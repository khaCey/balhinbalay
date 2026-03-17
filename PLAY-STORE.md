# Submitting BalhinBalay to the Google Play Store (Android)

Step-by-step plan to publish your app on **Google Play**. You can build and submit from Windows, Mac, or Linux (no Mac required, unlike the App Store).

---

## 1. Google Play Developer account

- Sign up at [play.google.com/console](https://play.google.com/console/).
- One-time **$25 USD** registration fee.
- Approval is usually within a few days. You need this before you can publish.

---

## 2. Create the app in Play Console

1. In [Google Play Console](https://play.google.com/console/), click **Create app**.
2. Fill in: **App name** (BalhinBalay), **Default language**, **App or game**, **Free or paid**.
3. Accept the declarations (e.g. policies, US export laws). The app is created and you land in the dashboard.

---

## 3. Build a release AAB (Android App Bundle)

Google Play requires an **Android App Bundle** (`.aab`), not an APK, for new apps.

**3.1 Production build and sync**

From the project root, build the web app for production (so the app uses your live API) and sync to Android:

```bash
npm run build:tunnel:clean
npm run cap:sync:android:production
```

(Or `npm run cap:sync:android` if your default build already uses the production API URL.)

**3.2 Open in Android Studio and build the bundle**

```bash
npm run cap:android
```

In **Android Studio**:

1. **Build** → **Generate Signed Bundle / APK** → choose **Android App Bundle** → **Next**.
2. **Create new** (or use existing) keystore:
   - **Key store path**: e.g. `balhinbalay-release.keystore` (store somewhere safe and back it up).
   - **Password** and **Key** alias, password. Remember these; you need them for every future update.
3. Select **release** build variant, **Next** → **Create**.
4. The signed `.aab` is saved (e.g. `android/app/release/app-release.aab`).

**Important:** Keep the keystore file and passwords secure. If you lose them, you cannot update the same app on Play Store.

---

## 4. App signing (optional but recommended)

Play Console can manage your app signing key for you:

1. In Play Console → your app → **Setup** → **App signing**.
2. Choose **Google Play App Signing**: upload your first upload key (or let Google generate it). Play will sign releases with the app signing key; you only need to keep your **upload** key for future updates.

---

## 5. Store listing

In Play Console → **Grow** → **Store presence** → **Main store listing**:

- **App name**, **Short description** (80 chars), **Full description** (4000 chars).
- **Graphics**: app icon (512×512), **feature graphic** (1024×500), **screenshots** (phone: at least 2; 7" and 10" tablet if you support them).
- **Category** (e.g. House & Home or Lifestyle).
- **Contact details**: email, **Privacy policy** URL (required if you collect user data).

---

## 6. Content rating and other policies

- **Content rating**: **Policy** → **App content** → **Content rating**. Complete the questionnaire; you get a rating (e.g. Everyone, Teen).
- **Target audience**: **Policy** → **App content** → **Target audience and content**.
- **Privacy**: If you collect data, add a **Privacy policy** and fill **Data safety** (what you collect and why).
- **Ads**: If the app has ads, declare in **Ads declaration**.

---

## 7. Release the app

1. In Play Console → **Release** → **Production** (or **Testing** for internal/closed/open testing first).
2. **Create new release**.
3. **Upload** the signed `.aab` from step 3.
4. **Release name**: e.g. `1` or `1.0.0` (for your reference).
5. **Release notes**: short description of what’s new (for users).
6. **Review and roll out** → **Start rollout to Production**.

Review can take from hours to a few days. You’ll get email when the app is approved (or if changes are requested).

---

## Checklist (summary)

| Step | Action |
|------|--------|
| 1 | Register as [Google Play Developer](https://play.google.com/console/) ($25 one-time). |
| 2 | Create the app in Play Console (name, type, free/paid). |
| 3 | Build: `npm run build:tunnel:clean` → `npm run cap:sync:android:production`; open Android Studio → **Generate Signed Bundle** → produce `.aab`. |
| 4 | (Recommended) Enroll in **Google Play App Signing**. |
| 5 | Complete **Store listing** (icon, screenshots, descriptions, privacy policy). |
| 6 | Complete **Content rating**, **Target audience**, **Data safety** (and ads if applicable). |
| 7 | **Production** → **Create new release** → upload `.aab` → **Roll out**. |

---

## Version for updates

When you release updates, increase **versionCode** (integer) and optionally **versionName** in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2
    versionName "1.1"
    // ...
}
```

Then build a new signed AAB and create a new release in Play Console.

---

## Notes

- **Package name**: `com.balhinbalay.app` (in `android/app/build.gradle`). It must stay the same for the same app on Play Store.
- **Push notifications**: If you use FCM, ensure `android/app/google-services.json` is in place and the server is configured (see CAPACITOR.md).
- **Internal / closed testing**: Use **Release** → **Testing** to upload a build and share with testers before going to production.
