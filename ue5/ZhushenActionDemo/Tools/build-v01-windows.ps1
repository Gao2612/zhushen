$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EngineRoot = if ($env:UE_ROOT) { $env:UE_ROOT } else { "G:\UE_5.8" }
$RunUAT = Join-Path $EngineRoot "Engine\Build\BatchFiles\RunUAT.bat"
$TempProjectRoot = if ($env:ZHUSHEN_UE5_PACKAGE_TEMP) { $env:ZHUSHEN_UE5_PACKAGE_TEMP } else { "G:\ZhushenUE5Demo-PackageTemp" }

if (!(Test-Path -LiteralPath $RunUAT)) {
  throw "RunUAT.bat not found. Set UE_ROOT to your Unreal Engine directory."
}

if (Test-Path -LiteralPath $TempProjectRoot) {
  Remove-Item -LiteralPath $TempProjectRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $TempProjectRoot | Out-Null
robocopy $ProjectRoot $TempProjectRoot /E /XD Source Intermediate Saved Builds DerivedDataCache .vs /XF *.sln | Out-Null

$ProjectFile = Join-Path $TempProjectRoot "ZhushenActionDemo.uproject"

foreach ($Config in @("Development", "Shipping")) {
  $ArchiveDir = Join-Path $ProjectRoot "Builds\Windows\$Config\v0.1"
  if (Test-Path -LiteralPath $ArchiveDir) {
    Remove-Item -LiteralPath $ArchiveDir -Recurse -Force
  }

  & $RunUAT BuildCookRun `
    -project="$ProjectFile" `
    -noP4 `
    -platform=Win64 `
    -clientconfig="$Config" `
    -cook `
    -stage `
    -pak `
    -iostore `
    -archive `
    -archivedirectory="$ArchiveDir" `
    -nocompile `
    -nocompileeditor `
    -skipbuild

  if ($LASTEXITCODE -ne 0) {
    throw "Windows $Config package failed with exit code $LASTEXITCODE."
  }
}
