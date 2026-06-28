import unreal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FBX = ROOT / "SourceAssets" / "Characters" / "OriginalHero" / "Exports" / "OriginalFemaleHero_VRMProduction_v08.fbx"
DEST_DIR = "/Game/Core/Characters/Hero/OriginalFemaleHero/VRMProduction_v08_Skeletal"


def ensure_dir(path):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)


def import_skeletal_mesh():
    if not FBX.exists():
        raise RuntimeError(f"Missing FBX: {FBX}")

    ensure_dir(DEST_DIR)

    task = unreal.AssetImportTask()
    task.filename = str(FBX)
    task.destination_path = DEST_DIR
    task.automated = True
    task.replace_existing = True
    task.save = True

    options = unreal.FbxImportUI()
    options.import_mesh = True
    options.import_as_skeletal = True
    options.import_animations = True
    options.import_materials = True
    options.import_textures = True
    options.mesh_type_to_import = unreal.FBXImportType.FBXIT_SKELETAL_MESH
    options.skeletal_mesh_import_data.import_uniform_scale = 100.0
    options.skeletal_mesh_import_data.import_meshes_in_bone_hierarchy = True
    task.options = options

    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    unreal.log(f"VRMProduction v08 skeletal imported paths: {task.imported_object_paths}")

    skeletal_meshes = []
    animations = []
    for asset_path in task.imported_object_paths:
        asset = unreal.load_asset(asset_path)
        if isinstance(asset, unreal.SkeletalMesh):
            skeletal_meshes.append(asset_path)
        elif isinstance(asset, unreal.AnimSequence):
            animations.append(asset_path)

    if not skeletal_meshes:
        raise RuntimeError("No SkeletalMesh was produced by the v08 skeletal import")

    unreal.log(f"VRMProduction v08 skeletal mesh count: {len(skeletal_meshes)}")
    unreal.log(f"VRMProduction v08 animation count: {len(animations)}")


if __name__ == "__main__":
    import_skeletal_mesh()
