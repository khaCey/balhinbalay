# Changelog

## v.1.0.00.178 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Replace Android app launcher icons with assets from the project’s "android icons" folder (mipmap-* and values/ic_launcher_background).

### Changes (detailed)

#### Changed
- android/app/src/main/res/: mipmap-anydpi-v26, mipmap-ldpi, mipmap-mdpi, mipmap-hdpi, mipmap-xhdpi, mipmap-xxhdpi, mipmap-xxxhdpi, and values/ic_launcher_background.xml replaced/copied from "android icons" folder.

## v.1.0.00.177 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix Android app icon: replace all mipmap launcher assets with logo.png so the default Capacitor/Android icon no longer appears.

### Changes (detailed)

#### Changed
- android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/: ic_launcher.png, ic_launcher_round.png, and ic_launcher_foreground.png in each folder replaced with public/logo.png.
- android/app/src/main/AndroidManifest.xml: reverted to android:icon="@mipmap/ic_launcher" and android:roundIcon="@mipmap/ic_launcher_round" so standard mipmap resolution is used.
- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml and ic_launcher_round.xml: reverted foreground to @mipmap/ic_launcher_foreground (now our logo in each density).

## v.1.0.00.176 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Use public/logo.png as the native app icon for Android and iOS (Capacitor).

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_launcher_foreground.png: copy of public/logo.png used as app icon.

#### Changed
- android/app/src/main/AndroidManifest.xml: android:icon and android:roundIcon set to @drawable/ic_launcher_foreground (replacing @mipmap/ic_launcher and @mipmap/ic_launcher_round).
- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml: foreground drawable set to @drawable/ic_launcher_foreground.
- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml: foreground drawable set to @drawable/ic_launcher_foreground.
- ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png: replaced with public/logo.png (1024×1024 source recommended for best quality).

## v.1.0.00.175 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Add build:tunnel script and doc so tunnel build always uses https://balhinbalay.com (fix "Failed to fetch" with localhost after hard reset).

### Changes (detailed)

#### Added
- package.json: script build:tunnel (env-cmd -f .env.production craco build).
- TUNNEL.md: use npm run build:tunnel and optional "rm -rf build" + rebuild if API still shows localhost.

## v.1.0.00.174 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Android app: production build script and docs so app works via tunnel (https://balhinbalay.com/api) from anywhere.

### Changes (detailed)

#### Added
- package.json: script cap:sync:android:production (env-cmd -f .env.production npm run build && npx cap sync android).
- CAPACITOR.md: "Production / tunnel (use from anywhere)" and cap:sync:android:production in API URL section and commands table.
- TUNNEL.md: Android app note and npm run cap:sync:android:production.

## v.1.0.00.173 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Reroute app to use https://balhinbalay.com/api in production builds via .env.production.

### Changes (detailed)

#### Added
- .env.production: REACT_APP_API_URL=https://balhinbalay.com so production build uses tunnel API.
- TUNNEL.md: note that production build uses tunnel URL for API.

## v.1.0.00.172 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Add TUNNEL.md: Cloudflare Tunnel (cloudflared) setup to expose local server + React app from outside the network.

### Changes (detailed)

#### Added
- TUNNEL.md: Install cloudflared, login, create tunnel, config.yml (hostname → localhost:5000), route DNS, run tunnel; optional service; mobile app note for tunnel URL as API base.

## v.1.0.00.171 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Use direct import from @capacitor/push-notifications instead of registerPlugin so the real plugin (and native bridge) is used on device.

### Changes (detailed)

#### Changed
- src/App.js: From: registerPlugin('PushNotifications') from @capacitor/core (returned "not implemented" stub). To: import('@capacitor/push-notifications') and use PushNotifications so the official plugin and native implementation are used.

## v.1.0.00.170 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix "PushNotifications plugin is not implemented on android": install @capacitor/push-notifications and run cap sync so native plugin is included.

### Changes (detailed)

#### Fixed
- @capacitor/push-notifications was in package.json but not installed in node_modules; native Android project had no push-notifications module. Ran npm install @capacitor/push-notifications and npx cap sync android so capacitor.settings.gradle and capacitor.build.gradle include capacitor-push-notifications (fixes "not implemented on android").

## v.1.0.00.169 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push: retry register() after 15s; add "Enable push notifications" in profile drawer on native so user can manually trigger token registration.

### Changes (detailed)

#### Added
- src/App.js: pushRegisterTrigger state; effect re-runs on trigger; retry PushNotifications.register() after 15s; pass isNative and onEnableNotifications to ProfileDrawer.
- src/components/ProfileDrawer.js: "Notifications" section with "Enable push notifications" button when isNative and onEnableNotifications (triggers push registration again).

## v.1.0.00.168 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix Android build: onResume() override must be public to match BridgeActivity.

### Changes (detailed)

#### Fixed
- android/.../MainActivity.java: onResume() changed from protected to public so override matches parent (fixes "attempting to assign weaker access privileges").

## v.1.0.00.167 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Android 13+: request POST_NOTIFICATIONS from MainActivity on resume so the system "Allow notifications?" prompt appears when the app opens.

### Changes (detailed)

#### Added
- android/.../MainActivity.java: requestNotificationPermissionIfNeeded() in onResume; on API 33+ request POST_NOTIFICATIONS if not granted so the system dialog shows (fixes "no allow notifs prompt").

## v.1.0.00.166 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix push on device: use registerPlugin('PushNotifications') from @capacitor/core so plugin resolves in WebView (fixes "Failed to resolve module specifier '@capacitor/push-notifications'").

### Changes (detailed)

#### Fixed
- src/App.js: From: dynamic import('@capacitor/push-notifications') which fails to resolve in native WebView. To: import('@capacitor/core') then registerPlugin('PushNotifications') so the plugin is provided by the native bridge and no push-notifications module resolution in JS.

## v.1.0.00.165 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push on device: client logs for permission, register(), token, and server POST; log status/data on fail; CAPACITOR debug steps.

### Changes (detailed)

#### Changed
- src/App.js: Push flow now logs "Requesting notification permission…", "Permission granted, calling register()…", "Got FCM token, sending to server…", "Token registered with server." or "Failed to register token" with status/data; log when permission not granted.
- CAPACITOR.md: Added "Debug push on a physical device" (chrome://inspect, what [push] logs mean).

## v.1.0.00.164 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Build for physical Android device: .env.android.device.example and cap:sync:android:device script so phone can reach local server via PC IP.

### Changes (detailed)

#### Added
- .env.android.device.example: template with YOUR_PC_IP for device build; copy to .env.android.device and set PC IPv4.
- package.json: script cap:sync:android:device (env-cmd -f .env.android.device npm run build && npx cap sync android).
- .gitignore: .env.android.device so local IP is not committed.
- CAPACITOR.md: physical device steps and script in API URL section and commands table.

## v.1.0.00.163 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix user_push_tokens migration: user_id must be UUID to match users(id); run migrations to create table.

### Changes (detailed)

#### Fixed
- server/migrations/add-user-push-tokens.sql: From: user_id INT REFERENCES users(id) (foreign key failed). To: user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE to match schema.

## v.1.0.00.162 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix FCM never initializing: start with messaging undefined so first call runs init instead of returning cached null.

### Changes (detailed)

#### Fixed
- server/services/push.js: getMessaging() — From: messaging started as null so first call treated as "cached failure" and never ran Firebase init. To: messaging starts as undefined so first call runs init; null is only set after a failed init.

## v.1.0.00.161 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Load .env with override so GOOGLE_APPLICATION_CREDENTIALS from .env is used even when the shell has an old value.

### Changes (detailed)

#### Changed
- server/index.js: dotenv.config() now uses override: true so .env values (e.g. correct Firebase key path) override existing process.env from the terminal.

## v.1.0.00.160 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push: when FCM is disabled (cached), log last init error so credential path + file-exists case shows why init failed.

### Changes (detailed)

#### Changed
- server/services/push.js: Added lastPushError; on init failure store err.message and log stack. When returning cached null, log lastPushError so "credPath set | exists true" case shows the actual Firebase/init error.

## v.1.0.00.159 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push optional: no console spam when FCM not configured; only log "Push: FCM enabled" when it is.

### Changes (detailed)

#### Changed
- server/services/push.js: When GOOGLE_APPLICATION_CREDENTIALS not set, return null without logging instructions.
- server/index.js: When push disabled, do not log a line (in-app notifications work without push).

## v.1.0.00.158 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix webpack "Can't resolve '@capacitor/push-notifications'" warning: use webpackIgnore on dynamic import.

### Changes (detailed)

#### Changed
- src/App.js: dynamic import of @capacitor/push-notifications now uses /* webpackIgnore: true */ so webpack does not resolve the native-only module at build time; runtime import still works in Capacitor app.

## v.1.0.00.157 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push false: clearer server instructions and .env.example; check credential file exists before init.

### Changes (detailed)

#### Added
- .env.example: DATABASE_URL and GOOGLE_APPLICATION_CREDENTIALS with short instructions.
- server/services/push.js: When FCM disabled, log 4-step instructions (Firebase key, save file, add to .env, restart). When path set but file missing, log full path and hint.

## v.1.0.00.156 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push (outside app): FCM channel ID, Android default channel, health push status, token registration log, FCM error log, troubleshooting.

### Changes (detailed)

#### Added
- server/services/push.js: android.notification.channelId 'default' and priority for Android 8+ display. Log FCM error code/message when a token fails.
- server/index.js: require getMessaging; /api/health returns push: true/false; startup log "Push: FCM enabled" or "FCM disabled".
- server/routes/users.js: GET /api/users/me/push-token returns { registered: true/false }. Log "[push] Token registered for user X" on POST success.
- android/.../MainActivity.java: create default notification channel "Messages" (id: default) in onCreate so FCM notifications show when app is in background.
- CAPACITOR.md: "Still no push?" checklist (health push, token log, google-services.json, send result).

## v.1.0.00.155 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push (outside app): add listener before register() so token is not missed; document FCM + google-services.json in CAPACITOR.md.

### Changes (detailed)

#### Changed
- src/App.js: Push notification listeners (registration + tap) are now added before requestPermissions/register() so the token event is not missed. Log push registration failures to console.
- CAPACITOR.md: New section "Push notifications (when app is in background or closed)" — Firebase project, google-services.json in android/app, server GOOGLE_APPLICATION_CREDENTIALS, and troubleshooting.

## v.1.0.00.154 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push/in-app notifications debugging: server logs for FCM, SSE, and chat; in-app toast on new message; proxy buffer off for SSE.

### Changes (detailed)

#### Added
- server/services/push.js: Log when FCM is disabled (no creds), when no pool, when no tokens for user, and when send succeeds (N ok, M failed).
- server/chatEvents.js: Log on SSE subscribe (user, connection count) and when notifying user; log when no SSE connection for recipient.
- server/routes/chat.js: Log when new message is sent and recipient user id.
- src/context/ChatContext.js: inAppNotification state; show "New message" toast (fixed top) when threads_updated received; auto-clear after 4s; expose inAppNotification in context.

#### Changed
- src/setupProxy.js: buffer: false on /api proxy so SSE stream is not buffered.

## v.1.0.00.153 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix MessagesModal ReferenceError: compute thread/listing inside effect so threadsWithListing is not used before initialization.

### Changes (detailed)

#### Fixed
- src/components/MessagesModal.js: initialThreadId effect no longer references threadsWithListing (which was declared later). Effect now builds thread list from getThreads() and allListings inside the effect and finds thread/listing there.

## v.1.0.00.152 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Complete push notification flow: open specific thread from notification tap; FCM credential path from project root; FCM data strings; Android POST_NOTIFICATIONS.

### Changes (detailed)

#### Added
- src/App.js: notificationThreadId state; set from push tap data.threadId; pass initialThreadId and onClearInitialThreadId to MessagesModal.
- src/components/MessagesModal.js: initialThreadId and onClearInitialThreadId props; useEffect to auto-open that thread when in list (from notification tap).
- android/app/src/main/AndroidManifest.xml: POST_NOTIFICATIONS permission for FCM on Android 13+.

#### Changed
- server/services/push.js: Resolve FCM credential path from project root (__dirname/../..) when relative so .env at root works. Ensure all FCM data payload values are strings (required by FCM).

## v.1.0.00.151 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix webpack compile: resolve @capacitor/push-notifications only on native via dynamic import; avoid server ENOENT when build/index.html missing.

### Changes (detailed)

#### Changed
- src/App.js: Removed top-level import of @capacitor/push-notifications. Push notification registration and listeners now use dynamic import('@capacitor/push-notifications') inside the native-only useEffect so the web build does not resolve the native plugin. Added cancelled guard to avoid adding listeners after unmount.
- server/index.js: Serve static/SPA fallback only when build/index.html exists (hasIndex). From: serving when BUILD_DIR existed but index.html was missing caused ENOENT. To: require both BUILD_DIR and indexPath to exist before registering static and catch-all.

## v.1.0.00.150 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Server: login error for missing DB column (42703); add npm run migrate; point message to migrate.

### Changes (detailed)

#### Added
- package.json: script "migrate" runs node server/run-migrations.js (applies add-email-confirmation and other migrations).

#### Changed
- server/routes/auth.js: catch 42703 (undefined_column) and return message "Database schema out of date. From project root run: npm run migrate".

## v.1.0.00.149 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Server: clearer login 500 handling and messages (DB/schema); log [auth/login] errors.

### Changes (detailed)

#### Changed
- server/routes/auth.js: login catch logs [auth/login] and message; return specific messages for DB unavailable (503) and missing schema (42P01); otherwise "Login failed. Check server logs for details."

## v.1.0.00.148 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Improve login error messages: clearer fallbacks and use non-JSON response body when present.

### Changes (detailed)

#### Changed
- src/context/AuthContext.js: login failure fallback message suggests checking email, password, and email verification; catch fallback "Connection problem. Check your network and try again." when no server message.
- src/api/client.js: when response is not ok and body is not valid JSON, set err.data.message from raw text (truncated) so it can be shown.

## v.1.0.00.147 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix login in Capacitor app: persist auth with Preferences, restore on launch, show server error messages.

### Changes (detailed)

#### Added
- package.json: dependency @capacitor/preferences.
- src/context/AuthContext.js: Capacitor Preferences for auth in native app; on mount when Capacitor.isNativePlatform() load auth from Preferences and set user/token; saveAuth now also writes to Preferences when native so login persists across app restarts.

#### Changed
- src/context/AuthContext.js: saveAuth is async and clears/writes Preferences when on native platform; login catch returns err.userMessage so server messages (e.g. "Please verify your email") are shown.

## v.1.0.00.146 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Allow HTTP API calls from Capacitor app WebView: mixed content, CORS, and domain-config.

### Changes (detailed)

#### Added
- capacitor.config.ts: android.allowMixedContent: true.
- android/app/src/main/java/.../MainActivity.java: onResume() calls allowMixedContent() to set WebSettings.MIXED_CONTENT_ALWAYS_ALLOW so fetch() to http://10.0.2.2:5000 works in the app (Chrome in emulator already worked).
- android/app/src/main/res/xml/network_security_config.xml: domain-config for 10.0.2.2, localhost, 127.0.0.1 with cleartext permitted.

#### Changed
- server/index.js: CORS origin callback explicitly allows capacitor://, localhost, 10.0.2.2, file://.

## v.1.0.00.145 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Server: make /api/health and /api responses explicit; add listen error handler and Health URL log.

### Changes (detailed)

#### Changed
- server/index.js: /api/health now sets status 200 and Content-Type application/json explicitly; added GET /api returning { message, health }; server logs Health URL on startup; listen error handler for EADDRINUSE and other errors.

## v.1.0.00.144 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- CAPACITOR.md: add Windows Firewall steps to allow port 5000 so emulator can reach host API.

### Changes (detailed)

#### Changed
- CAPACITOR.md: new troubleshooting block "If http://10.0.2.2:5000/api/health fails in the emulator's browser" with steps to create an inbound rule for TCP port 5000 (Private/Domain) so the Android emulator can connect to the backend.

## v.1.0.00.143 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Show API base URL in listings error banner to debug emulator connection; document clean rebuild in CAPACITOR.md.

### Changes (detailed)

#### Changed
- src/App.js: import baseUrl from api/client; in listings error banner show "— API: <baseUrl>" or "— API: same origin" so user can confirm which URL the app is using.
- CAPACITOR.md: add clean-rebuild step (delete build then cap:sync:android:emulator); note that error banner shows API URL to verify build.

## v.1.0.00.142 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix Android emulator not connecting to API: use .env.android.emulator for emulator build (avoids .env override), bind server to 0.0.0.0.

### Changes (detailed)

#### Added
- .env.android.emulator: REACT_APP_API_URL=http://10.0.2.2:5000 (used only by cap:sync:android:emulator).
- package.json: devDependency env-cmd; cap:sync:android:emulator now runs `env-cmd -f .env.android.emulator npm run build` so the build is not overridden by main .env.

#### Changed
- server/index.js: app.listen(PORT, '0.0.0.0', ...) so the server accepts connections from the emulator (host 0.0.0.0).
- CAPACITOR.md: troubleshooting step to restart backend so it listens on 0.0.0.0; note that emulator build uses .env.android.emulator.

## v.1.0.00.141 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- CAPACITOR.md: add troubleshooting for "Failed to fetch" when API runs on host localhost:5000 (rebuild with cap:sync:android:emulator).

### Changes (detailed)

#### Changed
- CAPACITOR.md: added note under Quick start that "Failed to fetch" / "0 properties found" means app was built with wrong API host; instruct to run `npm run cap:sync:android:emulator` then Run in Android Studio.

## v.1.0.00.140 — Development
Date: 2026-03-06
Type: Dev Change

### Summary
- Wire Android emulator: one-command build/sync/open with emulator API URL; add Quick start to CAPACITOR.md.

### Changes (detailed)

#### Added
- package.json: devDependency cross-env; scripts cap:sync:android:emulator (build with REACT_APP_API_URL=http://10.0.2.2:5000, then cap sync android), android:emulator (run cap:sync:android:emulator then cap:android).
- CAPACITOR.md: "Quick start: run in emulator" section (start server, run android:emulator, run in Android Studio); note that backend must be running or API calls fail.

## v.1.0.00.139 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Android-first: allow HTTP (cleartext) for API, add cap:sync:android, docs focused on Android.

### Changes (detailed)

#### Added
- android/app/src/main/res/xml/network_security_config.xml: allow cleartext traffic so HTTP API URLs work (e.g. dev server at 10.0.2.2:5000).
- package.json: script cap:sync:android (build and sync Android only).
- CAPACITOR.md: reordered for Android first (prerequisites, build/run steps, API URL), then iOS; documented cap:sync:android.

#### Changed
- android/app/src/main/AndroidManifest.xml: android:networkSecurityConfig and android:usesCleartextTraffic so backend can be HTTP.

## v.1.0.00.138 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add Capacitor to build Android and iOS apps from the React web app.

### Changes (detailed)

#### Added
- package.json: @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios; scripts cap:sync, cap:android, cap:ios.
- capacitor.config.ts: appId com.balhinbalay.app, appName BalhinBalay, webDir build.
- android/: Capacitor Android project (open with Android Studio).
- ios/: Capacitor iOS project (open with Xcode on macOS).
- CAPACITOR.md: workflow (build/sync, open native IDE), API URL for native builds, useful commands.

## v.1.0.00.137 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Email: default From address to SMTP_USER so IONOS accepts sender (fixes 550 Sender address not allowed).

### Changes (detailed)

#### Fixed
- server/services/email.js
  - sendConfirmationEmail()
  - From: `SMTP_FROM || noreply@SMTP_HOST` (rejected by IONOS when SMTP_FROM unset). To: `SMTP_FROM || SMTP_USER || noreply@SMTP_HOST` so From matches authenticated mailbox.

## v.1.0.00.136 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- .env template: add commented SMTP block (IONOS-ready) so only credentials need to be pasted.

### Changes (detailed)

#### Added
- .env: Commented block for SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM, APP_URL with IONOS host/port and short instructions.

## v.1.0.00.135 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix profile drawer: moved out of header to escape backdrop-filter containment; added AnimatePresence keys; scrim changed from button to div.

### Changes (detailed)

#### Fixed
- src/App.js: ProfileDrawer moved from inside app-header to top-level (sibling to FavoritesModal). From: drawer rendered inside header, broken by parent backdrop-filter creating fixed-position containment. To: drawer renders at root, position:fixed now correct relative to viewport.
- src/components/ProfileDrawer.js: Scrim changed from motion.button to motion.div (role=button, onKeyDown) for overlay semantics; added unique keys for AnimatePresence children (profile-drawer-scrim, profile-drawer-panel) for proper exit animations.

## v.1.0.00.134 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Full UI redesign: modern app aesthetic—card-heavy, soft shadows, rounded corners, pill-shaped buttons. New design tokens, updated header, tabs, property cards, modals, profile, Admin, forms.

### Changes (detailed)

#### Changed
- src/App.css: New design system (--bb-primary #0d7377, softer shadows, larger radius, typography vars); header with backdrop blur; pill segment tabs; property cards with soft shadow, pill View Details; favorites modal card style; filter sheet, modals; profile drawer, admin stat cards, nav pills; global form/btn overrides; transitions 0.25s ease.
- public/index.html: theme-color to #0d7377.

## v.1.0.00.133 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- UI made more mobile-oriented: larger touch targets (48px min), improved padding and spacing, better readability.

### Changes (detailed)

#### Changed
- src/App.css: Touch targets use --bb-tap (48px) for header buttons, listing tabs, view-mode toggle, sort select, favorite button, View Details; header min-height 56px with more padding; listing tabs flex:1 on mobile, 48px min-height; sort bar and results area more padding; property card body padding 16–18px; card title 1.125rem; html -webkit-tap-highlight-color; results-area safe-area insets on mobile; App min-height 100dvh.

## v.1.0.00.132 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- npm start now runs both React dev server and API server concurrently.

### Changes (detailed)

#### Added
- package.json: concurrently ^9.1.2 (devDependency).

#### Changed
- package.json: start script from "craco start" to "concurrently \"craco start\" \"npm run server\"".

## v.1.0.00.131 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Resolved React hooks exhaustive-deps ESLint warnings in MapPicker.

### Changes (detailed)

#### Fixed
- src/components/MapPicker.js: Use onPickRef to avoid stale onPick closure (no deps needed); add center to first useEffect deps; add eslint-disable for markerPosition (second effect handles updates); add markerPosition to second useEffect deps.

## v.1.0.00.130 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add Property section headers use a new color scheme (purple, teal, olive, orange, pink) separate from the main app palette.

### Changes (detailed)

#### Changed
- src/App.css: Added --bb-section-1 through --bb-section-5 (purple #7b1fa2, teal #00796b, olive #558b2f, deep orange #e65100, pink #ad1457). Add Property form section titles now use these instead of --bb-primary/accent/success/price.

## v.1.0.00.129 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Section headers use distinct colours; Contact info header changed from accent to price (orange).

### Changes (detailed)

#### Changed
- src/App.css: Add Property form section titles — Contact info (nth-child 5) from var(--bb-accent) to var(--bb-price); Basic info, Location, Property details, Images remain primary, accent, success, primary-soft respectively.

## v.1.0.00.128 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed validateDOMNesting: button cannot appear as descendant of button in FavoritesModal.

### Changes (detailed)

#### Fixed
- src/components/FavoritesModal.js: Changed favorites-modal-card from `<button>` to `<div role="button">` so FavoritesButton (which renders a button) is no longer nested inside a button. Added tabIndex={0} and onKeyDown for Enter/Space to preserve accessibility.

## v.1.0.00.127 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Moved heart (favorite) icon to top-right corner of property cards.

### Changes (detailed)

#### Changed
- src/components/PropertyListCard.js: FavoritesButton moved from image container to card-level; position-absolute top-0 end-0 for top-right of full card.
- src/components/PropertyCard.js: Same; FavoritesButton at card level, top-right.
- src/components/FavoritesModal.js: FavoritesButton moved from image wrap to card level; positioned top-right of card.
- src/App.css: .favorites-modal-card — Added position: relative for fav positioning.

## v.1.0.00.126 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Removed logo from profile sidebar/drawer header.

### Changes (detailed)

#### Removed
- src/components/ProfileDrawer.js: Logo image (profile-drawer-logo) from drawer header; email/user-info remains.
- src/App.css: .profile-drawer-logo styles (orphaned).

## v.1.0.00.125 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Reverted Messages component to original look (right-side panel with minimize/close, list rows).

### Changes (detailed)

#### Changed
- src/components/MessagesModal.js: Reverted to messages-panel-wrap / messages-panel structure, minimize and close buttons, original row layout (unread dot + avatar + title · participant + time, preview).
- src/App.css: Removed messages-modal-* styles; kept messages-panel-* as active.

## v.1.0.00.124 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile and Add Property modals converted to full-page routes (/profile, /add-property, /add-property/:id) with mobile-app layout.
- Profile drawer and header actions now navigate to pages instead of opening modals.
- Edit property flow navigates to /add-property/:id.

### Changes (detailed)

#### Added
- src/pages/ProfilePage.js — Full-page account view; profile section, change password section; login gate for guests.
- src/pages/AddPropertyPage.js — Full-page add/edit property form; login gate for guests.
- src/components/AddPropertyForm.js — Extracted form from AddPropertyModal; reusable by modal and page.
- src/context/LoginModalContext.js — LoginModalProvider, useLoginModal(); allows opening login from any route.
- src/App.css: .profile-page, .add-property-page, .page-header, .page-header-back, .page-header-title, .page-content, .page-section, .page-section-gate, .page-gate-text, .profile-page-section, .add-property-page-form styles.

#### Changed
- src/App.js: Added routes /profile, /add-property, /add-property/:id; wrapped Routes with LoginModalProvider; removed showProfileModal, showAddPropertyModal, editProperty state; Profile drawer onProfile/onAddProperty and header Profile/Add buttons now navigate; handleEditListing navigates to /add-property/:id; removed ProfileModal, AddPropertyModal, LoginModal from render; AppContent uses useLoginModal().openLogin() for login.
- src/components/AddPropertyModal.js: Refactored to use AddPropertyForm; kept for potential modal use elsewhere.

## v.1.0.00.123 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile drawer stays open when clicking Add property, My properties, Profile, or Log out.

### Changes (detailed)

#### Changed
- src/components/ProfileDrawer.js: handleAction(fn) — From: fn(); onClose(); To: fn() only. Drawer no longer auto-closes on button click; user closes via X or scrim.

## v.1.0.00.122 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Filter sidebar no longer closes when clicking Search Properties, Apply, Save, or other buttons; stays open until X or backdrop.

### Changes (detailed)

#### Changed
- src/App.js: onApply no longer closes filter; applySavedSearchState no longer closes filter; added onClick stopPropagation on filter-sheet to prevent accidental backdrop clicks.
- src/components/FilterSidebar.js: added stopPropagation on content wrapper and all buttons (Save, Apply, Delete, Search Properties, Advanced filters toggle).

## v.1.0.00.121 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Distinguish search results vs My Properties view; logo as home button.

### Changes (detailed)

#### Added
- src/App.js: handleLogoHome() — resets filters, showMyPropertiesOnly, scrolls to top. Logo wrapped in button with aria-label="Home".
- src/components/SortBar.js: isMyProperties prop — "X of your property/properties" when true, "X property/properties found" when false.

#### Changed
- src/App.js: pass isMyProperties={showMyPropertiesOnly && !!user} to SortBar; add house icon to my-properties-bar text.
- src/App.css: .app-logo-btn (reset styles, cursor pointer, hover opacity); .my-properties-bar — stronger styling (accent background, 2px border, house icon with margin).

## v.1.0.00.120 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- My properties icon changed from user to house.

### Changes (detailed)

#### Changed
- src/App.js: My properties icon fa-user → fa-house (mobile menu + desktop header).
- src/components/ProfileDrawer.js: My properties icon fa-user → fa-house.

## v.1.0.00.119 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix admin Unlist (and Approve/Relist); modal awaits API before closing; errors keep modal open.

### Changes (detailed)

#### Fixed
- src/pages/AdminPage.js: handleListingStatus(listingId, status)
  - From: Approve used handleListingStatus(id) only, so status was undefined → 400 error.
  - To: onApprove now passes (id) => handleListingStatus(id, 'approved'); rethrow on error so modal can detect failure.
- src/components/AdminListingDetailModal.js: Unlist/Relist/Approve handlers
  - From: Fire-and-forget; modal closed immediately; errors often missed.
  - To: await async callbacks; close only on success; show loading state; stay open on error.

#### Changed
- src/pages/AdminPage.js: add .catch(() => {}) to table-row Unlist/Relist/Approve buttons to avoid unhandled rejection.

## v.1.0.00.118 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Restore Search header button; opens filter sheet instead of saved searches modal.

### Changes (detailed)

#### Changed
- src/App.js: add Search button (mobile + desktop) that calls setFiltersOpen(true).

## v.1.0.00.117 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Unify saved search with filters; remove standalone modal and Searches button.

### Changes (detailed)

#### Added
- src/components/FilterSidebar.js: saved filters section (save row, list with Apply/Delete); useSavedSearches; currentFilterState, onApplySavedState props.
- src/App.css: .filter-saved-presets, .filter-saved-save-row, .filter-saved-list, etc.

#### Changed
- src/App.js: remove SavedSearchesModal, showSavedSearchesModal, both Searches header buttons; pass currentFilterState, onApplySavedState to FilterSidebar.

#### Removed
- src/components/SavedSearchesModal.js: deleted.
- src/App.css: saved-searches modal styles (replaced by filter-saved-*).

## v.1.0.00.116 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile drawer slides in from right instead of left.

### Changes (detailed)

#### Changed
- src/components/ProfileDrawer.js: initial/exit x from -100% to 100%.
- src/App.css: .profile-drawer-panel left: 0 to right: 0.

## v.1.0.00.115 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Mobile nav patterns: Drawer for profile; framer-motion bottom sheets for filters, favorites, saved searches.

### Changes (detailed)

#### Added
- framer-motion dependency.
- src/components/ProfileDrawer.js: slide-in drawer for mobile profile/account menu (82vw max 360px, Escape to close).
- src/App.css: .profile-drawer-* styles; .filter-backdrop-animated, .filter-sheet-mobile; .favorites-modal-handle.

#### Changed
- src/App.js: ProfileDrawer for mobile (replaces dropdown); filter sheet uses AnimatePresence + motion on mobile.
- src/components/FavoritesModal.js: AnimatePresence, motion backdrop + sheet (y 100%→0, 0.24s easeOut).
- src/components/SavedSearchesModal.js: same framer-motion bottom sheet pattern.
- Desktop filter sheet and profile dropdown unchanged.

## v.1.0.00.114 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Sync updated signed logo to public/logo-nav.png.

### Changes (detailed)

#### Changed
- public/logo-nav.png: replaced with updated signed logo from project root.

## v.1.0.00.113 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Split logo usage: logo.png for favicon only; signed logo (logo-nav.png) for navigation/header.

### Changes (detailed)

#### Added
- public/logo-nav.png: nav logo with site name (from signed logo.png).

#### Changed
- src/App.js: header img uses /logo-nav.png instead of /logo.png.
- Favicon remains /logo.png.

## v.1.0.00.112 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Sync updated logo.png to public folder.

### Changes (detailed)

#### Changed
- public/logo.png: replaced with updated logo from project root.

## v.1.0.00.111 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Use logo.png as site logo and favicon.

### Changes (detailed)

#### Added
- public/logo.png: copy of root logo.png for serving.
- public/index.html: favicon link to logo.png.
- src/App.css: .app-logo-img for header logo image.

#### Changed
- src/App.js: replace text logo with img src="/logo.png".
- src/App.css: .app-logo removed; .app-logo-img responsive (32px mobile, 40px desktop).

## v.1.0.00.110 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table: alternating row stripes for readability.

### Changes (detailed)

#### Added
- src/App.css: .admin-table tbody tr:nth-child(odd/even) stripes; hover overrides stripe.

## v.1.0.00.109 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table: fixed height even with little/no content.

### Changes (detailed)

#### Changed
- src/App.css: .admin-table-wrap
 - From: max-height only; table shrinks when few rows.
 - To: min-height: min(60vh, 500px); table area always same size.

## v.1.0.00.108 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin Pending listings: add search by title, owner, type.

### Changes (detailed)

#### Added
- src/pages/AdminPage.js: pendingListingSearch state; filteredPendingListings; search input for pending tab.

## v.1.0.00.107 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table always visible; empty/loading shown as table row.

### Changes (detailed)

#### Changed
- src/pages/AdminPage.js: table always renders; loading/empty as single row with colspan.
- src/App.css: .admin-table-empty for centered muted cell.

## v.1.0.00.106 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin: single prerendered table; headers and rows switch by tab.

### Changes (detailed)

#### Changed
- src/pages/AdminPage.js: one section, one table; thead/tbody content conditional on adminTab; search inputs for all/users only.

## v.1.0.00.105 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table: scrollable with sticky header (max-height, overflow-y).

### Changes (detailed)

#### Changed
- src/App.css: .admin-table-wrap — overflow-y: auto, max-height: min(60vh, 500px), border; .admin-table th — position: sticky, top: 0, box-shadow.

## v.1.0.00.104 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin page: tabs switch table content instead of scrolling.

### Changes (detailed)

#### Changed
- src/pages/AdminPage.js: adminTab state; nav links → buttons; conditional render of All/Pending/Users sections.
- src/App.css: .admin-nav-link as button styles; .admin-nav-link.active for selected tab.

## v.1.0.00.103 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat button uses price color (F68048).

### Changes (detailed)

#### Changed
- src/App.css: .btn-chat — background var(--bb-price); hover #e06d38.

## v.1.0.00.102 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price color: F68048 (coral orange).

### Changes (detailed)

#### Changed
- src/App.css: --bb-price: #f68048; price styles use var(--bb-price).
- src/components/MapView.js: popup price color #F68048.

## v.1.0.00.101 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Use D2C1B6 (--bb-accent-light) for all price displays.

### Changes (detailed)

#### Changed
- src/App.css: .property-price, .recently-viewed-card-price, .favorites-modal-card-price — color: var(--bb-accent-light).
- src/App.css: .admin-table-price added for admin table price cells.
- src/components/MapView.js: map popup price color #D2C1B6.
- src/pages/AdminPage.js: add admin-table-price class to price cells.

## v.1.0.00.100 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Apply slate-blue palette (1B3C53, 234C6A, 456882, D2C1B6).

### Changes (detailed)

#### Changed
- src/App.css: :root — primary #1b3c53, primary-soft #234c6a, accent #456882, accent-light #d2c1b6; surface/border/text cooler; shadows use navy tint.

## v.1.0.00.99 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Apply warm coral–yellow palette (FF5A5A, FF8B5A, FFA95A, FFD45A).

### Changes (detailed)

#### Changed
- src/App.css: :root — primary #e04a4a (from FF5A5A), primary-soft #ff8b5a, accent #ffa95a, accent-hover #ff9240; surface/border/text tuned for warm palette; shadows use coral tint.

## v.1.0.00.98 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Update colour scheme: coastal teal primary, lighter surfaces, warmer accent.

### Changes (detailed)

#### Changed
- src/App.css: :root — primary #0d3b2c→#0c5460, primary-soft #1a5c45→#14707d, accent-hover darker; surface #faf9f7→#f5f8f9, border cooler; text tones adjusted; success #2d7d5e→#2d8f6f; shadows use teal tint.

## v.1.0.00.97 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove debug outlines from image upload section.

### Changes (detailed)

#### Removed
- src/components/AddPropertyModal.js: add-property-images-debug class.
- src/App.css: Debug outline rules for image upload divs.

## v.1.0.00.96 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move X button inside image container so it positions correctly on thumbnail.

### Changes (detailed)

#### Changed
- src/components/AddPropertyModal.js: X button now inside add-property-thumb-img.
- src/App.css: .add-property-thumb-img overflow: visible (was hidden) so button isn't clipped; img border-radius for clipping.

## v.1.0.00.95 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Thumbnail image fill fix: inner clip div, stronger overrides.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: .add-property-thumb-img wrapper around img.
- src/App.css: .add-property-thumb-img with overflow:hidden; img position:absolute inset:0 with !important overrides.

#### Changed
- src/App.css: .add-property-thumb-wrap — min-width/height, flex-shrink:0.

## v.1.0.00.94 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix thumbnail image not filling container (black margin around image).

### Changes (detailed)

#### Fixed
- src/App.css: .add-property-thumb-wrap img — From: width/height 100% only. To: position:absolute, inset:0, max-width:none, max-height:none — overrides Bootstrap/Leaflet img constraints so image fills 64x64 box.

## v.1.0.00.93 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image remove X: center on top-right corner (transform: translate 50%, -50%).

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — top:0 right:0 + transform for corner placement; thumb-wrap overflow:visible.

## v.1.0.00.92 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image remove X: revert to top-right corner (4px inset).

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — top:4px right:4px (corner placement).

## v.1.0.00.90 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Symmetrical X for image remove: SVG icon, centered on corner; thumb-wrap overflow visible.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-wrap overflow: visible; .add-property-thumb-remove top:0 right:0 + transform: translate(50%,-50%) for centered corner placement; img border-radius.
- src/components/AddPropertyModal.js: Replace fa-times with symmetrical SVG X.

## v.1.0.00.89 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move image remove X higher.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — From: top: 2px, right: 2px. To: top: -4px, right: -4px.

## v.1.0.00.88 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image remove button: plain X only, no background.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — transparent background, text-colour X; hover uses primary.

## v.1.0.00.87 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove horizontal section divider bars from add-property form.

### Changes (detailed)

#### Removed
- src/App.css: border-bottom from .add-property-form-section.

## v.1.0.00.86 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move section accent bar to left side of headers.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-section-title — horizontal accent bar on right side of header (::after, flex layout); bar extends from text to right edge.

## v.1.0.00.85 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove circular shape from image remove button; use rounded square.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — From: border-radius: 50%. To: border-radius: 4px.

## v.1.0.00.84 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Province and City on one line; add coloured accents to add-property form sections.

### Changes (detailed)

#### Changed
- src/components/AddPropertyModal.js: Province and City in a row (col-6 each) for compact layout.
- src/App.css: .add-property-section-title — coloured headers per section (primary, accent, success, primary-soft); removed left borders.

## v.1.0.00.83 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Group add-property form into sections for readability: Basic info, Location, Property details, Images, Contact info.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: Section wrappers with headings (Basic info, Location, Property details, Images, Contact info).
- src/App.css: .add-property-form-section, .add-property-section-title for grouped form styling.

#### Changed
- src/components/AddPropertyModal.js: Form structure — fields wrapped in semantic sections; removed duplicate "Images" form label (section title suffices).

## v.1.0.00.82 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove manual latitude/longitude inputs and instruction from add-property form; keep map picker only.

### Changes (detailed)

#### Removed
- src/components/AddPropertyModal.js: "Click on the map to place the pin..." instruction; Latitude (optional) and Longitude (optional) input fields.

## v.1.0.00.81 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove blue tap/focus highlight under cluster pin on hover or tap.

### Changes (detailed)

#### Changed
- src/App.css: .marker-cluster-pin-wrap
  - From: only background/border reset
  - To: outline: none, -webkit-tap-highlight-color: transparent, focus/focus-visible overrides — removes blue oval under pin.

## v.1.0.00.80 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Lower cluster count badge to match white dot position (center of rounded head).

### Changes (detailed)

#### Changed
- src/App.css: .marker-cluster-pin-count
  - From: top: 10px
  - To: top: 13px — moves badge lower into center of pin head.

## v.1.0.00.79 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Cluster count badge positioned like white dot (centered in rounded head of pin).

### Changes (detailed)

#### Changed
- src/App.css: .marker-cluster-pin-count
  - From: top: 2px, transform: translateX(-50%)
  - To: top: 10px, transform: translate(-50%, -50%) — aligns count with white dot on Leaflet marker.

## v.1.0.00.78 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map clusters use pin icon instead of circle; count badge on pin.

### Changes (detailed)

#### Added
- src/App.css: .marker-cluster-pin-wrap, .marker-cluster-pin, .marker-cluster-pin-count for pin-style cluster icon.
- src/components/MapView.js: iconCreateFunction for markerClusterGroup — pin image + count badge.

## v.1.0.00.77 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map marker clustering: nearby pins combine into numbered clusters; zoom/click expands to individual pins.

### Changes (detailed)

#### Added
- src/components/MapView.js: Leaflet.markercluster plugin (CDN); L.markerClusterGroup() for property markers.

#### Changed
- src/components/MapView.js: Markers added to cluster group instead of map; ensureLeaflet → ensureMarkerCluster → initializeMap load order; cleanup removes cluster group.

## v.1.0.00.76 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Hide coordinates and "View on Map" button below property map; keep map preview only.

### Changes (detailed)

#### Removed
- src/components/PropertyModal.js: "Coordinates: lat, lng" paragraph and "View on Map" button below map preview.

## v.1.0.00.75 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Simplify image upload: client-side resize (max 1200px, JPEG 80%) + base64 JSON; remove multipart/multer entirely.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: resizeImageToDataUrl() — uses canvas to resize images before upload; keeps payload small for JSON.

#### Changed
- src/components/AddPropertyModal.js: uploadedImages (data URLs) instead of uploadedFiles; handleImageUpload resizes then stores; always JSON POST.
- src/context/UserListingsContext.js: addListing(listing) only — removed FormData/multipart branch.
- server/routes/listings.js: Removed multer and multipart handling; POST / accepts only JSON with processImages for data URLs.

#### Removed
- server: multer usage from listings route (dependency can stay for future use).

## v.1.0.00.74 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix "Title is required" when uploading with images: multer.any() parses both listing JSON and image files; extract listing from req.files.

### Changes (detailed)

#### Fixed
- server/routes/listings.js: From: multer.array('images') which didn't populate req.body with text fields. To: multer.any() parses all parts; get listing from req.files (fieldname 'listing'), images from fieldname 'images'.

## v.1.0.00.73 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix 404 on image upload: use POST /api/listings for both JSON and multipart instead of separate /upload route.

### Changes (detailed)

#### Changed
- server/routes/listings.js: POST / now accepts both application/json and multipart/form-data; multer runs conditionally for multipart.
- src/context/UserListingsContext.js: postFormData path /api/listings/upload → /api/listings.

## v.1.0.00.72 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Improve error surfacing: show server message or status when generic "Something went wrong"; add multer to server deps.

### Changes (detailed)

#### Changed
- src/api/client.js: request() and requestFormData() — From: generic "Something went wrong. Try again." for non-401/403/404/413. To: use data.error/data.message first; else "Request failed (status). Check that the server is running."
- src/components/AddPropertyModal.js: catch — added err?.data?.error to fallback chain.

#### Fixed
- server/package.json: Added multer dependency (was only in root; server needs it for /upload).

## v.1.0.00.71 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix missed rename: setUploadedImages → setUploadedFiles in AddPropertyModal edit-init effect.

### Changes (detailed)

#### Fixed
- src/components/AddPropertyModal.js: useEffect for initialListing — From: setUploadedImages([]). To: setUploadedFiles([]).

## v.1.0.00.70 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image upload via multipart FormData instead of base64 in JSON to fix 413 on small images (e.g. 153kb).

### Changes (detailed)

#### Added
- server/lib/imageProcessor.js: processMulterFiles() — converts multer buffers to WebP.
- server/routes/listings.js: POST /upload route with multer; accepts FormData (listing JSON + image files).
- src/api/client.js: postFormData() for multipart requests.

#### Changed
- src/components/AddPropertyModal.js: Store File objects (uploadedFiles) instead of base64; use addListing(listing, files) for multipart; preview via URL.createObjectURL.
- src/context/UserListingsContext.js: addListing(listing, imageFiles) — uses postFormData to /api/listings/upload when imageFiles present.
- server: multer dependency.

## v.1.0.00.69 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Submit error (e.g. images too large) shown as modal instead of inline alert.

### Changes (detailed)

#### Added
- src/components/ConfirmModal.js: `alertOnly` prop for OK-only modal.

#### Changed
- src/components/AddPropertyModal.js: Replaced inline submit-error div with ConfirmModal (alertOnly, variant="danger"); Import ConfirmModal.

## v.1.0.00.68 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image limit: 2MB per file (client + server); still convert to WebP.

### Changes (detailed)

#### Changed
- src/components/AddPropertyModal.js: Restored 2MB per-file limit in handleImageUpload; updated hint to "Up to 5 images, 2MB each. Converted to WebP on the server."
- server/index.js: express.json limit 200mb → 15mb (enough for 5×2MB base64).
- server/lib/imageProcessor.js: Skip data URLs over 2MB before conversion; convert remaining to WebP.

## v.1.0.00.67 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add property: UI error handling for 413 (payload too large) and other API errors.

### Changes (detailed)

#### Changed
- src/api/client.js: Added 413 status handler with userMessage "Images are too large. Try fewer or smaller images, then submit again."
- src/components/AddPropertyModal.js: catch uses err.userMessage first so friendly messages display in the UI.

## v.1.0.00.66 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Images: accept any size; convert uploaded images to WebP on server.

### Changes (detailed)

#### Added
- server/lib/imageProcessor.js: processImages() — converts data URLs to WebP via sharp; saves to uploads/; passes through http/https URLs.
- server/index.js: express.json limit 50mb; /uploads static route.
- src/setupProxy.js: proxy /uploads to backend for dev.

#### Changed
- src/components/AddPropertyModal.js: handleImageUpload — removed 2MB per-file limit; accept any size.
- server/routes/listings.js: POST and PATCH — process images through processImages before storing; store /uploads/xxx.webp URLs instead of base64.
- .gitignore: /uploads.

#### Dependencies
- server: sharp (WebP conversion).

## v.1.0.00.65 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Seed script to add sample listings under user email@gmail.com.

### Changes (detailed)

#### Added
- server/seed-user-listings.js: Creates or finds user email@gmail.com; inserts 5 sample listings (sale/rent, Cebu/Mandaue/Lapu-Lapu) with owner_id and status approved.
- package.json: seed-user script for running the seed.

## v.1.0.00.64 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed "BodyStreamBuffer was aborted" runtime error when navigating between /sale and /rent.

### Changes (detailed)

#### Fixed
- src/context/ChatContext.js: SSE read() — From: reader.read() had no .catch(), so AbortError from cleanup propagated as uncaught. To: added .catch() to ignore AbortError and avoid reconnect when intentionally aborted.

## v.1.0.00.63 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- For Sale and For Rent are now separate routes /sale and /rent so refreshes keep the selected page.

### Changes (detailed)

#### Changed
- src/App.js: Routes — added /sale and /rent; / redirects to /sale. AppContent derives listingType from pathname (useLocation). Tabs are NavLink to /sale and /rent. handleListingTypeChange and applySavedSearchState use navigate() instead of setListingType.
- src/App.css: .listing-tab — added text-decoration: none, display, align-items, justify-content for NavLink (anchor) styling.

## v.1.0.00.62 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map pins: barangay centroid lookup before Nominatim geocoding for more accurate pin placement.

### Changes (detailed)

#### Added
- src/data/barangayCentroids.js: BARANGAY_CENTROIDS lookup; getBarangayCoordinates(location, cityName); normalizes "Barangay X" / "Bgy. X" for key lookup.

#### Changed
- src/components/AddPropertyModal.js: handleSubmit — From: geocode via Nominatim only. To: try getBarangayCoordinates first (sync local lookup); if not found, fall back to Nominatim; then city center. Improves pin accuracy for known barangays.

## v.1.0.00.61 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat: fixed per-property-per-user. Inquirer now correctly finds their thread; owner with multiple inquirers gets most recent. Messages list shows "Property · Other Person".

### Changes (detailed)

#### Changed
- server/routes/chat.js: GET /threads — join users for inquirer_name, owner_name; return otherParticipantName (other party in the chat). POST /threads — return listingTitle, listingOwnerId.
- src/context/ChatContext.js: Store userId, listingOwnerId, updatedAt, otherParticipantName; loadMessagesForListing, getMessages, sendMessage, markThreadReadByListingId — use correct thread: inquirer finds thread where userId===me; owner with multiple threads gets most recent by updatedAt.
- src/components/MessagesModal.js: Display "Property · Other Person" in thread row.

## v.1.0.00.60 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map: added "Pick location on map" — click-to-place pin for accurate barangay-level location. Replaces inaccurate geocoding when OpenStreetMap lacks barangay data.

### Changes (detailed)

#### Added
- src/components/MapPicker.js: Interactive map; click to place/move marker; draggable marker; center on city.
- src/components/AddPropertyModal.js: "Pick location on map" toggle; MapPicker integration; onPick updates manualLat/manualLng.

## v.1.0.00.59 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map coordinates: improved geocoding (structured query, countrycodes=ph, viewbox bias); added optional manual lat/lng override when geocoding is wrong.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: manualLat, manualLng state; optional Latitude/Longitude inputs; hint text under Location field.

#### Changed
- src/components/AddPropertyModal.js: geocodeAddress — From: free-form q param. To: structured street/city/country params, countrycodes=ph, viewbox around city for bias; fallback to free-form q if structured fails.
- src/components/AddPropertyModal.js: handleSubmit — manual lat/lng take precedence over geocoding when both valid; geocode only when no manual coords.

## v.1.0.00.58 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map coordinates: use barangay/location for marker position. Geocode "Location / Barangay" + city via Nominatim; fall back to city center if geocoding fails.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: geocodeAddress(address) — calls Nominatim API to get lat/lng for address in Philippines.

#### Changed
- src/components/AddPropertyModal.js: handleSubmit — From: coordinates always from city. To: if location (barangay) is entered, geocode "location, cityName, Philippines"; use result for coordinates, else fall back to city center.

## v.1.0.00.57 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Recently viewed: fixed duplicate listings. Server returns unique IDs (most recent per listing); client deduplicates as fallback.

### Changes (detailed)

#### Changed
- server/routes/recentViewed.js: GET query — From: all rows ordered by viewed_at. To: ROW_NUMBER() subquery to return one row per listing_id (most recent), ordered by viewed_at DESC, LIMIT 20.
- src/App.js: recentListings useMemo — added client-side deduplication by listing.id (seen Set) so each listing appears once.

## v.1.0.00.56 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Recently viewed section: hidden when viewing "My properties" (profile area); visible only in search results.

### Changes (detailed)

#### Changed
- src/App.js: Recently viewed section condition — From: viewMode !== 'map' && recentListings.length > 0. To: also requires !showMyPropertiesOnly so it does not show in profile/my-properties view.

## v.1.0.00.55 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- ESLint: removed unused variables (navigate, userListings, confirmEmail); fixed useMemo/useEffect dependency arrays.

### Changes (detailed)

#### Changed
- src/App.js: Removed unused navigate and useNavigate import; destructure only deleteListing from useUserListings; removed selectedProvince from filteredListings useMemo deps.
- src/components/ProfileModal.js: Removed unused confirmEmail state and setConfirmEmail calls.
- src/components/PropertyMapPreview.js: useEffect dependency array — From: [coordinates?.lat, coordinates?.lng, title]. To: [coordinates, title].

## v.1.0.00.54 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed ECONNREFUSED / Gateway Timeout: port conflict between React dev server and API. React now runs on 3000, API on 5000.
- Server can run API-only when build folder is missing (dev mode).

### Changes (detailed)

#### Added
- .env.development: PORT=3000 so React dev server uses 3000 (avoids conflict with API on 5000).
- package.json: "server" script to run API from project root.

#### Changed
- server/index.js: From: required build folder, exited if missing. To: API_ONLY mode when build missing; serves API routes only, GET / returns JSON message.
- server/index.js: Console output shows "API-only" or "Static" mode.

## v.1.0.00.53 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Webpack Dev Server: replaced deprecated onBeforeSetupMiddleware/onAfterSetupMiddleware with setupMiddlewares to remove deprecation warnings.
- Auth: proactive session validation on app load — call /api/auth/me when a stored token exists; expired tokens trigger logout immediately instead of waiting for the next auth-protected request.

### Changes (detailed)

#### Added
- craco.config.js: CRACO dev server override using setupMiddlewares; preserves evalSourceMapMiddleware, setupProxy, redirectServedPath, noopServiceWorkerMiddleware.
- src/context/AuthContext.js: validateStoredSession() effect; on mount, if token exists, calls GET /api/auth/me; 401 triggers existing on401Callback → setUser(null).

#### Changed
- package.json: start/build/test scripts now use craco instead of react-scripts for start and build.
- package.json: Added @craco/craco as devDependency.

#### Removed
- Removed: none (deprecated keys deleted from devServer config at runtime via CRACO override).

## v.1.0.00.52 — Development
Date: 2026-02-22
Type: Dev Change

### Summary
- Confirmation modals for destructive actions: Log out, Change password, and Delete listing now show an in-app "Are you sure?" modal with Confirm and Cancel instead of window.confirm/alert.

### Changes (detailed)

#### Added
- src/components/ConfirmModal.js: Reusable confirmation modal (show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, optional variant e.g. danger).
- src/App.js: showLogoutConfirm and listingToDelete state; ConfirmModal for logout and for delete listing; handleConfirmDeleteListing to perform delete on confirm.
- src/components/ProfileModal.js: showChangePasswordConfirm state; ConfirmModal for change password; doChangePassword called on confirm after validation.

#### Changed
- src/App.js: Log out buttons (mobile and desktop) open logout ConfirmModal instead of calling logout immediately; on confirm, close menu then run existing logout flow. handleDeleteListing now sets listingToDelete to open delete ConfirmModal; delete runs on confirm.
- src/components/PropertyModal.js: Delete button no longer uses window.confirm; calls onDelete(property) only (parent shows confirm modal).
- src/components/ProfileModal.js: Change password form submit validates then shows ConfirmModal; actual changePassword API call runs only when user clicks Confirm.

## v.1.0.00.51 — Development
Date: 2026-02-22
Type: Dev Change

### Summary
- Login and logout loader animations: spinner during login/sign-up submit; brief spinner and "Logging out..." when user clicks Log out (mobile and desktop).

### Changes (detailed)

#### Added
- src/components/LoginModal.js: Submit button shows fa-spinner fa-spin + "Logging in..." or "Signing up..." when loading; button has class btn-loading.
- src/App.js: loggingOut state; both logout controls (mobile menu and desktop header) set loggingOut true, then after 400ms call logout() and set loggingOut false; show spinner + "Logging out..." and disable buttons while loggingOut.
- src/App.css: @keyframes auth-spin, .fa-spin, .auth-spinner (inline-block, size, margin-right), .btn-loading (flex, align center, gap) for spinner alignment in buttons.

#### Changed
- src/components/LoginModal.js: Submit button content — From: text only "Please wait...". To: spinner icon + "Logging in..." / "Signing up...".

## v.1.0.00.50 — Development
Date: 2026-02-22
Type: Dev Change

### Summary
- Auto logout on 401: clear user state and storage when API returns unauthorized.
- Chat messages: show time at bottom-right of each bubble; defensive formatTime for missing timestamp.
- API client: fix 403 userMessage string so build does not fail (apostrophe in single-quoted string).

### Changes (detailed)

#### Added
- src/api/client.js: on401Callback, setOn401(fn); on 401 response, after clearToken() call on401Callback() if set.
- src/context/AuthContext.js: useEffect registers setOn401(() => setUser(null)), cleanup setOn401(null), so any 401 logs user out in UI.
- src/components/ChatModal.js: chat-panel-bubble-footer wrapper around time; formatTime(ts) returns '' when ts is null or invalid.
- src/App.css: .chat-panel-bubble-footer (flex, justify-content flex-end) to align time at bottom-right of each bubble.

#### Changed
- src/components/ChatModal.js: .chat-panel-text margin 0 0 4px 0 → 0 0 2px 0; time moved inside bubble-footer.
- src/api/client.js: 403 userMessage string — From: single-quoted 'You don't have permission.' (apostrophe terminated string, SyntaxError). To: double-quoted "You don't have permission.".

## v.1.0.00.49 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Account profile: confirm email field; email and confirm must match when changing email.

### Changes (detailed)

#### Added
- src/components/ProfileModal.js: Confirm email field; when email is being changed, email and confirm email must match (case-insensitive) or show “Email and confirm email do not match.”

#### Changed
- src/components/ProfileModal.js: handleProfileSubmit validates email vs confirmEmail when new email differs from current; confirmEmail state synced on open and on success.

## v.1.0.00.48 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Profile/Account modal: two sections (Profile + Change password); change password with current/new/confirm; clearer labels and hints.

### Changes (detailed)

#### Added
- src/context/AuthContext.js: changePassword(currentPassword, newPassword) — verifies current (hash or legacy), hashes and saves new password.
- src/components/ProfileModal.js: “Profile” section (name, email, hint, Save profile); “Change password” section (current, new, confirm, hint, Change password button). Separate success/error per section.
- src/App.css: .profile-modal-dialog, .profile-modal-body, .profile-section, .profile-section-password, .profile-section-title, .profile-section-hint.

#### Changed
- src/components/ProfileModal.js: Modal title to “Account”; two forms and sections; password form clears on success.

## v.1.0.00.47 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Security: password hashing (bcrypt), no plaintext passwords; minimum password length; input length limits.

### Changes (detailed)

#### Added
- package.json: bcryptjs dependency for password hashing.
- src/context/AuthContext.js: bcrypt hash on register; compare hash on login; migrate legacy plaintext passwords to hash on next login. MIN_PASSWORD_LENGTH (8), BCRYPT_ROUNDS (10).
- src/components/LoginModal.js: Password hint “At least 8 characters” on Sign up; minLength={8} on password when registering.

#### Changed
- src/context/AuthContext.js: register stores passwordHash only (no plaintext); login uses bcrypt.compareSync; updateProfile trims and limits name/email length (200 / 254 chars). Register limits name and email length.

## v.1.0.00.46 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Profile management: edit name and email from a Profile modal; Profile entry in header (desktop and mobile menu).

### Changes (detailed)

#### Added
- src/context/AuthContext.js: updateProfile(updates) — updates name and/or email for current user; persists to stored users and in-memory user.
- src/components/ProfileModal.js: Profile modal with name and email form; save calls updateProfile; shows success/error.

#### Changed
- src/App.js: showProfileModal state; Profile button in desktop header and in mobile account menu; ProfileModal rendered; anyModalOpen includes showProfileModal.

## v.1.0.00.45 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Chat + Messages panels: stronger viewport resize (maxHeight, rAF); Messages panel full-viewport + viewport resize on mobile.

### Changes (detailed)

#### Changed
- src/components/ChatModal.js: Viewport update runs in requestAnimationFrame; panel inline style now includes maxHeight so CSS max-height cannot prevent shrinking when keyboard opens.
- src/components/MessagesModal.js: Added viewportSize state and visualViewport listener on mobile; Messages panel gets same inline height/top/maxHeight when viewport shrinks; body scroll lock when open; full-viewport on mobile.
- src/App.css: Messages panel on max-width 767px is full-viewport (inset 0, height 100%); messages-panel-header gets top safe-area padding on mobile.

## v.1.0.00.44 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Chat panel (mobile): resize to visual viewport when keyboard opens so header stays fixed and message bar moves up.

### Changes (detailed)

#### Changed
- src/components/ChatModal.js: Added viewportSize state and visualViewport resize/scroll listener on mobile when chat is open; chat panel gets inline height and top from visualViewport so the whole div resizes and the header does not move when the keyboard opens.

## v.1.0.00.43 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Chat panel: mobile fixes — full-viewport on small screens, safe-area padding, larger touch targets, body scroll lock.

### Changes (detailed)

#### Changed
- src/App.css: On max-width 767px, chat panel is full-viewport (inset 0, height 100%) so map no longer shows behind and keyboard resizing works; chat header gets top safe-area padding; form gets bottom safe-area padding; input min-height and send button size 44px on mobile for touch targets.
- src/components/ChatModal.js: When chat is open, set body overflow hidden and restore on close so background does not scroll on mobile.

## v.1.0.00.42 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat input bar: removed emoji button; send button is icon-only (no circle/pill background).

### Changes (detailed)

#### Removed
- src/components/ChatModal.js: Emoji button in chat form.

#### Changed
- src/App.css: .chat-panel-send — From: pill/circle background (--bb-primary), white icon. To: no background, primary-colored icon only; hover darkens icon color.

## v.1.0.00.41 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- FUTURE_FEATURES.md: added Chat & Messages (database-backed + real notifications) for when an actual database is connected; renumbered subsequent items.

### Changes (detailed)

#### Added
- FUTURE_FEATURES.md: New item 6 — Chat & Messages (database-backed + real notifications). Describes current (localStorage-only) vs planned (DB persistence, two-way messaging, unread count, push/email, cross-device sync). Renumbered Medium/Low items 6→7 through 16→17.

## v.1.0.00.40 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat send button: aligned with theme and input bar (primary green, pill shape).

### Changes (detailed)

#### Changed
- src/App.css: .chat-panel-send — From: circle (border-radius: 50%), orange (--bb-accent). To: pill (border-radius: 20px to match input), primary green (--bb-primary), hover --bb-primary-soft; added min-width and flex-shrink: 0 for alignment.

## v.1.0.00.39 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat input bar: strictly text messages — removed microphone, camera, and gallery buttons.

### Changes (detailed)

#### Removed
- src/components/ChatModal.js: Microphone, Camera, and Gallery buttons in the chat form. Removed: voice, photo, and image-attachment actions so chat is text-only.

## v.1.0.00.38 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages and Chat panels: same height (56vh), reduced size so they are not too big.

### Changes (detailed)

#### Changed
- src/App.css: Messages panel From: height 70vh. To: height 56vh, max-height 56vh. Chat panel From: height 85vh. To: height 56vh, max-height 56vh. Both panels now share the same height.

## v.1.0.00.37 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages pill and Messages/Chat panels anchored from the same bottom-right position.

### Changes (detailed)

#### Changed
- src/App.css: Messages panel and Chat panel From: vertically centered (top: 50%, transform: translateY(-50%), right: 24px). To: same anchor as pill — right: 16px, bottom: calc(24px + var(--bb-safe-bottom)); desktop (768px+) right: 24px, bottom: 24px. Panels now sit above the pill and share the same bottom-right corner.

## v.1.0.00.36 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Remove pencil FAB from Messages panel; chat panel same bottom (rounded input bar); pill and both panels use site theme (BalhinBalay).

### Changes (detailed)

#### Removed
- src/components/MessagesModal.js: Pencil (new message) FAB button.
- src/App.css: .messages-panel-fab, .messages-panel-fab:hover; padding-bottom: 80px from .messages-panel-body.

#### Changed
- src/App.css: Pill (.instagram-style): From dark #262626. To: var(--bb-surface-elevated), var(--bb-text), var(--bb-border), badge var(--bb-accent), avatars var(--bb-border). Messages panel: From dark #1a1a1a/#3e4042. To: var(--bb-surface-elevated), var(--bb-border), var(--bb-text), var(--bb-text-muted), var(--bb-primary) for badge and unread dot, header/row hover var(--bb-surface). Chat panel: Same theme; form has border-radius 0 0 var(--bb-radius) var(--bb-radius) so same bottom as Messages; bubbles var(--bb-primary)/var(--bb-border); input and send use --bb-surface, --bb-accent. All use var(--bb-radius) for panel and bubbles.

## v.1.0.00.35 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages/Chat panels and pill match reference: floating panels (not full height), 10px border-radius, pill ellipsis; bubble radius 8px.

### Changes (detailed)

#### Added
- src/App.js: Ellipsis icon (fa-ellipsis-v) after avatars in Messages pill.
- src/App.css: .floating-messages-pill-ellipsis; explicit border-radius 9999px on .instagram-style pill.

#### Changed
- src/App.css: Messages panel From: full height (top:0; right:0; bottom:0). To: floating, height 70vh, top 50% + translateY(-50%), right 24px, border-radius 10px, overflow hidden. Chat panel From: full height. To: floating, height 85vh, top 50% + translateY(-50%), right 24px, border-radius 10px, overflow hidden. Chat bubble border-radius From: 18px. To: 8px. Panel headers get border-radius 10px 10px 0 0.

## v.1.0.00.34 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat UI aligned to Instagram reference images: dark theme (pill #262626, panels #1a1a1a), red badge (#e7385a), blue unread dots in list, blue "me" bubbles (#0084ff) and gray "them" (#3e4042), blue pencil FAB and send button, input bar dark (#3e4042). Header grouped as "< Name" (back + avatar + title).

### Changes (detailed)

#### Added
- src/components/MessagesModal.js: Blue unread dot (.messages-panel-row-unread) when last message is not from user.
- src/components/ChatModal.js: .chat-panel-header-left wrapper for back + avatar + title (Instagram "< Name" style).
- src/App.css: .messages-panel-row-unread (10px blue circle); .chat-panel-header-left.

#### Changed
- src/App.css: Pill, Messages panel, Chat panel reverted to dark Instagram look from reference: pill #262626, red badge #e7385a; panel backgrounds #1a1a1a, borders #3e4042, text #fff/#e4e6eb/#b0b3b8; list row hover #262626; FAB and send #0084ff; "me" bubble #0084ff, "them" #3e4042; input bar background #3e4042. From: site theme (light). To: dark theme per Instagram screenshots.

## v.1.0.00.33 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages pill and chat panels restyled to match site theme (BalhinBalay): light surfaces, primary green, accent orange, border and text muted.

### Changes (detailed)

#### Changed
- src/App.css: Messages pill (.instagram-style) From: dark #262626. To: var(--bb-surface-elevated), var(--bb-text), var(--bb-border); badge var(--bb-accent); avatar border/background var(--bb-*). Messages panel From: dark #1a1a1a, #3e4042, #0084ff. To: var(--bb-surface-elevated), var(--bb-border), var(--bb-text), var(--bb-text-muted), badge var(--bb-primary), FAB var(--bb-accent). Chat panel From: dark theme, blue bubbles. To: var(--bb-surface-elevated), var(--bb-border); "me" bubble var(--bb-primary), "them" var(--bb-border); input bar and form buttons use --bb-surface, --bb-text-muted, --bb-primary hover; send button var(--bb-accent).

## v.1.0.00.32 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat UI updated to match new Instagram-style: floating Messages pill (bottom-right, dark, paper plane + badge + stacked avatars), right-side dark Messages panel with pencil FAB, right-side dark Chat panel with back arrow, grey/blue bubbles, and input bar (emoji, mic, camera, gallery, send). Filters FAB moved to bottom-left.

### Changes (detailed)

#### Added
- src/App.js: useChat(); messagesPillData (thread count + recent 3 listings for avatars); Messages pill with class instagram-style, paper plane icon, badge (count), "Messages" label, stacked avatars from recent threads.
- src/App.css: .floating-messages-pill.instagram-style (bottom-right, #262626); .floating-messages-pill-icon-wrap, .floating-messages-pill-badge (red), .floating-messages-pill-avatars/avatar (stacked circles); Instagram-style Messages panel (.messages-panel-wrap, .messages-panel, .messages-panel-header, .messages-panel-badge, .messages-panel-body, .messages-panel-list, .messages-panel-row, .messages-panel-fab); Instagram-style Chat panel (.chat-panel-wrap, .chat-panel, .chat-panel-header, .chat-panel-back, .chat-panel-bubble-me/them, .chat-panel-form, .chat-panel-input, .chat-panel-send, .chat-panel-form-btn for emoji/mic/camera/gallery). Dark theme (#1a1a1a, #3e4042, #0084ff for me/send/FAB).

#### Changed
- src/components/MessagesModal.js: From: centered modal (.modal.auth-modal). To: right-side panel (.messages-panel-wrap, .messages-panel), dark header with minimize + close, list rows (.messages-panel-row), pencil FAB bottom-right.
- src/components/ChatModal.js: From: centered modal. To: right-side panel (.chat-panel-wrap, .chat-panel), back arrow, dark header, grey/blue bubbles (.chat-panel-bubble-them/me), input bar with emoji, mic, camera, gallery, send.
- src/App.css: .floating-filters-btn From: right 16px. To: left 16px (bottom-left). Messages pill From: left (green). To: right, dark, paper plane + badge + avatars.

## v.1.0.00.31 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Changelog dates corrected from 2025 to 2026.

### Changes (detailed)

#### Changed
- CHANGELOG.md: All entry dates From: 2025-02-19. To: 2026-02-19.

## v.1.0.00.30 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages entry moved from header to a floating pill: remove Messages from desktop header and mobile menu; add floating Messages pill (bottom-left) when logged in and no modal open.

### Changes (detailed)

#### Added
- src/App.js: Floating Messages pill button (envelope icon + "Messages" label) shown when user && !anyModalOpen; opens MessagesModal on click.
- src/App.css: .floating-messages-pill, .floating-messages-pill-label — fixed bottom-left, pill shape (border-radius 9999px), --bb-primary background, responsive inset for desktop.

#### Removed
- src/App.js: Messages button from desktop header (header-actions-full). Messages menu item from mobile header menu dropdown.

## v.1.0.00.29 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fix Messages/Chat modals not visible: override global full-height .modal-content so content shows; flex layout so header and body stay visible and scrollable.

### Changes (detailed)

#### Fixed
- src/App.css: From: Messages/Chat modals inherited .modal-content min-height: 100vh so content could overflow or appear blank. To: .auth-modal .modal-content.messages-modal-content and .chat-modal-content get min-height: auto, flex: 1, min-height: 0; .messages-modal-body and .chat-modal-body get flex: 1, min-height: 0; headers get flex-shrink: 0 so layout stays visible and scrollable.

## v.1.0.00.28 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Desktop chat (Messages + Chat modals) restyled to messenger-style layout with site theme: avatars, timestamps, back button, accent send button.

### Changes (detailed)

#### Added
- src/components/MessagesModal.js: relativeTime(ts); messenger-style header (Messages + badge count, expand/close); thread list rows with circular avatar (listing image), title + relative time row, "You: " prefix on preview when from user.
- src/components/ChatModal.js: onBack prop; header with back button, property avatar + title, expand/close; emoji button in form; placeholder "Message..."; send button styled with --bb-accent.
- src/App.js: ChatModal onBack callback that closes chat and reopens MessagesModal.
- src/App.css: .messages-modal-content, .messages-modal-header, .messages-modal-title, .messages-modal-badge, .messages-modal-header-actions, .messages-modal-icon-btn; .messages-thread-avatar, .messages-thread-main, .messages-thread-row, .messages-thread-time; .chat-modal-content, .chat-modal-header, .chat-modal-back, .chat-modal-header-main, .chat-modal-header-avatar, .chat-modal-header-title, .chat-modal-header-actions, .chat-form-emoji; .chat-send-btn uses --bb-accent/--bb-accent-hover; all use site theme (--bb-surface-elevated, --bb-border, --bb-text, --bb-text-muted, --bb-primary).

#### Changed
- src/components/MessagesModal.js: From: single-line thread rows with title + preview. To: rows with avatar, title + relative time, and preview with "You: " when last message from user.
- src/components/ChatModal.js: From: plain modal header and single input. To: back button (when onBack), avatar + title in header, emoji + input + send bar; styling aligned to BalhinBalay theme.

## v.1.0.00.27 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- When viewing "My properties", add a bar with "Show all properties" so users can return to the full search/list.

### Changes (detailed)

#### Added
- src/App.js: When showMyPropertiesOnly && user, render a bar above SortBar with text "Showing only your properties" and button "Show all properties" that calls setShowMyPropertiesOnly(false).
- src/App.css: .my-properties-bar, .my-properties-bar-text, .my-properties-bar-back for layout and button styling.

## v.1.0.00.26 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add all Philippine regions with provinces and cities so users can add properties anywhere (e.g. Samar, NCR, CAR, I–XIII, BARMM). Search filters show only regions and cities that have at least one listing.

### Changes (detailed)

#### Added
- src/data/cities.js: getCityIdsWithListings(listings). City entries for Region VIII (Samar, Eastern Samar, Northern Samar, Leyte, Biliran, Southern Leyte), NCR (Manila, Quezon City, Makati, Taguig), CAR (Baguio, Bangued), Region I (Laoag, Vigan, San Fernando La Union, Dagupan), Region II (Tuguegarao, Ilagan), Region III (Angeles, San Jose del Monte), Region IV-A (Lipa, Bacoor, Calamba), Region IV-B (Puerto Princesa, Calapan), Region V (Legazpi, Naga Camarines Sur), Region VI (Iloilo City, Bacolod, Roxas), Region VII extra (Tagbilaran, Dumaguete, Siquijor), Region IX (Zamboanga City, Dipolog), Region X (Valencia Bukidnon, Ozamiz), Region XI (Davao City, Tagum), Region XII (General Santos, Koronadal), Region XIII (Butuan, Surigao City), BARMM (Cotabato City, Marawi).
- src/App.js: availableCityIds from getCityIdsWithListings(listingsByType); pass availableCityIds to FilterSidebar; useEffect to reset selectedCity to cebu-province when current city has no listings.

#### Changed
- src/components/FilterSidebar.js: Accept availableCityIds; city dropdown now shows only “All Cities” plus cities that have at least one listing (citiesForDropdown filtered by availableCityIds). Search thus restricts to areas that have properties.

## v.1.0.00.25 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Mobile header: logo left, actions right (2-column layout) so logo and buttons never overlap; logo truncates with ellipsis when narrow. Desktop keeps centered 3-column layout.

### Changes (detailed)

#### Changed
- src/App.css: Mobile (default): .app-header grid-template-columns: minmax(0, 1fr) auto (logo column | actions column). .app-header-spacer and .app-logo both grid-column: 1 / row: 1 (spacer 0 width so logo uses the space); .app-logo justify-self: start, min-width: 0, max-width: 100% for truncation. .app-header-actions grid-column: 2. Desktop (768px+): restore 3-column layout (1fr minmax(100px, auto) 1fr), spacer and logo/actions reset to auto placement, logo centered.

## v.1.0.00.24 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Prevent heart and Log in from covering the logo on mobile: reserve center column and logo min-width.

### Changes (detailed)

#### Fixed
- src/App.css: .app-header — From: grid-template-columns: 1fr auto 1fr (center could shrink). To: grid-template-columns: 1fr minmax(100px, auto) 1fr so the center column is at least 100px on mobile. .app-logo — added min-width: 100px so the logo keeps space and header actions don’t overlap it.

## v.1.0.00.23 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Increase spacing between header buttons on desktop (gap 14px for .header-actions-full).

### Changes (detailed)

#### Changed
- src/App.css: .header-actions-full at 768px+ — From: inherited gap 8px from .app-header-actions. To: gap: 14px so Saved, Add, Messages, My properties, Log out (or Log in) have more space between them on desktop.

## v.1.0.00.22 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Keep mobile Log in button text on one line (white-space: nowrap, flex-shrink: 0, padding tweak).

### Changes (detailed)

#### Fixed
- src/App.css: .btn-header-login-mobile — From: "Log in" could wrap to two lines on narrow mobile. To: white-space: nowrap, flex-shrink: 0, padding 10px horizontal so label stays on one line.

## v.1.0.00.21 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Restore Log in button on mobile header when user is not logged in (was missing after mobile menu refactor).

### Changes (detailed)

#### Fixed
- src/App.js: From: header-actions-mobile showed only Favorites when !user (no Log in). To: when !user show Favorites + Log in button (btn-header-login); when user show Favorites + account menu (⋮). Log in opens LoginModal.

## v.1.0.00.20 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add Property form: location hierarchy Region → Province → City; show all cities in selected region+province (no listing filter); add getProvincesByRegion, getCitiesByRegionAndProvince, getRegionIdsWithCities in cities.js.

### Changes (detailed)

#### Added
- src/data/cities.js: getProvincesByRegion(regionId), getCitiesByRegionAndProvince(regionId, province), getRegionIdsWithCities(). All cities in data for that region+province are shown (fully unlocked).

#### Changed
- src/components/AddPropertyModal.js: From: Province → City only. To: Region dropdown first (all Philippine regions except "All"), then Province (from getProvincesByRegion(regionId)), then City (from getCitiesByRegionAndProvince(regionId, province)). Region change resets province and city; province change resets city. City list is all cities in data for that region and province, not filtered by listings.

## v.1.0.00.19 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add Property form: add Province dropdown (Province → City); add image upload (file input, up to 5 images, 2MB each, data URLs stored); keep optional Image URL; add getProvinces and getCitiesByProvince in cities.js.

### Changes (detailed)

#### Added
- src/data/cities.js: getProvinces(), getCitiesByProvince(province).
- src/components/AddPropertyModal.js: Province state and dropdown; city options filtered by selected province; handleProvinceChange (resets city to first in province); uploadedImages state; handleImageUpload (FileReader data URLs, max 5, 2MB/file); removeUploadedImage; image upload file input and thumbnails with remove; optional Image URL field. Submit uses validCityId and images = URL + uploaded data URLs, or default.
- src/App.css: .add-property-thumbnails, .add-property-thumb-wrap, .add-property-thumb-remove for upload previews.

#### Changed
- src/components/AddPropertyModal.js: From: City only, single Image URL. To: Province dropdown before City; City options from getCitiesByProvince(province); image upload + optional URL; listing.images built from uploaded + URL or default.

## v.1.0.00.18 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Hide orange floating filters button when any modal is open (Saved properties, Login, Add property, Chat, Messages, property details) so it no longer overlaps modals.

### Changes (detailed)

#### Changed
- src/App.js: Added anyModalOpen (true when showLoginModal, showAddPropertyModal, showChatModal, showMessagesModal, showFavoritesModal, or showModal). Floating filters button now renders only when !filtersOpen && !anyModalOpen. From: FAB visible whenever filter panel closed. To: FAB hidden when any overlay/modal is open.

## v.1.0.00.17 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Show orange floating filters button on desktop when filter sidebar is closed (remove CSS that hid it at 768px+).

### Changes (detailed)

#### Changed
- src/App.css: From: .floating-filters-btn { display: none; } inside @media (min-width: 768px) hid the orange FAB on desktop. To: rule removed so the floating filters button appears on desktop when filters are closed, matching mobile.

## v.1.0.00.16 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Remove green header "Filters" button from mobile and desktop; filters are opened only via the orange floating button when the filter panel is closed (same on both viewports).

### Changes (detailed)

#### Removed
- src/App.js: Green "Filters" button (btn-filter-trigger) from header-actions-mobile and header-actions-full. Filters are now opened solely via the orange floating filters button when filtersOpen is false (mobile and desktop).

## v.1.0.00.15 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fix mobile header overflow: on mobile show Favorites + account menu (dropdown) + Filters instead of five separate buttons; add Saved/Favorites entry point and Favorites modal; change floating filters button icon from search to sliders; keep logo from shrinking (white-space: nowrap, text-overflow: ellipsis).

### Changes (detailed)

#### Added
- src/components/FavoritesModal.js: modal/sheet listing saved properties from FavoritesContext; empty state; tap listing opens property details and closes modal.
- App.js: useFavorites, showFavoritesModal, showHeaderMenu, favoriteListings memo; Favorites button (mobile + desktop); mobile-only header menu (ellipsis) with dropdown (Add, Messages, My properties, Log out) and backdrop to close.
- src/App.css: .favorites-modal-backdrop, .favorites-modal-sheet, .favorites-modal-header/body/list/card; .header-actions-mobile, .header-actions-full, .header-menu-backdrop, .header-menu-dropdown, .btn-header-favorites, .btn-header-menu-trigger.

#### Changed
- src/App.js
  - Header: From: single row of 4–5 buttons + Filters causing cramping on mobile. To: on mobile, Favorites (icon) + account menu (icon, dropdown) + Filters; on desktop (768px+), Favorites (Saved) + full auth actions + Filters. Logo: no code change; CSS prevents shrink.
  - Floating filters button: From: fa-search (magnifying glass). To: fa-sliders-h to match "Open filters" and avoid confusion with search.
- src/App.css: .app-logo given white-space: nowrap, overflow: hidden, text-overflow: ellipsis, min-width: 0. Media query to show .header-actions-full at 768px+ and .header-actions-mobile below.

## v.1.0.00.14 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- FUTURE_FEATURES.md: Clarify that all listed items are not implemented; add dedicated sections for Profile Management, Saved Searches & Alerts, and Favorite Properties (account sync/cross-device); add "Not implemented" to each future feature.

### Changes (detailed)

#### Changed
- FUTURE_FEATURES.md
  - From: Some unimplemented features (profile management, saved search, favorites sync) were folded into combined sections; no explicit "not implemented" note.
  - To: Intro states "All items listed here are not yet implemented." Profile Management is its own section (#2). Saved Searches & Alerts remains (#3). New section (#4) "Favorite Properties (account sync / cross-device)" clarifies current behavior (localStorage per device) vs planned (account sync). "Other Account-Related Features" (#5) keeps comparison lists and viewing history. All numbered features now include "Not implemented" where applicable. Sections renumbered 1–16.

## v.1.0.00.13 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Filter FUTURE_FEATURES.md to list only planned work; remove or reframe items already implemented (chat, auth, basic listing form, basic share, basic accessibility).

### Changes (detailed)

#### Changed
- FUTURE_FEATURES.md
  - From: Roadmap included Chat Integration, User Accounts & Authentication, Property Listing Management, Social Media Integration, and Accessibility as full future items.
  - To: Removed duplicate “future” items that exist in the app (in-house chat, login/signup, add property form, Web Share/copy URL, ARIA/modal focus). Kept only truly planned work: province-level filtering, saved searches & alerts, enhanced user features (profile, comparison, history, cross-device favorites), comparison tool, virtual tours, analytics, advanced search, listing enhancements (upload, edit/delete, stats), reviews & ratings, mobile app, i18n, social sharing enhancements, financing calculator, agent directory, and technical debt. Added link to FEATURES.md; renumbered sections; noted “current” vs “planned” where partially implemented.

## v.1.0.00.12 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add FEATURES.md documenting all app features: listing types, filters, view modes, property display, auth, user listings, favorites, chat, map, layout, data/regions, accessibility.

### Changes (detailed)

#### Added
- FEATURES.md
  - Documented: listing types and browsing, filters, view modes and sorting, property display, authentication, user listings (add property), favorites, chat and messages, map, layout and responsiveness, data and regions, accessibility and UX.

## v.1.0.00.11 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add login so users can add properties to their profile: AuthContext (login/register/logout, localStorage), UserListingsContext (user listings by owner), LoginModal, Add Property modal, header auth UI (Log in / Add, My properties, Log out), and “My properties” filter.

### Changes (detailed)

#### Added
- src/context/AuthContext.js: user, login, register, logout; persistence via balhinbalay_user and balhinbalay_users in localStorage.
- src/context/UserListingsContext.js: userListings, addListing, getListingsByOwner; persistence via balhinbalay_user_listings.
- src/components/LoginModal.js: Login / Sign up tabs, email, password, name (sign up).
- src/components/AddPropertyModal.js: Form (title, listing type, property type, price, city, location, beds, baths, size, description, image URL, contact); submits with ownerId.
- App.js: AuthProvider → UserListingsProvider → FavoritesProvider → AppContent; allListings = sampleListings + userListings; listingsToFilter when “My properties” uses ownerId filter; header shows Log in (when guest) or Add, My properties toggle, Log out (when user); LoginModal and AddPropertyModal with show/onClose.

#### Changed
- src/App.css: .btn-header-login, .btn-header-secondary(.active), .btn-header-label (hidden on small screens); .auth-modal (z-index 1060, centered dialog, non–full-screen); .login-tabs; .auth-modal .modal-dialog.add-property-modal-dialog max-width 520px.
- LoginModal.js and AddPropertyModal.js: wrapper div uses class auth-modal for centered, non–full-screen styling.

## v.1.0.00.10 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Center the logo / home (BalhinBalay) in the app header.

### Changes (detailed)

#### Changed
- src/App.js: Added empty app-header-spacer div so header has three columns (spacer, logo, actions).
- src/App.css: .app-header now uses display: grid; grid-template-columns: 1fr auto 1fr; .app-logo has justify-self: center; .app-header-actions has justify-content: flex-end so the Filters button stays on the right.

## v.1.0.00.09 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Default to list view when viewport is mobile (initial load and when resizing to mobile).

### Changes (detailed)

#### Changed
- src/App.js
  - viewMode initial state, handleResize
    - From: viewMode always started as 'grid'; no change on resize.
    - To: viewMode initial state is 'list' when window.innerWidth < 768, else 'grid'; when resize crosses to mobile (nextIsMobile && wasDesktop), setViewMode('list').

## v.1.0.00.08 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- On mobile show list + map view only (hide grid/tiled); on desktop show grid, list, and map.

### Changes (detailed)

#### Changed
- src/App.css
  - .view-mode-toggle .btn-view-mode:nth-child(1)
    - From: List view hidden on mobile (grid + map only).
    - To: Grid/tiled view hidden on mobile (list + map only); first button (grid) display: none until 768px.

## v.1.0.00.07 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed white block overlaying property photo in View Details modal; made close button a clear X.

### Changes (detailed)

#### Fixed
- src/components/PropertyModal.js
  - Close button: Replaced Bootstrap btn-close (which was not clearly visible) with custom modal-close-btn using Font Awesome fa-times so the X is visible on the dark green header.
  - Carousel: Replaced Bootstrap carousel structure with property-modal-carousel; moved indicators out of overlay into a bar below the image (carousel-indicators-bar) so no white block appears on the photo; removed rounded/mb from img to avoid layout glitches.
- src/App.css
  - Added .modal-close-btn: visible X button (white icon, light background) in modal header.
  - Added .property-modal-carousel, .carousel-indicators-bar and related styles: image area contained with overflow hidden; indicators as small dots below the image (no overlay on photo).

## v.1.0.00.06 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed filter sheet closing on mobile when tapping the search bar (keyboard open was triggering resize and closing the sheet).

### Changes (detailed)

#### Fixed
- src/App.js
  - handleResize (in useEffect), prevWidthRef
    - From: Any resize while on mobile (nextIsMobile) called setFiltersOpen(false), so opening the virtual keyboard (which fires resize) closed the sheet before the user could type.
    - To: Only close the sheet when actually crossing from desktop (width >= 768) to mobile (width < 768), using prevWidthRef to store previous width; keyboard-open resize on an already-mobile viewport no longer closes the sheet.

## v.1.0.00.05 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed View Details modal greyed out and not interactable (backdrop was covering content).

### Changes (detailed)

#### Fixed
- src/App.css
  - .modal, .modal-backdrop, .modal-dialog
    - From: No z-index; backdrop rendered after dialog in DOM so it sat on top and blocked clicks.
    - To: .modal position fixed, z-index 1050; .modal-backdrop z-index 0; .modal-dialog position relative, z-index 1 so dialog is above backdrop and receives clicks.
- src/components/PropertyModal.js
  - Modal structure
    - From: Backdrop rendered after modal-dialog.
    - To: Backdrop rendered before modal-dialog so stacking order is correct; backdrop still closes on click.

## v.1.0.00.04 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Added Iligan City and Cagayan de Oro (Region X – Northern Mindanao) with sample properties.

### Changes (detailed)

#### Added
- src/data/cities.js
  - Iligan City (id: iligan-city, province: Lanao del Norte, regionId: region-x)
  - Cagayan de Oro (id: cagayan-de-oro, province: Misamis Oriental, regionId: region-x)
- src/data/listings.js
  - 3 listings in Iligan City: 3BR house for sale, 2BR apartment for rent, commercial lot for sale (ids 21–23)
  - 3 listings in Cagayan de Oro: 4BR house for sale, studio condo for rent, 2BR house and lot for sale (ids 24–26)

## v.1.0.00.03 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed search bar placeholder/text overlapping icon in filter sheet (specificity override).

### Changes (detailed)

#### Fixed
- src/App.css
  - .filter-sidebar-content .form-control.search-input
    - From: Padding was overridden by .filter-sidebar-content .form-control (padding: 12px 14px), so left padding was 14px and text overlapped the search icon.
    - To: Added more specific rule with padding-left: 52px and padding-right: 44px so placeholder and text start clear of the icon.

## v.1.0.00.02 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed search bar icon alignment and overlap in filter sheet.

### Changes (detailed)

#### Fixed
- src/App.css
  - .search-icon, .search-input
    - From: Icon left-aligned only, possible clip/overlap with input corner.
    - To: Icon vertically centered (top: 50%, transform: translateY(-50%)), left 16px, z-index: 2, line-height: 1; input padding-left 48px so text clears icon.
