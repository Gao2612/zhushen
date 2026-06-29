$ErrorActionPreference = "Stop"

$Links = @(
  [PSCustomObject]@{
    Name = "Epic Games Launcher / Unreal Engine 5.8"
    Url = "https://www.unrealengine.com/download"
  },
  [PSCustomObject]@{
    Name = "Unreal Engine 5.8 Android SDK 自动配置文档"
    Url = "https://dev.epicgames.com/documentation/unreal-engine/automated-android-sdk-ndk-and-jdk-setup-in-unreal-engine"
  },
  [PSCustomObject]@{
    Name = "Unreal Engine Android 支持文档"
    Url = "https://dev.epicgames.com/documentation/unreal-engine/android-support-for-unreal-engine"
  },
  [PSCustomObject]@{
    Name = "Android Studio"
    Url = "https://developer.android.com/studio"
  },
  [PSCustomObject]@{
    Name = "Temurin JDK 17"
    Url = "https://adoptium.net/temurin/releases/?version=17"
  },
  [PSCustomObject]@{
    Name = "Visual Studio 2022"
    Url = "https://visualstudio.microsoft.com/downloads/"
  }
)

Write-Host "v0.1 UE 5.8 环境下载入口" -ForegroundColor Yellow
Write-Host "建议安装路径：" -ForegroundColor Yellow
Write-Host "  UE_ROOT      = C:\Program Files\Epic Games\UE_5.8"
Write-Host "  ProjectRoot  = E:\zhushen\ue5\ZhushenActionDemo"
Write-Host "  ANDROID_HOME = C:\Android\Sdk"
Write-Host "  JAVA_HOME    = C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
Write-Host ""

foreach ($Link in $Links) {
  Write-Host ("打开：{0}" -f $Link.Name) -ForegroundColor Cyan
  Start-Process $Link.Url
}

Write-Host ""
Write-Host "下载和安装完成后执行：" -ForegroundColor Yellow
Write-Host "  .\Tools\check-v01-env.ps1"
