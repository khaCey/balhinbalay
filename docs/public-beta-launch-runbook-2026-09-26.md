# BalhinBalay public beta — launch gate (revised 25 September 2026)

**HOLD.** IDE0152 changed the release scope. The 26 September target does not authorise opening RC v9: it is a verified owner-private browse/search baseline without real accounts. The feature branch contains an account-only service, but no approved HTTPS owner-PC route, production database, live sender or verified mailbox journey. Feature freeze and the public access switch remain blocked. If the account gate is not completed in time, move the opening date rather than weakening IDE0152.

## Current reference and rollback

- Site project: `appgprj_6aacc98f8eb88191885c041bb731230c`; intended public URL: `https://balhinbalay-react.khacey-salvador.chatgpt.site/`. Verify current access directly before relying on this snapshot.
- Known browse/search baseline RC v9: commit `32efa96e8d5635ec0bf8742db1d61e7282640f39`, saved version `appgprj_6aacc98f8eb88191885c041bb731230c~appgver_41c5ca9efce88191937c45a8a931c7be`, deployment `appgdep_6ab4b6456f8481918b1d3df6e20d90ab`.
- Additional saved points: RC v8 `appgprj_6aacc98f8eb88191885c041bb731230c~appgver_8547bf17c0788191a7c703e46e358087`; RC v7 `appgprj_6aacc98f8eb88191885c041bb731230c~appgver_477f4d64d7c881918f48f47203ad5b61`; RC v6 `appgprj_6aacc98f8eb88191885c041bb731230c~appgver_969facc0ab508191a92dfa3aa9f29b0c`.
- RC v9 is a **technical rollback** to browsing, not a compliant public-beta candidate after IDE0152. If a new auth RC fails, restore owner-only access while rolling back to RC v9; do not present RC v9 as the public launch.

## Before feature freeze or a new owner-private RC

1. Read the current Idea Register and full Soft-Launch To-Do List. Resolve IDE0153 public HTTPS/backend/email route and IDE0155 cookie/proxy decision. IDE0154 verified-only sign-in is accepted. Confirm actual owner-PC PostgreSQL, private DB exposure, migration, backup, service process, TLS path and secret storage. Do not reuse archived `.env` credentials without rotation and explicit provisioning.
2. Configure a real sender/provider and a test mailbox. Register through the deployed private Site; confirm persisted pending state, genuine inbox arrival, one-time email action and authoritative verified state. Sign in, refresh, sign out, confirm revocation, sign in again; test resend and password-reset email/action. Record environment/provider/path and outcome without personal addresses, passwords or tokens.
3. Run account-service `npm test` plus actual PostgreSQL migration verification. Run Site `node --test tests/*.test.mjs`, `pnpm lint`, `pnpm build`. Run a private-browser account journey, direct verification/reset links and mobile/tablet/laptop forms. Fix blockers. Review Privacy/Terms against the real provider and cookie behaviour.
4. Re-run RC v9 browse/search regressions: Home, City/Keyword/School/Map search, Results, Map pin/list, Property Detail, About, Contact, Privacy, Terms, sample disclosures, images/fallbacks, report email draft, browser Back/Forward and local demo actions. Confirm real account identity is not confused with demo profile/listing persistence.
5. Commit a clean integration, save/deploy a **new owner-private RC**, verify its exact version/commit/deployment and Worker logs, repeat the relevant private-browser checks, record results and rollback candidate in the tracker. Only then assess feature freeze. A committed branch or local SMTP capture is not a deployment or real inbox proof.

## Public opening — only after those gates and owner approval

1. At the approved launch time, verify the exact private auth RC, current Git state, successful deployment, no launch blockers and owner-only `custom` access. Confirm rollback IDs are still available. Obtain the owner's decision to open access.
2. Use Sites **update site access** for the exact project ID to set `access_mode: public`; read back the policy. Record time, RC, commit and deployment. If it fails, leave access closed.
3. From a genuinely signed-out fresh browser/device, open the HTTPS URL. Check guest Home → Search → Results/Map → Property Detail, sample disclosure, Contact/Privacy/Terms, report draft and a minimal account registration/login journey with an authorised test account. Include a mobile navigation check. Public smoke occurs **after** the access switch, never in advance.
4. Query recent Sites Worker errors and inspect client journeys directly. A clean Worker log alone is not evidence of client health; no separate client error monitor has been verified. Review messages sent to `support@balhinbalay.com` through the owner's normal mailbox. Record outcomes in the tracker.

## Containment and rollback

If account creation, email verification, login, basic browse/search, privacy or public routing fails materially, return the Site to owner-only `custom` access. Deploy a saved known-good version as needed and poll deployment status until succeeded. RC v9 restores browse/search while account launch remains on hold. Never treat a saved-version ID as a deployment ID. Record cause, time, new deployment and follow-up in the tracker/Idea Register.
