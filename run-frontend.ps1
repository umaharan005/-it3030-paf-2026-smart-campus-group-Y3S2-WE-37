$ErrorActionPreference = "Stop"

$frontendDir = Join-Path $PSScriptRoot "frontend"

Push-Location $frontendDir
try {
  & npm.cmd run dev -- --host 127.0.0.1
} finally {
  Pop-Location
}
