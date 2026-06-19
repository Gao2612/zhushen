# 2026-06-19 变更记录

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
