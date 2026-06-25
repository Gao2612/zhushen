# 2026-06-25 变更记录

本次维护进入“第三期：移动端专项体验优化”和工程质量治理阶段，重点处理 Android 首屏加载体验、移动端大图查看器，以及构建前质量门禁。

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

- 横屏专属布局本期不做，仅保留现有横竖屏基础能力。
- 后续需要分别针对首页、官方动态、角色详情和图片预览设计横屏专属布局后再落地。

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
- 本次压缩 4 个最大视频资源，合计从约 209 MB 降到约 93 MB，节省约 111 MB。
- 新增 `releases/resource-reports/resource-report-2026-06-25.json` 和 `media-optimization-2026-06-25.json`，记录资源体积排行与压缩前后数据。
- 重新生成 Android debug 包、Windows 桌面端、推荐安装器和 PC 便携 zip，并同步桌面交付文件夹。

## 验证

- `npm run verify`：通过。
- `npm run build`：通过，重新生成 Android debug 包。
- `npm run lint:android`：通过；需显式设置仓库内 `JAVA_HOME` 与 `ANDROID_HOME`。
- `npm run installer-shell:win`：通过，重新生成推荐安装器与启动器/桌面端打包资源。
