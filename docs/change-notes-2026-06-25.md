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
