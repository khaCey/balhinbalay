param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[0-9a-fA-F]{40}$')]
    [string]$CommitSha,

    [string]$DeployDir = 'C:\GitHub\BalhinBalay-server'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$ConfigDir = Join-Path $env:USERPROFILE '.balhinbalay'
$ProductionEnv = Join-Path $ConfigDir 'production.env'
$DeployEnabledMarker = Join-Path $ConfigDir 'server-deploy-enabled'
$LastServerShaFile = Join-Path $ConfigDir 'last-server-sha.txt'
$Ecosystem = Join-Path $DeployDir 'ops\windows\ecosystem.server.config.cjs'

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed with exit code $LASTEXITCODE"
    }
}

function Get-HttpStatus {
    param([Parameter(Mandatory = $true)][string]$Url)

    $output = & curl.exe -sS -o NUL -w '%{http_code}' --max-time 15 $Url
    if ($LASTEXITCODE -ne 0) {
        return 0
    }

    $status = 0
    if ([int]::TryParse(($output | Out-String).Trim(), [ref]$status)) {
        return $status
    }

    return 0
}

function Wait-ForHttp200 {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$Attempts = 12,
        [int]$DelaySeconds = 5
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        $status = Get-HttpStatus -Url $Url
        if ($status -eq 200) {
            return
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    throw "Health check failed for $Url"
}

function Build-Checkout {
    param([Parameter(Mandatory = $true)][string]$Path)

    Push-Location $Path
    try {
        Invoke-Native pnpm install --frozen-lockfile
        Invoke-Native pnpm audit --prod --audit-level high
        Invoke-Native pnpm build

        Push-Location (Join-Path $Path 'account-service')
        try {
            Invoke-Native npm ci
            Invoke-Native npm audit --omit=dev --audit-level high
        }
        finally {
            Pop-Location
        }
    }
    finally {
        Pop-Location
    }
}

function Restart-Runtime {
    if (-not (Test-Path $Ecosystem)) {
        throw "Missing PM2 server configuration: $Ecosystem"
    }

    Invoke-Native pm2 startOrRestart $Ecosystem --update-env
    Invoke-Native pm2 save
}

function Verify-Runtime {
    if (-not (Test-NetConnection -ComputerName '127.0.0.1' -Port 5000 -InformationLevel Quiet)) {
        throw 'Account service is not listening on 127.0.0.1:5000.'
    }

    Wait-ForHttp200 -Url 'http://127.0.0.1:8787/'
    Wait-ForHttp200 -Url 'https://balhinbalay.com/'
}

foreach ($command in @('git', 'node', 'pnpm', 'npm', 'pm2', 'curl.exe')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command is not available to the runner account: $command"
    }
}

if (-not (Test-Path $ProductionEnv)) {
    throw "Missing machine-local production environment file: $ProductionEnv"
}

if (-not (Test-Path $DeployEnabledMarker)) {
    throw "Automatic deployment is not enabled on this PC. Complete and verify the initial server-branch deployment, then create $DeployEnabledMarker."
}

if (-not (Test-Path (Join-Path $DeployDir '.git'))) {
    throw "Dedicated server checkout does not exist at $DeployDir. Bootstrap and verify it manually before enabling automatic deployment."
}

$origin = (& git -C $DeployDir remote get-url origin | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $origin -notmatch 'khaCey/balhinbalay(?:\.git)?$') {
    throw "Unexpected Git remote for dedicated server checkout: $origin"
}

$trackedChanges = @(& git -C $DeployDir status --porcelain --untracked-files=no)
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to inspect the dedicated server checkout.'
}
if ($trackedChanges.Count -gt 0) {
    throw 'Dedicated server checkout has tracked local changes. Automatic deployment stopped without modifying it.'
}

Invoke-Native git -C $DeployDir fetch --prune origin server
Invoke-Native git -C $DeployDir cat-file -e "$CommitSha^{commit}"

& git -C $DeployDir merge-base --is-ancestor $CommitSha origin/server
if ($LASTEXITCODE -ne 0) {
    throw "Trigger commit $CommitSha is not reachable from origin/server."
}

$previousSha = (& git -C $DeployDir rev-parse HEAD | Out-String).Trim()
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to determine the currently deployed commit.'
}

if ($previousSha -eq $CommitSha) {
    Write-Host "Commit $CommitSha is already deployed. Running health checks only."
    Verify-Runtime
    exit 0
}

$migrationChanges = @(& git -C $DeployDir diff --name-only $previousSha $CommitSha -- account-service/migrations)
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to compare account-service migrations.'
}
if ($migrationChanges.Count -gt 0) {
    $changed = $migrationChanges -join ', '
    throw "Deployment introduces database migration changes ($changed). Automatic migration policy is unresolved under IDE0166, so deployment stopped before changing the live checkout."
}

Write-Host "Deploying exact server commit $CommitSha (previous $previousSha)."
Set-Content -Path $LastServerShaFile -Value $previousSha -Encoding ASCII -NoNewline

try {
    Invoke-Native git -C $DeployDir checkout -B server $CommitSha
    Invoke-Native git -C $DeployDir reset --hard $CommitSha

    $deployedSha = (& git -C $DeployDir rev-parse HEAD | Out-String).Trim()
    if ($deployedSha -ne $CommitSha) {
        throw "Dedicated checkout is at $deployedSha instead of $CommitSha."
    }

    Build-Checkout -Path $DeployDir
    Restart-Runtime
    Verify-Runtime

    Write-Host "BalhinBalay server deployment succeeded at $CommitSha."
}
catch {
    $deploymentError = $_
    Write-Warning "Deployment failed: $($deploymentError.Exception.Message)"
    Write-Host "Attempting rollback to $previousSha."

    try {
        Invoke-Native git -C $DeployDir checkout -B server $previousSha
        Invoke-Native git -C $DeployDir reset --hard $previousSha
        Build-Checkout -Path $DeployDir
        Restart-Runtime
        Verify-Runtime
        Write-Host "Rollback succeeded at $previousSha."
    }
    catch {
        Write-Warning "Automatic rollback also failed: $($_.Exception.Message)"
    }

    throw $deploymentError
}
