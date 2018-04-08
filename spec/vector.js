describe("vector", () => {
  const glMatrix = require("gl-matrix")

  describe("createVector", () => assert({
    "returns a new vector each call": () => expect(index.__get__("createVector")()).not.toBe(index.__get__("createVector")()),
    "returns a zero vector x": () => expect(index.__get__("createVector")()[0]).toEqual(0),
    "returns a zero vector y": () => expect(index.__get__("createVector")()[1]).toEqual(0),
    "returns a zero vector z": () => expect(index.__get__("createVector")()[2]).toEqual(0)
  }))

  const expectedVector = glMatrix.vec3.create()
  let actualVector
  setup(() => {
    actualVector = index.__get__("createVector")()
    expectedVector[0] = actualVector[0] = -0.43
    expectedVector[1] = actualVector[1] = 2.50
    expectedVector[2] = actualVector[2] = -2.34
  })

  describe("createMatrix", () => {
    setup(() => index.__get__("applyMatrixToVector")(actualVector, index.__get__("createMatrix")()))
    assert({
      "returns a new matrix each call": () => expect(index.__get__("createMatrix")()).not.toBe(index.__get__("createMatrix")()),
      "returns a matrix which has no effect on vectors x": () => expect(actualVector[0]).toBeCloseTo(-0.43),
      "returns a matrix which has no effect on vectors y": () => expect(actualVector[1]).toBeCloseTo(2.50),
      "returns a matrix which has no effect on vectors z": () => expect(actualVector[2]).toBeCloseTo(-2.34)
    })
  })

  describe("copyMatrix", () => {
    let from, to
    setup(() => {
      from = index.__get__("createMatrix")()
      from[0] = -2.50
      from[1] = -1.90
      from[2] = -0.28
      from[3] = -3.00
      from[4] = 0.59
      from[5] = 1.74
      from[6] = 0.43
      from[7] = -1.13
      from[8] = 0.55
      from[9] = -2.29
      from[10] = -0.97
      from[11] = 2.96
      from[12] = -1.28
      from[13] = -2.65
      from[14] = 1.55
      from[15] = -1.32

      to = index.__get__("createMatrix")()
      to[0] = -0.92
      to[1] = -0.70
      to[2] = 0.33
      to[3] = -1.03
      to[4] = -1.25
      to[5] = 0.37
      to[6] = 1.27
      to[7] = 2.93
      to[8] = -1.28
      to[9] = 0.87
      to[10] = -0.15
      to[11] = 0.01
      to[12] = 0.08
      to[13] = -0.67
      to[14] = -2.74
      to[15] = 0.85

      index.__get__("copyMatrix")(from, to)
    })

    assert({
      "does not modify the matrix copied from": () => {
        expect(from[0]).toBeCloseTo(-2.50)
        expect(from[1]).toBeCloseTo(-1.90)
        expect(from[2]).toBeCloseTo(-0.28)
        expect(from[3]).toBeCloseTo(-3.00)
        expect(from[4]).toBeCloseTo(0.59)
        expect(from[5]).toBeCloseTo(1.74)
        expect(from[6]).toBeCloseTo(0.43)
        expect(from[7]).toBeCloseTo(-1.13)
        expect(from[8]).toBeCloseTo(0.55)
        expect(from[9]).toBeCloseTo(-2.29)
        expect(from[10]).toBeCloseTo(-0.97)
        expect(from[11]).toBeCloseTo(2.96)
        expect(from[12]).toBeCloseTo(-1.28)
        expect(from[13]).toBeCloseTo(-2.65)
        expect(from[14]).toBeCloseTo(1.55)
        expect(from[15]).toBeCloseTo(-1.32)
      },
      "replaces the contents of the matrix copied to with those of the matrix copied from": () => {
        expect(to[0]).toBeCloseTo(-2.50)
        expect(to[1]).toBeCloseTo(-1.90)
        expect(to[2]).toBeCloseTo(-0.28)
        expect(to[3]).toBeCloseTo(-3.00)
        expect(to[4]).toBeCloseTo(0.59)
        expect(to[5]).toBeCloseTo(1.74)
        expect(to[6]).toBeCloseTo(0.43)
        expect(to[7]).toBeCloseTo(-1.13)
        expect(to[8]).toBeCloseTo(0.55)
        expect(to[9]).toBeCloseTo(-2.29)
        expect(to[10]).toBeCloseTo(-0.97)
        expect(to[11]).toBeCloseTo(2.96)
        expect(to[12]).toBeCloseTo(-1.28)
        expect(to[13]).toBeCloseTo(-2.65)
        expect(to[14]).toBeCloseTo(1.55)
        expect(to[15]).toBeCloseTo(-1.32)
      }
    })
  })

  const expectedMatrix = glMatrix.mat4.create()
  let actualMatrix
  setup(() => {
    actualMatrix = index.__get__("createMatrix")()
    expectedMatrix[0] = actualMatrix[0] = -2.50
    expectedMatrix[1] = actualMatrix[1] = -1.90
    expectedMatrix[2] = actualMatrix[2] = -0.28
    expectedMatrix[3] = actualMatrix[3] = -3.00
    expectedMatrix[4] = actualMatrix[4] = 0.59
    expectedMatrix[5] = actualMatrix[5] = 1.74
    expectedMatrix[6] = actualMatrix[6] = 0.43
    expectedMatrix[7] = actualMatrix[7] = -1.13
    expectedMatrix[8] = actualMatrix[8] = 0.55
    expectedMatrix[9] = actualMatrix[9] = -2.29
    expectedMatrix[10] = actualMatrix[10] = -0.97
    expectedMatrix[11] = actualMatrix[11] = 2.96
    expectedMatrix[12] = actualMatrix[12] = -1.28
    expectedMatrix[13] = actualMatrix[13] = -2.65
    expectedMatrix[14] = actualMatrix[14] = 1.55
    expectedMatrix[15] = actualMatrix[15] = -1.32
  })

  describe("applyMatrixToVector", () => {
    setup(() => {
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "does not modify the given matrix": () => expect(actualMatrix).toEqual(expectedMatrix),
      "modifies the given vector to apply the transformation x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given vector to apply the transformation y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given vector to apply the transformation z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("identityMatrix", () => {
    setup(() => {
      index.__get__("identityMatrix")(actualMatrix)
      glMatrix.mat4.identity(expectedMatrix)
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to have no effect on vectors x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to have no effect on vectors y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to have no effect on vectors z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("translateMatrixOnX", () => {
    setup(() => {
      index.__get__("translateMatrixOnX")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.93, 0, 0]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local translation on the X axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local translation on the X axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local translation on the X axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("translateMatrixOnY", () => {
    setup(() => {
      index.__get__("translateMatrixOnY")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.93, 0]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local translation on the Y axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local translation on the Y axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local translation on the Y axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("translateMatrixOnZ", () => {
    setup(() => {
      index.__get__("translateMatrixOnZ")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 0.93]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local translation on the Z axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local translation on the Z axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local translation on the Z axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("rotateMatrixAroundX", () => {
    setup(() => {
      index.__get__("rotateMatrixAroundX")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), 0.93))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local rotation around the X axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local rotation around the X axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local rotation around the X axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("rotateMatrixAroundY", () => {
    setup(() => {
      index.__get__("rotateMatrixAroundY")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), 0.93))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local rotation around the Y axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local rotation around the Y axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local rotation around the Y axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("rotateMatrixAroundZ", () => {
    setup(() => {
      index.__get__("rotateMatrixAroundZ")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), 0.93))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local rotation around the Z axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local rotation around the Z axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local rotation around the Z axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("scaleMatrixOnX", () => {
    setup(() => {
      index.__get__("scaleMatrixOnX")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.93, 1, 1]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local scaling on the X axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local scaling on the X axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local scaling on the X axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("scaleMatrixOnY", () => {
    setup(() => {
      index.__get__("scaleMatrixOnY")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [1, 0.93, 1]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local scaling on the Y axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local scaling on the Y axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local scaling on the Y axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("scaleMatrixOnZ", () => {
    setup(() => {
      index.__get__("scaleMatrixOnZ")(actualMatrix, 0.93)
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [1, 1, 0.93]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
    })
    assert({
      "modifies the given matrix to perform a local scaling on the Z axis x": () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]),
      "modifies the given matrix to perform a local scaling on the Z axis y": () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]),
      "modifies the given matrix to perform a local scaling on the Z axis z": () => expect(actualVector[2]).toBeCloseTo(expectedVector[2])
    })
  })

  describe("perspectiveMatrix", () => {
    const corner = (description, inputX, inputY, inputZ, expectedX, expectedY, expectedZ) => describe(`modifies the given matrix to contain a perspective projection ${description}`, () => {
      setup(() => {
        index.__get__("perspectiveMatrix")(actualMatrix, 0.4, 2.4, 3.7, 4.47, 16.87)
        actualVector[0] = inputX
        actualVector[1] = inputY
        actualVector[2] = inputZ
        index.__get__("applyMatrixToVector")(actualVector, actualMatrix)
      })
      assert({
        "x": () => expect(actualVector[0]).toBeCloseTo(expectedX),
        "y": () => expect(actualVector[1]).toBeCloseTo(expectedY),
        "z": () => expect(actualVector[2]).toBeCloseTo(expectedZ)
      })
    })
    corner("near bottom left", -2.17467, -3.35262, 4.47, -1, -1, -1)
    corner("near bottom right", 2.17467, -3.35262, 4.47, 1, -1, -1)
    corner("near top left", -2.17467, 3.35262, 4.47, -1, 1, -1)
    corner("near top right", 2.17467, 3.35262, 4.47, 1, 1, -1)
    corner("far bottom left", -8.20733, -12.653, 16.87, -1, -1, 1)
    corner("far bottom right", 8.20733, -12.653, 16.87, 1, -1, 1)
    corner("far top left", -8.20733, 12.653, 16.87, -1, 1, 1)
    corner("far top right", 8.20733, 12.653, 16.87, 1, 1, 1)
  })
})