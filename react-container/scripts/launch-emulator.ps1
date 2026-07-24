#!/usr/bin/env pwsh
# Launch HONOR Pad 10 (12.1 inch) emulator at 1:1 pixel-perfect scale - PORTRAIT mode
# Resolution: 1600x2560 (portrait), DPI: 249, Aspect ratio: 10:16
# This will exceed most monitors - that's intentional for true 1:1 representation

Write-Host "Launching HONOR Pad 10 emulator (1600x2560 Portrait @ 249 DPI, 1:1 scale)..." -ForegroundColor Cyan
Write-Host "Note: The emulator window will be very large (actual tablet resolution)." -ForegroundColor Yellow

emulator -avd HONOR_Pad_10 -fixed-scale -no-snapshot
