# 苹果安装包研究结论

当前仓库可以继续向 iOS 方向迁移，但本机是 Windows 环境，不能在本机直接
产出可安装的 `.ipa`。官方发布流程需要 Xcode 生成 Archive，并从 Xcode 的
Organizer 执行 Distribute App；Xcode 是 Apple 平台开发、测试和分发工具。

可行路径：

1. 使用 Mac 或 Xcode Cloud。
2. 为本项目补 Capacitor iOS 工程或原生 iOS WebView 壳。
3. 在 Apple Developer 账号里配置 Bundle ID、证书和描述文件。
4. 用 Xcode Archive 后导出 Ad Hoc / Development `.ipa`，或上传 TestFlight。

当前提交内容：

- 安卓安装包会输出到 `releases/android-debug.apk`。
- PC 便携客户端会输出到 `releases/pc/zhushen-pc-client-v1.1.0`。
- iOS 侧先提交研究结论和构建路径，不伪造不可安装的 `.ipa`。

参考来源：

- Apple Developer: Xcode
- Apple Developer: Distributing your app for beta testing and releases
