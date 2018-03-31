function parseKeyframe(parser) {
  const keyframe = {
    startsOnSecond: parseFloat32(parser)
  }

  switch (parseUint8(parser)) {
    case 0: {
      keyframe.type = "constant"
      keyframe.withValue = parseFloat32(parser)
    } break

    case 1: {
      keyframe.type = "linear"
      keyframe.withValue = parseFloat32(parser)
    } break

    case 2: {
      keyframe.type = "constant"
      keyframe.withValue = false
    } break

    case 3: {
      keyframe.type = "constant"
      keyframe.withValue = true
    } break
  }

  return keyframe
}

function parseAnimation(parser) {
  const numberOfKeyframes = parseUint16(parser)
  const output = []
  while (output.length < numberOfKeyframes) output.push(parseKeyframe(parser))
  return output
}