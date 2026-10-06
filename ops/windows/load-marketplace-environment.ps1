param([string]$EnvFile=(Join-Path $env:USERPROFILE '.balhinbalay\production.env'))
$ErrorActionPreference='Stop'
$flags=@('MARKETPLACE_ENABLED','MARKETPLACE_MESSAGING_ENABLED','MARKETPLACE_MODERATION_ENABLED','MARKETPLACE_PUBLICATION_ENABLED')
$selected=@{}
foreach($rawLine in (Get-Content -LiteralPath $EnvFile)) {
  $line=$rawLine.Trim().TrimStart([char]0xFEFF)
  if(-not $line -or $line.StartsWith('#')) { continue }
  $separator=$line.IndexOf('=')
  if($separator -lt 1) { continue }
  $key=$line.Substring(0,$separator).Trim()
  if($key -ne 'DATABASE_URL' -and $key -notin $flags) { continue }
  if($selected.ContainsKey($key)) { throw 'Duplicate selected production setting' }
  $selected[$key]=$line.Substring($separator+1)
}
foreach($flag in $flags) {
  if(-not $selected.ContainsKey($flag)) { $selected[$flag]='false' }
  if($selected[$flag] -cnotin @('true','false')) { throw 'Marketplace flags must be exact true or false' }
}
try { $database=[uri]$selected['DATABASE_URL'] } catch { throw 'Private local DATABASE_URL is required' }
if(-not $database.IsAbsoluteUri -or $database.Scheme -notin @('postgres','postgresql') -or $database.Host -notin @('localhost','127.0.0.1','[::1]') -or $database.AbsolutePath -notmatch '^/[A-Za-z0-9_]+$' -or -not $database.UserInfo -or $database.Fragment) { throw 'Private local DATABASE_URL is required' }
$credentials=$database.UserInfo -split ':',2
$pg=@{
  PGHOST=$database.Host.Trim('[',']'); PGPORT=if($database.Port -gt 0){[string]$database.Port}else{'5432'}
  PGDATABASE=[uri]::UnescapeDataString($database.AbsolutePath.Substring(1)); PGUSER=[uri]::UnescapeDataString($credentials[0])
  PGPASSWORD=if($credentials.Length -eq 2){[uri]::UnescapeDataString($credentials[1])}else{''}; PGSSLMODE='prefer'
}
if($database.Query) {
  $pairs=$database.Query.Substring(1) -split '&'
  if($pairs.Length -ne 1 -or $pairs[0] -notmatch '^sslmode=(disable|allow|prefer|require|verify-ca|verify-full)$') { throw 'Unreviewed DATABASE_URL option; inspect privately before deployment' }
  $pg.PGSSLMODE=$Matches[1]
}
# Validate everything first; no file is edited and no selected value is printed.
[Environment]::SetEnvironmentVariable('DATABASE_URL',$selected['DATABASE_URL'],'Process')
foreach($flag in $flags) { [Environment]::SetEnvironmentVariable($flag,$selected[$flag],'Process') }
foreach($entry in $pg.GetEnumerator()) { [Environment]::SetEnvironmentVariable($entry.Key,$entry.Value,'Process') }
