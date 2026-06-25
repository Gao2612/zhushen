# 2026-06-25 变更记录

本次维护进入“第三期：移动端专项体验优化”和工程质量治理阶段，重点处理 Android 首屏加载体验、移动端大图查看器，以及构建前质量门禁。

## 点划式 Demo 方案归档

- 新增 `docs/demo-plans/方案一.docx`，整理档案馆内嵌式点划演示方案。
- 新增 `docs/demo-plans/方案二.docx`，整理 Unity 点划式伪可玩动作 Demo 方案。
- 新增 `docs/demo-plans/方案三.docx`，整理产品化动作原型方案。
- 三份方案均以官方“3D 点划激爽 ACT”、双击闪避、划屏处决和技能拖曳释放等公开资料为依据，不采用虚拟摇杆方案。

## 移动端启动体验

- 保留系统 Splash 页作为静态启动图，不尝试在系统 Splash 阶段播放视频。
- Android App 内新增自定义加载层，显示标题、提示文字和进度视觉。
- WebView 首次加载完成后不再立刻露出首页，而是等待前端增强层完成初始化并调用 `Android.setFrontendReady()`。
- 增加 4.5 秒超时兜底，避免异常情况下永远停留在加载页。

## 大图查看器

- 图片预览保留关闭按钮，点击即可退出预览。
- 新增移动端手势：双指缩放、单指拖动查看细节、双击恢复原始比例。
- 新增保存按钮，Android 端通过原生桥接保存到本地相册。
- 新增长按图片保存，便于手机端快速保存官方图和二创图。

## 工程质量治理

- 新增 `scripts/check-encoding.js`，扫描源码文本的 UTF-8 解码、BOM、异常控制字符和疑似乱码片段。
- `npm run verify` 已接入编码检查，构建前先做编码质量门禁。
- 新增 `scripts/generate-build-info.js`，构建时生成版本号、构建时间、Git 分支、提交号和目标平台。
- 新增 `scripts/generate-changelog.js`，根据 `docs/change-notes-*.md` 自动生成 `CHANGELOG.md`。
- 新增 `content/` 源数据目录，页面生成脚本优先读取源数据文件，生成后的 HTML/CSS/JS 继续保留在 `manual-build/assets`。
- `scripts/verify-project.js` 新增源数据文件检查，防止后续生成链路退回硬编码散落状态。

## 版本链路

- 客户端设置页版本号改为读取 `package.json`。
- Android `versionName` 改为读取 `package.json`，避免前端版本和 APK 版本分裂。
- 构建信息写入 `manual-build/assets/build-info.json`、`scripts/generated/build-info.json` 和 `releases/build-info/`。

## 延后事项

- 真实账号登录和云端同步本期不做，先保留为独立设计报告。
- 远程内容同步仅做桌面端内容包试点，Android 端暂不静默覆盖内置资料。

## 收尾优化闭环

- 启动器打开后会自动检查远端版本；手动检查更新复用同一套逻辑，并增加检查中、已最新、发现更新和检查失败状态。
- 启动器底部补齐官网、TapTap、QQ群、反馈和设置五个入口；右侧竖排入口继续保留为快捷社交/更新入口。
- 启动器状态区区分启动器版本和目标客户端版本；安装器状态区区分安装器版本和将安装的客户端版本。
- 清理桌面端普通用户可触达的窗口缩放快捷键与 IPC，保留 F11、Esc、Ctrl+F 和 Alt+左/右等有效快捷键。
- 桌面背景音乐新增真实 audio 音量淡入淡出，开启、关闭和恢复时不再直接突兀切断。

## 内容源与资源系统

- 官方动态正文迁移到 `content/official-posts/*.md`；`content/official-posts.json` 只保留元数据、要点、媒体和 Markdown 路径。
- `scripts/generate-ui.js` 移除旧 fallback 数据读取，缺少必需 JSON 或 Markdown 时会直接构建失败。
- 新增 `scripts/generate-resource-manifest.py`，生成 `content/resource-manifest.json`、图片缩略图和资源体积报告。
- 页面卡片和官方动态图片列表改为加载 WebP 缩略图，点击预览时仍打开原图。
- 官方动态和二创列表保留分批加载，并改为滚动接近底部后自动加载下一批，减少首屏压力。

## 体积治理与交付

- 新增 `scripts/optimize-media.js`，使用项目内 `ffmpeg-static` 压缩大体积 MP4，原文件备份到 `releases/original-media-backup/2026-06-25/`。
- 本次评估 4 个视频资源，实际替换 1 个视频；合计从约 93.13 MB 降到约 87.85 MB，节省约 5.28 MB。
- 新增 `releases/resource-reports/resource-report-2026-06-25.json` 和 `media-optimization-2026-06-25.json`，记录资源体积排行与压缩前后数据。
- 重新生成 Android debug 包、Windows 桌面端、推荐安装器和 PC 便携 zip，并同步桌面交付文件夹。

## 验证

- `npm run verify`：通过。
- `npm run build`：通过，重新生成 Android debug 包。
- `npm run lint:android`：通过；需显式设置仓库内 `JAVA_HOME` 与 `ANDROID_HOME`。
- `npm run installer-shell:win`：产物已生成并核对；本轮命令输出在 15 分钟处超时，但安装器、启动器和桌面端文件已刷新。

## 收尾执行：体验、报告与资料维护

- 新增横屏专属 CSS：首页、官方动态、角色页和图片预览在手机横屏与小高度窗口下改为更紧凑的双栏或多栏浏览。
- 收藏夹升级为 `schemaVersion: 2`，支持备注、标签和置顶；旧收藏会自动补齐新字段。
- 桌面设置页新增本地资料编辑草稿入口，可读取角色、概念、二创、笑话和官方动态的 JSON 条目。
- 资料草稿应用仅允许维护仓库环境执行，应用前写草稿，应用时生成页面并跑项目校验，失败会恢复备份。
- 新增 `scripts/inspect-content-health.js`，输出内容健康检查 JSON/HTML 报告，缺失资源会阻断 `npm run verify`。
- 新增 `scripts/inspect-assets-size.js`，输出资源体积、扩展名分布、目录分布、疑似未引用资源和重复哈希报告。
- 新增 `scripts/generate-release-report.js`，生成发布前检查面板，集中展示版本、构建、资源、报告和发布资产状态。
- 新增 `scripts/generate-remote-content-package.js`，生成远程内容包和 manifest；内容包仅包含 JSON 与 Markdown，不包含可执行脚本。
- 远程内容同步报告补充桌面端下载、校验、缓存、应用和回滚链路；Android 端保持提示更新策略。
- 账号登录和云端同步新增简要计划报告，明确本轮未实现账号体系，只保留后续数据边界、登录态、冲突合并和隐私设计。

## 本轮新增报告

- `releases/reports/content-health.html`
- `releases/reports/assets-size.html`
- `releases/reports/release-check.html`
- `releases/reports/remote-content-sync-report.md`
- `releases/reports/account-cloud-sync-plan.md`
- `releases/update-content/remote-content-manifest.json`
- `releases/update-content/content-bundle.json`

## UE5 v0.1 环境验证 Demo

- 新增 `ue5/ZhushenActionDemo` 工程骨架，定位为 `v0.1 Environment Verification`，只验证 UE5 项目能否在 Windows 与 Android 跑通基础打包链路。
- 新增 C++ 占位 GameMode、Pawn 与 HUD：默认角色为极简占位体，HUD 显示 `Zhushen UE5 Demo v0.1`、环境验证说明与 FPS。
- 新增 Windows / Android 基础配置：Windows 目标 Win64 Shipping，Android 包名 `com.zhushen.demo`，横屏运行，优先 ASTC。
- 新增 `Tools/check-v01-env.ps1`、`build-v01-windows.ps1`、`build-v01-android.ps1` 与 `CreateV01StartupMap.py`，用于后续在 UE Editor / RunUAT 可用后生成启动地图并执行打包。
- 新增 `BuildReports/v0.1-build-report.md`，记录当前 JDK、Android Studio、adb、UE5、UnrealEditor、RunUAT、Windows 包、Android 包的验证状态。
- 客户端底部 Tab 新增独立 `UE5 Demo` 入口，使用单独卡片展示 v0.1 环境验证目标、范围、Windows/Android 验收项和构建报告链接。
- `.gitignore` 新增 UE5 中间目录、缓存目录和打包产物排除规则，避免提交 `Binaries`、`Intermediate`、`Saved`、`DerivedDataCache`、`Builds` 等大体积或机器相关内容。

## UE5 工具链安装状态

- 已安装并验证 Temurin JDK 17：`G:\Program Files\Eclipse Adoptium\jdk-17\bin\java.exe`。
- 已安装 Android command-line tools 到 `G:\Android\cmdline-tools\latest`，并安装 Android SDK 到 `G:\Android\Sdk`。
- 已验证 `adb`：`G:\Android\Sdk\platform-tools\adb.exe`，版本 `37.0.0-14910828`。
- 已安装 Android 35、build-tools 35.0.0 与 NDK 25.2.9519653 到 G 盘。
- 已通过 winget 安装 Epic Games Launcher；官方安装器实际落到 `C:\Program Files\Epic Games\Launcher`。UE5 本体仍需在 Epic Launcher 登录后安装 UE 5.4 或 UE 5.5，完成后再执行 `RunUAT` 打包验证。
