# BalhinBalay React migration handoff

Checkpoint: 13 September 2026. Broad React conversion/parity work is complete and the branch is in final acceptance. Overall project status remains **PARTIAL** because live-service/account QA, one accepted-but-parameterised search change, backend location-privacy enforcement, final user acceptance, merge and deployment are still outstanding.

## Continuity and location

This is the existing React migration, not a replacement application.

- Repository: https://github.com/khaCey/balhinbalay
- Pull request: PR #1, draft, targeting `dev`
- Working branch: `feature/react-prototype-ui`
- Approved static Site remains the visual reference.
- Owner-form/frontend QA baseline: `6557357c5193f6b47074403f4cb1ba7164381507`
- No merge to `dev` or production deployment has been performed.

## Completed frontend/parity work

The React application now covers the migrated user-facing flows while preserving the approved prototype appearance and existing supported application contracts.

Completed and verified areas include:

- shared foundations, responsive header/mobile navigation and common UI primitives;
- Home, city-first search entry and listing rails;
- City, Keyword, School and Map search modes and results presentation;
- Property Detail, Saved, Recently viewed, comparison and map property preview;
- account/profile/settings and messaging views;
- My properties owner cards and supported owner actions;
- Owner Add/Edit Property six-step flow;
- owner photo empty/uploaded states;
- edit-existing and availability-edit owner states;
- new owner listings defaulting to Region VII → Cebu → Cebu City;
- accepted Privacy Choices banner behaviour;
- unsupported controls hidden rather than simulated, including the owner exact-map-pin control while the privacy/backend model is incomplete.

## Verification completed

On the owner-form/frontend QA baseline `6557357c5193f6b47074403f4cb1ba7164381507`:

- React tests/build passed;
- main visual QA passed at 320, 375, 390, 1280, 1440 and 1920 px;
- dedicated Owner Form visual QA passed at mobile and desktop widths across all six steps;
- owner photo empty/uploaded states were captured;
- edit-existing and availability-edit states were captured;
- all three GitHub checks were green:
  - React conversion validation run `34747626165`;
  - Owner form visual QA run `34747626193`;
  - React visual QA run `34747626205`.

The temporary one-shot workflow used during the 13 September live-service investigation was removed after use and is not part of the application.

## Live service QA: blocked by production tunnel

A read-only production smoke check was attempted against `https://balhinbalay.com` on 13 September 2026. It did not mutate production data or create accounts.

Both the root site and API endpoints returned **HTTP 530** from Cloudflare with **error code 1033**:

- `https://balhinbalay.com/`
- `https://balhinbalay.com/api/health`
- `https://balhinbalay.com/api`
- `https://www.balhinbalay.com/`

Evidence: GitHub Actions diagnostic run `34753584283`.

Because the public Cloudflare Tunnel is not currently delivering traffic to the origin, live API compatibility and authenticated account-state QA cannot be completed yet. Do not mark those checks passed until the tunnel is healthy and the live flows are exercised with an authorised test account.

## Remaining decisions and dependent work

### School-radius slider

`IDE0071` accepts a continuous distance slider for School search, but implementation remains **BLOCKED** by `IDE0076`, which is still **PROPOSED**. Minimum distance, maximum distance and increment/step must be accepted before implementation. The existing 10 km behaviour remains in place; do not invent replacement values.

### Exact versus approximate property location

`IDE0068` remains **PARTIAL**.

Frontend exposure has been reduced safely:

- Property Detail no longer renders a stored exact-coordinate map as the public location;
- the owner form does not expose a map-pin control that the current backend cannot protect correctly.

However, the current API still stores/returns the legacy exact `coordinates` field and Map Search still consumes it. The accepted model requires exact coordinates to remain private by default, a separate safe public/approximate location, and an explicit Lister opt-in before public exact-location disclosure. That backend/API separation is not implemented in this migration and should not be faked in the frontend.

## Still pending before React migration completion

1. Restore the production Cloudflare Tunnel/origin path and rerun public live API checks.
2. Exercise login/session/account-backed states with an authorised live or staging test account.
3. Accept the `IDE0076` school-radius minimum/maximum/step values, then implement and verify `IDE0071`.
4. Implement the backend/API exact-private versus public-approximate location model for `IDE0068` when the database/API design is ready.
5. Obtain final user visual acceptance.
6. Review PR #1, merge to `dev`, and deploy through the normal deployment process.

## Do not redo

Do not regenerate the React project, redo completed pages from the static export, restore unsupported controls merely for visual parity, or silently choose pending business-rule values. Continue from the current branch and only change areas supported by evidence or an accepted decision.
