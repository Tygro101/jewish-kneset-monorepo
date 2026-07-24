@echo off
title HONOR Pad 10 (12.1 inch) Emulator
echo Starting HONOR Pad 10 emulator (1600x2560, Portrait, 1:1 scale)...
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd HONOR_Pad_10 -fixed-scale -no-snapshot
pause
