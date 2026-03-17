# Submitting BalhinBalay to the App Store (iOS)

This is a step-by-step plan to add your app to the **Apple App Store**. You need a **Mac with Xcode**; iOS apps cannot be built or submitted from Windows/Linux.

---

## 1. Apple Developer account

- Enroll at [developer.apple.com/programs](https://developer.apple.com/programs/).
- Cost: **$99 USD/year** (individual or organization).
- Approval can take 24–48 hours. You need this before you can submit.

---

## 2. App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/).
2. **My Apps** → **+** → **New App**.
3. Choose **iOS**, name **BalhinBalay**, primary language, bundle ID **com.balhinbalay.app** (must match your Xcode project), SKU (e.g. `balhinbalay-ios`).
4. Create the app; you’ll add metadata and builds in the next steps.

---

## 3. Build the app for release

From the project root, build the web app for production (so the app uses your live API, e.g. `https://balhinbalay.com`) and sync to iOS:

```bash
npm run build:tunnel:clean
npm run cap:sync
npm run cap:ios
```

In **Xcode**:

1. Select the **App** target.
2. **Signing & Capabilities**: choose your **Team** (Apple Developer account), enable **Automatically manage signing**, and set the bundle identifier to **com.balhinbalay.app** (must match App Store Connect).
3. **Product** → **Scheme** → **Edit Scheme** → **Run** and **Archive** both use **Release**.
4. **Product** → **Archive**.
5. When the archive finishes, the **Organizer** window opens. Select the archive → **Distribute App** → **App Store Connect** → **Upload**. Follow the prompts (e.g. automatic signing, upload).

---

## 4. App Store listing (metadata)

In App Store Connect, open your app and fill in:

- **App Information**: name, subtitle, category (e.g. Lifestyle or Real Estate), privacy policy URL.
- **Pricing**: free or paid; countries.
- **App Privacy**: declare what data you collect (e.g. email, location if used) in the privacy form.
- **Screenshots**: required for each device size (e.g. 6.7", 6.5", 5.5" iPhone). Simulator: **File** → **New Screen Shot** or run on device and capture.
- **Description**, **Keywords**, **Support URL**, **Marketing URL** (optional).
- **Version**: must match the version you set in Xcode (e.g. **CFBundleShortVersionString** / Marketing Version).

---

## 5. Submit for review

1. In App Store Connect, open your app → **+ Version or Platform** if needed → select the **iOS** version.
2. Under **Build**, click **+** and select the build you uploaded from Xcode (it can take a few minutes to appear).
3. Complete all required fields (screenshots, description, privacy, etc.).
4. Click **Add for Review** → **Submit to App Review**.

Review usually takes **24–48 hours**. You’ll get email when the status changes (e.g. “In Review”, “Approved”, or “Rejected” with reasons).

---

## 6. After approval

- You can release manually or set **Automatically release this version after App Review**.
- The app will go live on the App Store in the regions you chose.

---

## Checklist (summary)

| Step | Action |
|------|--------|
| 1 | Enroll in Apple Developer Program ($99/year). |
| 2 | Create the app in App Store Connect (bundle ID: `com.balhinbalay.app`). |
| 3 | Build: `npm run build:tunnel:clean` → `npm run cap:sync` → `npm run cap:ios`; in Xcode set signing and **Product → Archive** → **Distribute** → App Store Connect. |
| 4 | In App Store Connect: add screenshots, description, privacy, pricing. |
| 5 | Select the uploaded build for the version and **Submit to App Review**. |

---

## Notes

- **Push notifications (APNs):** If you use push, you’ll need an APNs key or certificate in the Apple Developer account and in your backend; Capacitor’s Push Notifications plugin works with that.
- **TestFlight:** In App Store Connect you can invite testers via TestFlight before public release (optional).
- **Android:** See **[PLAY-STORE.md](PLAY-STORE.md)** in this repo for the Google Play submission plan (signed AAB, Play Console, store listing, release).
