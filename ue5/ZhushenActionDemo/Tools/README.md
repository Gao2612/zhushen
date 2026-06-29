# Tools

These scripts are thin wrappers for the v0.1 verification build.

- `open-v01-downloads.ps1`: opens the official UE 5.8, Android Studio, JDK, and Visual Studio download pages.
- `check-v01-env.ps1`: checks Java, adb, UnrealEditor, and RunUAT discovery.
- `build-v01-windows.ps1`: packages Win64 Shipping with RunUAT.
- `build-v01-android.ps1`: packages Android Shipping with RunUAT.
- `CreateV01StartupMap.py`: helper script to create the simple startup level inside Unreal Editor.

Target engine is UE 5.8. Set `UE_ROOT` to the engine directory when the engine is not in a default path, for example:

```powershell
$env:UE_ROOT = "C:\Program Files\Epic Games\UE_5.8"
```
