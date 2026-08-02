<#
  Builds the NSIS installer and installs it on this PC (silent, elevated).
  Usage: npm run install:local
#>
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host '==> Verifying (type-check + tests)...' -ForegroundColor Cyan
npm run verify
if ($LASTEXITCODE -ne 0) { throw 'Verification failed. Aborting install.' }

Write-Host '==> Building Windows installer...' -ForegroundColor Cyan
npm run dist:win
if ($LASTEXITCODE -ne 0) { throw 'electron-builder failed.' }

$setup = Get-ChildItem -Path (Join-Path $projectRoot 'release') -Filter 'SmartClockSetup-*.exe' |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $setup) { throw 'No installer found in release/.' }

Write-Host "==> Installing $($setup.Name) (UAC prompt expected)..." -ForegroundColor Cyan
$process = Start-Process -FilePath $setup.FullName -ArgumentList '/S' -Verb RunAs -Wait -PassThru
if ($process.ExitCode -ne 0) { throw "Installer exited with code $($process.ExitCode)." }

Write-Host '==> Installed. Smart Clock will start automatically at logon.' -ForegroundColor Green
Write-Host '    Verify: reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" /v SmartClock' -ForegroundColor DarkGray
