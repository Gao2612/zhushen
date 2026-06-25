import unreal


ASSET_PATH = "/Game/Demo/Maps/L_v01_Startup"


def main():
    unreal.EditorLoadingAndSavingUtils.new_blank_map(False)
    world = unreal.EditorLevelLibrary.get_editor_world()

    unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.DirectionalLight, unreal.Vector(0, 0, 500), unreal.Rotator(-45, 0, 0))
    unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.SkyLight, unreal.Vector(0, 0, 300), unreal.Rotator(0, 0, 0))
    unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(0, 0, 120), unreal.Rotator(0, 0, 0))

    plane = unreal.EditorLevelLibrary.spawn_actor_from_object(
        unreal.EditorAssetLibrary.load_asset("/Engine/BasicShapes/Plane"),
        unreal.Vector(0, 0, 0),
        unreal.Rotator(0, 0, 0),
    )
    plane.set_actor_scale3d(unreal.Vector(40, 40, 1))

    unreal.EditorLoadingAndSavingUtils.save_map(world, ASSET_PATH)
    unreal.log("Created v0.1 startup map: {}".format(ASSET_PATH))


if __name__ == "__main__":
    main()

