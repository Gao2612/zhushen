# 2026-06-24 变更记录

本次维护进入“第一期：导航体验优先”，重点收口顶部导航、Android 原生底部 Tab 和桌面端底部 Dock 的 active 状态，并优化 Android 返回键的 App 化行为。

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

## 验证和交付

- `npm run verify`：通过。
- `npm run test:client-navigation`：通过；Electron 的 Windows 网络状态查询有非阻断日志，不影响测试结果。
- `npm run build`：通过，重新生成 Android debug 包。
- `npm run lint:android`：通过。
- `node scripts/build-installer-shell.js`：通过，重新生成推荐安装器。
- 已刷新桌面文件夹 `C:\Users\EDY\Desktop\诸神终应知晓` 中的推荐安装器和 Android debug 包。
