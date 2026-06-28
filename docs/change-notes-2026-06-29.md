# 2026-06-29 变更记录

## UE5 原创女性角色 v08 资产归档

- 继续推进原创女性角色资产生产线，当前角色方向调整为白发、红瞳、成熟女性气质。
- 基于现有 VRM 生产底模生成 `OriginalFemaleHero_VRMProduction_v08`。
- 输出并归档 Blender 源文件、GLB、FBX、LOD1、LOD2、PBR 贴图和预览图。
- 新增 UE5 静态评审导入脚本：
  - `ue5/ZhushenActionDemo/Tools/ImportVRMProductionV08ReviewToUE.py`
- 新增 UE5 骨骼导入验证脚本：
  - `ue5/ZhushenActionDemo/Tools/ImportVRMProductionV08SkeletalToUE.py`
- 新增 UE5 静态评审地图：
  - `/Game/Demo/Maps/L_v04_OriginalFemaleHero_VRMProduction_v08`
- 新增 UE5 静态评审资产目录：
  - `/Game/Core/Characters/Hero/OriginalFemaleHero/VRMProduction_v08`
- 新增评审地图依赖材质：
  - `/Game/Core/Materials/M_Preview_Black`
  - `/Game/Core/Materials/M_Preview_Gold`

## 本次资产清单

- 生成基础文件：
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Blender/OriginalFemaleHero_VRMProduction_v03.blend`
- Blender 源文件：
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Blender/OriginalFemaleHero_VRMProduction_v08.blend`
- 交换格式：
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08.glb`
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08.fbx`
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08_LOD1.fbx`
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08_LOD2.fbx`
- 贴图目录：
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Textures/vrm_production_v08/`
- 预览图：
  - `ue5/ZhushenActionDemo/SourceAssets/Characters/OriginalHero/Preview/OriginalFemaleHero_VRMProduction_v08_preview.png`

## 验证记录

- Blender 5.1.2 后台生成通过。
- v08 预览图已人工检查，没有 v07 那种白发覆盖片遮脸问题。
- UE5 静态评审导入通过，地图检测结果为 0 个错误、0 个警告。
- UE5 编辑器已打开到 `L_v04_OriginalFemaleHero_VRMProduction_v08` 评审地图。

## 未完成 / 风险

- Skeletal Mesh 导入目录已创建，但 UE 未产出 SkeletalMesh / AnimSequence，动作绑定进 UE 仍未通过。
- 当前 v08 属于可导入、可评审、可继续精修的游戏角色资产阶段，不是最终商业级手工雕刻资产。
- Android SDK 当前仍显示 `INVALID r27c`，后续 APK 打包需要继续修复 SDK / NDK 配置。
- 角色使用原创方向推进，不复刻任何官方角色外观或资产，避免版权风险。
