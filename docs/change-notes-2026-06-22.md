# 2026-06-22 变更记录

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

## 2026-06-23 Android 局部切页补齐

- Android 原生底部 Tab 不再直接整页 `webView.loadUrl(...)` 切换资料页。
- 前端增强层暴露 `window.ZhushenNavigate`，Android 原生层优先调用同一套局部切页逻辑。
- 当页面尚未初始化、正在外部内置浏览层或局部切页 API 不可用时，Android 仍回退到整页加载，保证首次启动和异常兜底可用。
- 局部切页时由原生层同步底部 Tab 高亮，不依赖整页加载完成回调。
- `scripts/verify-project.js` 新增回归检查，防止后续把 Android 底部 Tab 改回整页刷新。
- 重新构建 Android debug 包、桌面客户端、启动器压缩包和推荐安装器，并覆盖 GitHub Release `v1.1.1` 相关资产。

## 2026-06-23 设置、音乐与角色归档收口

- 设置页的背景音乐控制改为等宽分段开关，补充曲名与歌词面板；桌面端音乐状态保存开关、音量和播放位置，重启后继续沿用上次设置。
- 删除设置页中没有实际使用价值的窗口缩放按钮；桌面端缩放快捷键仍保留在客户端内部。
- 将“低动态模式”和“记录最近浏览”迁移到设置页；个人档案抽屉只保留昵称、数字 ID、头像、备注、导入和导出。
- 最近浏览开关关闭后不再写入新的本地浏览记录；低动态模式会减少动态背景和恢复动画。
- 夕岚的“玩家二创一”“玩家二创二”“我的世界”从官方角色页移到二创页的视频区，避免二创内容混入官方角色资料。
- 角色图集卡片改为“官方图像 / 动图”等资料类型标签，避免每张图重复显示“少女骑士 · 送葬人”“第十三席恶魔”等身份称号。
- Android 前后台切换新增 `zhushen:pause` / `zhushen:resume` 事件，前端暂停动态背景并在恢复时轻淡入，减少切回应用时的硬顿感。

## 2026-06-23 启动器右侧社交栏简化

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
