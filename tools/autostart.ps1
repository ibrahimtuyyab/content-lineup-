# Optional: keep the ContentLineup site running across reboots on Windows.
#
# Registers a Scheduled Task that builds and serves the site at logon, hidden,
# with automatic restart if it stops. Nothing is installed system-wide and no
# admin rights are needed — it runs as the current user.
#
#   Install:    powershell -ExecutionPolicy Bypass -File tools\autostart.ps1
#   Remove:     powershell -ExecutionPolicy Bypass -File tools\autostart.ps1 -Remove
#   Port:       powershell -ExecutionPolicy Bypass -File tools\autostart.ps1 -Port 3000

param(
  [switch]$Remove,
  [int]$Port = 8080
)

$TaskName = 'ContentLineupSite'
$Root     = Split-Path -Parent $PSScriptRoot

if ($Remove) {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed scheduled task '$TaskName'."
  } else {
    Write-Host "No scheduled task named '$TaskName' is registered."
  }
  return
}

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { Write-Error 'node was not found on PATH.'; return }

# Build first so the task never starts against a missing dist/.
Write-Host 'Building…'
& $node (Join-Path $Root 'build.mjs') | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Error 'Build failed; task not registered.'; return }

$action = New-ScheduledTaskAction `
  -Execute $node `
  -Argument 'serve.mjs' `
  -WorkingDirectory $Root

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
  -Hidden

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description 'Serves the ContentLineup marketing site from dist/.' | Out-Null

# The task sets PORT via the environment; default matches serve.mjs.
[Environment]::SetEnvironmentVariable('PORT', $Port, 'User')
[Environment]::SetEnvironmentVariable('LOG', 'off', 'User')

Start-ScheduledTask -TaskName $TaskName

Write-Host ""
Write-Host "Registered '$TaskName'. The site starts at logon and is serving now:"
Write-Host "  http://localhost:$Port"
Write-Host ""
Write-Host "Remove it with:  powershell -ExecutionPolicy Bypass -File tools\autostart.ps1 -Remove"
