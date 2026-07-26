@echo off
title HONOR Pad 10 (12.1 inch) - Physical 1:1
echo Launching HONOR Pad 10 at true physical size (scale 0.653)...
echo Target physical dimensions: 163mm wide x 261mm tall (portrait)
echo.
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd HONOR_Pad_10 -scale 0.653 -no-snapshot -port 5554
pause
