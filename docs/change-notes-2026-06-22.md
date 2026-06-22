# 2026-06-22 变更记录

本次更新基于 GitHub `main` 分支最近三天的迭代继续收口，重点是让“个人档案”功能边界更清晰：档案只保留在资料馆客户端内，安装器和轻量启动器不再携带不可见的档案抽屉、IPC 和本地档案读写逻辑。

## 三天更新梳理

- 2026-06-19：安装器改为游戏启动器风格，并拆分出日常使用的轻量启动器；新增更新、修复、重装、日志、快捷入口和远端 manifest 检查链路；修复 Windows 图标资源和桌面音乐播放。
- 2026-06-20：继续优化启动器布局、轮播封面、书法字标、安装路径识别、ASAR 复制、G 盘运行数据和诊断日志；新增本地用户档案结构、导入导出预留和账号同步方案文档。
- 2026-06-21：版本提升到 `v1.1.1`；档案入口迁移到客户端头像抽屉；客户端导航改为持久外壳内局部切页；问答和论坛进入内置浏览层；桌面背景音乐、无边框窗口、图标解包、延迟加载和分批渲染继续完善。

## 本次后续更新

- 移除 `installer-shell` 中未使用的个人档案浮层样式、页面脚本、preload 暴露接口和主进程 IPC。
- 移除 `launcher-shell` 中未使用的个人档案浮层样式、页面脚本、preload 暴露接口和主进程 IPC。
- 保留客户端内的个人档案抽屉和 `scripts/test-client-navigation.js` 测试覆盖，确保用户档案仍在资料馆客户端中可用。
- 降低安装器和轻量启动器的无效代码体积，避免后续误把档案入口重新接回安装链路。

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
```

说明：第一次 `npm run test:asar-copy` 使用 120 秒超时运行时被终止；随后使用更长超时重跑通过，结果为 `ASAR raw copy verified.`。
