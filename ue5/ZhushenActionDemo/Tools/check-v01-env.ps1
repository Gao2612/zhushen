$ErrorActionPreference = "Continue"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ExpectedProjectRoot = "G:\ZhushenUE5Demo"
$ExpectedEngineRoot = "G:\UE_5.8"
$ExpectedAndroidRoot = "G:\Android\Sdk"
$ExpectedJavaRoot = "G:\Program Files\Eclipse Adoptium\jdk-17"

function Find-FirstExisting {
  param([string[]]$Paths)
  foreach ($Path in $Paths) {
    if ($Path -and (Test-Path -LiteralPath $Path)) {
      return $Path
    }
  }
  return $null
}

function Find-CommandOrPath {
  param([string]$CommandName, [string[]]$Paths)
  $Command = Get-Command $CommandName -ErrorAction SilentlyContinue
  if ($Command) {
    return $Command.Source
  }
  return Find-FirstExisting -Paths $Paths
}

function Get-StatusValue {
  param([string]$Path)
  if ($Path -and (Test-Path -LiteralPath $Path)) {
    return "OK"
  }
  return "MISSING"
}

function New-EnvRow {
  param([string]$Name, [string]$Status, [string]$Value, [string]$Expected, [string]$Note)
  return [PSCustomObject]@{
    Name = $Name
    Status = $Status
    Value = $Value
    Expected = $Expected
    Note = $Note
  }
}

function Get-ChildNames {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    return "MISSING"
  }
  $Names = Get-ChildItem -LiteralPath $Path -Directory -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty Name
  if (-not $Names) {
    return "EMPTY"
  }
  return ($Names -join ", ")
}

function Get-VsWherePath {
  return Find-FirstExisting -Paths @(
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe",
    "$env:ProgramFiles\Microsoft Visual Studio\Installer\vswhere.exe"
  )
}

function Get-VisualStudioPath {
  param([string]$VsWhere)
  if (-not $VsWhere) {
    return Find-FirstExisting -Paths @(
      "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community",
      "${env:ProgramFiles}\Microsoft Visual Studio\2022\BuildTools",
      "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools"
    )
  }
  $Result = & $VsWhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null
  if ($Result) {
    return $Result.Trim()
  }
  return $null
}

function Get-MSBuildPath {
  param([string]$VsWhere)
  if ($VsWhere) {
    $Result = & $VsWhere -latest -products * -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" 2>$null |
      Select-Object -First 1
    if ($Result) {
      return $Result.Trim()
    }
  }
  return Find-CommandOrPath -CommandName "MSBuild.exe" -Paths @()
}

function Get-WindowsSdkSummary {
  $RegistryPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SDKs\Windows\v10.0"
  $InstallFolder = $null
  $ProductVersion = $null
  if (Test-Path $RegistryPath) {
    $Item = Get-ItemProperty -Path $RegistryPath -ErrorAction SilentlyContinue
    $InstallFolder = $Item.InstallationFolder
    $ProductVersion = $Item.ProductVersion
  }
  if (-not $InstallFolder) {
    $InstallFolder = Find-FirstExisting -Paths @("${env:ProgramFiles(x86)}\Windows Kits\10", "$env:ProgramFiles\Windows Kits\10")
  }
  if ($InstallFolder -and (Test-Path -LiteralPath $InstallFolder)) {
    return @{
      Status = "OK"
      Value = if ($ProductVersion) { "$InstallFolder ($ProductVersion)" } else { $InstallFolder }
    }
  }
  return @{
    Status = "MISSING"
    Value = "MISSING"
  }
}

$EngineRoot = Find-FirstExisting -Paths @($env:UE_ROOT, $ExpectedEngineRoot)
$UnrealEditor = if ($EngineRoot) { Join-Path $EngineRoot "Engine\Binaries\Win64\UnrealEditor.exe" } else { $null }
$RunUAT = if ($EngineRoot) { Join-Path $EngineRoot "Engine\Build\BatchFiles\RunUAT.bat" } else { $null }
$Java = Find-CommandOrPath -CommandName "java.exe" -Paths @(
  "$env:JAVA_HOME\bin\java.exe",
  "$ExpectedJavaRoot\bin\java.exe"
)
$AndroidHome = Find-FirstExisting -Paths @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT, $ExpectedAndroidRoot)
$Adb = Find-CommandOrPath -CommandName "adb.exe" -Paths @(
  "$AndroidHome\platform-tools\adb.exe",
  "$ExpectedAndroidRoot\platform-tools\adb.exe"
)
$AndroidStudio = Find-FirstExisting -Paths @(
  "$env:ProgramFiles\Android\Android Studio\bin\studio64.exe",
  "${env:ProgramFiles(x86)}\Android\Android Studio\bin\studio64.exe"
)
$VsWhere = Get-VsWherePath
$VisualStudio = Get-VisualStudioPath -VsWhere $VsWhere
$MSBuild = Get-MSBuildPath -VsWhere $VsWhere
$WindowsSdk = Get-WindowsSdkSummary

$Rows = @(
  (New-EnvRow -Name "ProjectRoot" -Status "INFO" -Value $ProjectRoot -Expected $ExpectedProjectRoot -Note "Current repository project path"),
  (New-EnvRow -Name "UE_ROOT" -Status (Get-StatusValue -Path $EngineRoot) -Value $(if ($EngineRoot) { $EngineRoot } else { "MISSING" }) -Expected $ExpectedEngineRoot -Note "Unreal Engine 5.8 root"),
  (New-EnvRow -Name "UnrealEditor" -Status (Get-StatusValue -Path $UnrealEditor) -Value $(if ($UnrealEditor) { $UnrealEditor } else { "MISSING" }) -Expected "$ExpectedEngineRoot\Engine\Binaries\Win64\UnrealEditor.exe" -Note "Required for editor and map creation"),
  (New-EnvRow -Name "RunUAT" -Status (Get-StatusValue -Path $RunUAT) -Value $(if ($RunUAT) { $RunUAT } else { "MISSING" }) -Expected "$ExpectedEngineRoot\Engine\Build\BatchFiles\RunUAT.bat" -Note "Required for Windows and Android packaging"),
  (New-EnvRow -Name "VisualStudio" -Status (Get-StatusValue -Path $VisualStudio) -Value $(if ($VisualStudio) { $VisualStudio } else { "MISSING" }) -Expected "Visual Studio 2022 C++ workload" -Note "Required for UE C++ compile"),
  (New-EnvRow -Name "MSBuild" -Status (Get-StatusValue -Path $MSBuild) -Value $(if ($MSBuild) { $MSBuild } else { "MISSING" }) -Expected "MSBuild.exe" -Note "Required for Windows compile"),
  (New-EnvRow -Name "WindowsSDK" -Status $WindowsSdk.Status -Value $WindowsSdk.Value -Expected "Windows 10/11 SDK" -Note "Required for Windows Shipping build"),
  (New-EnvRow -Name "AndroidStudio" -Status (Get-StatusValue -Path $AndroidStudio) -Value $(if ($AndroidStudio) { $AndroidStudio } else { "MISSING" }) -Expected "Android Studio" -Note "Android SDK management entry"),
  (New-EnvRow -Name "JAVA_HOME" -Status (Get-StatusValue -Path "$env:JAVA_HOME") -Value $(if ($env:JAVA_HOME) { $env:JAVA_HOME } else { "MISSING" }) -Expected $ExpectedJavaRoot -Note "JDK 17 recommended"),
  (New-EnvRow -Name "Java" -Status (Get-StatusValue -Path $Java) -Value $(if ($Java) { $Java } else { "MISSING" }) -Expected "$ExpectedJavaRoot\bin\java.exe" -Note "Required for Android packaging"),
  (New-EnvRow -Name "ANDROID_HOME" -Status (Get-StatusValue -Path $AndroidHome) -Value $(if ($AndroidHome) { $AndroidHome } else { "MISSING" }) -Expected $ExpectedAndroidRoot -Note "Android SDK root"),
  (New-EnvRow -Name "Adb" -Status (Get-StatusValue -Path $Adb) -Value $(if ($Adb) { $Adb } else { "MISSING" }) -Expected "$ExpectedAndroidRoot\platform-tools\adb.exe" -Note "Required for device install and logs"),
  (New-EnvRow -Name "SDK Platforms" -Status (Get-StatusValue -Path "$AndroidHome\platforms") -Value (Get-ChildNames -Path "$AndroidHome\platforms") -Expected "android-35" -Note "Android target platform"),
  (New-EnvRow -Name "Build Tools" -Status (Get-StatusValue -Path "$AndroidHome\build-tools") -Value (Get-ChildNames -Path "$AndroidHome\build-tools") -Expected "35.0.0" -Note "Android build tools"),
  (New-EnvRow -Name "NDK" -Status (Get-StatusValue -Path "$AndroidHome\ndk") -Value (Get-ChildNames -Path "$AndroidHome\ndk") -Expected "UE 5.8 SDK Management recommended version" -Note "Required for Android C++ compile")
)

Write-Host "ZhushenActionDemo v0.1 environment check" -ForegroundColor Yellow
Write-Host ""
$Rows | Format-Table -AutoSize

$Missing = $Rows | Where-Object { $_.Status -eq "MISSING" }
if ($Missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Missing items:" -ForegroundColor Yellow
  $Missing | ForEach-Object {
    Write-Host ("- {0}: expected {1}" -f $_.Name, $_.Expected)
  }
}
