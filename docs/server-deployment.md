# BalhinBalay server branch deployment

## Purpose

`server` is the canonical Git branch for the owner-PC runtime exposed at `https://balhinbalay.com` through Cloudflare Tunnel.

Cloudflare is branch-agnostic. It continues forwarding the public hostname to the Vinext Site on `127.0.0.1:8787`. The account service remains private on `127.0.0.1:5000`, and PostgreSQL remains private on `127.0.0.1:5433`.

Only a deliberate push to `server` is eligible for automatic deployment.

## Machine-local data that must never be committed

The deployment branch contains application source only. Keep these outside Git:

- `%USERPROFILE%\.balhinbalay\production.env`
- Cloudflare tunnel tokens/configuration
- PostgreSQL data and backups
- PM2 state and logs
- GitHub self-hosted runner registration credentials

## Initial activation gate

Automatic deployment is intentionally disabled until the owner-PC runtime has been moved to an exact reviewed `server` commit and verified manually.

The deployment script requires this machine-local marker:

```text
%USERPROFILE%\.balhinbalay\server-deploy-enabled
```

Do not create that marker until all of the following are true:

1. The exact reviewed owner-PC release candidate, including the accepted security and login/Profile redirect fixes, has been promoted to `server`.
2. `C:\GitHub\BalhinBalay-server` is a dedicated clean checkout of that exact `server` commit.
3. Site and account dependencies install successfully.
4. The Site production build succeeds.
5. The account service starts against the already-approved database migrations.
6. PM2 is running the Site/account service from the dedicated server checkout.
7. `http://127.0.0.1:8787/` and `https://balhinbalay.com/` both return HTTP 200.
8. The normal account-service listener remains private on `127.0.0.1:5000`.

The bootstrap `server` branch was created from the shared ancestor `405a9cb0a354207a16edd925614e948fbff9bc33` only so the branch exists and can receive a fast-forward promotion from the owner-PC RC. That bootstrap commit must not be treated as the desired live release.

## GitHub Actions runner

Use one repository self-hosted runner on the owner PC with these labels:

```text
self-hosted
windows
x64
balhinbalay-server
```

Install/configure the runner from:

```text
GitHub repository
→ Settings
→ Actions
→ Runners
→ New self-hosted runner
→ Windows / x64
```

Use GitHub's generated commands and time-limited registration token. Do not store that token in the repository or project notes.

Configure the runner as a Windows service under the same Windows account that owns the BalhinBalay PM2 daemon and `%USERPROFILE%\.balhinbalay` runtime files. The deployment workflow relies on that user-scoped PM2 state and production environment file.

Give the runner the custom label:

```text
balhinbalay-server
```

The workflow will not run on ordinary GitHub-hosted runners or unrelated self-hosted runners.

## Automatic deployment sequence

A push to `server` triggers `.github/workflows/deploy-server.yml`.

The workflow:

1. checks out the exact triggering Git SHA;
2. verifies the branch/SHA identity;
3. verifies runner prerequisites and the machine-local activation marker;
4. performs a frozen Site dependency install;
5. fails on HIGH/CRITICAL Site production dependency findings;
6. runs the complete Site tests, lint and production build;
7. runs account-service `npm ci`, production audit and tests;
8. confirms preflight did not modify tracked source;
9. invokes `ops/windows/deploy-server.ps1` with the exact triggering SHA;
10. fetches that exact commit into the dedicated production checkout;
11. blocks before changing the live checkout if account-service migration files changed;
12. installs/builds the dedicated checkout;
13. restarts `balhinbalay-account` and `balhinbalay-site` through the server PM2 config;
14. saves PM2 state;
15. verifies private account-service connectivity, local Site HTTP 200 and public Cloudflare HTTP 200;
16. attempts rollback to the previous exact commit if the deployment/restart/health phase fails.

Cloudflare is not restarted for ordinary application deployments.

## Database migrations

Automatic migration execution is not currently approved.

IDE0166 tracks the unresolved production migration policy. Until that decision is accepted, a deployment that changes anything under:

```text
account-service/migrations/
```

stops before changing the live checkout. The migration must be handled as a separately reviewed owner action.

## PM2 runtime configuration

The server checkout contains:

```text
ops/windows/ecosystem.server.config.cjs
ops/windows/site-runner.cjs
```

The ecosystem config derives the project root from its own location and reads secrets only from:

```text
%USERPROFILE%\.balhinbalay\production.env
```

The Site runner starts Vinext hidden on Windows so the production Site does not depend on a visible terminal window.

For reboot startup, the existing machine-local `%USERPROFILE%\.balhinbalay\ecosystem.config.cjs` should become a tiny loader for the server checkout after the first server deployment is verified:

```js
module.exports = require("C:\\GitHub\\BalhinBalay-server\\ops\\windows\\ecosystem.server.config.cjs");
```

Back up the current machine-local ecosystem file before making that one-time switch.

## Promotion rule

Development, RC and Work branches do not auto-deploy.

The release flow is:

```text
reviewed/tested source
        ↓
      server
        ↓
GitHub Actions self-hosted runner
        ↓
C:\GitHub\BalhinBalay-server
        ↓
PM2 Site + account service
        ↓
Cloudflare Tunnel
        ↓
balhinbalay.com
```

A push to `server` is therefore a production deployment action and should contain only reviewed source intended for the live owner-PC runtime.
