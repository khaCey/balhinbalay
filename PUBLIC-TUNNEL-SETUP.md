# BalhinBalay public tunnel setup (Windows)

This runbook publishes the owner-PC BalhinBalay Site at:

```text
https://balhinbalay.com
```

The public path is:

```text
Browser
  -> Cloudflare HTTPS
  -> Cloudflare Tunnel
  -> http://127.0.0.1:8787  (private Vinext Site target)
  -> http://127.0.0.1:5000  (private account service, via Site proxy only)
  -> PostgreSQL on 127.0.0.1:5433
```

The account service and PostgreSQL must not be published as Cloudflare Tunnel routes.

## Security rules

- The only public browser origin for this run is `https://balhinbalay.com`.
- `http://127.0.0.1:8787` is the private Cloudflare Tunnel destination, not an alternative browser origin.
- Keep `127.0.0.1:5000` private. Do not create a public hostname for the account service.
- Keep PostgreSQL private on localhost.
- Keep the Cloudflare tunnel token, SMTP password, database password and BalhinBalay proxy key outside Git and browser code.
- The Site and account service must share the same generated proxy key.
- The Site and account service must also share the same canonical `APP_URL`: `https://balhinbalay.com`.
- Do not delete mail-related DNS records such as MX/TXT records while changing the website route.

## 1. Start PostgreSQL

Use the existing owner-PC BalhinBalay PostgreSQL cluster on port `5433`.

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" `
  -D "$env:USERPROFILE\pg18-balhinbalay" `
  -l "$env:USERPROFILE\pg18-balhinbalay.log" `
  -o "-p 5433" `
  start
```

Verify:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h 127.0.0.1 -p 5433
```

Expected:

```text
127.0.0.1:5433 - accepting connections
```

## 2. Start the account service with the public BalhinBalay origin

Open PowerShell in:

```text
C:\GitHub\BalhinBalay-v0.0.02\account-service
```

Set the database connection and existing SMTP credentials privately, then use:

```powershell
$env:NODE_ENV = "production"
$env:APP_URL = "https://balhinbalay.com"
$env:HOST = "127.0.0.1"
$env:PORT = "5000"
```

`APP_URL` is the canonical browser origin. It is also the origin used when the account service builds verification and password-reset links, so production email links become:

```text
https://balhinbalay.com/#verify-email/...
https://balhinbalay.com/#reset-password/...
```

Generate one fresh proxy key for the account service and copy it without printing it:

```powershell
$env:PROXY_KEY = node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
Set-Clipboard $env:PROXY_KEY
```

Start the account service:

```powershell
npm start
```

Leave this PowerShell window running.

## 3. Start the Vinext Site

Open a second PowerShell window in:

```text
C:\GitHub\BalhinBalay-v0.0.02
```

Load the server-only account proxy configuration. Use the same `APP_URL` as the account service so the Site validates browser POST origins against the public BalhinBalay origin rather than against its private loopback request URL:

```powershell
$env:NODE_ENV = "production"
$env:APP_URL = "https://balhinbalay.com"
$env:ACCOUNT_API_ORIGIN = "http://127.0.0.1:5000"
$env:ACCOUNT_PROXY_KEY = Get-Clipboard
$env:ACCOUNT_ALLOW_LOCAL_HTTP = "true"
Set-Clipboard ""

if ([string]::IsNullOrWhiteSpace($env:ACCOUNT_PROXY_KEY) -or $env:ACCOUNT_PROXY_KEY.Length -lt 32) {
  throw "The Site and account service need the same generated proxy key."
}
```

Build and start the Site:

```powershell
pnpm build
npm start
```

During this public production run, use this browser URL for account testing:

```text
https://balhinbalay.com
```

The Site process still listens privately on `http://127.0.0.1:8787` so Cloudflare can reach it. That loopback address is an internal transport destination only and must not be treated as a second browser origin. Do not add a second TLS layer on localhost just for the tunnel.

If you need separate local-mode account testing, stop/restart both Site and account service using `LOCAL-SETUP.md`, where the canonical browser origin is `http://localhost:8787`.

## 4. Create the named Cloudflare Tunnel

Use a normal named tunnel, not a temporary `trycloudflare.com` quick tunnel.

In Cloudflare Dashboard:

1. Confirm `balhinbalay.com` is an active Cloudflare zone.
2. Go to **Networking -> Tunnels**.
3. Create a tunnel named `balhinbalay-web`.
4. Choose the Windows connector instructions.
5. Run the Cloudflare-provided install command in an Administrator terminal on the owner PC.
6. Treat the tunnel token in that command as a secret. Do not paste it into chat, Git, documentation or screenshots.
7. Wait until the connector shows **Healthy**.

For the tunnel route, add a **Published application** with:

```text
Hostname:    balhinbalay.com
Service URL: http://127.0.0.1:8787
```

Cloudflare Tunnel supports an apex/root-domain hostname. If Cloudflare reports that an A, AAAA or CNAME record already exists for `balhinbalay.com`, remove or replace only the old website-routing record that conflicts with the tunnel. Preserve MX/TXT records used by email.

Do not add any route for port `5000` or `5433`.

## 5. Verify the public site

From a normal browser or another network, open:

```text
https://balhinbalay.com
```

From PowerShell:

```powershell
curl.exe -I https://balhinbalay.com
```

Then verify the real account journey:

1. Register a fresh test account at `https://balhinbalay.com`.
2. Confirm the verification email arrives.
3. Confirm the link starts with `https://balhinbalay.com/#verify-email/`.
4. Open the link and verify the account.
5. Sign in at `https://balhinbalay.com`.
6. Refresh the page and confirm the authenticated session survives.
7. Sign out and confirm the session is revoked.

Do not mark the public account path complete until this browser/mailbox sequence passes.

## 6. Windows service check

For a remotely managed tunnel installed by Cloudflare's dashboard command, check the service with:

```powershell
Get-Service cloudflared
```

The connector should also remain **Healthy** in Cloudflare Dashboard.

If the PC restarts, PostgreSQL, the account service and the Vinext Site must also be started before the tunnel can serve BalhinBalay successfully. Automating those application processes is separate operational work.
