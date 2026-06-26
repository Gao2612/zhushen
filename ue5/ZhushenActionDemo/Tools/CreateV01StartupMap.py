import unreal
from pathlib import Path


ASSET_PATH = "/Game/Demo/Maps/L_v01_Startup"
PACKAGE_PATH = "/Game/Demo/Maps"
SCRIPT_LOG_PATH = (
    Path(__file__).resolve().parents[1]
    / "BuildReports"
    / "v0.1-create-map-python.log"
)


def script_log(message):
    SCRIPT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with SCRIPT_LOG_PATH.open("a", encoding="utf-8") as log_file:
        log_file.write(message + "\n")
    unreal.log(message)


def ensure_directory(path):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)


def spawn_static_mesh(label, mesh_path, location, rotation=None, scale=None):
    mesh = unreal.load_asset(mesh_path)
    if mesh is None:
        raise RuntimeError("Missing mesh asset: {}".format(mesh_path))

    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.StaticMeshActor,
        location,
        rotation or unreal.Rotator(0, 0, 0),
    )
    actor.set_actor_label(label)
    if scale is not None:
        actor.set_actor_scale3d(scale)
    actor.static_mesh_component.set_static_mesh(mesh)
    return actor


def main():
    script_log("CreateV01StartupMap.py started")
    ensure_directory(PACKAGE_PATH)
    unreal.EditorLoadingAndSavingUtils.new_blank_map(False)
    world = unreal.EditorLevelLibrary.get_editor_world()

    directional_light = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.DirectionalLight,
        unreal.Vector(0, 0, 500),
        unreal.Rotator(-45, -35, 0),
    )
    directional_light.set_actor_label("V01_DirectionalLight")

    sky_light = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.SkyLight,
        unreal.Vector(0, 0, 300),
        unreal.Rotator(0, 0, 0),
    )
    sky_light.set_actor_label("V01_SkyLight")

    player_start = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.PlayerStart,
        unreal.Vector(0, 0, 120),
        unreal.Rotator(0, 0, 0),
    )
    player_start.set_actor_label("V01_PlayerStart")

    camera = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.CameraActor,
        unreal.Vector(-780, -520, 620),
        unreal.Rotator(-38, 42, 0),
    )
    camera.set_actor_label("V01_OverviewCamera")

    spawn_static_mesh(
        "V01_GreyboxGround_40m",
        "/Engine/BasicShapes/Plane.Plane",
        unreal.Vector(0, 0, 0),
        scale=unreal.Vector(40, 40, 1),
    )

    spawn_static_mesh(
        "V01_VisiblePlaceholder_Body",
        "/Engine/BasicShapes/Cylinder.Cylinder",
        unreal.Vector(0, 0, 120),
        scale=unreal.Vector(0.65, 0.65, 1.55),
    )
    spawn_static_mesh(
        "V01_VisiblePlaceholder_Head",
        "/Engine/BasicShapes/Sphere.Sphere",
        unreal.Vector(0, 0, 245),
        scale=unreal.Vector(0.72, 0.72, 0.72),
    )

    for label, x, y in [
        ("V01_GreyboxScale_North", 0, 1200),
        ("V01_GreyboxScale_East", 1200, 0),
        ("V01_GreyboxScale_South", 0, -1200),
        ("V01_GreyboxScale_West", -1200, 0),
    ]:
        spawn_static_mesh(
            label,
            "/Engine/BasicShapes/Cube.Cube",
            unreal.Vector(x, y, 50),
            scale=unreal.Vector(0.8, 0.8, 1.0),
        )

    text = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.TextRenderActor,
        unreal.Vector(-260, -180, 220),
        unreal.Rotator(0, 35, 0),
    )
    text.set_actor_label("V01_TitleText")
    text.text_render.set_text("Zhushen UE5 Demo v0.1")
    text.text_render.set_world_size(48)
    text.text_render.set_horizontal_alignment(unreal.HorizTextAligment.EHTA_CENTER)

    saved = unreal.EditorLoadingAndSavingUtils.save_map(world, ASSET_PATH)
    if not saved:
        raise RuntimeError("Failed to save map: {}".format(ASSET_PATH))
    script_log("Created v0.1 startup map: {}".format(ASSET_PATH))


if __name__ == "__main__":
    main()
