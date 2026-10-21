# WRK0070 source handoff

Updated20 October2026 JST. Operational snapshot; live Work Queue/Idea Register remain authoritative.

WRK0069 independently reproduced pgDATE→local-midnightDate→timezone-dependent frozenISO under UTC/Tokyo/NewYork. WRK0070 implements a pool-local textDATE parser in a shared account-service factory, used by the production entrypoint and relevant native integration fixtures. Date-only values remain YYYY-MM-DD; timestamps, global pg parser and binary formats are unchanged.

Parent source is reporting PR8 cda46df246379bdfc6f0220c68edd1d217a1b214. Dedicated branch codex/wrk0070-calendar-dates is a stacked candidate; no accepted parent source rewritten, merge, production deployment, migration or dependency change. Existing ambiguous immutable snapshots remain failclosed and untouched. Exact root cause, compatibility boundary and verification are in docs/wrk0070-calendar-dates.md.

NativePG18.2/PostGIS3.6.2 calendar/publication/reporting20/20 in each of UTC,Asia/Tokyo,America/New_York; Site79/79; account46/46; lint0 errors/two existing warnings; production build PASS. Isolated55433 cluster is to be stopped after tests, with test databases removed. Work returns REVIEW, not COMPLETE; separate Coordinator acceptance required.

Next permission-dependent work is IDE0197/WRK0068's proposed Next16.3.8 and eslint-config-next16.3.8 dependency patch. It explicitly awaits Owner acceptance and is not authorised by the earlier reporting/media tasks. No patch to those dependencies ran here. SMTP/ingress/cutover and parked WRK0043 retain their separate live queue states.
