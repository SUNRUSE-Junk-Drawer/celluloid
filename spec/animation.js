describe("animation", () => {
  describe("parseKeyframe", () => {
    describe("constant", () => {
      let parser, result
      setup(() => {
        parser = {
          dataView: new DataView(new Uint8Array([
            131, 127, 117,
            70, 233, 50, 64,
            0,
            31, 116, 118, 68,
            86, 26, 221, 42
          ]).buffer),
          position: 3
        }
        result = index.__get__("parseKeyframe")(parser)
      })
      assert({
        "returns the expected startsOnSecond": () => expect(result.startsOnSecond).toBeCloseTo(2.79548788070679),
        "returns a type of constant": () => expect(result.type).toEqual("constant"),
        "returns the expected withValue": () => expect(result.withValue).toBeCloseTo(985.814392089844),
        "does not read any further into the file": () => expect(parser.position).toEqual(12)
      })
    })

    describe("linear", () => {
      let parser, result
      setup(() => {
        parser = {
          dataView: new DataView(new Uint8Array([
            131, 127, 117,
            70, 233, 50, 64,
            1,
            31, 116, 118, 68,
            86, 26, 221, 42
          ]).buffer),
          position: 3
        }
        result = index.__get__("parseKeyframe")(parser)
      })
      assert({
        "returns the expected startsOnSecond": () => expect(result.startsOnSecond).toBeCloseTo(2.79548788070679),
        "returns a type of constant": () => expect(result.type).toEqual("linear"),
        "returns the expected withValue": () => expect(result.withValue).toBeCloseTo(985.814392089844),
        "does not read any further into the file": () => expect(parser.position).toEqual(12)
      })
    })

    describe("false", () => {
      let parser, result
      setup(() => {
        parser = {
          dataView: new DataView(new Uint8Array([
            131, 127, 117,
            70, 233, 50, 64,
            2,
            86, 26, 221, 42
          ]).buffer),
          position: 3
        }
        result = index.__get__("parseKeyframe")(parser)
      })
      assert({
        "returns the expected startsOnSecond": () => expect(result.startsOnSecond).toBeCloseTo(2.79548788070679),
        "returns a type of constant": () => expect(result.type).toEqual("constant"),
        "returns the expected withValue": () => expect(result.withValue).toEqual(false),
        "does not read any further into the file": () => expect(parser.position).toEqual(8)
      })
    })

    describe("true", () => {
      let parser, result
      setup(() => {
        parser = {
          dataView: new DataView(new Uint8Array([
            131, 127, 117,
            70, 233, 50, 64,
            3,
            86, 26, 221, 42
          ]).buffer),
          position: 3
        }
        result = index.__get__("parseKeyframe")(parser)
      })
      assert({
        "returns the expected startsOnSecond": () => expect(result.startsOnSecond).toBeCloseTo(2.79548788070679),
        "returns a type of constant": () => expect(result.type).toEqual("constant"),
        "returns the expected withValue": () => expect(result.withValue).toEqual(true),
        "does not read any further into the file": () => expect(parser.position).toEqual(8)
      })
    })

    describe("unexpected type", () => {
      let parser, error
      setup(() => {
        parser = {
          dataView: new DataView(new Uint8Array([
            131, 127, 117,
            70, 233, 50, 64,
            4,
            86, 26, 221, 42
          ]).buffer),
          position: 3
        }
        try {
          result = index.__get__("parseKeyframe")(parser)
        } catch (e) {
          error = e
        }
      })
      assert({
        "it throws an error": () => expect(error).toEqual(new Error("Unexpected keyframe type 4."))
      })
    })
  })

  describe("parseAnimation", () => {
    let parseKeyframe, parseUint16, result
    setup(() => {
      parseUint16 = jasmine.createSpy("parseUint16")
      parseUint16.and.returnValue(4)
      index.__set__("parseUint16", parseUint16)
      parseKeyframe = jasmine.createSpy("parseKeyframe")
      const keyframes = [
        "Test Keyframe A",
        "Test Keyframe B",
        "Test Keyframe C",
        "Test Keyframe D",
        "Test Keyframe E"
      ]
      parseKeyframe.and.callFake(() => keyframes.shift())
      index.__set__("parseKeyframe", parseKeyframe)
      result = index.__get__("parseAnimation")("Test Parser")
    })
    assert({
      "parses one uint16": () => expect(parseUint16).toHaveBeenCalledTimes(1),
      "parses the uint16 using the given parser": () => expect(parseUint16).toHaveBeenCalledWith("Test Parser"),
      "parses the keyframes": () => expect(parseKeyframe).toHaveBeenCalledTimes(4),
      "always parses the keyframe using the given parser": () => expect(parseKeyframe.calls.allArgs()).toEqual([
        ["Test Parser"],
        ["Test Parser"],
        ["Test Parser"],
        ["Test Parser"]
      ]),
      "returns the parsed keyframes in order": () => expect(result).toEqual([
        "Test Keyframe A",
        "Test Keyframe B",
        "Test Keyframe C",
        "Test Keyframe D"
      ])
    })
  })
})
