# Celluloid Scene File (JSON)

A scene file is a JSON document describing a scene graph which can be rendered
using Celluloid.  It is intended to be source controllable and able to 
round-trip to Blender.

## Units

### Space

All measurements of length are in meters.

### Time

All measurements of time are in numbers of frames.

### Color

All colors are RGB unit intervals.

### Angle

All angles are in radians.

## Animations

Animations are arrays of objects defining keyframes, in order of appearance.

### Keyframes

#### Constant Number

The value specified is held until the next keyframe.

```json
{
  "type": "constant",
  "startsOnFrame": "any number",
  "withValue": "any number"
}
```

#### Linear Number

The value specified interpolates linearly to the next keyframe's value.

```json
{
  "type": "linear",
  "startsOnFrame": "any number",
  "withValue": "any number"
}
```

#### False

The value is false until the next keyframe.

```json
{
  "type": "false",
  "startsOnFrame": "any number"
}
```

#### True

The value is false until the next keyframe.

```json
{
  "type": "true",
  "startsOnFrame": "any number"
}
```

## Structure

```json
{
  "celluloidScene": {
    "framesPerSecond": {
      "numerator": "any number",
      "denominator": "any number"
    },
    "ambientLight": {
      "color": [
        "any red number animation",
        "any green number animation",
        "any blue number animation"
      ],
      "energy": "any number animation"
    },
    "data": {
      "any data type": {
        "any data name": "any data value"
      }
    }
  }
}
```

## Data Types

### Material (material)

Describes a material which is applicable to polygons of meshes.

```json
{
	"diffuseColor": [
		"any red number animation",
		"any green number animation",
		"any blue number animation"
	],
	"diffuseIntensity": "any number animation",
	"emit": "any number animation",
	"useCastShadows": "any boolean",
	"useCastShadowsOnly": "any boolean"
}
```

### Mesh (mesh)

Describes a "polygon soup".

```json
{
	"locations": [
		["x number", "y number", "z number"],
		["x number", "y number", "z number"],
		["x number", "y number", "z number"]
	],
	"polygons": "any array of polygons"
}
```

#### Polygon

```json
{
	"material": "any key of celluloidScene.data.material",
	"indices": "any array of numeric indices into the locations array"
}
```

#### Lamp (lamp)

```json
{
	"color": [
		"any red number animation",
		"any green number animation",
		"any blue number animation"
	],
	"energy": "any number animation",
	"spotSize": "any angle number animation",
	"shadowBufferSize": "any number",
	"shadowBufferClipStart": "any number animation",
	"shadowBufferClipEnd": "any number animation"
}
```

#### Camera (Camera)

```json
{
	"clipStart": "any number animation",
	"clipEnd": "any number animation",
	"angle": "any number animation"
}
```

#### Scene Node (sceneNode)

```json
{
	"parent": "any key of celluloidScene.data.sceneNode, or null if none",
	"type": "any key of celluloidScene.data, or null if empty",
  "data": "any key of celluloidScene.data[type], or null if empty",
  "location": [
		"any x number animation",
		"any y number animation",
		"any z number animation"
	], 
	"rotation": [
		"any x number animation",
		"any y number animation",
		"any z number animation"
	],
  "scale": [
		"any x number animation",
		"any y number animation",
		"any z number animation"
	],
	"hide": "any boolean animation",
	"hideRender": "any boolean animation"
}
```