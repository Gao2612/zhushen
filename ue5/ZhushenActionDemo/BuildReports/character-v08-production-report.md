# Original Female Hero v08 Production Report

Date: 2026-06-29

## Summary

`OriginalFemaleHero_VRMProduction_v08` is the current UE5 review asset for the original white-haired, red-eyed female hero direction.

This is a production-review asset, not the final commercial sculpt. It is intended to preserve the Blender source, exchange files, texture set, UE imported static review mesh, and review map so the work can continue from GitHub on another machine.

## Source Assets

- Base generation blend:
  - `SourceAssets/Characters/OriginalHero/Blender/OriginalFemaleHero_VRMProduction_v03.blend`
- Blender:
  - `SourceAssets/Characters/OriginalHero/Blender/OriginalFemaleHero_VRMProduction_v08.blend`
- Exports:
  - `SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08.fbx`
  - `SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08.glb`
  - `SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08_LOD1.fbx`
  - `SourceAssets/Characters/OriginalHero/Exports/OriginalFemaleHero_VRMProduction_v08_LOD2.fbx`
- Textures:
  - `SourceAssets/Characters/OriginalHero/Textures/vrm_production_v08/`
- Preview:
  - `SourceAssets/Characters/OriginalHero/Preview/OriginalFemaleHero_VRMProduction_v08_preview.png`

## UE Imported Assets

- Static review mesh and materials:
  - `/Game/Core/Characters/Hero/OriginalFemaleHero/VRMProduction_v08`
- Review helper materials:
  - `/Game/Core/Materials/M_Preview_Black`
  - `/Game/Core/Materials/M_Preview_Gold`
- Review map:
  - `/Game/Demo/Maps/L_v04_OriginalFemaleHero_VRMProduction_v08`
- Import scripts:
  - `Tools/ImportVRMProductionV08ReviewToUE.py`
  - `Tools/ImportVRMProductionV08SkeletalToUE.py`

## Completed

- Generated v08 Blender source.
- Generated v08 GLB, FBX, LOD1 FBX, and LOD2 FBX.
- Generated v08 PBR-style texture sheets.
- Imported static review mesh, materials, and textures into UE5.
- Created and saved a UE5 static review map.
- Opened UE5 with the v08 review map.

## Not Yet Passing

- Skeletal Mesh import did not produce a UE SkeletalMesh or AnimSequence.
- The Blender file contains a breathing idle action, but UE animation import needs another pass.
- Android platform validation still reports SDK / NDK invalid state.

## Next Steps

1. Rework the FBX skeletal export into a clean single-armature mesh hierarchy.
2. Import v08 as UE SkeletalMesh with animation enabled.
3. Build a UE material pass for skin, hair, eyes, cloth, gold trim, and emissive gems.
4. Replace procedural clothing panels with hand-modeled folds and cleaner silhouette topology.
5. Add LODs to the UE mesh asset instead of keeping LOD FBXs only as separate source exports.
