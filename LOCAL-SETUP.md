# BalhinBalay local setup (Windows)

This ZIP contains the React Site and the separate PostgreSQL-backed account service at commit `0b23b3242c0a7e8086b4291201f68c293cf1377c`. The additional `LOCAL-SETUP.md` is an export guide; it is not part of that commit. Run the commands below in **PowerShell** from the extracted ZIP's top-level folder. Nothing here deploys the Site.

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

Open a **new PowerShell window** in the extracted top-level folder. Enter the PostgreSQL password and SMTP settings when prompted; no real values are included in this ZIP. The `SMTP_FROM` value must be authorised by your SMTP provider. Use port 587 with STARTTLS, or change the port to 465 and `SMTP_SECURE` to `true` if your provider requires implicit TLS.

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
$env:HOST = '127.0.0.1'
$env:PORT = '5000'
npm run migrate
npm test
npm start
```

Keep this window open. The service listens on `127.0.0.1:5000`; its database and SMTP configuration are available only to this PowerShell process and its children. `npm test` uses its own PGlite and local SMTP fixtures; passing tests does not prove delivery to a real mailbox. `account-service/.env.example` lists the configuration keys, but this source does **not** automatically load an `.env` file.

## 3. Run the React Site

Open another PowerShell window in the extracted top-level folder:

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173/`. The Site is a React 19 application using Next-compatible Vinext. The tracked `pnpm-lock.yaml` belongs to this Site; the separate account service uses its own `package-lock.json` and `npm ci`. Stop either server with **Ctrl+C**. For source checks, run `node --test tests/*.test.mjs` in the Site folder and `npm test` in `account-service`.

## Local account integration limit

Both processes can run locally using these steps. Registration through the Site will still report that the account service is unavailable: the source's server-only proxy **requires an HTTPS `ACCOUNT_API_ORIGIN`** and a matching `ACCOUNT_PROXY_KEY`/service `PROXY_KEY`. It rejects a plain `http://localhost:5000` backend. A trusted local HTTPS reverse proxy and server-only Site environment settings would be needed for an end-to-end browser account test; this export does not configure one or change that security check. Do not place the proxy key in a `NEXT_PUBLIC_` variable or expose PostgreSQL on the network. See `account-service/README.md` and `docs/registration-architecture-assessment.md` for the remaining deployment decisions.
