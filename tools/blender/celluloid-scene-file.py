bl_info = {
  "name": "Celluloid Scene File",
  "category": "Import-Export"
}

import bpy, bpy_extras, json, bmesh, struct, math

def initialize_material(material):
  material.diffuse_shader = "TOON"
  material.diffuse_toon_size = math.pi
  material.diffuse_toon_smooth = 0
  material.specular_intensity = 0

def initialize_lamp(lamp):
  lamp.data.type = "SPOT"
  initialize_lamp_data(lamp.data)

def initialize_lamp_data(lamp_data):
  lamp_data.use_square = True
  lamp_data.spot_blend = 0
  lamp_data.falloff_type = "CONSTANT"
  lamp_data.use_specular = False
  lamp_data.shadow_method = "BUFFER_SHADOW"
  lamp_data.shadow_buffer_type = "REGULAR"
  lamp_data.shadow_buffer_samples = 1
  lamp_data.distance = 99999

def initialize_camera_data(camera_data):
  camera_data.show_limits = True
  camera_data.lens_unit = "FOV"

class CelluloidPanel(bpy.types.Panel):
  bl_idname = "OBJECT_PT_celluloid"
  bl_label = "Celluloid"
  bl_space_type = "VIEW_3D"
  bl_region_type = "TOOLS"
  bl_category = "Tools"

  def draw(self, context):
    self.layout.operator("celluloid.setup_scene", text="Setup Scene")
    self.layout.operator("celluloid.lamp_add", text="Add Lamp")
    self.layout.operator("celluloid.camera_add", text="Add Camera")
    self.layout.operator("import.celluloidscenefile", text="Import")
    self.layout.operator("export.celluloidscenefile", text="Export")

class SetupCelluloidScene(bpy.types.Operator):
  """Configure a new scene for Celluloid"""
  bl_idname = "celluloid.setup_scene"
  bl_label = "Setup Celluloid Scene"

  def execute(self, context):
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1
    bpy.context.scene.render.use_edge_enhance = True
    bpy.context.space_data.show_backface_culling = True;
    for material in bpy.data.materials:
        initialize_material(material)
    for object in bpy.context.scene.objects:
      if object.type == "LAMP" and object.name != "ambientLight":
        initialize_lamp(object)
      elif object.type == "CAMERA":
        initialize_camera_data(object.data)

    if "ambientLight" not in bpy.context.scene.objects:
      ambient_light_data = bpy.data.lamps.new(name="ambientLight", type="SUN")
      ambient_light_data.energy = 0
      ambient_light_data.animation_data_create()
      ambient_light_data.animation_data.action = bpy.data.actions.new(name="")
      ambient_light = bpy.data.objects.new("ambientLight", ambient_light_data)
      ambient_light.rotation_euler[0] = 1
      ambient_light.rotation_euler[1] = 1
      ambient_light.rotation_euler[2] = 1
      bpy.context.scene.objects.link(ambient_light)

    return {"FINISHED"}

class AddCelluloidLamp(bpy.types.Operator):
  """Create a new Lamp which is set up for Celluloid"""
  bl_idname = "celluloid.lamp_add"
  bl_label = "Add Celluloid Lamp"

  def execute(self, context):
    bpy.ops.object.lamp_add(type="SPOT")
    initialize_lamp_data(bpy.context.selected_objects[0].data)
    return {"FINISHED"}

class AddCelluloidCamera(bpy.types.Operator):
  """Create a new Camera which is set up for Celluloid"""
  bl_idname = "celluloid.camera_add"
  bl_label = "Add Celluloid Camera"

  def execute(self, context):
    bpy.ops.object.camera_add()
    initialize_camera_data(bpy.context.selected_objects[0].data)
    return {"FINISHED"}

def import_menu_func(self, context):
  self.layout.operator(ImportCelluloidSceneFile.bl_idname)

class ImportCelluloidSceneFile(bpy.types.Operator, bpy_extras.io_utils.ImportHelper):
  """Import Celluloid Scene File"""
  bl_idname = "import.celluloidscenefile"
  bl_label = "Import Celluloid Scene File (*.json)"

  filename_ext = ".json"

  def execute(self, context):
    file = open(self.properties.filepath, "r")
    json_string = file.read()
    file.close()
    json_object = json.loads(json_string)

    if "celluloidScene" not in json_object:
      self.report({"ERROR"}, "This file does not appear to be a Celluloid scene.")
      return {"FINISHED"}

    json_object = json_object["celluloidScene"]

    bpy.context.scene.render.fps = json_object["framesPerSecond"]["numerator"]
    bpy.context.scene.render.fps_base = json_object["framesPerSecond"]["denominator"]
    bpy.ops.celluloid.setup_scene()

    def read_animation(keyframes, object, property_name):
      if not isinstance(keyframes[0], list): keyframes = [keyframes]

      first_keyframe_values = []
      for axis_index, axis in enumerate(keyframes):
        if axis[0]["type"] == "constant" or axis[0]["type"] == "linear":
          first_keyframe_values.append(axis[0]["withValue"])
        elif axis[0]["type"] == "false":
          first_keyframe_values.append(0)
        elif axis[0]["type"] == "true":
          first_keyframe_values.append(1)

        if len(axis) == 1: continue

        fcurve = object.animation_data.action.fcurves.new(property_name, axis_index)

        for keyframe in axis:
          if keyframe["type"] == "constant":
            created = fcurve.keyframe_points.insert(keyframe["startsOnFrame"], keyframe["withValue"])
            created.interpolation = "CONSTANT"
          elif keyframe["type"] == "linear":
            created = fcurve.keyframe_points.insert(keyframe["startsOnFrame"], keyframe["withValue"])
            created.interpolation = "LINEAR"
          elif keyframe["type"] == "false":
            created = fcurve.keyframe_points.insert(keyframe["startsOnFrame"], 0)
            created.interpolation = "CONSTANT"
          elif keyframe["type"] == "true":
            created = fcurve.keyframe_points.insert(keyframe["startsOnFrame"], 1)
            created.interpolation = "CONSTANT"

      setattr(object, property_name, first_keyframe_values if len(first_keyframe_values) > 1 else first_keyframe_values[0])

    ambient_light = bpy.context.scene.objects["ambientLight"]
    read_animation(json_object["ambientLight"]["color"], ambient_light.data, "color")
    read_animation(json_object["ambientLight"]["energy"], ambient_light.data, "energy")

    data = {
      "material": {},
      "mesh": {},
      "lamp": {},
      "camera": {},
      "sceneNode": {}
    }

    for material_name, material in json_object["data"]["material"].items():
      created = bpy.data.materials.new(name=material_name)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")

      read_animation(material["diffuseColor"], created, "diffuse_color")
      read_animation(material["diffuseIntensity"], created, "diffuse_intensity")
      read_animation(material["emit"], created, "emit")
      created.use_cast_shadows = material["useCastShadows"]
      created.use_cast_shadows_only = material["useCastShadowsOnly"]
      initialize_material(created)

      data["material"][material_name] = created

    for mesh_name, mesh in json_object["data"]["mesh"].items():
      bm = bmesh.new()
      for index, location in enumerate(mesh["locations"]): bm.verts.new(location)
      bm.verts.ensure_lookup_table()

      ordered_materials = []
      for polygon in mesh["polygons"]:
        if polygon["material"] not in ordered_materials: ordered_materials.append(polygon["material"])
        vertices = []
        for vertex in polygon["indices"]:
          vertices.append(bm.verts[vertex])
        face = bm.faces.new(vertices)
        face.material_index = ordered_materials.index(polygon["material"])

      mesh = bpy.data.meshes.new(mesh_name)
      for material_name in ordered_materials: mesh.materials.append(data["material"][material_name])

      bm.to_mesh(mesh)
      data["mesh"][mesh_name] = mesh

    for lamp_name, lamp in json_object["data"]["lamp"].items():
      created = bpy.data.lamps.new(name=lamp_name, type="SPOT")
      initialize_lamp_data(created)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")
      read_animation(lamp["color"], created, "color")
      read_animation(lamp["energy"], created, "energy")
      read_animation(lamp["spotSize"], created, "spot_size")
      created.shadow_buffer_size = lamp["shadowBufferSize"]
      read_animation(lamp["shadowBufferClipStart"], created, "shadow_buffer_clip_start")
      read_animation(lamp["shadowBufferClipEnd"], created, "shadow_buffer_clip_end")
      data["lamp"][lamp_name] = created

    for camera_name, camera in json_object["data"]["camera"].items():
      created = bpy.data.cameras.new(name=camera_name)
      initialize_camera_data(created)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")
      read_animation(camera["clipStart"], created, "clip_start")
      read_animation(camera["clipEnd"], created, "clip_end")
      read_animation(camera["angle"], created, "angle")
      data["camera"][camera_name] = created

    def recurse(parent_name, parent):
      for object_name, object in json_object["data"]["sceneNode"].items():
        if object["parent"] != parent_name: continue
        created = bpy.data.objects.new(object_name, data[object["type"]][object["data"]] if object["type"] != None else None)
        created.animation_data_create()
        created.animation_data.action = bpy.data.actions.new(name="")
        bpy.context.scene.objects.link(created)
        if parent_name != None: created.parent = parent
        read_animation(object["location"], created, "location")
        read_animation(object["rotation"], created, "rotation_euler")
        read_animation(object["scale"], created, "scale")
        read_animation(object["hide"], created, "hide")
        read_animation(object["hideRender"], created, "hide_render")
        data["sceneNode"][object_name] = created
        recurse(object_name, created)

    recurse(None, None)

    # TODO: Set keyframe to apply animations

    return {"FINISHED"}

def export_menu_func(self, context):
  self.layout.operator(ExportCelluloidSceneFile.bl_idname)

class ExportCelluloidSceneFile(bpy.types.Operator, bpy_extras.io_utils.ExportHelper):
  """Export Celluloid Scene File"""
  bl_idname = "export.celluloidscenefile"
  bl_label = "Export Celluloid Scene File (*.json)"

  filename_ext = ".json"

  def execute(self, context):
    def write_animation(object, data_object, property_name, axes, is_boolean):
      fallback = getattr(data_object, property_name)
      if axes == 1: fallback = [fallback]

      output = []
      for axis in range(0, axes):
        found = False

        if data_object.animation_data and data_object.animation_data.action and data_object.animation_data.action.fcurves:
          for curve in data_object.animation_data.action.fcurves:
            if curve.data_path != property_name: continue
            if curve.array_index != axis: continue
            curve.update()
            if (curve.extrapolation != "CONSTANT"):
              self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected extrapolation type \"" + curve.extrapolation + "\".")
              return False

            keyframes = []
            for keyframe in curve.keyframe_points:
              value = keyframe.co[1]
              exported = {
                "startsOnFrame": keyframe.co[0]
              }
              if is_boolean:
                if keyframe.interpolation != "CONSTANT":
                  self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected interpolation type \"" + keyframe.interpolation + "\".")
                  return False
                exported["type"] = "true" if value != 0 else "false"
              else:
                if keyframe.interpolation == "CONSTANT": exported["type"] = "constant"
                elif keyframe.interpolation == "LINEAR": exported["type"] = "linear"
                else:
                  self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected interpolation type \"" + keyframe.interpolation + "\".")
                  return False
                exported["withValue"] = value
              keyframes.append(exported)

            output.append(keyframes)

            found = True
            break

        if not found:
          if is_boolean:
            output.append([{
              "type": "true" if fallback[axis] else "false",
              "startsOnFrame": 0
            }])
          else:
            output.append([{
              "type": "constant",
              "startsOnFrame": 0,
              "withValue": fallback[axis]
            }])

      return output if axes > 1 else output[0]

    bpy.ops.celluloid.setup_scene()

    ambient_light = bpy.context.scene.objects["ambientLight"]

    json_object = {
      "framesPerSecond": {
        "numerator": bpy.context.scene.render.fps,
        "denominator": bpy.context.scene.render.fps_base
      },
      "ambientLight": {
        "color": write_animation(ambient_light, ambient_light.data, "color", 3, False),
        "energy": write_animation(ambient_light, ambient_light.data, "energy", 1, False)
      },
      "data": {
        "material": {},
        "mesh": {},
        "lamp": {},
        "camera": {},
        "sceneNode": {}
      }
    }

    if not json_object["ambientLight"]["color"]: return {"FINISHED"}
    if not json_object["ambientLight"]["energy"]: return {"FINISHED"}

    for object in bpy.context.scene.objects:
      if object.name == "ambientLight": continue

      is_identity = True
      for row_index, row in enumerate(object.matrix_parent_inverse):
        for column_index, column in enumerate(row):
          expected = 0
          if row_index == column_index:
            expected = 1
          if (abs(column - expected) > 0.001): is_identity = False

      if not is_identity:
        original_matrix = object.matrix_world.copy()
        object.matrix_parent_inverse.identity()
        object.matrix_basis = object.parent.matrix_world.inverted() * original_matrix

      exported = {
        "parent": object.parent.name if object.parent else None,
        "location": write_animation(object, object, "location", 3, False),
        "rotation": write_animation(object, object, "rotation_euler", 3, False),
        "scale": write_animation(object, object, "scale", 3, False),
        "hide": write_animation(object, object, "hide", 1, True),
        "hideRender": write_animation(object, object, "hide_render", 1, True)
      }

      if object.type == "EMPTY":
        exported["type"] = None
        exported["data"] = None
      elif object.type == "LAMP":
        exported["type"] = "lamp"
        exported["data"] = object.data.name
        if object.data.name not in json_object["data"]["lamp"]:
          data = {
            "color": write_animation(object, object.data, "color", 3, False),
            "energy": write_animation(object, object.data, "energy", 1, False),
            "spotSize": write_animation(object, object.data, "spot_size", 1, False),
            "shadowBufferSize": object.data.shadow_buffer_size,
            "shadowBufferClipStart": write_animation(object, object.data, "shadow_buffer_clip_start", 1, False),
            "shadowBufferClipEnd": write_animation(object, object.data, "shadow_buffer_clip_end", 1, False)
          }
          if not data["energy"]: return {"FINISHED"}
          if not data["spotSize"]: return {"FINISHED"}
          if not data["shadowBufferClipStart"]: return {"FINISHED"}
          if not data["shadowBufferClipEnd"]: return {"FINISHED"}

          json_object["data"]["lamp"][object.data.name] = data
      elif object.type == "MESH":
        exported["type"] = "mesh"
        exported["data"] = object.data.name
        if object.data.name not in json_object["data"]["mesh"]:
          locations = []
          polygons = []
          for polygon in object.data.polygons:
            material = object.data.materials[polygon.material_index] if object.data.materials else None
            if material == None:
              self.report({"ERROR"}, "Object \"" + object.name + "\" contains faces without materials, which is not supported.")
              return {"FINISHED"}

            indices = []
            for index in polygon.vertices:
              location = [
                object.data.vertices[index].co[0],
                object.data.vertices[index].co[1],
                object.data.vertices[index].co[2]
              ]
              if location not in locations: locations.append(location)
              indices.append(locations.index(location))

            polygons.append({
              "material": material.name,
              "indices": indices
            })

            if material.name not in json_object["data"]["material"]:
              data = {
                "diffuseColor": write_animation(material, material, "diffuse_color", 3, False),
                "diffuseIntensity": write_animation(material, material, "diffuse_intensity", 1, False),
                "emit": write_animation(material, material, "emit", 1, False),
                "useCastShadows": material.use_cast_shadows,
                "useCastShadowsOnly": material.use_cast_shadows_only
              }

              if not data["diffuseColor"]: return {"FINISHED"}
              if not data["diffuseIntensity"]: return {"FINISHED"}
              if not data["emit"]: return {"FINISHED"}

              json_object["data"]["material"][material.name] = data

          json_object["data"]["mesh"][object.data.name] = {
            "locations": locations,
            "polygons": polygons
          }
      elif object.type == "CAMERA":
        exported["type"] = "camera"
        exported["data"] = object.data.name
        if object.data.name not in json_object["data"]["camera"]:
          data = {
            "clipStart": write_animation(object, object.data, "clip_start", 1, False),
            "clipEnd": write_animation(object, object.data, "clip_end", 1, False),
            "angle": write_animation(object, object.data, "angle", 1, False)
          }
          if not data["clipStart"]: return {"FINISHED"}
          if not data["clipEnd"]: return {"FINISHED"}
          if not data["angle"]: return {"FINISHED"}

          json_object["data"]["camera"][object.data.name] = data
      else:
        self.report({"ERROR"}, "Object \"" + object.name + "\" is a(n) \"" + object.type + "\", which is not a supported type.")
        return {"FINISHED"}

      json_object["data"]["sceneNode"][object.name] = exported

    json_object = {
      "celluloidScene": json_object
    }
    json_string = json.dumps(json_object, indent=4, sort_keys=True)

    file = open(self.properties.filepath, "w")
    file.write(json_string)
    file.close()

    return {"FINISHED"}

def register():
  bpy.utils.register_class(CelluloidPanel)
  bpy.utils.register_class(SetupCelluloidScene)
  bpy.utils.register_class(AddCelluloidLamp)
  bpy.utils.register_class(AddCelluloidCamera)
  bpy.utils.register_class(ImportCelluloidSceneFile)
  bpy.utils.register_class(ExportCelluloidSceneFile)
  bpy.types.INFO_MT_file_import.append(import_menu_func)
  bpy.types.INFO_MT_file_export.append(export_menu_func)

def unregister():
  bpy.utils.unregister_class(CelluloidPanel)
  bpy.utils.unregister_class(SetupCelluloidScene)
  bpy.utils.unregister_class(AddCelluloidLamp)
  bpy.utils.unregister_class(AddCelluloidCamera)
  bpy.utils.unregister_class(ImportCelluloidSceneFile)
  bpy.utils.unregister_class(ExportCelluloidSceneFile)
  bpy.types.INFO_MT_file_import.remove(import_menu_func)
  bpy.types.INFO_MT_file_export.remove(export_menu_func)

if __name__ == "__main__":
  register()
