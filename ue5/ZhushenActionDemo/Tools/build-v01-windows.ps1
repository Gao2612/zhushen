$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ProjectFile = Join-Path $ProjectRoot "ZhushenActionDemo.uproject"
$ArchiveDir = Join-Path $ProjectRoot "Builds\Windows\v0.1"
$EngineRoot = if ($env:UE_ROOT) { $env:UE_ROOT } else { "G:\Program Files\Epic Games\UE_5.5" }
$RunUAT = Join-Path $EngineRoot "Engine\Build\BatchFiles\RunUAT.bat"

if (!(Test-Path -LiteralPath $RunUAT)) {
  throw "RunUAT.bat not found. Set UE_ROOT to your Unreal Engine directory."
}

& $RunUAT BuildCookRun `
  -project="$ProjectFile" `
  -noP4 `
  -platform=Win64 `
  -clientconfig=Shipping `
  -build `
  -cook `
  -stage `
  -pak `
  -iostore `
  -archive `
  -archivedirectory="$ArchiveDir"

