$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EngineRoot = if ($env:UE_ROOT) { $env:UE_ROOT } else { "C:\Program Files\Epic Games\UE_5.8" }
$RunUAT = Join-Path $EngineRoot "Engine\Build\BatchFiles\RunUAT.bat"
$DotNetRoot = Join-Path $EngineRoot "Engine\Binaries\ThirdParty\DotNet\10.0\win-x64"
$TempRoot = if ($env:ZHUSHEN_UE5_PACKAGE_TEMP) {
  $env:ZHUSHEN_UE5_PACKAGE_TEMP
} else {
  Join-Path $env:TEMP "ZhushenUE5Demo-PackageTemp"
}
$TempProjectRoot = Join-Path $TempRoot "AndroidContentOnly"

$env:JAVA_HOME = if ($env:JAVA_HOME) {
  $env:JAVA_HOME
} else {
  "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
}
$env:ANDROID_HOME = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "C:\Android\Sdk" }
$env:ANDROID_SDK_ROOT = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { $env:ANDROID_HOME }
$env:NDKROOT = if ($env:NDKROOT) { $env:NDKROOT } else { "C:\Android\Sdk\ndk\27.2.12479018" }

if (!(Test-Path -LiteralPath $RunUAT)) {
  throw "RunUAT.bat not found. Set UE_ROOT to your Unreal Engine directory."
}

if (Test-Path -LiteralPath $DotNetRoot) {
  $env:DOTNET_ROOT = $DotNetRoot
  $env:DOTNET_ROOT_X64 = $DotNetRoot
  $env:PATH = "$DotNetRoot;$env:PATH"
}

if (Test-Path -LiteralPath $TempProjectRoot) {
  Remove-Item -LiteralPath $TempProjectRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $TempProjectRoot | Out-Null
robocopy $ProjectRoot $TempProjectRoot /E /XD Source Intermediate Saved Builds DerivedDataCache .vs /XF *.sln | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "Failed to prepare Android content-only package temp project. robocopy exit code: $LASTEXITCODE"
}

$ProjectFile = Join-Path $TempProjectRoot "ZhushenActionDemo.uproject"

foreach ($Config in @("Development", "Shipping")) {
  $ArchiveDir = Join-Path $ProjectRoot "Builds\Android\$Config\v0.1"
  if (Test-Path -LiteralPath $ArchiveDir) {
    Remove-Item -LiteralPath $ArchiveDir -Recurse -Force
  }

  & $RunUAT BuildCookRun `
    -project="$ProjectFile" `
    -noP4 `
    -platform=Android `
    -clientconfig="$Config" `
    -cook `
    -stage `
    -pak `
    -iostore `
    -package `
    -archive `
    -archivedirectory="$ArchiveDir" `
    -nocompile `
    -nocompileeditor `
    -skipbuild

  if ($LASTEXITCODE -ne 0) {
    throw "Android $Config package failed with exit code $LASTEXITCODE."
  }
}
