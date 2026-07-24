# =============================================================================
# build-apk.ps1 — Local Android APK build for Smart Clock container (Windows)
#
# PREREQUISITES (one-time setup):
#   1. JDK 17 installed — set JAVA_HOME environment variable.
#   2. Android SDK installed — set ANDROID_HOME (usually %LOCALAPPDATA%\Android\Sdk).
#   3. npm install has been run in react-container/.
#   4. Release keystore created (see README.md).
#
# USAGE (from react-container/):
#   .\scripts\build-apk.ps1               # builds release APK
#   .\scripts\build-apk.ps1 -BuildType debug  # builds debug APK
#
# OUTPUT:
#   android\app\build\outputs\apk\release\app-release.apk
#
# INSTALL ON DEVICE:
#   adb install -r android\app\build\outputs\apk\release\app-release.apk
# =============================================================================

param(
    [ValidateSet("release", "debug")]
    [string]$BuildType = "release"
)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectDir

Write-Host "==> Working directory: $ProjectDir" -ForegroundColor Cyan

# Step 1: Generate native android/ project
Write-Host "==> Running expo prebuild (android)..." -ForegroundColor Cyan
npx expo prebuild --platform android --clean
if ($LASTEXITCODE -ne 0) { throw "expo prebuild failed" }

# Step 2: Check release signing
if ($BuildType -eq "release") {
    $gradleProps = "android\gradle.properties"
    if (Test-Path $gradleProps) {
        $content = Get-Content $gradleProps -Raw
        if ($content -notmatch "SMARTCLOCK_UPLOAD_STORE_FILE") {
            Write-Warning @"

Release signing not configured in $gradleProps.
Add these lines:

  SMARTCLOCK_UPLOAD_STORE_FILE=../../smartclock-release.keystore
  SMARTCLOCK_UPLOAD_KEY_ALIAS=smartclock
  SMARTCLOCK_UPLOAD_STORE_PASSWORD=<password>
  SMARTCLOCK_UPLOAD_KEY_PASSWORD=<password>

Falling back to debug build.
"@
            $BuildType = "debug"
        }
    } else {
        Write-Warning "gradle.properties not found. Falling back to debug build."
        $BuildType = "debug"
    }
}

# Step 3: Build APK with Gradle
$taskName = "assemble" + (Get-Culture).TextInfo.ToTitleCase($BuildType)
Write-Host "==> Building APK ($BuildType) with task: $taskName..." -ForegroundColor Cyan

Set-Location android
& .\gradlew.bat $taskName
if ($LASTEXITCODE -ne 0) { throw "Gradle build failed" }
Set-Location ..

# Step 4: Report output
$apkPath = "android\app\build\outputs\apk\$BuildType\app-$BuildType.apk"
if (Test-Path $apkPath) {
    Write-Host ""
    Write-Host "APK built successfully: $apkPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Install on device with:" -ForegroundColor Yellow
    Write-Host "  adb install -r $apkPath" -ForegroundColor Yellow
} else {
    Write-Error "APK not found at expected path: $apkPath"
    exit 1
}
