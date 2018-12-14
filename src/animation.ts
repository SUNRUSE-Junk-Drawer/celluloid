type constantKeyframe<T> = {
  readonly startsOnSecond: number
  readonly type: "constant"
  readonly withValue: T
}

type linearKeyframe<T> = {
  readonly startsOnSecond: number
  readonly type: "linear"
  readonly withValue: T
}

type keyframe =
  | constantKeyframe<number>
  | linearKeyframe<number>
  | constantKeyframe<boolean>

function parseKeyframe(parser: parser): keyframe {
  const startsOnSecond = parseFloat32(parser)
  const type = parseUint8(parser)
  switch (type) {
    case 0:
      return {
        startsOnSecond,
        type: "constant",
        withValue: parseFloat32(parser)
      }

    case 1:
      return {
        startsOnSecond,
        type: "linear",
        withValue: parseFloat32(parser)
      }

    case 2:
      return {
        startsOnSecond,
        type: "constant",
        withValue: false
      }

    case 3:
      return {
        startsOnSecond,
        type: "constant",
        withValue: true
      }

    default:
      throw new Error(`Unexpected keyframe type ${type}.`)
  }
}

function parseAnimation(parser: parser): keyframe[] {
  const numberOfKeyframes = parseUint16(parser)
  const output: keyframe[] = []
  while (output.length < numberOfKeyframes) output.push(parseKeyframe(parser))
  return output
}
