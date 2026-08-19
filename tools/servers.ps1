# Start, stop and check the ContentLineup servers.
#
# Runs them detached, so they survive the terminal that launched them.
#
#   powershell -ExecutionPolicy Bypass -File tools\servers.ps1 status
#   powershell -ExecutionPolicy Bypass -File tools\servers.ps1 start
#   powershell -ExecutionPolicy Bypass -File tools\servers.ps1 stop
#   powershell -ExecutionPolicy Bypass -File tools\servers.ps1 restart
#
# The site binds to 0.0.0.0 so other devices on the network can reach it.
# The admin binds to 127.0.0.1 only — it has no authentication.

param(
  [ValidateSet('start', 'stop', 'restart', 'status')]
  [string]$Action = 'status',
  [int]$Port = 8080,
  [int]$AdminPort = 8081,
  [switch]$NoAdmin
)

$Root = Split-Path -Parent $PSScriptRoot

function Get-ServerProcesses {
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and ($_.CommandLine -match 'serve\.mjs|admin\.mjs') }
}

function Get-LanAddress {
  (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.PrefixOrigin -ne 'WellKnown' } |
    Select-Object -First 1).IPAddress
}

function Show-Status {
  $procs = Get-ServerProcesses
  if (-not $procs) {
    Write-Host "Not running."
    return
  }
  foreach ($p in $procs) {
    $which = if ($p.CommandLine -match 'admin\.mjs') { 'admin' } else { 'site ' }
    Write-Host ("  {0}  PID {1}" -f $which, $p.ProcessId)
  }
  $lan = Get-LanAddress
  Write-Host ""
  Write-Host ("  Local    http://localhost:{0}" -f $Port)
  if ($lan) { Write-Host ("  Network  http://{0}:{1}" -f $lan, $Port) }
  Write-Host ("  Admin    http://127.0.0.1:{0}   (this machine only)" -f $AdminPort)
}

function Stop-Servers {
  $procs = Get-ServerProcesses
  if (-not $procs) { Write-Host "Nothing to stop."; return }
  foreach ($p in $procs) {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host ("Stopped PID {0}" -f $p.ProcessId)
  }
}

function Start-Servers {
  if (Get-ServerProcesses) {
    Write-Host "Already running. Use 'restart' to replace, or 'stop' first."
    Show-Status
    return
  }

  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
  if (-not $node) { Write-Error 'node was not found on PATH.'; return }

  if (-not (Test-Path (Join-Path $Root 'dist'))) {
    Write-Host 'No dist/ yet — building first…'
    & $node (Join-Path $Root 'build.mjs') | Out-Null
  }

  $env:PORT = $Port
  $env:ADMIN_PORT = $AdminPort
  $env:LOG = 'off'

  Start-Process -FilePath $node -ArgumentList 'serve.mjs' `
    -WorkingDirectory $Root -WindowStyle Hidden | Out-Null

  if (-not $NoAdmin) {
    Start-Process -FilePath $node -ArgumentList 'admin.mjs' `
      -WorkingDirectory $Root -WindowStyle Hidden | Out-Null
  }

  Start-Sleep -Seconds 2
  Show-Status
}

switch ($Action) {
  'start'   { Start-Servers }
  'stop'    { Stop-Servers }
  'restart' { Stop-Servers; Start-Sleep -Seconds 1; Start-Servers }
  'status'  { Show-Status }
}
