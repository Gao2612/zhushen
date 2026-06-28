import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


ROOT = Path(r"G:\zhushen-source\ue5\ZhushenActionDemo")
ASSET_ROOT = ROOT / "SourceAssets" / "Characters" / "OriginalHero"
IN_BLEND = ASSET_ROOT / "Blender" / "OriginalFemaleHero_VRMProduction_v03.blend"
OUT_BLEND = ASSET_ROOT / "Blender" / "OriginalFemaleHero_VRMProduction_v08.blend"
OUT_GLB = ASSET_ROOT / "Exports" / "OriginalFemaleHero_VRMProduction_v08.glb"
OUT_FBX = ASSET_ROOT / "Exports" / "OriginalFemaleHero_VRMProduction_v08.fbx"
OUT_FBX_LOD1 = ASSET_ROOT / "Exports" / "OriginalFemaleHero_VRMProduction_v08_LOD1.fbx"
OUT_FBX_LOD2 = ASSET_ROOT / "Exports" / "OriginalFemaleHero_VRMProduction_v08_LOD2.fbx"
OUT_PREVIEW = ASSET_ROOT / "Preview" / "OriginalFemaleHero_VRMProduction_v08_preview.png"
TEX_DIR = ASSET_ROOT / "Textures" / "vrm_production_v08"


def ensure_dirs():
    for path in [OUT_BLEND.parent, OUT_GLB.parent, OUT_FBX.parent, OUT_PREVIEW.parent, TEX_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def set_input(node, name, value):
    if name in node.inputs:
        node.inputs[name].default_value = value


def make_image(name, kind, base, accent=(0.0, 0.0, 0.0), size=1024):
    image = bpy.data.images.new(name, size, size)
    pixels = []
    for y in range(size):
        for x in range(size):
            grain = ((x * 17 + y * 31 + (x * y) % 127) % 101) / 100.0
            weave = 1.0 if (x % 47 < 2 or y % 61 < 2) else 0.0
            scratch = 1.0 if (x + y * 5) % 239 < 3 else 0.0
            if kind == "normal":
                r = 0.50 + (grain - 0.5) * 0.045
                g = 0.50 + weave * 0.10 - scratch * 0.04
                b = 1.00
            elif kind == "roughness":
                v = base[0] + (grain - 0.5) * 0.12 - scratch * 0.08
                r = g = b = max(0.04, min(0.96, v))
            elif kind == "metallic":
                v = base[0] + scratch * accent[0]
                r = g = b = max(0.0, min(1.0, v))
            elif kind == "ao":
                v = base[0] - weave * 0.10 - scratch * 0.08
                r = g = b = max(0.12, min(1.0, v))
            else:
                multiplier = 0.88 + grain * 0.22
                r = min(1.0, base[0] * multiplier + accent[0] * scratch + weave * accent[0] * 0.35)
                g = min(1.0, base[1] * multiplier + accent[1] * scratch + weave * accent[1] * 0.35)
                b = min(1.0, base[2] * multiplier + accent[2] * scratch + weave * accent[2] * 0.35)
            pixels.extend([r, g, b, 1.0])
    image.pixels[:] = pixels
    path = TEX_DIR / f"{name}.png"
    image.filepath_raw = str(path)
    image.file_format = "PNG"
    image.save()
    return path


def make_texture_set(prefix, base_color, accent, roughness, metallic):
    return {
        "base": make_image(f"T_{prefix}_BaseColor", "base", base_color, accent),
        "normal": make_image(f"T_{prefix}_Normal", "normal", (0.5, 0.5, 1.0), accent),
        "roughness": make_image(f"T_{prefix}_Roughness", "roughness", (roughness, roughness, roughness), accent),
        "metallic": make_image(f"T_{prefix}_Metallic", "metallic", (metallic, metallic, metallic), (0.28, 0.28, 0.28)),
        "ao": make_image(f"T_{prefix}_AO", "ao", (0.82, 0.82, 0.82), accent),
    }


def new_pbr_material(name, texset, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        return mat

    def tex_node(path, label, non_color=False):
        node = nodes.new("ShaderNodeTexImage")
        node.label = label
        node.image = bpy.data.images.load(str(path), check_existing=True)
        if non_color:
            node.image.colorspace_settings.name = "Non-Color"
        return node

    base = tex_node(texset["base"], "BaseColor")
    roughness = tex_node(texset["roughness"], "Roughness", True)
    metallic = tex_node(texset["metallic"], "Metallic", True)
    normal = tex_node(texset["normal"], "Normal", True)
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 0.42
    links.new(base.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(roughness.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(metallic.outputs["Color"], bsdf.inputs["Metallic"])
    links.new(normal.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])
    if emission:
        set_input(bsdf, "Emission Color", emission)
        set_input(bsdf, "Emission Strength", emission_strength)
    return mat


def build_v04_materials():
    texture_sets = {
        "ivory": make_texture_set("OFH_V08_IvorySilk", (0.90, 0.86, 0.76), (0.08, 0.07, 0.03), 0.68, 0.0),
        "black": make_texture_set("OFH_V08_BlackLeather", (0.016, 0.014, 0.012), (0.08, 0.065, 0.035), 0.42, 0.05),
        "gold": make_texture_set("OFH_V08_AgedGold", (0.86, 0.61, 0.25), (0.18, 0.12, 0.04), 0.28, 0.82),
        "steel": make_texture_set("OFH_V08_BlackenedSteel", (0.030, 0.030, 0.032), (0.12, 0.12, 0.12), 0.24, 0.90),
        "hair": make_texture_set("OFH_V08_WhiteHair", (0.985, 0.975, 0.94), (0.13, 0.13, 0.11), 0.46, 0.0),
        "gem": make_texture_set("OFH_V08_CrimsonGem", (0.90, 0.025, 0.045), (0.35, 0.02, 0.02), 0.16, 0.0),
        "blue": make_texture_set("OFH_V08_BlueHalo", (0.04, 0.35, 1.0), (0.08, 0.12, 0.28), 0.18, 0.0),
    }
    return {
        "ivory": new_pbr_material("OFH_V08_IvorySilk_PBR_Baked", texture_sets["ivory"]),
        "black": new_pbr_material("OFH_V08_BlackLeather_PBR_Baked", texture_sets["black"]),
        "gold": new_pbr_material("OFH_V08_AgedGold_PBR_Baked", texture_sets["gold"]),
        "steel": new_pbr_material("OFH_V08_BlackenedSteel_PBR_Baked", texture_sets["steel"]),
        "hair": new_pbr_material("OFH_V08_WhiteHair_PBR_Baked", texture_sets["hair"]),
        "gem": new_pbr_material("OFH_V08_CrimsonGem_PBR_Baked", texture_sets["gem"], emission=(1.0, 0.02, 0.04, 1.0), emission_strength=1.8),
        "blue": new_pbr_material("OFH_V08_BlueHalo_PBR_Baked", texture_sets["blue"], emission=(0.05, 0.36, 1.0, 1.0), emission_strength=1.25),
        "iris": bpy.data.materials.new("OFH_V08_RedIris_Overlay"),
        "pupil": bpy.data.materials.new("OFH_V08_DeepRedPupil_Overlay"),
    }


def setup_eye_materials(mats):
    mats["iris"].use_nodes = True
    mats["iris"].diffuse_color = (0.92, 0.025, 0.035, 1.0)
    iris_bsdf = mats["iris"].node_tree.nodes.get("Principled BSDF")
    if iris_bsdf:
        set_input(iris_bsdf, "Base Color", (0.92, 0.025, 0.035, 1.0))
        set_input(iris_bsdf, "Roughness", 0.18)
        set_input(iris_bsdf, "Emission Color", (0.50, 0.015, 0.025, 1.0))
        set_input(iris_bsdf, "Emission Strength", 0.22)
    mats["pupil"].use_nodes = True
    mats["pupil"].diffuse_color = (0.12, 0.0, 0.006, 1.0)
    pupil_bsdf = mats["pupil"].node_tree.nodes.get("Principled BSDF")
    if pupil_bsdf:
        set_input(pupil_bsdf, "Base Color", (0.12, 0.0, 0.006, 1.0))
        set_input(pupil_bsdf, "Roughness", 0.20)


def mature_silhouette_pass():
    body = bpy.data.objects.get("Body")
    if not body or body.type != "MESH":
        return
    mesh = body.data
    # Adult "onee-san" silhouette pass: softer waist, stronger bust/hip curve.
    # This is deliberately restrained so the asset remains a game character,
    # not a caricature.
    for vert in mesh.vertices:
        x, y, z = vert.co.x, vert.co.y, vert.co.z
        chest = math.exp(-((z - 1.155) / 0.115) ** 2)
        waist = math.exp(-((z - 0.930) / 0.125) ** 2)
        hips = math.exp(-((z - 0.705) / 0.145) ** 2)
        thigh = math.exp(-((z - 0.470) / 0.110) ** 2)

        if chest > 0.08 and abs(x) < 0.19:
            vert.co.y = y + 0.035 * chest * max(0.0, 1.0 - abs(x) / 0.20)
            vert.co.x = x * (1.0 + 0.075 * chest)
        if waist > 0.08 and abs(x) < 0.20:
            vert.co.x = x * (1.0 - 0.065 * waist)
            vert.co.y = vert.co.y - 0.008 * waist
        if hips > 0.08:
            vert.co.x = vert.co.x * (1.0 + 0.105 * hips)
            vert.co.y = vert.co.y - 0.038 * hips * max(0.0, 1.0 - abs(x) / 0.24)
        if thigh > 0.08 and abs(x) > 0.055:
            vert.co.x = vert.co.x * (1.0 + 0.045 * thigh)
    mesh.update()

    # Let the generated costume follow the revised adult silhouette.
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or not obj.name.startswith("OFH_VRM_"):
            continue
        if "BlackCorset" in obj.name:
            obj.scale.x *= 1.05
            obj.scale.y *= 1.05
            obj.location.y += 0.015
        elif "IvoryArchiveRobe" in obj.name:
            obj.scale.x *= 1.05
            obj.location.y -= 0.012
        elif "RobePanel" in obj.name:
            obj.scale.x *= 1.04


def mature_head_ratio_pass():
    # The VRM sample starts with a cute head ratio. Shrinking face/hair around the
    # eye line pushes the read toward a taller, older heroine silhouette.
    center = Vector((0.0, 0.035, 1.405))
    scales = {
        "Face": Vector((0.86, 0.88, 0.88)),
        "Hair001": Vector((0.88, 0.90, 0.90)),
    }
    for name, scale in scales.items():
        obj = bpy.data.objects.get(name)
        if not obj or obj.type != "MESH":
            continue
        inverse = obj.matrix_world.inverted()
        for vert in obj.data.vertices:
            world = obj.matrix_world @ vert.co
            local_delta = world - center
            world = Vector(
                (
                    center.x + local_delta.x * scale.x,
                    center.y + local_delta.y * scale.y,
                    center.z + local_delta.z * scale.z,
                )
            )
            vert.co = inverse @ world
        obj.data.update()

    for obj in bpy.context.scene.objects:
        if obj.name.startswith("OFH_VRM_BlueArchiveHalo"):
            obj.scale *= 0.92
            obj.location.z += 0.025


def add_white_hair_cap(mats):
    # Covers the original VRM scalp color that is baked into the face texture.
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=48,
        ring_count=16,
        radius=0.092,
        location=(0.0, 0.028, 1.595),
    )
    cap = bpy.context.object
    cap.name = "OFH_V08_WhiteHairCap"
    cap.scale = (1.00, 0.84, 0.34)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mesh = cap.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    remove_verts = [vert for vert in bm.verts if vert.co.z < -0.015]
    bmesh.ops.delete(bm, geom=remove_verts, context="VERTS")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    cap.data.materials.append(mats["hair"])


def assign_v04_materials(mats):
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        name = obj.name
        target = None
        if name == "Hair001":
            target = mats["hair"]
        elif "IvoryArchiveRobe" in name:
            target = mats["ivory"]
        elif "BlackCorset" in name or "BlackHighCollar" in name:
            target = mats["black"]
        elif "ShoulderBlackGoldPlate" in name or "SideSpear_Head" in name:
            target = mats["steel"]
        elif "Gold" in name or "RobeEdge" in name or "CorsetDiamond" in name or "CorsetSpine" in name:
            target = mats["gold"]
        elif "CrimsonArchiveCore" in name:
            target = mats["gem"]
        elif "BlueArchiveHalo" in name:
            target = mats["blue"]
        if target:
            obj.data.materials.clear()
            obj.data.materials.append(target)


def cleanup_mesh_normals():
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        if obj.name.split(".")[0] in {"Face", "Body", "Hair001"}:
            # Keep the imported VRM face/body/hair UVs and material slots intact.
            # The cleanup pass is mainly for generated armor, robe panels, halo and props.
            continue
        mesh = obj.data
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bmesh.ops.dissolve_degenerate(bm, dist=0.000001, edges=bm.edges)
        bm.to_mesh(mesh)
        bm.free()
        mesh.validate(clean_customdata=False)
        mesh.update()
        for poly in mesh.polygons:
            poly.use_smooth = True
        if not any(mod.type == "WEIGHTED_NORMAL" for mod in obj.modifiers):
            obj.modifiers.new("OFH_V04_WeightedNormals", "WEIGHTED_NORMAL")


def bind_mesh_to_armature(obj, armature, bone_weights):
    world_matrix = obj.matrix_world.copy()
    obj.parent = armature
    obj.matrix_parent_inverse = armature.matrix_world.inverted()
    obj.matrix_world = world_matrix
    mod = obj.modifiers.get("OFH_V04_ClothArmatureBinding") or obj.modifiers.new(
        "OFH_V04_ClothArmatureBinding", "ARMATURE"
    )
    mod.object = armature
    verts_by_group = {}
    for vert in obj.data.vertices:
        world = obj.matrix_world @ vert.co
        if callable(bone_weights):
            weighted = bone_weights(world)
        else:
            weighted = bone_weights
        for group_name, weight in weighted.items():
            if weight > 0:
                verts_by_group.setdefault(group_name, [])
                verts_by_group[group_name].append((vert.index, weight))
    for group_name, values in verts_by_group.items():
        group = obj.vertex_groups.get(group_name) or obj.vertex_groups.new(name=group_name)
        for index, weight in values:
            group.add([index], weight, "REPLACE")


def add_clothing_binding():
    armature = bpy.data.objects.get("Armature")
    if not armature:
        raise RuntimeError("Missing Armature for v04 clothing binding")

    def torso_weights(world):
        if world.z > 1.18:
            return {"J_Bip_C_Chest": 0.65, "J_Bip_C_UpperChest": 0.35}
        if world.z > 0.78:
            return {"J_Bip_C_Chest": 0.55, "J_Bip_C_Spine": 0.45}
        return {"J_Bip_C_Hips": 0.70, "J_Bip_C_Spine": 0.30}

    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or not (
            obj.name.startswith("OFH_VRM_")
            or obj.name.startswith("OFH_V08_Eye")
            or obj.name.startswith("OFH_V08_WhiteHairCap")
        ):
            continue
        name = obj.name
        if "ReviewPedestal" in name:
            continue
        if name.startswith("OFH_V08_Eye") or name.startswith("OFH_V08_WhiteHairCap") or "Halo" in name:
            bind_mesh_to_armature(obj, armature, {"J_Bip_C_Head": 1.0})
        elif "Spear" in name:
            bind_mesh_to_armature(obj, armature, {"Root": 1.0})
        elif "_-1_" in name:
            bind_mesh_to_armature(obj, armature, {"J_Bip_L_Shoulder": 0.85, "J_Bip_C_Chest": 0.15})
        elif "_1_" in name and "Shoulder" in name:
            bind_mesh_to_armature(obj, armature, {"J_Bip_R_Shoulder": 0.85, "J_Bip_C_Chest": 0.15})
        else:
            bind_mesh_to_armature(obj, armature, torso_weights)


def add_eye_overlays(mats):
    # The VRM base keeps its original face texture, but the separate iris/pupil
    # layers make the review render robust after FBX/UE material conversion.
    for side in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=32,
            ring_count=12,
            radius=0.018,
            location=(side * 0.034, 0.060, 1.555),
        )
        iris = bpy.context.object
        iris.name = f"OFH_V08_Eye_Iris_{side}"
        iris.scale = (0.70, 0.07, 0.82)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        iris.data.materials.append(mats["iris"])
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=20,
            ring_count=8,
            radius=0.0048,
            location=(side * 0.034, 0.062, 1.555),
        )
        pupil = bpy.context.object
        pupil.name = f"OFH_V08_Eye_Pupil_{side}"
        pupil.scale = (0.70, 0.06, 0.82)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        pupil.data.materials.append(mats["pupil"])


def create_idle_action():
    armature = bpy.data.objects.get("Armature")
    if not armature:
        return
    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)
    bpy.ops.object.mode_set(mode="POSE")
    action = bpy.data.actions.new("A_OFH_V08_BreathingIdle_60f")
    armature.animation_data_create()
    armature.animation_data.action = action
    key_bones = {
        "J_Bip_C_Chest": (math.radians(1.2), 0.0, 0.0),
        "J_Bip_C_UpperChest": (math.radians(1.8), 0.0, 0.0),
        "J_Bip_C_Head": (math.radians(-0.8), 0.0, math.radians(0.6)),
    }
    for frame, factor in [(1, 0.0), (30, 1.0), (60, 0.0)]:
        bpy.context.scene.frame_set(frame)
        for bone_name, rot in key_bones.items():
            bone = armature.pose.bones.get(bone_name)
            if not bone:
                continue
            bone.rotation_mode = "XYZ"
            bone.rotation_euler = (rot[0] * factor, rot[1] * factor, rot[2] * factor)
            bone.keyframe_insert("rotation_euler", frame=frame)
        for bone in armature.pose.bones:
            if bone.name.startswith("HairJoint-"):
                bone.rotation_mode = "XYZ"
                bone.rotation_euler = (math.radians(0.8) * factor, 0, math.radians(0.5) * factor)
                bone.keyframe_insert("rotation_euler", frame=frame)
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 60
    bpy.context.scene.frame_set(1)
    bpy.ops.object.mode_set(mode="OBJECT")


def export_scene(filepath):
    bpy.ops.export_scene.fbx(
        filepath=str(filepath),
        use_selection=False,
        add_leaf_bones=False,
        bake_anim=True,
        bake_anim_use_all_actions=True,
        mesh_smooth_type="FACE",
        use_mesh_modifiers=True,
    )


def add_lod_modifiers(ratio, suffix):
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or len(obj.data.polygons) < 300:
            continue
        mod = obj.modifiers.get(f"OFH_V04_{suffix}_Decimate") or obj.modifiers.new(
            f"OFH_V04_{suffix}_Decimate", "DECIMATE"
        )
        mod.ratio = ratio
        mod.use_collapse_triangulate = True


def remove_lod_modifiers():
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for mod in list(obj.modifiers):
            if mod.name.startswith("OFH_V04_LOD") and mod.type == "DECIMATE":
                obj.modifiers.remove(mod)


def render_preview():
    bpy.context.scene.render.engine = "BLENDER_EEVEE"
    if hasattr(bpy.context.scene, "eevee"):
        bpy.context.scene.eevee.taa_render_samples = 96
    bpy.context.scene.render.resolution_x = 1500
    bpy.context.scene.render.resolution_y = 2200
    bpy.context.scene.render.filepath = str(OUT_PREVIEW)
    bpy.ops.render.render(write_still=True)


def main():
    ensure_dirs()
    if not IN_BLEND.exists():
        raise RuntimeError(f"Missing v03 blend: {IN_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=str(IN_BLEND))
    mats = build_v04_materials()
    setup_eye_materials(mats)
    assign_v04_materials(mats)
    mature_silhouette_pass()
    mature_head_ratio_pass()
    add_white_hair_cap(mats)
    add_eye_overlays(mats)
    cleanup_mesh_normals()
    add_clothing_binding()
    create_idle_action()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
    bpy.ops.export_scene.gltf(filepath=str(OUT_GLB), export_format="GLB", use_selection=False)
    export_scene(OUT_FBX)
    remove_lod_modifiers()
    add_lod_modifiers(0.55, "LOD1")
    export_scene(OUT_FBX_LOD1)
    remove_lod_modifiers()
    add_lod_modifiers(0.28, "LOD2")
    export_scene(OUT_FBX_LOD2)
    remove_lod_modifiers()
    render_preview()
    print(f"BLEND={OUT_BLEND}")
    print(f"FBX={OUT_FBX}")
    print(f"FBX_LOD1={OUT_FBX_LOD1}")
    print(f"FBX_LOD2={OUT_FBX_LOD2}")
    print(f"GLB={OUT_GLB}")
    print(f"PREVIEW={OUT_PREVIEW}")
    print(f"TEXTURES={TEX_DIR}")


if __name__ == "__main__":
    main()
