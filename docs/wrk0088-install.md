# WRK0088 mobile home-screen installation

Source-only, not merged/deployed. Base6c6efc258eef0793570b23e9b9464c4844b888ef; current productiond4ada549 unchanged.

Manifest at /manifest.webmanifest, standalone/root identity; existingfavicon house geometry rasterised into192/512 icons, safe padded maskable512 and Apple180. Client banner uses browser beforeinstallprompt once, catches errors and hides after choice; Install follows user click. iPhone/iPad instructions after12seconds. Not now suppresses7days; storage failures tolerated. Already standalone and appinstalled hide it. No serviceworker/offline/auth caching, dependencies, backend or DB changes.

Verification: changed component+layout ESLint PASS, production Vinext build PASS. Used existing staging wrk0061 node_modules via untracked symlink, so this is NOT a fresh frozen-install validation. Actual isolated built server12718788: manifest200/validJSON,4PNG200image/png+dimensions, initialHTML manifest/Apple metadata PASS; server stopped. No browser automation used per owner instruction. Native Android prompt, iPhoneShare UI, dismissal/react lifecycle and actual installed-mode behaviour require browser/device acceptance; not claimed passed.

No auto deployment. Coordinator review, fresh locked dependency validation and actual device acceptance precede later build/promotion. UI branch inherits newer approved WRK0087 retry changes from server; production must not silently be updated.
