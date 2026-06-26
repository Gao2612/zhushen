# ZhushenActionDemo v0.1

This UE5 project is the environment verification track for the Zhushen action demo.

## Goal

v0.1 only verifies that the project can open, build, package, and run on Windows and Android.

It intentionally does not include combat, skills, bosses, final UI, final character art, heavy effects, or archive app integration.

## Expected Engine

- Unreal Engine: 5.8.
- Windows target: Win64 Shipping.
- Android target: Landscape APK or AAB, ASTC texture format, package name `com.zhushen.demo`.

## Download Checklist

The current machine may not have the UE5 toolchain installed yet. Use the full checklist:

- `Docs/v0.1-download-checklist.md`
- `Tools/open-v01-downloads.ps1`

## First Run

1. Install UE5 with Android support.
2. Open `ZhushenActionDemo.uproject`.
3. Run `Tools/CreateV01StartupMap.py` in Unreal Editor if `/Game/Demo/Maps/L_v01_Startup` does not exist yet.
4. Package Windows and Android with the scripts in `Tools/` or through Unreal Editor.
5. Fill `BuildReports/v0.1-build-report.md` with actual package size, startup time, FPS, and device notes.

