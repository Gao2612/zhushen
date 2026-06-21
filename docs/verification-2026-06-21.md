# 2026-06-21 构建验证

## 自动检查

- `npm run verify`：通过。
- `npm run test:client-navigation`：通过；真实 Electron `file://` 环境验证档案抽屉、局部切页、持久外壳与分页面背景。
- Windows 客户端、轻量启动器和自定义安装器构建：通过。
- Android debug APK 构建：通过。
- Electron 主进程、预加载脚本、页面增强脚本和启动器内联脚本语法检查：通过。
- `git diff --check`：通过。

## 实机检查

- G 盘客户端可到达 `ready-to-show`，客户端日志写入 `G:\zhushen-archive\data\client\logs`。
- 启动器从自身目录自动识别 `G:\zhushen-archive`，无需再次选择安装位置。
- 启动器已安装态隐藏安装路径、空间和进度，不增加“游戏已就绪”卡片；仅保留标题、启动按钮和齿轮。
- 初次检查发现隐藏音乐页从 `data:` 地址读取 `file:` 音频被 Chromium 拦截；已改为同源本地音乐页并重新构建。
- 初次检查发现任务栏图标从 ASAR 原生路径读取失败；已将图标单独解包并改用原生资源路径。
- 运行目录、最终安装器和 APK 均同步到 G 盘；原始运行日志不提交，避免包含本机用户名、绝对路径和环境信息。
