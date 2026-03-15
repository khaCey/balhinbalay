# Building Android and iOS apps (Capacitor)

This project uses [Capacitor](https://capacitorjs.com/) to wrap the React web app as native Android and iOS apps.

---

## Quick start: run in emulator

1. **Terminal 1:** Start the backend and leave it running so the emulator can call the API:
   ```bash
   npm run server
   ```

2. **Terminal 2:** Build for the emulator (API URL `http://10.0.2.2:5000`), sync to Android, and open Android Studio:
   ```bash
   npm run android:emulator
   ```

3. **Android Studio:** Choose an emulator (or device) from the device dropdown, then click **Run** (or Shift+F10).

If the backend is not running, the app will open but API calls (listings, login, etc.) will fail.

**If you see "Failed to fetch" or "0 properties found"** even though the API runs on your PC at `localhost:5000`:

1. **Restart the backend** so it listens on all interfaces (`0.0.0.0`), then leave it running:
   ```bash
   npm run server
   ```
2. **Rebuild for the emulator** (uses `.env.android.emulator` so the app calls `http://10.0.2.2:5000`; your main `.env` is not used for this build). If you still see "Failed to fetch", do a clean rebuild: delete the `build` folder, then run:
   ```bash
   npm run cap:sync:android:emulator
   ```
3. In Android Studio, click **Run** again (no need to reopen the project).

When the error appears, the app now shows which API URL it is using (e.g. "— API: http://10.0.2.2:5000"). If you see "— API: http://localhost:5000" or "— API: same origin", the emulator build did not pick up `.env.android.emulator`; run the clean rebuild above.

**If `http://10.0.2.2:5000/api/health` fails in the emulator’s browser** but works on your PC at `http://localhost:5000/api/health`, the emulator cannot reach your PC. On **Windows**, allow inbound connections on port 5000:

1. Open **Windows Defender Firewall** → **Advanced settings** (or run `wf.msc`).
2. Click **Inbound Rules** → **New Rule**.
3. Choose **Port** → Next → **TCP**, **Specific local ports**: `5000` → Next.
4. **Allow the connection** → Next → check **Private** (and **Domain** if you use it) → Next.
5. Name it e.g. "BalhinBalay API (emulator)" → Finish.

Restart the backend (`npm run server`), then in the emulator open Chrome and try `http://10.0.2.2:5000/api/health` again.

---

## Android (focus first)

### Prerequisites

- [Android Studio](https://developer.android.com/studio) (includes Android SDK and emulator)
- During setup, install **Android SDK** and an **emulator** (e.g. Pixel 5, API 34)

### Build and run the Android app

1. **Build the web app and copy it into the Android project:**
   ```bash
   npm run cap:sync:android
   ```
   (Use `npm run cap:sync` if you want to update both Android and iOS.)

2. **Open the project in Android Studio:**
   ```bash
   npm run cap:android
   ```
   This opens the `android/` folder in Android Studio.

3. **Run the app:**
   - Choose an emulator or a connected device from the device dropdown.
   - Click **Run** ▶️ (or Shift+F10).
   - The app loads your React bundle in a WebView.

4. **After changing the React app**, run `npm run cap:sync:android` again, then in Android Studio use **Run** ▶️ to reload (or run again).

### API URL (backend) on Android

The app uses `REACT_APP_API_URL` for the backend. On device/emulator, `localhost` is the device itself, not your PC.

- **Emulator → your PC’s backend:** set before building, e.g. in `.env.production`:
  ```
  REACT_APP_API_URL=http://10.0.2.2:5000
  ```
  Then run `npm run cap:sync:android`. (HTTP is allowed on Android for this.)

- **Physical device → your PC:** copy `.env.android.device.example` to `.env.android.device`, replace `YOUR_PC_IP` with your PC’s IPv4 (same Wi‑Fi as phone; get it with `ipconfig` on Windows or `ifconfig` on Mac/Linux), then run:
  ```bash
  npm run cap:sync:android:device
  ```
  Then run the app from Android Studio on your phone. The app will call your server at `http://YOUR_PC_IP:5000`.

- **Production / tunnel (use from anywhere):** build the Android app so it uses `https://balhinbalay.com/api` (Cloudflare Tunnel or your live site). Run:
  ```bash
  npm run cap:sync:android:production
  ```
  This uses `.env.production` (`REACT_APP_API_URL=https://balhinbalay.com`). Then open Android Studio and run the app in the emulator or on a device; the app will call the tunnel URL, not localhost. Keep the tunnel and server running.

---

## Push notifications (when app is in background or closed)

In-app notifications (toast when the app is open) use SSE and work without extra setup. **Push notifications** (when the app is closed or in the background) need Firebase Cloud Messaging (FCM) on both the app and the server.

### 1. Firebase project and Android app

1. In [Firebase Console](https://console.firebase.google.com/), create or select a project.
2. Add an **Android app** with package name `com.balhinbalay.app`.
3. Download **google-services.json** and put it in **`android/app/google-services.json`** (create the file; do not commit secrets to public repos if the file contains sensitive data).
4. Sync and rebuild Android:
   ```bash
   npm run cap:sync:android
   ```
   Then open Android Studio and run the app. The build will apply the Google Services plugin (see `android/app/build.gradle`). Without this file, the app logs “google-services.json not found … Push Notifications won’t work”.

### 2. Server: send pushes via FCM

1. In the same Firebase project, go to **Project settings** → **Service accounts** → **Generate new private key**. Save the JSON file somewhere safe (e.g. project root as `firebase-service-account.json`, and add it to `.gitignore`).
2. Set the path in your server environment (e.g. in `.env` at project root):
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```
   (Or `FCM_SERVICE_ACCOUNT_PATH`. Relative path is from project root.)
3. Restart the server. On startup you should **not** see `[push] FCM disabled`. When a message is sent, you should see e.g. `[push] Sent to user X : 1 ok, 0 failed` or `[push] No tokens for user X` if the recipient has not registered a device yet.

### 3. What the app does

- On native (Android/iOS), when the user is logged in the app requests notification permission, registers with FCM/APNs, and sends the token to `POST /api/users/me/push-token`. The server stores it in `user_push_tokens` (run `npm run migrate` if you added the push-tokens migration).
- When someone sends a chat message, the server notifies that user via SSE (in-app) and, if FCM is configured, sends a push to all of their registered devices.

**Still no push?**

1. **Server:** Open `http://localhost:5000/api/health` (or your API URL). You must see `"push": true`. If you see `"push": false`, set `GOOGLE_APPLICATION_CREDENTIALS` in `.env` to your Firebase service account JSON path and restart the server.
2. **Token on server:** After opening the app (logged in, notifications allowed), check the server log for `[push] Token registered for user X`. If you never see that, the app is not sending the token (wrong API URL, no `google-services.json`, or permission denied).
3. **Android:** Ensure `android/app/google-services.json` is present (from Firebase Console → Project settings → your Android app). Rebuild: `npm run cap:sync:android` and run from Android Studio.
4. **When a message is sent:** In the server log you should see either `[push] Sent to user X : 1 ok` or `[push] No tokens for user X` or `[push] Token failed: <code>`. If you see a token failure, the error code (e.g. `invalid-registration-token`) will explain the problem.

**Debug push on a physical device:** Connect the phone via USB, enable USB debugging, then on your PC open Chrome and go to `chrome://inspect`. Find your WebView (BalhinBalay) and click "inspect". In the Console tab you’ll see `[push]` logs: "Requesting notification permission…", "Permission granted, calling register()…", "Got FCM token, sending to server…", and either "Token registered with server." or "Failed to register token" with status/data. If you never see "Got FCM token", FCM didn’t give a token (check `google-services.json` and that the app has notification permission). If you see "Failed to register token" with status 401, the session may not be sent (try logging in again on the device).

---

## iOS (later)

- **Prerequisites:** macOS and [Xcode](https://developer.apple.com/xcode/). iOS cannot be built on Windows.
- **Commands:** `npm run cap:sync` then `npm run cap:ios` to open in Xcode; run on simulator or device.

---

## Project layout

- `capacitor.config.ts` – Capacitor config (app id `com.balhinbalay.app`, `webDir`: `build`)
- `android/` – Android Studio project
- `ios/` – Xcode project (macOS only)

## Commands

| Command                           | Description                                                                 |
|-----------------------------------|-----------------------------------------------------------------------------|
| `npm run android:emulator`        | Build for emulator (10.0.2.2:5000), sync Android, open Android Studio      |
| `npm run cap:sync:android:emulator`| Build with emulator API URL and sync to Android only                       |
| `npm run cap:sync:android:device` | Build with PC IP from `.env.android.device` and sync (for testing on phone) |
| `npm run cap:sync:android:production` | Build with `https://balhinbalay.com` (`.env.production`) and sync — use from anywhere |
| `npm run cap:sync:android`       | Build web app and copy into **Android only** (uses .env / .env.production) |
| `npm run cap:sync`                | Build web app and copy into Android + iOS                                  |
| `npm run cap:android`             | Open Android project in Android Studio                                    |
| `npm run cap:ios`                 | Open iOS project in Xcode (macOS only)                                     |
