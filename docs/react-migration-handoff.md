# BalhinBalay React migration handoff

Checkpoint: 13 September 2026. Broad React conversion/parity work is complete and the branch is in final acceptance. Overall migration status remains **PARTIAL** only because final user visual acceptance, PR readiness/review, merge to `dev` and deployment are still outstanding.

Per **IDE0077**, the current BalhinBalay API is **not** part of this migration's acceptance gate. Live API integration, authenticated account-state QA and API-dependent backend verification are deferred until the API is reworked. Do not spend migration time certifying an API contract that is already scheduled for redesign.

## Continuity and location

This is the existing React migration, not a replacement application.

- Repository: https://github.com/khaCey/balhinbalay
- Pull request: PR #1, draft, targeting `dev`
- Working branch: `feature/react-prototype-ui`
- Approved static Site remains the visual reference.
- Owner-form/frontend QA baseline: `6557357c5193f6b47074403f4cb1ba7164381507`
- No merge to `dev` or production deployment has been performed.

## Completed frontend/parity work

The React application now covers the migrated user-facing flows while preserving the approved prototype appearance and existing supported frontend behaviour.

Completed and verified areas include:

- shared foundations, responsive header/mobile navigation and common UI primitives;
- Home, city-first search entry and listing rails;
- City, Keyword, School and Map search presentation;
- Results presentation and supported filter UI;
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

On the owner-form/frontend QA baseline `6557357c5193f6b47074403f4cb1ba7164381507` and subsequent documentation head:

- React tests/build passed;
- main visual QA passed at 320, 375, 390, 1280, 1440 and 1920 px;
- dedicated Owner Form visual QA passed at mobile and desktop widths across all six steps;
- owner photo empty/uploaded states were captured;
- edit-existing and availability-edit states were captured;
- current-head React conversion validation, Owner Form visual QA and main React visual QA were green before this scope-only documentation update.

A one-shot read-only production probe previously found the public tunnel unavailable. That diagnostic is retained as historical evidence only. Per IDE0077, restoring or certifying the current API/tunnel is **not required to complete this React migration**.

## API scope boundary: IDE0077

The user explicitly decided that the existing API should not be used or certified yet because it needs to be reworked.

Therefore, the following are **deferred from this migration**:

- live API compatibility testing;
- authenticated live/staging account-state QA against the current API;
- persistence verification that depends on the current API contract;
- backend work whose correct shape depends on the API redesign.

This deferral does **not** mark those behaviours implemented. It only removes them from the frontend migration acceptance criteria.

## Separate product/backend work

### School-radius slider

`IDE0071` accepts a continuous distance slider for School search, but implementation remains **BLOCKED** by `IDE0076`, which is still **PROPOSED**. Minimum distance, maximum distance and increment/step must be accepted before implementation. Because unsupported controls must not be simulated, the slider should not be exposed as functional until its parameters and eventual integration are settled.

This work is tracked separately and does not block acceptance of the current React migration.

### Exact versus approximate property location

`IDE0068` remains **PARTIAL**.

Frontend exposure has been reduced safely:

- Property Detail no longer renders a stored exact-coordinate map as the public location;
- the owner form does not expose a map-pin control that the current backend cannot protect correctly.

The future API/data model still needs to separate private exact coordinates from a safe public approximate location and support explicit Lister reveal. This work belongs with the API/backend redesign and must not be faked in the frontend.

## Remaining before React migration completion

1. Obtain final user visual acceptance.
2. Review PR #1 and move it out of Draft when accepted.
3. Merge PR #1 to `dev`.
4. Handle deployment separately through the normal deployment process.

API redesign/integration, IDE0068 backend enforcement and IDE0071 functional integration remain separately tracked follow-up work.

## Do not redo

Do not regenerate the React project, redo completed pages from the static export, restore unsupported controls merely for visual parity, test against or extend the current API unless the API redesign work is explicitly started, or silently choose pending business-rule values. Continue from the current branch and only change areas supported by evidence or an accepted decision.
