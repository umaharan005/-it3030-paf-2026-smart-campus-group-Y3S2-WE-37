$ErrorActionPreference = "Stop"

$backendDir = Join-Path $PSScriptRoot "backend"
$mavenHome = Join-Path $backendDir "apache-maven-3.9.9"
$mavenCmd = Join-Path $mavenHome "bin\\mvn.cmd"

if (-not (Test-Path $mavenCmd)) {
  throw "Local Maven was not found at $mavenCmd"
}

Push-Location $backendDir
try {
  $env:Path = (Join-Path $mavenHome "bin") + ";" + $env:Path
  & $mavenCmd spring-boot:run
} finally {
  Pop-Location
}
