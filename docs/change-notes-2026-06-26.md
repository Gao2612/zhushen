# 2026-06-26 变更记录

本次维护针对另一台电脑提交的 UE5 v0.1 工程骨架做口径收口。
目标是明确 v0.1 使用 UE 5.8 最新版，并为当前电脑缺少 UE5 / Android
工具链的情况补齐下载和安装入口。

## UE5 v0.1 环境下载补全

- UE5 v0.1 目标版本明确为 UE 5.8。
- 新增 `ue5/ZhushenActionDemo/Docs/v0.1-download-checklist.md`，集中记录 Epic Games Launcher、UE 5.8、Visual Studio、Android Studio、JDK 17 和 Android SDK 的下载入口。
- 新增 `ue5/ZhushenActionDemo/Tools/open-v01-downloads.ps1`，可一次打开官方下载页和 UE Android 配置文档。
- 已在桌面交付目录下载 Epic Games Launcher、Visual Studio Build Tools、Temurin JDK 17 和 Android command-line tools。
- 下载目录为 `C:\Users\EDY\Desktop\诸神终应知晓\UE5.8环境下载包`，并附带 `download-manifest.json` 与 `README-先看这里.md`。
- `README.md` 与 `Tools/README.md` 改为指向 UE 5.8，不再写 5.4 / 5.5 作为首选。
- `BuildReports/v0.1-build-report.md` 改为记录目标路径和当前电脑待安装状态，避免误判为当前电脑已经具备 UE5 / Android 打包环境。
- 资料馆 `UE5 Demo` 页面同步改为“当前电脑需按清单安装环境”，并增加下载清单和脚本入口。

## UE5 v0.1 引擎前置准备

- 新增 `Content/Core/Maps`、`Content/Core/Materials`、`Content/Core/Characters`、`Content/Core/UI`、`Content/Demo/Maps`、`Content/Test/Materials` 和 `Content/Test/Meshes` 目录占位。
- 增强 `Tools/check-v01-env.ps1`，输出 UE_ROOT、UnrealEditor、RunUAT、Visual Studio、MSBuild、Windows SDK、Android Studio、JDK、adb、Android SDK、build-tools 与 NDK 状态。
- `BuildReports/v0.1-build-report.md` 增加 Windows / Android Development 与 Shipping 待填表格、失败记录模板和验收步骤。
- 新增 `BuildReports/v0.1-readiness-check.md`，拆分引擎安装前已完成、引擎安装前还可做、引擎安装后才能做和当前阻塞项。
- 新增 `BuildReports/v0.1-code-structure-review.md`，静态审查 C++ 模块依赖、Target、GameMode、Pawn 和 HUD 是否符合 v0.1 极简目标。
- 资料馆 `UE5 Demo` 页面进一步改为“环境准备中”，明确当前不是打包验证完成态。

## 边界说明

- 本次没有执行 Windows / Android 打包。
- 本次没有新增战斗、技能、Boss、正式 UI、正式角色美术或资料馆联动。
- 本次没有制作半自动安装脚本；安装脚本等 UE 5.8 安装完成后再做。
- v0.1 仍处于环境验证阶段，下一步需要在安装 UE 5.8 与 Android 工具链后运行 `check-v01-env.ps1` 和打包脚本。
