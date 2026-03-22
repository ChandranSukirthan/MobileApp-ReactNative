# Run PowerShell as Administrator once, then:
#   cd DuinophileBackend\scripts
#   .\allow-port-5000.ps1

New-NetFirewallRule -DisplayName "Duinophile API 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
Write-Host "Done. If rule already existed, that is OK."
