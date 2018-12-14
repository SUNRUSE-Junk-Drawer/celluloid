# Celluloid Scene File (BIN)

This format is a packed binary representation of the equivalent JSON format.

## Animations

- A uint16 specifying how many keyframes there are.

For each keyframe, in order of appearance:

### Keyframe

- A float32 specifying the number of seconds between the start of the file and
  the keyframe.
- A uint8 indicating the type of keyframe.

#### 0 - Constant Number

- A float32 specifying the value on the keyframe.

#### 1 - Linear Number

- A float32 specifying the value on the keyframe.

#### 2 - False

There is no further information.

#### 3 - True

There is no further animation.

## Structure

- Three animations specifying the red, green and blue color of the ambient
  light.
- An animation specifying the energy of the ambient light.

For each data type, in the order defined below:

- A uint16 specifying how many items there are of that type.

For each item:

- A zero-terminated UTF8 string specifying its name.
- Type-specific data on the item itself (see below).

## Data Types

### 0 - Material

- Three animations specifying the red, green and blue diffuse color.
- An animation specifying the diffuse intensity.
- An animation specifying the emissive intensity.
- A uint8 containing flags:

- 1 - Visible (will still cast shadows if not set).
- 2 - Cast shadows.

### 1 - Mesh

- A uint16 specifying how many locations there are.

For each location:
- Three float32s specifying the X, Y and Z coordinates of the location.

- A uint8 specifying how many materials there are.

For each material:

- A uint16 specifying which material data object to use.
- A uint16 specifyihg how many triangles there are.

For each triangle:

- Three uint16s specifying the location indices of the triangle.

### 2 - Lamp

- Three animations specifying the red, green and blue color.
- An animation specifying the energy.
- An animation specifying the spot size.
- A uint16 specifying the shadow buffer size.
- An animation specifying the shadow buffer clip start.
- An animation specifying the shadow buffer clip end.

### 3 - Camera

- An animation specifying the clip start.
- An animation specifying the clip end.
- An animation specifying the angle (field of view).

### 4 - Scene Node

These are pre-sorted so that parents appear before children.

- A uint16 specifying the parent scene node, if any, else, 65535.
- A uint8 specifying the data type, if any, else, 255.
- If a data type was set, a uint16 specifying the data item.
- Three animations specifying the location on X, Y and Z.
- Three animations specifying the scale on X, Y and Z.
- Three animations specifying the rotation on X, Y and Z.
- A animation specifying whether to hide the mesh and any child scene nodes.
