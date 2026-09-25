# IDE0152 registration architecture assessment — 25 September 2026

## Current boundary

RC v9 (`32efa96e8d5635ec0bf8742db1d61e7282640f39`) is the verified, owner-private browse/search baseline. Its deployment has no account database, mail credentials or account API. Its `chatgpt-auth` header identifies the Site owner in the hosting environment; it is not a public BalhinBalay account service. The feature branch now contains an account-only Express service and a server-only same-origin Site proxy, but neither is deployed or configured. Do not advertise the source as working registration.

## Historical implementation audit

The separate historical React/Express/PostgreSQL source has registration, confirm-email, resend, login, JWT authentication middleware, password-reset routes, `AuthContext`, Nodemailer SMTP transport and migrations. Registration creates a pending user with a bcrypt hash, stores a plaintext random confirmation token in the user row, expires it after 24 hours and sends a confirmation URL. The confirm route consumes the token and activates the account. Login rejects pending/unverified users and issues a seven-day JWT. This is reference code from the old API, not a production-verified deployment; no authentication/email automated tests or evidence of actual email receipt were found in the inspected archive.

| Historical component | Classification and current treatment |
| --- | --- |
| Express auth route structure, pending account and verified-only login concepts | Reusable after hardening. Account-only endpoints now implemented without unrelated marketplace routes. |
| PostgreSQL user/status/migration concepts | Reusable after hardening. New, isolated account migration follows current base-account design; old production records are not imported. |
| Nodemailer SMTP transport and verification/reset email copy intent | Reusable after hardening. Retained SMTP transport with required configuration and no token logging or opportunistic port fallback. Actual sender delivery remains unverified. |
| bcrypt, plaintext confirmation token and five-digit `Math.random()` reset code | Incompatible/unsafe. Replaced by Argon2id and hashed one-time actions. |
| JWT fallback signing secret and synthetic user during DB outage | Unsafe. Removed; authoritative database session checks fail closed. |
| Browser localStorage JWT and Capacitor preferences | Incompatible/obsolete. Replaced by server-side session and host-only Secure HttpOnly cookie; no mobile-app integration. |
| Unthrottled resend and registration success after SMTP failure | Unsafe. Replaced by persisted throttles, cooldown, recoverable pending state and truthful failure. |
| Historical listings/admin/messaging routes and broad server bootstrap | Unrelated/deferred. Not connected. |

The older server is not wired to the current Site and has not been certified.

The historical ZIP includes an `.env` with populated SMTP fields. That is an archived secret, not evidence of current sender ownership, deliverability or production readiness. No archived credentials were copied into source or used for a live email test. Provision and rotate secrets through the approved backend environment.

## Material decision proposed as IDE0153

| Option | Fit | Required setup / concern |
| --- | --- | --- |
| Small account-only API on owner-controlled PC, PostgreSQL/PostGIS, Argon2id, email transport | Recommended for continuity with IDE0001, IDE0003 and `dbdesign.md`; preserves current base-account model | Reliable public HTTPS endpoint or secure same-origin proxy to the PC; PostgreSQL deployment/backups; SMTP or transactional mail provider with validated sender/domain; secrets; availability, abuse controls and logs. Owner must approve exact hosting and mail path. |
| Managed auth service and managed email | Potentially faster deployment, provider handles verification and sessions | Changes accepted host/data/security assumptions; provider-specific password hashing and data location may conflict with Argon2id/PostgreSQL design. Requires explicit decision and provider account/configuration. |
| Site Worker plus D1 and email provider | Could run near the current Site | No D1 binding or email configuration exists; changes the accepted PostgreSQL/PC architecture and still requires mail provider, migrations, secrets and operational checks. |

The owner authorised extraction and hardening of the historical account implementation. This is authority to implement the narrow service; it does not settle public HTTPS reachability from the Site, reverse proxy/tunnel/firewall choices, actual database deployment or sender/provider credentials. IDE0153 remains PROPOSED for those deployment choices. The feature branch's proxy requires a secure endpoint and server-only secret but is not evidence that such an endpoint exists.

## Proposed unverified-account decision (IDE0154)

The owner has now instructed the launch implementation to preserve the historical verified-only login behaviour unless a newer accepted decision changes it. IDE0154 can be marked ACCEPTED for this beta rule: pending users may request another link under rate limits, but receive no authenticated session until verification. This is implemented in the new account service and covered by integration tests; real deployed verification remains pending.

## Proposed session deployment decision (IDE0155)

The feature branch implements opaque, database-authoritative per-device sessions through a same-origin Site proxy with a Secure HttpOnly host-only cookie, 14-day expiry, logout and reset revocation. This replaces the historical browser-stored JWT. IDE0155 remains PROPOSED because `dbdesign.md` left exact transport/lifetime open and no owner-approved HTTPS/proxy topology or deployed cookie test exists. Source tests do not establish that the Site runtime forwards and receives cookies correctly over the eventual public path.

## Backend acceptance criteria after the decisions

- Persistent unique normalised email; UUID user ID; Argon2id password hash; created/updated and verified timestamps; authoritative status and session state.
- Cryptographically random single-use verification action with only a token digest stored server-side, expiry, atomic consumption, invalid/expired/reused responses, generic resend response and resend/registration/login throttles.
- Verified-only sign-in if IDE0154 accepted; server-managed session in Secure, HttpOnly, SameSite cookie over HTTPS, rotation/revocation/expiry and refresh restoration; explicit CSRF protection for state-changing requests according to actual topology.
- Account mail genuinely delivered from an approved sender; no tokens/passwords/secrets in logs; operational visibility and rollback.
- Integration tests against real persistence and mail delivery capture for valid/invalid/duplicate registration, token validity/expiry/reuse/resend, wrong/correct login, verification policy, logout and session expiry. Then a real mailbox end-to-end exercise, with no sensitive values in project logs.
- Update Privacy/Terms to describe the actual provider, account data, email and session behaviour before deployment. Recheck browse/search baseline and owner-private build before creating a new RC.

## Current outcome

IDE0152 remains **IN PROGRESS / PARTIAL**: an account-only service, migration, same-origin proxy and React registration/verification/login/recovery screens exist on the feature branch. File-backed PostgreSQL integration tests cover account persistence and auth semantics. No owner-PC PostgreSQL deployment, actual sender/mailbox delivery, public HTTPS endpoint, deployed authenticated session or new RC exists. Feature freeze and public access are blocked. RC v9 remains the rollback/baseline. See `account-service/README.md` for route/configuration/test details.
