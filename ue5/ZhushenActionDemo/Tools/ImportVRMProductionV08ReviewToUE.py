import unreal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FBX = ROOT / "SourceAssets" / "Characters" / "OriginalHero" / "Exports" / "OriginalFemaleHero_VRMProduction_v08.fbx"
MAP_PATH = "/Game/Demo/Maps/L_v04_OriginalFemaleHero_VRMProduction_v08"
MAP_DIR = "/Game/Demo/Maps"
CHAR_DIR = "/Game/Core/Characters/Hero/OriginalFemaleHero/VRMProduction_v08"


def ensure_dir(path):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)


def import_static_review_mesh():
    if not FBX.exists():
        raise RuntimeError(f"Missing FBX: {FBX}")

    task = unreal.AssetImportTask()
    task.filename = str(FBX)
    task.destination_path = CHAR_DIR
    task.automated = True
    task.replace_existing = True
    task.save = True

    options = unreal.FbxImportUI()
    options.import_mesh = True
    options.import_as_skeletal = False
    options.import_materials = True
    options.import_textures = True
    options.static_mesh_import_data.combine_meshes = True
    options.static_mesh_import_data.import_uniform_scale = 100.0
    task.options = options

    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    unreal.log(f"VRMProduction v08 imported paths: {task.imported_object_paths}")
    for asset_path in task.imported_object_paths:
        asset = unreal.load_asset(asset_path)
        if isinstance(asset, unreal.StaticMesh):
            return asset
    raise RuntimeError("No StaticMesh was produced by the VRMProduction v08 import")


def spawn_static(label, mesh_path, location, rotation=None, scale=None, material=None):
    mesh = unreal.load_asset(mesh_path)
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.StaticMeshActor,
        location,
        rotation or unreal.Rotator(0, 0, 0),
    )
    actor.set_actor_label(label)
    actor.static_mesh_component.set_static_mesh(mesh)
    actor.static_mesh_component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)
    if material:
        actor.static_mesh_component.set_material(0, material)
    if scale:
        actor.set_actor_scale3d(scale)
    return actor


def create_review_map(character_mesh):
    ensure_dir(MAP_DIR)
    unreal.EditorLoadingAndSavingUtils.new_blank_map(False)
    world = unreal.EditorLevelLibrary.get_editor_world()

    floor_mat = unreal.load_asset("/Game/Core/Materials/M_Preview_Black.M_Preview_Black")
    gold_mat = unreal.load_asset("/Game/Core/Materials/M_Preview_Gold.M_Preview_Gold")

    spawn_static(
        "VRMProduction_v08_Floor",
        "/Engine/BasicShapes/Plane.Plane",
        unreal.Vector(0, 0, 0),
        scale=unreal.Vector(10.0, 7.0, 1.0),
        material=floor_mat,
    )
    spawn_static(
        "VRMProduction_v08_GoldBase",
        "/Engine/BasicShapes/Cylinder.Cylinder",
        unreal.Vector(0, 0, 5),
        scale=unreal.Vector(1.45, 1.45, 0.035),
        material=gold_mat,
    )

    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.StaticMeshActor,
        unreal.Vector(0, 0, 8),
        unreal.Rotator(0, 180, 0),
    )
    actor.set_actor_label("OriginalFemaleHero_VRMProduction_v08_StaticReview")
    actor.static_mesh_component.set_static_mesh(character_mesh)
    actor.static_mesh_component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)

    key = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.DirectionalLight,
        unreal.Vector(-280, -360, 500),
        unreal.Rotator(-42, -28, 0),
    )
    key.set_actor_label("VRMProduction_v08_KeyLight")
    key.light_component.set_intensity(7.5)

    rim = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.PointLight,
        unreal.Vector(260, 220, 250),
        unreal.Rotator(0, 0, 0),
    )
    rim.set_actor_label("VRMProduction_v08_BlueRim")
    rim.point_light_component.set_intensity(2500)
    rim.point_light_component.set_light_color(unreal.LinearColor(0.08, 0.46, 1.0, 1.0))

    warm = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.PointLight,
        unreal.Vector(-260, -230, 205),
        unreal.Rotator(0, 0, 0),
    )
    warm.set_actor_label("VRMProduction_v08_WarmFill")
    warm.point_light_component.set_intensity(1200)
    warm.point_light_component.set_light_color(unreal.LinearColor(1.0, 0.78, 0.48, 1.0))

    sky = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.SkyLight,
        unreal.Vector(0, 0, 320),
        unreal.Rotator(0, 0, 0),
    )
    sky.set_actor_label("VRMProduction_v08_SkyLight")
    sky.light_component.set_intensity(0.8)

    camera = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.CameraActor,
        unreal.Vector(35, -620, 155),
        unreal.Rotator(-2, 3, 0),
    )
    camera.set_actor_label("VRMProduction_v08_Camera")
    camera.camera_component.set_field_of_view(34)

    title = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.TextRenderActor,
        unreal.Vector(0, -280, 42),
        unreal.Rotator(76, 0, 0),
    )
    title.set_actor_label("VRMProduction_v08_Title")
    title.text_render.set_text("Original Female Hero - VRM Production v08")
    title.text_render.set_world_size(14)
    title.text_render.set_horizontal_alignment(unreal.HorizTextAligment.EHTA_CENTER)

    if not unreal.EditorLoadingAndSavingUtils.save_map(world, MAP_PATH):
        raise RuntimeError(f"Failed to save review map: {MAP_PATH}")
    unreal.log(f"Created VRMProduction v08 review map: {MAP_PATH}")


def main():
    ensure_dir(CHAR_DIR)
    mesh = import_static_review_mesh()
    create_review_map(mesh)


if __name__ == "__main__":
    main()
