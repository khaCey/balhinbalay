# WRK0068 — Next.js security patch

21 October 2026 JST. Owner accepted IDE0197 for implementation and testing only. No merge, deployment, runtime, database, ingress or public-access change is included.

## Source and scope

The candidate is stacked on media/sharing PR9 at 84bf1ba50dcd20c887e7d1555dd3f73498169526. Application/test source is unchanged. The only direct dependency changes are next and eslint-config-next from exact16.3.6 to exact16.3.8. The lockfile replaces12 Next-family package records, corresponding snapshots and Next peer references; shared package/snapshot records are unchanged. Vinext1.0.0-beta.5, React19.2.6, account dependencies, migrations, scoped overrides and the10080-minute minimum release age are unchanged.

The additional hosted workflow runs the existing media/sharing verification on this isolated branch. It uses disposable PostgreSQL/PostGIS and synthetic browser/API fixtures, read-only repository permissions and no production secrets. Documentation-only follow-ups do not rerun the application checks.

## Verification

The upstream advisory GHSA-cjq9-62q9-8jv4 identifies16.3.8 as patched. Fresh npm metadata reports next16.3.8 published2026-09-30T16:07:21.198Z and eslint-config-next16.3.8 published2026-09-30T15:59:39.390Z, satisfying the existing release-age requirement. No age bypass or advisory suppression was used.

Local frozen install, Site91/91, account45/45, lint0 errors/two existing warnings, production build, initial HTTP crawler/browser metadata and withdrawal/error fallback smoke all pass. Production audit: Site0 HIGH/CRITICAL with1 moderate/1 low remaining; account0 vulnerabilities. The remaining findings are not silently fixed or waived by this two-package task.

Hosted verification SUCCESS: https://github.com/khaCey/balhinbalay/actions/runs/39529385494 on code commit0b08662798dbab52db7ed4466325873c11deea7f/treebe5d9854a55b11a1c1153a0d254d04e4a8834b2f. Account45/45, Site91/91 and full native PostgreSQL/PostGIS integration110/110 pass. Actual runner database reports PostgreSQL18.6/PostGIS3.6.4. Frozen installs, lint/build, HTTP metadata, mobile/desktop Chromium photo controls, source integrity and production audit gates all pass. Chromium covers gallery changes, sequential uploads, unsaved fields, cover/reorder/remove, stale-version recovery and approved read-only photos. Browser screenshots are retained in the run artifact. A final documentation-only commit does not change the verified application/dependency bytes.

## Release limits

PR9 and this stacked patch are not integrated into server. Reporting PR8 and calendar-date PR10 are separate source candidates and were not silently combined here. A later reviewed integration must resolve the reporting/media migration catalogue and apply the date correction as appropriate. Historical release/migration verifiers remain unchanged.

Work returns REVIEW after verification. IDE0197 remains PARTIAL until independent review and authorised integration/runtime verification. The patch does not itself prove live Facebook unfurl behaviour, SMTP readiness, Akamaru public ingress or production deployment readiness.

References: https://github.com/advisories/GHSA-cjq9-62q9-8jv4 ; docs/wrk0062/HANDOFF.md ; IDE0167 superseded for its exact Next/ESLint pin only; accepted IDE0197 and WRK0068.
