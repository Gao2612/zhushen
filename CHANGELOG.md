# CHANGELOG

本文件由 `npm run prebuild:meta` 根据 `docs/change-notes-*.md` 自动生成。

## 2026-06-25

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
- `npm run installer-shell:win`：通过，重新生成推荐安装器与启动器/桌面端打包资源。

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

## 2026-06-24

本次维护进入“第一期：导航体验优先”，重点收口顶部导航、Android 原生底部 Tab 和桌面端底部 Dock 的 active 状态，并优化 Android 返回键的 App 化行为。

当天后续进入“第二期：搜索与个人资料管理优化”，在不重构底层数据结构的前提下补齐全站搜索分类、收藏默认分组、最近浏览首页入口和官方动态时间轴视觉。

## 导航状态统一

- 前端增强层新增统一导航源 `NAV_ITEMS`，首页、官方发布、角色、概念、二创、笑话和设置共用同一份页面定义。
- `updateNavigationState()` 以当前页面名作为唯一状态源，同时同步顶部导航和桌面 Dock 的 active 高亮。
- 页面切换后会写入 `html[data-current-page]`，并派发 `zhushen:navigation-state` 事件，方便后续新增入口继续复用同一状态。
- Android WebView 内页面完成局部切页后，会调用 `Android.setActivePage(page)`，由原生层同步底部 Tab 高亮。
- Android 原生底部 Tab 的页面名、图标和标题改为共享常量，避免后续维护时多个数组散落在方法内部。

## Android 返回键优先级

- Web 层新增 `window.ZhushenCloseTopLayer()`，统一处理免责声明、QQ 群弹窗、导航菜单、档案抽屉、图片预览和桌面内置浏览层。
- Android 返回键先调用 Web 层关闭顶层浮层；如果浮层已关闭，再处理内置浏览层、视频层、WebView 历史和二次确认退出。
- 内置浏览层关闭时会隐藏浏览栏，并优先回退到进入外链前的页面；没有历史时回到首页，避免只隐藏工具栏但仍停留在外链内容。
- 旧版 `manual-build` Android 壳也补齐同样的 Web 顶层浮层关闭逻辑，减少双入口行为不一致。

## 桌面 Dock 轻量化

- 桌面底部 Dock 从纯文字胶囊按钮改为“图标圆点 + 小字”样式。
- 默认状态弱化文字，hover 或 active 时显示完整页面名提示。
- active 状态不再使用大面积黄色填充，改为金色描边和半透明底色，更接近游戏资料站的轻量导航。

## 搜索与个人资料管理

- 首页全站搜索新增分类筛选：全部、官方、角色、概念、二创、笑话。
- 搜索筛选复用现有搜索索引里的 `section` 字段，不重构搜索底层。
- 首页“我的档案”板块新增收藏默认分组：全部收藏、官方发布、角色、概念、二创、笑话、图片。
- 收藏分组本期只做默认归类，不开放用户自定义分组，避免提前引入分组编辑和导入导出迁移成本。
- 最近浏览入口移动到首页“我的档案”板块；设置页继续只保留最近浏览总开关。
- 最近浏览关闭后首页会显示关闭提示，开启后展示最近 6 条本地访问记录。

## 官方动态时间轴

- 官方发布页保留现有卡片正文、图片、GIF、视频和收藏按钮。
- 视觉改为左侧时间轴线加右侧动态卡片布局，强化资料馆式归档观感。
- 官方动态按发布时间倒序展示；同日内容保留归档顺序。
- 修正“`To 罗老师最可爱的玩家`”日期为 `2024/08/02`。
- `scripts/verify-project.js` 新增回归检查，防止搜索分类、收藏分组、最近浏览入口和官方时间轴样式在后续生成时丢失。

## 验证和交付

- `npm run verify`：通过。
- `npm run test:client-navigation`：通过；Electron 的 Windows 网络状态查询有非阻断日志，不影响测试结果。
- `npm run build`：通过，重新生成 Android debug 包。
- `npm run lint:android`：通过。
- `node scripts/build-installer-shell.js`：通过，重新生成推荐安装器。
- 已刷新桌面文件夹 `C:\Users\EDY\Desktop\诸神终应知晓` 中的推荐安装器和 Android debug 包。

## 2026-06-23

本次维护继续收口 Android 局部切页、设置页、音乐状态、角色归档和轻量启动器右侧社交栏，并重新覆盖 `v1.1.1` 发布资产。

## Android 局部切页补齐

- Android 原生底部 Tab 不再直接整页 `webView.loadUrl(...)` 切换资料页。
- 前端增强层暴露 `window.ZhushenNavigate`，Android 原生层优先调用同一套局部切页逻辑。
- 当页面尚未初始化、正在外部内置浏览层或局部切页 API 不可用时，Android 仍回退到整页加载，保证首次启动和异常兜底可用。
- 局部切页时由原生层同步底部 Tab 高亮，不依赖整页加载完成回调。
- `scripts/verify-project.js` 新增回归检查，防止后续把 Android 底部 Tab 改回整页刷新。
- 重新构建 Android debug 包、桌面客户端、启动器压缩包和推荐安装器，并覆盖 GitHub Release `v1.1.1` 相关资产。

## 设置、音乐与角色归档收口

- 设置页的背景音乐控制改为等宽分段开关，补充曲名与歌词面板；桌面端音乐状态保存开关、音量和播放位置，重启后继续沿用上次设置。
- 删除设置页中没有实际使用价值的窗口缩放按钮；桌面端缩放快捷键仍保留在客户端内部。
- 将“低动态模式”和“记录最近浏览”迁移到设置页；个人档案抽屉只保留昵称、数字 ID、头像、备注、导入和导出。
- 最近浏览开关关闭后不再写入新的本地浏览记录；低动态模式会减少动态背景和恢复动画。
- 夕岚的“玩家二创一”“玩家二创二”“我的世界”从官方角色页移到二创页的视频区，避免二创内容混入官方角色资料。
- 角色图集卡片改为“官方图像 / 动图”等资料类型标签，避免每张图重复显示“少女骑士 · 送葬人”“第十三席恶魔”等身份称号。
- Android 前后台切换新增 `zhushen:pause` / `zhushen:resume` 事件，前端暂停动态背景并在恢复时轻淡入，减少切回应用时的硬顿感。

## 启动器右侧社交栏简化

- 轻量启动器右侧 rail 只保留 TapTap、QQ 群和 GitHub 三个透明单色 SVG 图标。
- 删除 rail 上的“设置”和“日志”按钮，避免右侧入口重复承载内部工具。
- TapTap 与 QQ 群入口不再显示文字标签，改为仅保留图标和悬浮提示。
- QQ 群信息卡移动到企鹅图标左侧；悬浮可查看，点击可固定或取消固定，点击空白区域可关闭。
- TapTap 与 GitHub 外链继续沿用现有白名单，无需调整 `launcher-shell/main.js`。
- 重新打包并同步桌面推荐安装器和 PC 便携版，覆盖 GitHub Release `v1.1.1` 中的安装器、启动器压缩包和更新清单。
- 对应源码提交：`9fc5cc3 Simplify launcher social rail`。
- 覆盖资产校验：
  - `zhushen-installer-1.1.1-win-x64.exe`：`sha256:9282a784b5c6ddb3047eaae4a4b69b49fec66ef3a54536ac9a74687fe355b64a`
  - `zhushen-launcher-1.1.1-win-x64.zip`：`sha256:f4589c05456a6c6fa64c4f356f6fa2fef15602b5fb9701c698ddc5c7401a24ad`
  - `zhushen-update-manifest.json`：`sha256:51d231a7ccecd134e46d922b4977cd0f8f4e8e3f8a9d3ec5fd3672336db2442d`

## 2026-06-22

本次更新基于 GitHub `main` 分支最近三天的迭代继续收口，重点是让“个人档案”功能边界更清晰：档案只保留在资料馆客户端内，安装器和轻量启动器不再携带不可见的档案抽屉、IPC 和本地档案读写逻辑。

## 三天更新梳理

- 2026-06-19：安装器改为游戏启动器风格，并拆分出日常使用的轻量启动器；新增更新、修复、重装、日志、快捷入口和远端 manifest 检查链路；修复 Windows 图标资源和桌面音乐播放。
- 2026-06-20：继续优化启动器布局、轮播封面、书法字标、安装路径识别、ASAR 复制、安装目录运行数据和诊断日志；新增本地用户档案结构、导入导出预留和账号同步方案文档。
- 2026-06-21：版本提升到 `v1.1.1`；档案入口迁移到客户端头像抽屉；客户端导航改为持久外壳内局部切页；问答和论坛进入内置浏览层；桌面背景音乐、无边框窗口、图标解包、延迟加载和分批渲染继续完善。

## 本次后续更新

- 移除 `installer-shell` 中未使用的个人档案浮层样式、页面脚本、preload 暴露接口和主进程 IPC。
- 移除 `launcher-shell` 中未使用的个人档案浮层样式、页面脚本、preload 暴露接口和主进程 IPC。
- 保留客户端内的个人档案抽屉和 `scripts/test-client-navigation.js` 测试覆盖，确保用户档案仍在资料馆客户端中可用。
- 降低安装器和轻量启动器的无效代码体积，避免后续误把档案入口重新接回安装链路。

## 2026-06-22 追加修复

- 修复启动器点击更新时进度条不显示的问题：已安装状态下更新进度会临时展开，不再被样式隐藏。
- 修复 Windows 占用 `app.asar` 时更新崩溃的问题：下载完成后先备份旧文件，再替换新文件；替换失败会恢复旧文件并显示中文提示，不再触发 Electron 主进程未捕获异常。
- 修复更新失败后状态被刷新覆盖的问题：失败时保留可读错误提示，方便关闭客户端后重试。
- 将启动器左下角 `TapTap`、更新页和 `QQ群` 文字入口迁移到右侧竖排按钮区。
- 右侧竖排按钮调整为设置、TapTap、GitHub、QQ 和日志入口，QQ 群信息卡同步移动到右侧按钮旁。
- 重新打包并同步桌面文件夹中的推荐安装器和 PC 便携版；GitHub Release `v1.1.1` 中的推荐安装器和启动器压缩包已覆盖为本次产物。

## v1.1.1 发布补齐

- 补发 GitHub Release `v1.1.1`，将 2026-06-21 的客户端、启动器和 Android 变更对应到实际可下载产物。
- Release 地址：
  - `https://github.com/Gao2612/zhushen/releases/tag/v1.1.1`
- 上传发布资产：
  - `zhushen-installer-1.1.1-win-x64.exe`：Windows 推荐安装器。
  - `zhushen-launcher-1.1.1-win-x64.zip`：轻量启动器压缩包。
  - `android-debug.apk`：Android debug 测试安装包。
  - `zhushen-update-manifest.json`：启动器远端更新清单。
  - `zhushen-app.asar`：客户端更新 payload。
  - `zhushen-archive.exe`：Windows 客户端可执行文件更新 payload。

## 验证

已通过：

```powershell
npm run verify
npm run test:client-navigation
npm run test:asar-copy
node --check installer-shell/main.js
node --check launcher-shell/main.js
node --check installer-shell/preload.js
node --check launcher-shell/preload.js
npm run build
```

说明：第一次 `npm run test:asar-copy` 使用 120 秒超时运行时被终止；随后使用更长超时重跑通过，结果为 `ASAR raw copy verified.`。

发布补齐时补充验证：

```powershell
npm run verify
gh release view v1.1.1 --repo Gao2612/zhushen --json name,tagName,url,assets
```

说明：Windows 安装器第一次构建因 GitHub/Electron Builder TLS 连接中断失败；重试后成功生成 `releases/installer-shell/zhushen-installer-1.1.1-win-x64.exe`。

追加修复时补充验证：

```powershell
node --check launcher-shell/main.js
node --check installer-shell/main.js
node --check launcher-shell/preload.js
npm run verify
npm run test:client-navigation
npm run installer-shell:win
gh release view v1.1.1 --json assets
```

说明：`gh release upload` 首次传输大文件时出现 EOF/超时；随后分开上传启动器压缩包和推荐安装器，并核对 Release 资产摘要：

- `zhushen-installer-1.1.1-win-x64.exe`：`sha256:a907dd66319f45c400fd1ac967bbd34a9c768f6419a8112368ea9d9f172362fc`
- `zhushen-launcher-1.1.1-win-x64.zip`：`sha256:a65f715577ffaf2fc0d4963a19cffddd015b1b917c722315da5e9a1ee59c5ed2`

## 2026-06-21

本次更新继续完善 Windows 客户端、轻量启动器、Android 客户端和安装链路，版本提升为 `v1.1.1`。

## 客户端

- 新增仅在项目客户端内展示的本地用户档案：9 位数字 ID、昵称、备注、自定义头像、偏好和 JSON 导入/导出。
- 顶部和底部导航移除“档案”入口，左上角头像改为个人档案入口；点击后从右侧滑出档案抽屉，不再打开独立页面。
- 标题栏仅显示“诸神终应知晓”，移除“玩家自制史记”副标题。
- 上下导航改为客户端内局部切页，只替换正文并使用约 180ms 淡入过渡；标题栏、导航、档案抽屉和独立音乐宿主保持常驻。
- 首页桌面端支持静音循环 PV 动态背景，资料页面使用各自静态主题图；设置页可切换动态/静态首页背景，Android 默认静态背景。
- Windows 客户端改为无边框自绘标题栏，移除原生白色标题栏与顶部多余空白。
- 玩家问答与游戏论坛改为在客户端当前窗口的内置浏览层中展示，不再打开独立窗口。
- 桌面背景音乐固定由独立隐藏窗口播放，移除页面播放器接管逻辑，并关闭后台计时节流。
- 修复隐藏音乐页跨协议读取本地音频失败的问题；音乐页改为同源本地文件。
- 客户端任务栏图标作为原生资源单独解包，避免从 ASAR 路径读取失败。
- 图片使用可视区延迟加载，视频进入可视区域后才初始化；官方动态和二创作者区分批展示。
- 移除明显的网格背景纹理，降低空页面的生成式视觉感。

## 启动器

- 移除启动器与安装器中的用户档案入口，档案功能只保留在客户端。
- 新增“启动后自动关闭”开关，默认开启并持久化保存。
- 启动器已安装态不显示安装路径、空间、进度或重复的“游戏已就绪”卡片，只保留标题、启动按钮和齿轮；面板位置保持原布局。
- 轻量启动器标题从 `Archive Installer` 改为 `Archive Launcher`，避免安装完成后仍呈现安装器语义。
- 安装目录继续由安装版启动器根据自身位置自动识别，并写入安装目录下的启动器配置，不要求每次重新选择。

## 构建与发布

- Windows 客户端、轻量启动器、自定义便携安装器与 Android debug APK 均已重新构建。
- 源码、维护记录和验证记录提交到仓库，为 `v1.1.1` 发布做准备。
- 对应的 GitHub Release `v1.1.1` 已在 2026-06-22 补发，详见 [2026-06-22 变更记录](change-notes-2026-06-22.md)。

- 详细验证结果见 [2026-06-21 构建验证](verification-2026-06-21.md)。

## 2026-06-20

本文记录 2026-06-20 对《诸神终应知晓》启动器、安装器与维护索引的更新。

## 启动器布局

- 左侧品牌区不再展示安装器说明文字。
- 将“公告 / 版本 / 维护”tab 和公告卡片从右侧安装面板移动到左侧品牌区。
- 将“公告 / 版本 / 维护”整合为一组信息卡，减少 tab 带来的割裂感。
- 在信息卡上方增加首页视觉轮换封面，让启动器更接近游戏启动器的视觉结构。
- 轮换封面使用：
  - `群友笑话合集.jpg`
  - `玩家二创.jpg`
  - `诸神终应知晓概念图.jpg`
  - `诸神终应知晓角色设定.jpg`
- 封面支持自动轮播，并提供半透明圆点用于手动切换。
- 安装器与启动器打包时包含 `manual-build/assets/zy/*.jpg`，避免封面在打包后显示为破图。
- 自定义安装器组装脚本同步复制 `manual-build/assets/zy`，修复便携安装器内轮播封面缺失。
- 右侧安装面板整体进一步下移，减少右侧信息密度。
- 版本信息展示简化为 `v1.1.0`。
- 右侧安装面板现在聚焦安装路径、磁盘空间、进度、主按钮和齿轮管理。
- 启动器壳内不再展示“离线”字样。

## 文案与社群入口

- 将公告卡片文案从“启动器更新系统已就绪”调整为更贴近资料馆内容的描述。
- QQ 群卡片群号修正为：
  - 官方一群：`913044248`
  - 官方二群：`130340208`

## 维护记录索引

- README 维护记录新增 `2026-06-20 变更记录` 入口。
- 说明：本次仅修正文档索引，不发布新的 GitHub Release，避免无安装包/manifest 的文档 release 影响启动器通过 latest release 检查更新。

## 本地用户档案

- 启动器和安装器新增“档案”入口。
- 新增本地用户档案 JSON：
  - 昵称
  - 头像标识
  - 备注
  - 偏好设置
  - 收藏与浏览记录预留字段
  - 云备份状态预留字段
- 支持保存、导入档案、导出档案。
- 云备份入口先显示为“未启用”，不接入真实联网服务。
- 新增 `docs/account-sync-plan.md`，记录未来登录、账号、联网同步的实现方案和风险。

## 安装器细节修复

- 修复安装到盘符根目录下一级目录时可能尝试创建盘符根目录导致 `EPERM` 的问题。
- 空间显示改为接近 1000 MB 时切换为 GB，例如 `1008.7 MB` 显示为约 `1.0 GB`。
- 左侧轮播图放大，公告 / 版本 / 维护信息卡压缩。
- 右侧安装面板改为靠近底部显示。
- 使用桌面原始书法图提取“诸神终应知晓”字标，不再通过字体或图像模型重新生成文字。
- 新增白色透明字标 `manual-build/assets/logo/title-wordmark.png`，用于深色启动器背景。
- 新增黑色透明字标 `manual-build/assets/logo/title-wordmark-ink.png`，用于浅色页面和文档。
- 保留原始字标图 `manual-build/assets/logo/title-wordmark-source.png`，方便后续重新调整透明阈值。
- 新增可重复执行的提取脚本 `scripts/extract-wordmark.ps1`，并让安装器构建脚本同步打包透明字标。
- 将左侧书法字标宽度限制为 `600px`、高度限制为 `132px`，避免遮挡底部入口。
- 将右侧安装面板上移，确保主按钮和齿轮在窗口内完整展示。
- 根据实机截图继续将字标收缩为 `520px × 108px`，并预留 `38px` 底部安全区，避免遮挡 QQ 群入口。
- 修复 Electron 便携安装器复制嵌入 `app.asar` 时被虚拟归档系统拦截的问题：对 `.asar` 的复制、读取与校验改用 `original-fs`。
- 新增 `npm run test:asar-copy` 回归测试，使用 Electron 实际复制 `app.asar` 并校验源文件与目标文件 SHA256 一致。
- 修复启动器首次打开后仍显示“立即安装”：安装版启动器现在优先根据自身 `launcher` 目录定位父级安装目录，并自动纠正旧配置。
- 修复选择现有 `zhushen-archive` 文件夹时重复拼接成 `zhushen-archive\zhushen-archive` 的问题。

## 运行数据与启动诊断

- 安装器配置、会话、日志和崩溃信息改为保存在便携安装器所在磁盘的 `zhushen-installer-data`。
- 安装版启动器运行数据改为保存到 `<安装目录>\data\launcher`。
- 桌面客户端运行数据改为保存到 `<安装目录>\data\client`。
- 安装日志统一保存到 `<安装目录>\data\installer\logs`，避免继续写入 C 盘 `%APPDATA%`。
- 修复启动器状态接口遗漏 `gameDir` 导致已安装状态读取失败的问题。
- 客户端启动失败时区分：文件不存在、路径损坏、权限不足、安全软件拦截或文件损坏。
- 齿轮菜单新增“日志”，可一键打开日志目录。
- 启动器自动汇总最近安装、启动器和客户端日志到 `<安装目录>\data\diagnostics\latest-diagnostics.log`。
- 修复此前失败安装留下的客户端半成品：完整同步 Electron 运行库，包括缺失的 `icudtl.dat`。
- 安装器和启动器创建的桌面/开始菜单快捷方式统一指向轻量启动器，日常使用不再绕过更新、修复和诊断流程。

## 验证

## 客户端档案、窗口与性能

- 将“本地用户档案”从安装器和启动器移入项目客户端，启动器底部不再显示“档案”入口。
- 新增客户端“个人档案”页面：支持 9 位数字 ID、昵称、个人备注、自定义头像、偏好设置和本地 JSON 导入/导出。
- 云备份入口保留为“敬请期待”，未来联网账号系统可沿用当前档案结构。
- Windows 客户端改为无边框自绘标题栏，移除原生白色标题栏和顶部多余空白。
- “玩家问答”和“游戏论坛”改为在客户端当前窗口的内置浏览层中显示，不再弹出独立窗口。
- 桌面背景音乐继续由独立隐藏窗口播放，移除页面级兜底播放器，避免切页时两套音频互相接管。
- 音乐进程关闭后台节流，并在主窗口创建前完成初始化，降低页面跳转时的音频卡顿。
- 隐藏音乐窗口改为同源本地页面加载，修复 `data:` 页面无法读取解包音频文件的问题。
- 客户端图标作为原生资源单独解包，避免 ASAR 内路径导致任务栏图标读取失败。
- 图片改为进入可视区域附近后再解码加载；视频改为进入可视区域后才挂载资源并初始化。
- 官方动态与二创作者区加入分批展示，降低首屏布局和绘制压力。
- 移除页面背景的明显网格纹理，改为更克制的深色层次背景。
- 启动器齿轮新增“启动后自动关闭”开关，默认开启。
- APK 资源包拆分与大图离线压缩仍作为后续构建优化项保留，避免本轮改变资源寻址后造成兼容回归。

已通过：

```powershell
npm run verify
npm run installer-shell:win
npm run build
```

- Windows 便携安装器构建成功。
- Android debug APK 构建成功。
- 最新构建已覆盖到桌面。

## 2026-06-19

本文记录 2026-06-19 对《诸神终应知晓》仓库的一组桌面端、安装器、Android 与资料内容更新，便于之后换电脑重新拉取仓库时快速理解改动范围。

## 提交

- `a5f47b9 Improve installer and archive metadata`

## 内容与资料更新

- 将玩家二创作者名 `范斯` 统一更正为 `范斯梅耶`。
- 同步重命名二创资源目录与文件：
  - `manual-build/assets/玩家-二创图/范斯/`
  - 改为 `manual-build/assets/玩家-二创图/范斯梅耶/`
- 重新生成 `wjec.html` 与 `app-ui.js`，保证二创页、收藏、搜索索引、图片路径都使用新名称。
- 将官方动态卡片「官方玩家群现已建立」日期从 `2024/03/06` 更正为 `2024/01/25`。
- 官方动态卡片页改为按日期升序渲染，避免 1 月动态排在 3 月之后。

## 音乐与页面跳转

- 桌面端背景音乐由隐藏 Electron 窗口继续承载。
- 修复顶部导航和底部 dock 页面跳转后音乐短暂停顿的问题：
  - `desktop/main.js` 中的隐藏音乐页面会记录上一次音乐状态。
  - 当启用状态和音量未变化且音乐已经播放时，不再重复调用 `audio.play()`。

## 安装器改造

- 移除旧的 NSIS 定制脚本 `desktop/installer.nsh`。
- Windows 桌面端默认构建目标改为 `dir` 解包目录，不再生成/依赖 NSIS 安装包。
- 安装器外壳改为游戏安装器/启动器式界面：
  - PV 背景。
  - 安装状态。
  - 安装位置显示与选择。
  - 安装进度条。
  - 安装、启动、打开目录、卸载操作。
- 安装器安装逻辑改为自管理：
  - 从 `releases/desktop/win-unpacked` 构建内置 `desktop-payload`。
  - 安装时复制 payload 到用户选择的安装目录。
  - 创建桌面与开始菜单快捷方式。
  - 启动客户端不经过 NSIS。
- 安装器卸载逻辑改为自管理：
  - 删除快捷方式。
  - 删除本地安装目录。
  - 不调用 NSIS 卸载器。
- 桌面端设置页的卸载入口也改为自清理 PowerShell 脚本，不再查找旧卸载器。

## Android / APK

- `android/gradle.properties` 增加：
  - `android.overridePathCheck=true`
- 原因：仓库目录名包含中文，Android Gradle Plugin 在 Windows 下默认阻止非 ASCII 路径构建。
- Android 工程的 assets 来源仍为：
  - `manual-build/assets`
- 因此资料名称、日期、页面和搜索索引更新会同步进入 APK。

## 构建产物

本地已成功生成：

- APK：
  - `app-debug.apk`
  - `android/app/build/outputs/apk/debug/app-debug.apk`
- Windows 安装器：
  - `releases/installer-shell/zhushen-installer-1.1.0-win-x64.exe`

这些产物被 `.gitignore` 忽略，不提交进仓库。

## 本地构建环境

为在当前电脑构建 APK，已在仓库根目录本地放置：

- `jdk/jdk-17.0.14+7`
- `android-sdk/`

这些目录也被 `.gitignore` 忽略，不提交进仓库。换电脑后如需重新构建 APK，需要重新准备 JDK 17 和 Android SDK。

## 验证命令

已通过：

```powershell
npm run verify
node --check desktop\main.js
node --check installer-shell\main.js
node --check installer-shell\preload.js
node --check scripts\build-installer-shell.js
node --check scripts\generate-ui.js
npm run installer-shell:win
npm run build
```

## GitHub 访问修复

当前电脑曾因 hosts 文件中存在 GitHub 相关 `127.0.0.1` 映射导致 `https://github.com/` 无法打开、Git 操作异常。

已移除 hosts 中 GitHub 相关映射，并备份原文件到：

```text
C:\Windows\System32\drivers\etc\hosts.zhushen-backup-20260619112803
```

修复后已确认：

- `https://github.com/` 可访问。
- `git push origin main` 成功。
## 2026-06-19 Launcher update and repair system

- Added file-manifest based installer maintenance:
  - `releases/update/zhushen-update-manifest.json`
  - `releases/update/zhushen-app.asar`
  - `releases/update/zhushen-archive.exe`
- The installer now prepares an embedded manifest in `desktop-payload/resources/zhushen-update-manifest.json`.
- The launcher can check the latest GitHub Release manifest:
  - `https://github.com/Gao2612/zhushen/releases/latest/download/zhushen-update-manifest.json`
- Update behavior:
  - compares local `buildId` with the remote manifest;
  - downloads only files that are missing, size-mismatched, or hash-mismatched and have a remote URL;
  - currently exposes remote URLs for `resources/app.asar` and `zhushen-archive.exe`, covering the app payload and executable/icon resource;
  - retries failed downloads up to 3 times;
  - verifies downloaded files with SHA256 before marking the update complete.
- Repair behavior:
  - verifies the installed payload against the embedded manifest;
  - restores missing or damaged files from the installer payload;
  - recreates desktop and Start Menu shortcuts.
- Install behavior:
  - checks disk free space before installing;
  - displays required/free space in the launcher UI;
  - copies files with speed and ETA progress;
  - verifies installed files after copy.
- Launcher UI:
  - keeps the main installed-state button as Launch;
  - gear menu now includes Check update, Update, Repair, Reinstall, Directory, and Uninstall.
## 2026-06-19 Installer / launcher split

- Split the daily launcher from the first-run installer.
- Added `launcher-shell/` as a lightweight Electron launcher shell.
- Installer now deploys:
  - `game/` for the desktop archive client;
  - `launcher/` for `zhushen-launcher.exe`.
- Desktop and Start Menu shortcuts now target the installed launcher instead of the large installer package.
- The installed launcher infers the install root from its own `launcher/` directory and launches `game/zhushen-archive.exe`.
- The installer still owns first install and embedded-payload repair; the lightweight launcher uses remote manifest update/repair behavior.
- Build flow now creates `releases/launcher-shell/win-unpacked` before packaging the installer.

## 2026-06-19 Frameless shell and quick links

- Switched installer and daily launcher windows to frameless custom chrome.
- Added in-app minimize and close controls for both shells.
- Simplified bottom quick links:
  - removed Feedback and Settings from the bottom row;
  - kept TapTap and the GitHub update page;
  - replaced the inline QQ number with a QQ group button.
- Moved the notice tabs and notice card from the install panel to the left brand area.
- Added a PV cover image above the notice tabs to make the launcher feel closer to a game launcher.
- Shifted the install panel slightly downward so the right side focuses on path, progress, primary action, and management.
- The QQ group button now opens an in-app card with both official group numbers:
  - official group 1: `913044248`;
  - official group 2: `130340208`.

## 2026-06-15-to-2026-06-21

本周维护记录用于串联《诸神终应知晓》资料馆从 Android WebView 资料应用，扩展到桌面客户端、启动器、安装器和发布链路的完整迭代。单日细节可继续查看 2026-06-19 至 2026-06-21 的每日记录。

## 维护范围

- 时间范围：2026-06-15 至 2026-06-21。
- 代码范围：从 Android 资料馆初版到 `v1.1.1` 桌面客户端与启动器改造。
- 主要平台：
  - Android debug APK。
  - Windows Electron 桌面客户端。
  - Windows 自定义安装器。
  - Windows 轻量启动器。
  - PC 离线便携包。

## Android 资料馆

- 建立 Android WebView 资料馆应用，加载 `manual-build/assets` 中的离线页面和媒体资源。
- 修复启动视频相关崩溃，强化启动视频播放、关闭和设置项。
- 加入背景音乐控制，并在设置页补充音乐、启动视频、版权与横竖屏相关选项。
- 增加沉浸式全屏和系统导航栏处理，减少底部系统栏对页面底部导航的遮挡。
- 修复非 ASCII 路径构建问题，补充 `android.overridePathCheck=true`，确保当前 Windows 中文路径下可构建 APK。

## 资料内容与媒体

- 新增官方发布模块，整理 TapTap 官方动态正文、日期、分类、摘要、关键词和媒体资源。
- 将官方帖子中的图片、GIF、PV 与实机视频嵌入项目卡片，减少对原帖跳转的依赖。
- 新增“梦开始的地方”和“暂时的终章”两条官方信息，补齐线下技术测招募与罗老师告别信。
- 修正角色资料边界：
  - 德赫奴资料保留为神明、无性别与 PV 台词。
  - 拉夏资料承接“汇流地管理者之一”“第十三席恶魔”等契约信息。
- 更正二创作者名与资源目录，将 `范斯` 统一为 `范斯梅耶`。
- 调整官方动态排序，让早期官方信息按日期正确进入时间线。

## 客户端体验

- 前端 UI 从普通资料页升级为深色档案馆风格，包含首页、官方发布、角色、概念、二创、笑话、问答、论坛和设置等入口。
- 增加全局搜索、二创筛选、图片收藏、最近浏览和统一灯箱预览。
- 图片点击后支持全屏查看，视频改为进入可视区域后再初始化，降低页面首屏压力。
- 问答和论坛改为客户端内置浏览层，并保留外部浏览器打开作为备用路径。
- 桌面客户端改为无边框自绘标题栏，移除原生白色标题栏和顶部空白。
- 桌面端导航改为持久外壳内局部切页，标题栏、底部导航、档案抽屉和音乐宿主保持常驻。
- 背景音乐迁移到独立隐藏窗口播放，修复切页时重复播放、读取失败或卡顿的问题。
- 首页支持 PV 动态背景，资料页面使用各自主题图；设置页可切换动态或静态首页背景。
- 增加本地个人档案入口，最终收口到客户端左上角头像抽屉中，支持昵称、9 位 ID、备注、头像标识、偏好与 JSON 导入导出。

## 安装器与启动器

- 从 NSIS 常规安装包逐步改为自定义游戏启动器风格安装器。
- 安装器负责首次安装、路径选择、磁盘空间检查、进度展示、复制 payload、创建桌面和开始菜单快捷方式。
- 拆分日常使用的轻量启动器，安装完成后的桌面快捷方式指向轻量启动器，而不是大型安装器。
- 轻量启动器支持：
  - 启动客户端。
  - 检查更新。
  - 远端更新。
  - 本地修复。
  - 重装。
  - 打开安装目录。
  - 打开日志目录。
  - 卸载。
  - 启动后自动关闭。
- 启动器可根据自身 `launcher` 目录识别安装根目录，减少重复选择安装位置。
- 安装器与启动器改为无边框自绘窗口，并加入 PV 背景、轮播封面、书法字标、QQ 群和更新页快捷入口。
- 将运行数据迁移到安装盘或安装目录下：
  - 安装器数据：`zhushen-installer-data`。
  - 启动器数据：`<安装目录>\data\launcher`。
  - 客户端数据：`<安装目录>\data\client`。
  - 诊断日志：`<安装目录>\data\diagnostics`。

## 更新与修复系统

- 新增基于 `zhushen-update-manifest.json` 的更新清单。
- 发布资产中包含：
  - `zhushen-update-manifest.json`
  - `zhushen-app.asar`
  - `zhushen-archive.exe`
- 启动器可对比本地 `buildId` 与远端清单，按文件大小和 SHA256 判断是否需要下载。
- 修复功能可根据内置 payload 恢复缺失或损坏文件，并重新创建快捷方式。
- 安装、更新、修复过程中增加空间检查、进度、速度、ETA 与校验。
- 修复 Electron 复制 `app.asar` 时被虚拟归档系统拦截的问题，改用 `original-fs` 处理原始文件。

## 构建与发布

- 新增或完善构建脚本：
  - `npm run build`
  - `npm run installer-shell:win`
  - `npm run package:pc`
  - `npm run test:asar-copy`
  - `npm run test:client-navigation`
  - `npm run lint:android`
- 生成并发布过多轮 GitHub Release，用于验证安装器、启动器、APK、更新清单和远端更新链路。
- 修复过 GitHub hosts / 代理 / TLS 访问问题，并在需要时使用无代理 git 命令推送。

## 验证记录

本周多次通过以下验证组合：

```powershell
npm run verify
npm run build
npm run installer-shell:win
npm run test:asar-copy
npm run test:client-navigation
node --check desktop\main.js
node --check installer-shell\main.js
node --check launcher-shell\main.js
git --no-pager diff --check
```

实机或本地验证重点：

- Android debug APK 构建成功。
- Windows 客户端可到达 `ready-to-show`。
- 日志和诊断文件能写入安装盘数据目录。
- GitHub Release 资产包含安装器、启动器、APK 和更新系统所需 payload。

## 已知后续事项

- iOS 安装包仍需 Mac/Xcode 或 Xcode Cloud 环境生成。
- macOS 和 Linux 包已有脚本入口，但当前主要验证集中在 Windows 与 Android。
- APK 资源包拆分、大图压缩和更细粒度懒加载仍可继续优化。
- 云备份和账号同步目前只保留文档方案与数据结构预留，尚未接入真实联网服务。
