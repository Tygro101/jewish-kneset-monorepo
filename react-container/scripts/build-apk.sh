#!/usr/bin/env bash
# =============================================================================
# build-apk.sh — Local Android APK build for Smart Clock container
#
# PREREQUISITES (one-time setup):
#   1. JDK 17 installed — set JAVA_HOME to the JDK root.
#   2. Android SDK installed — set ANDROID_HOME (usually ~/Android/Sdk or via Android Studio).
#   3. npm install has been run in react-container/.
#   4. Release keystore created (see below).
#
# CREATE RELEASE KEYSTORE (one-time):
#   cd react-container
#   keytool -genkeypair -v \
#     -keystore smartclock-release.keystore \
#     -alias smartclock \
#     -keyalg RSA -keysize 2048 -validity 10000
#
#   Then create a file `android/gradle.properties` (after prebuild) or
#   `gradle.properties.local` with:
#     SMARTCLOCK_UPLOAD_STORE_FILE=../../smartclock-release.keystore
#     SMARTCLOCK_UPLOAD_KEY_ALIAS=smartclock
#     SMARTCLOCK_UPLOAD_STORE_PASSWORD=<your-password>
#     SMARTCLOCK_UPLOAD_KEY_PASSWORD=<your-password>
#
# USAGE:
#   cd react-container
#   bash scripts/build-apk.sh          # builds release APK
#   bash scripts/build-apk.sh debug    # builds debug APK (no signing needed)
#
# OUTPUT:
#   android/app/build/outputs/apk/release/app-release.apk   (or debug/)
#
# INSTALL ON DEVICE:
#   adb install -r android/app/build/outputs/apk/release/app-release.apk
# =============================================================================

set -euo pipefail

BUILD_TYPE="${1:-release}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Working directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Step 1: Generate native android/ project (idempotent)
echo "==> Running expo prebuild (android)..."
npx expo prebuild --platform android --clean

# Step 2: Configure release signing (if release build)
if [ "$BUILD_TYPE" = "release" ]; then
  GRADLE_PROPS="android/gradle.properties"
  if ! grep -q "SMARTCLOCK_UPLOAD_STORE_FILE" "$GRADLE_PROPS" 2>/dev/null; then
    echo ""
    echo "⚠️  Release signing not configured in $GRADLE_PROPS."
    echo "   Add these lines to $GRADLE_PROPS:"
    echo ""
    echo "   SMARTCLOCK_UPLOAD_STORE_FILE=../../smartclock-release.keystore"
    echo "   SMARTCLOCK_UPLOAD_KEY_ALIAS=smartclock"
    echo "   SMARTCLOCK_UPLOAD_STORE_PASSWORD=<password>"
    echo "   SMARTCLOCK_UPLOAD_KEY_PASSWORD=<password>"
    echo ""
    echo "   Then also add the signingConfig in android/app/build.gradle."
    echo "   See README.md for full instructions."
    echo ""
    echo "   Falling back to debug build."
    BUILD_TYPE="debug"
  fi
fi

# Step 3: Build APK with Gradle
echo "==> Building APK ($BUILD_TYPE)..."
cd android

if [ "$(uname -s)" = "MINGW"* ] || [ "$(uname -s)" = "MSYS"* ] || [ "$OS" = "Windows_NT" ]; then
  ./gradlew.bat "assemble${BUILD_TYPE^}"
else
  ./gradlew "assemble${BUILD_TYPE^}"
fi

cd ..

# Step 4: Report output
APK_PATH="android/app/build/outputs/apk/$BUILD_TYPE/app-$BUILD_TYPE.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "✅ APK built successfully: $APK_PATH"
  echo ""
  echo "   Install on device with:"
  echo "   adb install -r $APK_PATH"
else
  echo "❌ APK not found at expected path: $APK_PATH"
  exit 1
fi
