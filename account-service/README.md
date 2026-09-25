# BalhinBalay account service — private integration branch

This is the **account-only extraction and hardening** of the historical Express/PostgreSQL authentication flow. It is not the old marketplace API. The current GitHub `v.0.0.02` branch contains the local account integration. Under IDE0157, the public-beta topology is now accepted: `https://balhinbalay.com` will reach the owner-PC Vinext Site through Cloudflare Tunnel, while this account service remains private on loopback. The actual tunnel/DNS/service and public mailbox/browser E2E still need verification before the public account path is complete.

## Design and historical reuse

Retained: Express route family, PostgreSQL persistence, pending-account/verification/resend/login/password-recovery flow concepts, and Nodemailer SMTP transport/email copy. Replaced: bcrypt with Argon2id; plain verification/reset tokens with 256-bit random tokens whose SHA-256 digests alone are stored; five-digit reset code with one-use expiring action link; JWT/localStorage with database-authoritative revocable sessions and Secure HttpOnly SameSite=Lax host-only cookie; database-unavailable synthetic user fallback with fail-closed responses; SMTP absence and token logging with fatal startup configuration; unthrottled resend with persisted email/IP buckets and one-minute cooldown. No Lister or listings APIs/tables are included. Account Management is now available in the BalhinBalay Site through a same-origin proxy, but only for a live verified session whose email is listed in server-only `ADMIN_EMAILS`. The older loopback admin page remains a private break-glass tool and is not routed through the public Site.

`migrations/001_accounts.sql` defines UUID-backed `users`, `account_actions`, `auth_sessions` and `auth_rate_limits`. Application-generated UUIDv7 identifies users/actions/sessions. `src/migrate.js` tracks migrations in `schema_migrations` and applies each within a transaction. Do not point it at the separate historical database without a specific migration assessment; this migration creates a fresh account slice and does not import old bcrypt users.

## Route contract

All public account routes are under `/api/auth/`. POST: `register`, `verify-email`, `resend-verification`, `login`, `logout`, `forgot-password`, `reset-password`. GET: `session`. The Site's `app/api/auth/[...path]/route.js` forwards only these actions to this service. Verification and reset links use the Site's URL fragment, and the browser POSTs the token in a JSON body; token values are absent from server request paths. The service requires the server-only proxy key and the exact Site origin on POST requests. Browsers never receive the proxy key.

Password rule: 12–128 characters, with no mandatory character classes. Argon2id uses memoryCost 19456 KiB, timeCost 2, parallelism 1; benchmark these settings on the intended owner PC before production. Verification links expire after 24 hours; reset links after 15 minutes. Sessions expire after 14 days, remain valid across refresh, are independently revocable on logout and all revoke on password reset. Sessions are checked against an active, verified user row on every authenticated read. Verification/login rejects pending accounts. Duplicate registration and unknown-account reset requests receive conditional responses to reduce account enumeration. Stored request buckets enforce per-address and shared IP limits; resends have an additional 60-second cooldown. For a single PC-hosted API, global IP limits are deliberately generous because the Site proxy may be its only visible peer.

SMTP delivery is attempted *after* the pending account and token are persisted. If SMTP rejects delivery, that action is invalidated and the request reports an error; the pending account is recoverable using resend. SMTP acceptance does **not** prove mailbox arrival; the real-mail test remains required. Expired, invalid, replaced and consumed actions cannot verify/reset. Never print token values or SMTP errors in production logs.

## Required configuration

The backend process needs `DATABASE_URL`, `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (`true` for implicit TLS, otherwise STARTTLS is required), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `PROXY_KEY` (at least 32 random characters), and `ADMIN_EMAILS` (a comma-separated server-only allowlist of verified administrator email addresses) plus optional `HOST` (defaults to `127.0.0.1`) and `PORT` (defaults to `5000`). Store credentials outside Git; grant DB least privilege, take backups and keep PostgreSQL private. If `ADMIN_EMAILS` is empty, the Site admin API fails closed with `ADMIN_NOT_CONFIGURED`.

For the accepted public-beta topology:

```text
APP_URL=https://balhinbalay.com
HOST=127.0.0.1
PORT=5000
```

`APP_URL` is both the exact accepted browser origin for account POST requests and the base used to build verification/reset links. With the production value above, email actions are generated as:

```text
https://balhinbalay.com/#verify-email/...
https://balhinbalay.com/#reset-password/...
```

The Vinext Site runs on the same PC and uses server-only values:

```text
ACCOUNT_API_ORIGIN=http://127.0.0.1:5000
ACCOUNT_ALLOW_LOCAL_HTTP=true
ACCOUNT_PROXY_KEY=<same value as PROXY_KEY>
```

The HTTP exception is restricted in source to literal `localhost`/`127.0.0.1`; arbitrary HTTP hosts remain rejected. The account-service port is **not** a Cloudflare Tunnel published application and must not be opened publicly. No `NEXT_PUBLIC_` secrets.

Under IDE0157, Cloudflare Tunnel publishes only the Vinext Site (`http://127.0.0.1:8787`) as `https://balhinbalay.com`. See `../PUBLIC-TUNNEL-SETUP.md`. Tunnel credentials/tokens stay outside the repository. The tunnel connector, DNS route, actual sender/provider, public mailbox delivery and public browser/session E2E still require deployment verification before the launch gate is complete.

The historical archive contains populated SMTP fields in an `.env`. Do not commit, copy or assume that archived credential is valid; the owner should rotate and provision the intended production sender securely.

## Site Account Management

After signing in to BalhinBalay with an email listed in `ADMIN_EMAILS`, open `#admin` or use **Profile → Admin · Accounts**. The Site proxy forwards only the list/create/delete account actions to the private account service. The browser never receives `PROXY_KEY` or an admin token. Direct navigation and direct API calls are checked server-side against the live session and allowlist.

The Site surface creates ordinary accounts as active and email-verified and deletes accounts after confirmation. It does not grant Lister access or implement role persistence. Keep `ADMIN_EMAILS` in the account-service process only; do not add it to `NEXT_PUBLIC_` variables or commit it.

## Local owner account admin (break-glass)

When the account service is running with its normal private binding (`HOST=127.0.0.1`, `PORT=5000`), open this **on the owner PC only**:

```text
http://127.0.0.1:5000/admin
```

The page lists all account rows and provides only the deliberately small owner workflow required for the current beta work:

- create a normal BalhinBalay account with an email and password, immediately setting `status='active'` and `email_verified_at=now()` so the account can sign in without an email-verification step;
- delete an account after browser confirmation; the existing foreign-key cascades also remove that account's verification/reset actions and auth sessions;
- refresh the account list.

This remains a private break-glass tool and is not proxied by the Site. Both the page and its `/admin/api/*` routes reject non-loopback connections. The page receives a random per-process admin token and sends it back in a private request header for admin API calls, which also prevents another browser origin from blindly submitting destructive admin requests. Restarting the account service changes that token automatically.

Do not add `/admin` or port `5000` to the Cloudflare Tunnel. The public Site admin path is `/api/admin` and still reaches the service only through the existing Site proxy; it does not make port `5000` public.

Fast deletion here is an owner/testing operation. It is not the future end-user account-deletion/anonymisation policy described in `dbdesign.md`.

## Verification evidence and remaining gate

`npm test` uses file-backed PGlite to execute the same PostgreSQL schema and account queries. It verifies persistence across reopen, hashing, duplicate handling, pending/verified login, single-use/expiry/replacement, resend limits, sessions, reset and revocation, missing configuration and fail-closed outages. A separate test runs a local SMTP server with a temporary trusted test certificate and sends verification/reset messages through Nodemailer over STARTTLS. This proves the transport path locally, not external inbox delivery. The account tests inject a mail capture for token assertions and now assert the canonical `https://balhinbalay.com` verification/reset URL shape. `test/admin.test.js` covers the local admin token guard, loopback-address helper, pre-verified account creation/login, account listing, duplicate handling and cascading deletion of sessions/actions.

Before public access: run migrations against actual PostgreSQL, configure the intended real sender, start the account service with `APP_URL=https://balhinbalay.com`, start the Site with the private loopback account proxy, bring the Cloudflare Tunnel route online, exercise real email delivery and verification/reset in a mailbox, verify Secure cookie transport over public HTTPS, test browser registration/refresh/logout and browse/search regression, and review Privacy/Terms against actual providers and operation.
