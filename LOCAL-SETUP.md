# BalhinBalay local setup (Windows)

This checkout contains the React Site and the separate PostgreSQL-backed account service, imported from Sites commit `0b23b3242c0a7e8086b4291201f68c293cf1377c` into GitHub branch `v.0.0.02`. Run the commands below in **PowerShell** from the project root. Nothing here deploys the Site.

## Prerequisites

- Windows with Node.js **22.13.0 or later**, npm, and PostgreSQL installed and running locally. Ensure `node`, `npm`, and `psql` work in PowerShell; add PostgreSQL's `bin` folder to your PATH if needed.
- An SMTP account with a valid sender address if you want to start the account service. The service refuses to start without SMTP settings. Keep its credentials on your own machine.
- Internet access for the first dependency installation.

## 1. Create the local PostgreSQL database

Open PowerShell, then start the PostgreSQL interactive shell:

```powershell
psql -h 127.0.0.1 -U postgres -d postgres
```

Enter your local PostgreSQL administrator password when prompted. At the `postgres=#` prompt, enter each of the following separately. `\password` prompts you for a new password without putting it into this guide or shell history:

```sql
CREATE ROLE bb_local LOGIN;
\password bb_local
CREATE DATABASE bb_local OWNER bb_local;
\q
```

Use this **fresh** database for the account migration; do not point it at the historical BalhinBalay database. PostgreSQL stays on your local machine. If `psql` is unavailable, use the installed PostgreSQL `bin\psql.exe` or pgAdmin to run the SQL and set the role password.

## 2. Run the account service

Open a **new PowerShell window** in the checkout's top-level folder. Enter the PostgreSQL password and SMTP settings when prompted; no real values are included in this source. The `SMTP_FROM` value must be authorised by your SMTP provider. Use port 587 with STARTTLS, or change the port to 465 and `SMTP_SECURE` to `true` if your provider requires implicit TLS.

```powershell
cd .\account-service
npm ci
$dbPassword = Read-Host 'bb_local database password' -AsSecureString
$dbPlain = [System.Net.NetworkCredential]::new('', $dbPassword).Password
$env:DATABASE_URL = 'postgresql://bb_local:' + [Uri]::EscapeDataString($dbPlain) + '@127.0.0.1:5432/bb_local'
Remove-Variable dbPassword, dbPlain
$env:NODE_ENV = 'development'
$env:APP_URL = 'http://localhost:5173'
$env:SMTP_HOST = Read-Host 'SMTP host'
$env:SMTP_PORT = '587'
$env:SMTP_SECURE = 'false'
$env:SMTP_USER = Read-Host 'SMTP user'
$smtpPassword = Read-Host 'SMTP password' -AsSecureString
$env:SMTP_PASS = [System.Net.NetworkCredential]::new('', $smtpPassword).Password
Remove-Variable smtpPassword
$env:SMTP_FROM = Read-Host 'Authorised sender email address'
$env:PROXY_KEY = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Set-Clipboard -Value $env:PROXY_KEY
$env:HOST = '127.0.0.1'
$env:PORT = '5000'
npm run migrate
npm test
npm start
```

Keep this window open. `Set-Clipboard` temporarily transfers the randomly generated local proxy key to the Site window; do not paste it into the repository or a message. The service listens on `127.0.0.1:5000`; its database and SMTP configuration are available only to this PowerShell process and its children. `npm test` uses its own PGlite and local SMTP fixtures; passing tests does not prove delivery to a real mailbox. `account-service/.env.example` lists the configuration keys, but this source does **not** automatically load an `.env` file.

## 3. Run the React Site

Open another PowerShell window in the checkout's top-level folder:

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
$env:NODE_ENV = 'development'
$env:ACCOUNT_API_ORIGIN = 'http://127.0.0.1:5000'
$env:ACCOUNT_PROXY_KEY = Get-Clipboard
Set-Clipboard -Value ''
if ([string]::IsNullOrWhiteSpace($env:ACCOUNT_PROXY_KEY) -or $env:ACCOUNT_PROXY_KEY.Length -lt 32) { throw 'The Site and account service need the same generated proxy key.' }
pnpm dev
```

Open `http://localhost:5173/`. The Site is a React 19 application using Next-compatible Vinext. The tracked `pnpm-lock.yaml` belongs to this Site; the separate account service uses its own `package-lock.json` and `npm ci`. Stop either server with **Ctrl+C**. For source checks, run `node --test tests/*.test.mjs` in the Site folder and `npm test` in `account-service`.

## Local account integration

In development only, the server-side Site proxy accepts a plain HTTP account endpoint at literal `localhost` or `127.0.0.1`. The account service and Site must use the same generated key; the key stays in server process environments and is cleared from the Windows clipboard after transfer. Stop and restart both processes if you generate a different key. Production and all non-development configurations still require HTTPS. Do not place the key in a `NEXT_PUBLIC_` variable or expose PostgreSQL on the network. Browser cookie behaviour, real mailbox delivery and any public HTTPS deployment remain separate verification steps; see `account-service/README.md` and `docs/registration-architecture-assessment.md`.
