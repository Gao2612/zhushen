# 2026-06-26 变更记录

本次维护围绕 UE5 v0.1 Environment Verification 展开。目标不是做战斗、
技能或正式 UI，而是确认《诸神终应知晓》UE5 Demo 的环境、地图、
Windows 打包和 Android 打包链路能推进到可复现状态。

## UE5 v0.1 环境下载补全

- UE5 v0.1 目标版本固定为 UE 5.8。
- 新增 `ue5/ZhushenActionDemo/Docs/v0.1-download-checklist.md`，
  集中记录 Epic Games Launcher、UE 5.8、Visual Studio、JDK 17、
  Android SDK / NDK 和 Android command-line tools 的下载入口。
- 新增 `ue5/ZhushenActionDemo/Tools/open-v01-downloads.ps1`，
  可一次打开官方下载页和 UE Android 配置文档。
- 桌面交付目录已保存 Epic Games Launcher、VS Build Tools、
  Temurin JDK 17、Android command-line tools、NDK r27c 和 Gradle 8.7。
- `README.md` 与 `Tools/README.md` 统一改为 UE 5.8 口径。

## UE5 v0.1 工程准备

- 新增 `Content/Core`、`Content/Demo`、`Content/Test` 目录占位。
- 增强 `Tools/check-v01-env.ps1`，输出 UE_ROOT、UnrealEditor、
  RunUAT、Visual Studio、MSBuild、Windows SDK、JDK、adb、
  Android SDK、build-tools 与 NDK 状态。
- `BuildReports/v0.1-build-report.md` 增加 Windows / Android
  Development 与 Shipping 表格、失败记录模板和验收步骤。
- `BuildReports/v0.1-readiness-check.md` 拆分引擎安装前准备、
  引擎安装后进展和当前阻塞项。
- `BuildReports/v0.1-code-structure-review.md` 静态审查 C++ 模块、
  Target、GameMode、Pawn 和 HUD 是否符合 v0.1 极简目标。
- 资料馆 UE Demo 页面保持“环境准备中 / 验证中”口径，不误标为正式完成。

## 启动地图与 Windows 验证

- 已生成真实地图资产
  `ue5/ZhushenActionDemo/Content/Demo/Maps/L_v01_Startup.umap`。
- 地图包含 40m x 40m 灰盒地面、可见占位角色、方向标记、
  Directional Light、Sky Light、Camera Actor、PlayerStart 和
  `Zhushen UE5 Demo v0.1` 文字。
- `CreateV01StartupMap.py` 适配 UE 5.8 Editor Subsystem API，
  并保留脚本日志，便于定位生成失败。
- 另一台电脑已通过临时内容版工程完成 Windows Development /
  Shipping 打包验证，并记录包体和启动保持运行结果。
- 当前电脑已完成 UE 5.8、VS、JDK、Android SDK / NDK 安装，
  正式 C++ 链路已推进到编译、Cook、IoStore 通过。
- 当前电脑 Windows Shipping 最后卡在 UAT staging 复制 `dbghelp.dll`。
  手动复制同一路径成功，说明下一步应集中排查 UAT SafeCopy、占用或权限。

## Android 验证进展

- Android SDK / NDK 已被 UE 5.8 识别为 Android VALID r27c。
- 当前电脑 Android 原生 arm64 `.so` 编译通过。
- Gradle 8.7 已缓存到本机 wrapper 目录，并添加本机 Gradle mirror
  初始化脚本。
- 当前电脑后续卡在 Gradle 依赖解析的 TLS / Maven 镜像问题。
- 另一台电脑 Android Development 曾推进到 cook 阶段，但卡在移动端
  shader / Engine plugin material，未生成 APK。
- 当前 `adb devices -l` 没有在线设备，APK 安装、横屏、启动时间、
  帧率和发热均未完成。

## 工具与兼容修复

- `ZhushenActionDemo.Target.cs` 和 `ZhushenActionDemoEditor.Target.cs`
  升级到 `BuildSettingsVersion.V7`，适配 UE 5.8。
- `ZhushenV01Hud.cpp` 不再使用 UE 5.8 已移除的
  `GEngine->GetAverageFPS()`，改用 `FApp::GetDeltaTime()` 计算 FPS。
- Windows / Android 打包脚本默认指向
  `C:\Program Files\Epic Games\UE_5.8`，并注入 UE 5.8 自带 .NET 10。
- `scripts/check-encoding.js` 排除 UE 生成缓存目录，避免 `Saved/`、
  `Intermediate/`、`Binaries/` 等非源码文件误触发编码门禁。
- `.gitignore` 增加 UE 打包临时文件排除，防止 OpenOrder 日志和
  生成的 Android Java 临时目录混入提交。

## 当前未完成与后续接续点

- Windows：优先修复 `dbghelp.dll` staging copy，拿到可重复产出的
  Windows Shipping 包。
- Android：优先解决 Gradle 依赖解析和 shader cook 牵入问题，
  再生成 Development APK。
- 设备：连接 MuMu 或真机后补齐 APK 安装、横屏、启动时间、包体和帧率。
- 报告：继续更新 `BuildReports/v0.1-build-report.md` 中的实测数据。

## 边界说明

- 本次没有新增战斗、技能、Boss、正式 UI、正式角色美术或资料馆联动。
- 本次没有把 UE 引擎源码、Android SDK、Gradle 缓存或下载包提交进仓库。
- v0.1 仍是环境验证阶段，完成标准仍是 Windows 可启动、
  Android 可安装横屏、包体和启动数据可复现。
