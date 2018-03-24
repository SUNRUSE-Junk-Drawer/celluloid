const index = require("rewire")("../dist/index.js")
const glMatrix = require("gl-matrix")

const createVector = index.__get__("createVector")
const applyMatrixToVector = index.__get__("applyMatrixToVector")

describe("createVector", () => {
  it("returns a new vector each call", () => expect(createVector()).not.toBe(createVector()))
  describe("returns a zero vector", () => {
    it("x", () => expect(createVector()[0]).toEqual(0))
    it("y", () => expect(createVector()[1]).toEqual(0))
    it("z", () => expect(createVector()[2]).toEqual(0))
  })
})

const createMatrix = index.__get__("createMatrix")
const copyMatrix = index.__get__("copyMatrix")
const identityMatrix = index.__get__("identityMatrix")
const translateMatrixOnX = index.__get__("translateMatrixOnX")
const translateMatrixOnY = index.__get__("translateMatrixOnY")
const translateMatrixOnZ = index.__get__("translateMatrixOnZ")
const rotateMatrixAroundX = index.__get__("rotateMatrixAroundX")
const rotateMatrixAroundY = index.__get__("rotateMatrixAroundY")
const rotateMatrixAroundZ = index.__get__("rotateMatrixAroundZ")
const scaleMatrixOnX = index.__get__("scaleMatrixOnX")
const scaleMatrixOnY = index.__get__("scaleMatrixOnY")
const scaleMatrixOnZ = index.__get__("scaleMatrixOnZ")
const perspectiveMatrix = index.__get__("perspectiveMatrix")

const expectedVector = glMatrix.vec3.create()
const actualVector = createVector()
beforeEach(() => {
  expectedVector[0] = actualVector[0] = -0.43
  expectedVector[1] = actualVector[1] = 2.50
  expectedVector[2] = actualVector[2] = -2.34
})

describe("createMatrix", () => {
  it("returns a new matrix each call", () => expect(createMatrix()).not.toBe(createMatrix()))
  describe("returns a matrix which has no effect on vectors", () => {
    beforeEach(() => applyMatrixToVector(actualVector, createMatrix()))
    it("x", () => expect(actualVector[0]).toBeCloseTo(-0.43))
    it("y", () => expect(actualVector[1]).toBeCloseTo(2.50))
    it("z", () => expect(actualVector[2]).toBeCloseTo(-2.34))
  })
})

describe("copyMatrix", () => {
  let from, to
  beforeEach(() => {
    from = createMatrix()
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

    to = createMatrix()
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

    copyMatrix(from, to)
  })

  it("does not modify the matrix copied from", () => {
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
  })

  it("replaces the contents of the matrix copied to with those of the matrix copied from", () => {
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
  })
})

const expectedMatrix = glMatrix.mat4.create()
const actualMatrix = createMatrix()
beforeEach(() => {
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
  beforeEach(() => applyMatrixToVector(actualVector, actualMatrix))
  it("does not modify the given matrix", () => {
    expect(actualMatrix).toEqual(expectedMatrix)
  })
  describe("modifies the given vector to apply the transformation", () => {
    beforeEach(() => glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix))
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("identityMatrix", () => {
  beforeEach(() => identityMatrix(actualMatrix))
  describe("modifies the given matrix to have no effect on vectors", () => {
    beforeEach(() => {
      glMatrix.mat4.identity(expectedMatrix)
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("translateMatrixOnX", () => {
  beforeEach(() => translateMatrixOnX(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local translation on the X axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.93, 0, 0]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("translateMatrixOnY", () => {
  beforeEach(() => translateMatrixOnY(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local translation on the Y axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.93, 0]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("translateMatrixOnZ", () => {
  beforeEach(() => translateMatrixOnZ(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local translation on the Z axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 0.93]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("rotateMatrixAroundX", () => {
  beforeEach(() => rotateMatrixAroundX(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local rotation around the X axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), 0.93))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("rotateMatrixAroundY", () => {
  beforeEach(() => rotateMatrixAroundY(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local rotation around the Y axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), 0.93))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("rotateMatrixAroundZ", () => {
  beforeEach(() => rotateMatrixAroundZ(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local rotation around the Z axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromZRotation(glMatrix.mat4.create(), 0.93))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("scaleMatrixOnX", () => {
  beforeEach(() => scaleMatrixOnX(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local scaling on the X axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.93, 1, 1]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("scaleMatrixOnY", () => {
  beforeEach(() => scaleMatrixOnY(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local scaling on the Y axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [1, 0.93, 1]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("scaleMatrixOnZ", () => {
  beforeEach(() => scaleMatrixOnZ(actualMatrix, 0.93))
  describe("modifies the given matrix to perform a local scaling on the Z axis", () => {
    beforeEach(() => {
      glMatrix.mat4.multiply(expectedMatrix, expectedMatrix, glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [1, 1, 0.93]))
      glMatrix.vec3.transformMat4(expectedVector, expectedVector, expectedMatrix)
      applyMatrixToVector(actualVector, actualMatrix)
    })
    it("x", () => expect(actualVector[0]).toBeCloseTo(expectedVector[0]))
    it("y", () => expect(actualVector[1]).toBeCloseTo(expectedVector[1]))
    it("z", () => expect(actualVector[2]).toBeCloseTo(expectedVector[2]))
  })
})

describe("perspectiveMatrix", () => {
  beforeEach(() => perspectiveMatrix(actualMatrix, 0.4, 2.4, 3.7, 4.47, 16.87))
  describe("modifies the given matrix to contain a perspective projection", () => {
    const corner = (description, inputX, inputY, inputZ, expectedX, expectedY, expectedZ) => describe(description, () => {
      beforeEach(() => {
        actualVector[0] = inputX
        actualVector[1] = inputY
        actualVector[2] = inputZ
        applyMatrixToVector(actualVector, actualMatrix)
      })
      it("x", () => expect(actualVector[0]).toBeCloseTo(expectedX))
      it("y", () => expect(actualVector[1]).toBeCloseTo(expectedY))
      it("z", () => expect(actualVector[2]).toBeCloseTo(expectedZ))
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