const vector = require("rewire")("../src/vector.js")
const glMatrix = require("gl-matrix")

const createVector = vector.__get__("createVector")
const applyMatrixToVector = vector.__get__("applyMatrixToVector")

describe("createVector", () => {
  it("returns a new vector each call", () => expect(createVector()).not.toBe(createVector()))
  describe("returns a zero vector", () => {
    it("x", () => expect(createVector()[0]).toEqual(0))
    it("y", () => expect(createVector()[1]).toEqual(0))
    it("z", () => expect(createVector()[2]).toEqual(0))
  })
})

const createMatrix = vector.__get__("createMatrix")
const identityMatrix = vector.__get__("identityMatrix")
const translateMatrixOnX = vector.__get__("translateMatrixOnX")
const translateMatrixOnY = vector.__get__("translateMatrixOnY")
const translateMatrixOnZ = vector.__get__("translateMatrixOnZ")
const rotateMatrixAroundX = vector.__get__("rotateMatrixAroundX")
const rotateMatrixAroundY = vector.__get__("rotateMatrixAroundY")
const rotateMatrixAroundZ = vector.__get__("rotateMatrixAroundZ")
const scaleMatrixOnX = vector.__get__("scaleMatrixOnX")
const scaleMatrixOnY = vector.__get__("scaleMatrixOnY")
const scaleMatrixOnZ = vector.__get__("scaleMatrixOnZ")
const perspectiveMatrix = vector.__get__("perspectiveMatrix")

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