$ErrorActionPreference = "Continue"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Candidates = @()
if ($env:UE_ROOT) {
  $Candidates += $env:UE_ROOT
}
$Candidates += @(
  "G:\Program Files\Epic Games\UE_5.5",
  "G:\Program Files\Epic Games\UE_5.4",
  "C:\Program Files\Epic Games\UE_5.5",
  "C:\Program Files\Epic Games\UE_5.4"
)

function Find-FirstExisting([string[]]$Paths) {
  foreach ($Path in $Paths) {
    if (Test-Path -LiteralPath $Path) {
      return $Path
    }
  }
  return $null
}

function Find-CommandOrPath([string]$CommandName, [string[]]$Paths) {
  $Command = Get-Command $CommandName -ErrorAction SilentlyContinue
  if ($Command) {
    return $Command.Source
  }
  return Find-FirstExisting $Paths
}

$EngineRoot = Find-FirstExisting $Candidates
$RunUAT = if ($EngineRoot) { Join-Path $EngineRoot "Engine\Build\BatchFiles\RunUAT.bat" } else { $null }
$UnrealEditor = if ($EngineRoot) { Join-Path $EngineRoot "Engine\Binaries\Win64\UnrealEditor.exe" } else { $null }
$Java = Find-CommandOrPath "java.exe" @("G:\Program Files\Eclipse Adoptium\jdk-17\bin\java.exe")
$Adb = Find-CommandOrPath "adb.exe" @("G:\Android\Sdk\platform-tools\adb.exe")

[PSCustomObject]@{
  ProjectRoot = $ProjectRoot
  UE_ROOT = if ($EngineRoot) { $EngineRoot } else { "MISSING" }
  UnrealEditor = if ($UnrealEditor -and (Test-Path -LiteralPath $UnrealEditor)) { $UnrealEditor } else { "MISSING" }
  RunUAT = if ($RunUAT -and (Test-Path -LiteralPath $RunUAT)) { $RunUAT } else { "MISSING" }
  Java = if ($Java) { $Java } else { "MISSING" }
  Adb = if ($Adb) { $Adb } else { "MISSING" }
} | Format-List
