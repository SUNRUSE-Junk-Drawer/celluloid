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

class CelluloidPanel(bpy.types.Panel):
  bl_idname = "OBJECT_PT_celluloid"
  bl_label = "Celluloid"
  bl_space_type = "VIEW_3D"
  bl_region_type = "TOOLS"
  bl_category = "Tools"

  def draw(self, context):
    self.layout.operator("celluloid.setup_scene", text="Setup Scene")
    self.layout.operator("celluloid.lamp_add", text="Add Lamp")

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

    if "ambient_light" not in bpy.context.scene.objects:
      ambient_light_data = bpy.data.lamps.new(name="ambientLight", type="SUN")
      ambient_light_data.energy = 0
      ambient_light = bpy.data.objects.new("ambientLight", ambient_light_data)
      ambient_light.animation_data_create()
      ambient_light.animation_data.action = bpy.data.actions.new(name="")
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

def register():
  bpy.utils.register_class(CelluloidPanel)
  bpy.utils.register_class(SetupCelluloidScene)
  bpy.utils.register_class(AddCelluloidLamp)

def unregister():
  bpy.utils.unregister_class(CelluloidPanel)
  bpy.utils.unregister_class(SetupCelluloidScene)
  bpy.utils.unregister_class(AddCelluloidLamp)

if __name__ == "__main__":
  register()