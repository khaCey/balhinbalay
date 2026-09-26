# BalhinBalay account service — private integration branch

This is the **account-only extraction and hardening** of the historical Express/PostgreSQL authentication flow. It is not the old marketplace API. The current GitHub `v.0.0.02` branch contains the local account integration. Under IDE0157, the public-beta topology is now accepted: `https://balhinbalay.com` will reach the owner-PC Vinext Site through Cloudflare Tunnel, while this account service remains private on loopback. The actual tunnel/DNS/service and public mailbox/browser E2E still need verification before the public account path is complete.

## Design and historical reuse

Retained: Express route family, PostgreSQL persistence, pending-account/verification/resend/login/password-recovery flow concepts, and Nodemailer SMTP transport/email copy. Replaced: bcrypt with Argon2id; plain verification/reset tokens with 256-bit random tokens whose SHA-256 digests alone are stored; five-digit reset code with one-use expiring action link; JWT/localStorage with database-authoritative revocable sessions and Secure HttpOnly SameSite=Lax host-only cookie; database-unavailable synthetic user fallback with fail-closed responses; SMTP absence and token logging with fatal startup configuration; unthrottled resend with persisted email/IP buckets and one-minute cooldown. No Lister or listings APIs/tables are included. Account Management is available through the standalone BalhinBalay `/admin` portal. Admin authentication uses the existing verified BalhinBalay account credentials plus the server-only `ADMIN_EMAILS` allowlist, but issues a separate Secure HttpOnly `__Host-bb_admin_session`; an ordinary `__Host-bb_session` never by itself authorises admin routes. The older loopback admin page remains a private break-glass tool and is not routed through the public Site.

`migrations/001_accounts.sql` defines UUID-backed `users`, `account_actions`, `auth_sessions` and `auth_rate_limits`. Application-generated UUIDv7 identifies users/actions/sessions. `src/migrate.js` tracks migrations in `schema_migrations` and applies each within a transaction. Do not point it at the separate historical database without a specific migration assessment; this migration creates a fresh account slice and does not import old bcrypt users.

## Route contract

All public account routes are under `/api/auth/`. POST: `register`, `verify-email`, `resend-verification`, `login`, `logout`, `forgot-password`, `reset-password`. GET: `session`. The Site's `app/api/auth/[...path]/route.js` forwards only these actions to this service. Verification and reset links use the Site's URL fragment, and the browser POSTs the token in a JSON body; token values are absent from server request paths. The service requires the server-only proxy key and the exact Site origin on POST requests. Browsers never receive the proxy key.

The standalone Site admin route family is `/api/admin/`. POST: `login`, `logout`, `accounts`; GET: `session`, `accounts`; DELETE: `accounts/:id`. The Site's `app/api/admin/[...path]/route.js` forwards only those actions. It forwards only the dedicated `__Host-bb_admin_session` cookie, never the ordinary BalhinBalay session cookie. The account service verifies the proxy key, exact browser origin on mutations, live admin session and current `ADMIN_EMAILS` membership before account-management access.

Password rule: 12–128 characters, with no mandatory character classes. Argon2id uses memoryCost 19456 KiB, timeCost 2, parallelism 1; benchmark these settings on the intended owner PC before production. Verification links expire after 24 hours; reset links after 15 minutes. Sessions expire after 14 days, remain valid across refresh, are independently revocable on logout and all revoke on password reset. Sessions are checked against an active, verified user row on every authenticated read. Verification/login rejects pending accounts. Duplicate registration and unknown-account reset requests receive conditional responses to reduce account enumeration. Stored request buckets enforce per-address and shared IP limits; resends have an additional 60-second cooldown. Admin login has its own rate-limit buckets and returns a generic invalid-admin-credentials response for wrong credentials, unavailable accounts and non-allowlisted users.

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

Open the standalone Site portal at `/admin`. An unauthenticated browser sees only the dedicated **Admin login** screen, not the ordinary BalhinBalay application shell. Sign in with an existing active, verified BalhinBalay account whose email is listed in the account-service process's `ADMIN_EMAILS`. The password is that account's normal BalhinBalay password; there is no separate hard-coded admin password or browser-stored admin secret.

Successful admin login creates `__Host-bb_admin_session`. Normal Site sign-in creates `__Host-bb_session`; that cookie is deliberately ignored by the admin Site proxy and cannot by itself unlock `/admin` or `/api/admin`. Removing an email from `ADMIN_EMAILS` and restarting the account service causes future admin session checks for that account to fail.

The admin surface lists current accounts, creates ordinary accounts immediately as active/email-verified, and deletes accounts after confirmation. It does not grant Lister access, implement persistent roles or define the future public account-deletion/anonymisation policy. `ADMIN_EMAILS` must remain server-only and must never be placed in `NEXT_PUBLIC_` configuration.

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

Do not add the loopback `/admin` or port `5000` to the Cloudflare Tunnel. The public Site admin path is `/admin` on the Site plus `/api/admin/*` on the same Site origin; both still reach the account service only through the private Site proxy.

Fast deletion here is an owner/testing operation. It is not the future end-user account-deletion/anonymisation policy described in `dbdesign.md`.

## Verification evidence and remaining gate

`npm test` uses file-backed PGlite to execute the same PostgreSQL schema and account queries. It verifies persistence across reopen, hashing, duplicate handling, pending/verified login, single-use/expiry/replacement, resend limits, sessions, reset and revocation, missing configuration and fail-closed outages. A separate test runs a local SMTP server with a temporary trusted test certificate and sends verification/reset messages through Nodemailer over STARTTLS. This proves the transport path locally, not external inbox delivery. The account tests inject a mail capture for token assertions and assert the canonical `https://balhinbalay.com` verification/reset URL shape. `test/admin.test.js` covers the loopback break-glass admin. `test/site-admin.test.js` covers the standalone admin boundary: a normal Site cookie is rejected, non-admin credentials cannot create an admin session, an allowlisted admin receives `__Host-bb_admin_session`, list/create/delete work under that session, logout revokes it, and proxy/origin checks remain required.

Before public access: run migrations against actual PostgreSQL, configure the intended real sender, start the account service with `APP_URL=https://balhinbalay.com`, start the Site with the private loopback account proxy, bring the Cloudflare Tunnel route online, exercise real email delivery and verification/reset in a mailbox, verify Secure cookie transport over public HTTPS, test normal browser registration/refresh/logout, test the standalone admin login/list/create/delete/logout journey, and review Privacy/Terms against actual providers and operation.
