# Smart Clock Container — Offline-First Android Kiosk App

## Overview

The **react-container** is an Expo (React Native) app that wraps the `smart-clock` web PWA in a native Android WebView. It runs as a kiosk-style wall display for a bet knesset, showing prayer times (zmanim), Hebrew dates, and titles — all computed locally on the device with no server-side data dependency.

### Architecture

```
┌────────────────────────────────────────────────┐
│  Android Tablet (always-on kiosk)              │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  react-container (Expo Native App)       │  │
│  │  • WebView → loads HTTPS host            │  │
│  │  • Keep-awake, landscape lock            │  │
│  │  • Connectivity monitor → reload on      │  │
│  │    network reconnect                     │  │
│  │                                          │  │
│  │  ┌──────────────────────────────────┐    │  │
│  │  │  smart-clock (PWA in WebView)    │    │  │
│  │  │  • Service Worker precaches all  │    │  │
│  │  │    assets (JS, CSS, fonts,       │    │  │
│  │  │    workers)                      │    │  │
│  │  │  • Polls for new version every   │    │  │
│  │  │    30 min                        │    │  │
│  │  │  • Auto-reloads on new build     │    │  │
│  │  │  • Recalculates zmanim at        │    │  │
│  │  │    midnight                      │    │  │
│  │  └──────────────────────────────────┘    │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
         │ (first load only)
         ▼
┌─────────────────────┐
│  HTTPS Host (CDN)   │
│  smart-clock/build/ │
└─────────────────────┘
```

### How Updates Propagate

1. You push a new build of `smart-clock` to the HTTPS host.
2. The service worker's 30-minute poll (or a reconnect reload) fetches the new `sw.js`.
3. Workbox sees changed file hashes → downloads new assets → activates → page reloads automatically.
4. **No APK rebuild needed** for smart-clock web changes. The APK only changes if native container code changes.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ | For npm scripts and expo |
| JDK 17 | Required by Android Gradle Plugin |
| Android SDK | `ANDROID_HOME` env var set |
| `adb` available | For installing APK on device |
| Tablet: Android 8+ | Required for WebView service worker support |
| Tablet: "Automatic date & time" ON | **Critical** — wrong device clock = wrong zmanim |

---

## Setup (One-Time)

### 1. Install dependencies

```bash
cd react-container
npm install
```

### 2. Configure the Smart Clock URL

Edit `constants/AppConfig.ts` and set `SMART_CLOCK_URL` to your deployed HTTPS host:

```ts
SMART_CLOCK_URL: 'https://your-deployed-host.com',
```

### 3. Create a release signing keystore

```bash
keytool -genkeypair -v \
  -keystore smartclock-release.keystore \
  -alias smartclock \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Back this file up securely.** If lost, you cannot publish signed updates to the same app identity.

### 4. Generate the native project

```bash
npx expo prebuild --platform android --clean
```

### 5. Configure release signing in Gradle

Add to `android/gradle.properties`:

```properties
SMARTCLOCK_UPLOAD_STORE_FILE=../../smartclock-release.keystore
SMARTCLOCK_UPLOAD_KEY_ALIAS=smartclock
SMARTCLOCK_UPLOAD_STORE_PASSWORD=your-password
SMARTCLOCK_UPLOAD_KEY_PASSWORD=your-password
```

In `android/app/build.gradle`, inside the `android { }` block, add:

```groovy
signingConfigs {
    release {
        storeFile file(SMARTCLOCK_UPLOAD_STORE_FILE)
        storePassword SMARTCLOCK_UPLOAD_STORE_PASSWORD
        keyAlias SMARTCLOCK_UPLOAD_KEY_ALIAS
        keyPassword SMARTCLOCK_UPLOAD_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ...existing config
    }
}
```

---

## Building the APK (Locally)

### Windows (PowerShell)

```powershell
.\scripts\build-apk.ps1                  # release
.\scripts\build-apk.ps1 -BuildType debug # debug (no keystore needed)
```

### Linux / macOS / Git Bash

```bash
bash scripts/build-apk.sh          # release
bash scripts/build-apk.sh debug    # debug
```

### Using npm scripts

```bash
npm run prebuild                    # generate android/ folder
npm run build:apk:release           # gradle assembleRelease
npm run build:apk:debug             # gradle assembleDebug
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Install on device

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## Deploying Smart Clock Web Updates

No APK rebuild needed. Just deploy the new `smart-clock/build/` folder to your HTTPS host:

```bash
cd smart-clock
npx vite build                    # outputs to build/
# Deploy build/ to your static host (S3, Netlify, Vercel, nginx, etc.)
```

Devices will pick up the new version within 30 minutes (or immediately on reconnect after being offline).

---

## Device Provisioning Checklist

When setting up a new tablet:

- [ ] **Automatic date & time** is ON (Settings → System → Date & time)
- [ ] Wi-Fi configured and connected
- [ ] Install the APK: `adb install app-release.apk`
- [ ] Launch the app once while online — wait for the clock to display (SW installs)
- [ ] Verify offline: enable airplane mode, force-close app, relaunch — clock should display
- [ ] Enable Android kiosk mode (optional): use Screen Pinning or a third-party kiosk launcher
- [ ] Mount tablet

---

## Known Limitations

| Limitation | Mitigation |
|---|---|
| First launch requires network | SW must install and precache assets on first run. Subsequent launches work offline. |
| Device clock accuracy | Zmanim depend on correct device time. Ensure "Automatic date & time" is ON. A drifting offline clock will show wrong times. |
| Android WebView may evict SW cache under storage pressure | Unlikely on a dedicated kiosk device. If it happens, the next online load re-caches. |
| OS-level kiosk lockdown not enforced in-app | Use Android Screen Pinning, a kiosk launcher app, or MDM/device-admin for true lockdown. |
| Location hardcoded to Netivot/Neva Sharon | Changing location requires a new smart-clock build (by design — see `CitiesEnum.NETIVOT_NEVA_SHARON`). |

---

## Versioning & Releases

- **smart-clock (web)**: Deploy new builds to the host. Devices auto-update via SW.
- **react-container (APK)**: Bump `version` and `android.versionCode` in `app.json` before rebuilding. Only needed for native-layer changes (new dependencies, new native features, container bug fixes).

---

## Project Structure

```
react-container/
├── app/
│   ├── _layout.tsx          # Kiosk hardening (keep-awake, orientation, fullscreen)
│   ├── index.tsx            # Entry → WebView
│   └── WebView.tsx          # WebView component with offline/SW config
├── constants/
│   └── AppConfig.ts         # Smart Clock URL + User-Agent config
├── hooks/
│   └── useConnectivityReload.ts  # Reload WebView on offline→online transition
├── scripts/
│   ├── build-apk.sh         # Bash build script
│   └── build-apk.ps1        # PowerShell build script
├── app.json                 # Expo/Android config
└── package.json

smart-clock/
├── src/
│   ├── main.tsx             # SW registration + periodic update poll
│   └── app/
│       ├── hooks/
│       │   └── useDailyRecalc.ts  # Midnight recalculation hook
│       └── components/clock-view/
│           └── ClockView.tsx       # Uses useDailyRecalc
├── public/
│   └── icon.svg             # PWA icon
├── index.html               # PWA entry with manifest link
└── vite.config.ts           # vite-plugin-pwa config
```
