; Smart Clock — NSIS custom install/uninstall hooks.
; Registers the kiosk to start for any user at logon (machine-wide).
; Requires perMachine: true so the installer runs elevated.

!macro customInstall
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "SmartClock" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
  DetailPrint "Registered Smart Clock for auto-launch at logon (HKLM Run)."
!macroend

!macro customUnInstall
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "SmartClock"
  DetailPrint "Removed Smart Clock auto-launch entry."
!macroend
