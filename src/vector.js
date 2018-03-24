// This implements a basic vector maths library supporting 3D vectors and 4x4
// matrices, following a design similar to gl-matrix where all are mutable (and 
// reused) to reduce GC pressure.

// All transforms are applied locally, so:
// perspectiveMatrix(...)
// translateMatrixOnX(...)
// rotateMatrixAroundY(...)
// will work as expected.

function createVector() {
  return new Float32Array(3)
}

function createMatrix() {
  const output = new Float32Array(16)
  output[0] = output[5] = output[10] = output[15] = 1
  return output
}

function copyMatrix(from, to) {
  to[0] = from[0]
  to[1] = from[1]
  to[2] = from[2]
  to[3] = from[3]
  to[4] = from[4]
  to[5] = from[5]
  to[6] = from[6]
  to[7] = from[7]
  to[8] = from[8]
  to[9] = from[9]
  to[10] = from[10]
  to[11] = from[11]
  to[12] = from[12]
  to[13] = from[13]
  to[14] = from[14]
  to[15] = from[15]
}

function applyMatrixToVector(to, matrix) {
  const x = to[0]
  const y = to[1]
  const z = to[2]
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
  to[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w
  to[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w
  to[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
}

function identityMatrix(to) {
  to[0] = to[5] = to[10] = to[15] = 1
  to[1] = to[2] = to[3] = to[4] = to[6] = to[7] = to[8] = to[9] = to[11] = to[12] = to[13] = to[14] = 0
}

function translateMatrix(to, meters, indexA, indexB, indexC, indexD) {
  to[12] += to[indexA] * meters
  to[13] += to[indexB] * meters
  to[14] += to[indexC] * meters
  to[15] += to[indexD] * meters
}

function translateMatrixOnX(to, meters) {
  translateMatrix(to, meters, 0, 1, 2, 3)
}

function translateMatrixOnY(to, meters) {
  translateMatrix(to, meters, 4, 5, 6, 7)
}

function translateMatrixOnZ(to, meters) {
  translateMatrix(to, meters, 8, 9, 10, 11)
}

function rotateMatrix(to, radians, indexA, indexB, indexC, indexD, indexE, indexF, indexG, indexH) {
  const sine = Math.sin(radians)
  const cosine = Math.cos(radians)

  const yx = to[indexA]
  const yy = to[indexB]
  const yz = to[indexC]
  const yw = to[indexD]
  const zx = to[indexE]
  const zy = to[indexF]
  const zz = to[indexG]
  const zw = to[indexH]

  to[indexA] = cosine * yx + sine * zx
  to[indexB] = cosine * yy + sine * zy
  to[indexC] = cosine * yz + sine * zz
  to[indexD] = cosine * yw + sine * zw
  to[indexE] = cosine * zx - sine * yx
  to[indexF] = cosine * zy - sine * yy
  to[indexG] = cosine * zz - sine * yz
  to[indexH] = cosine * zw - sine * yw
}

function rotateMatrixAroundX(to, radians) {
  rotateMatrix(to, radians, 4, 5, 6, 7, 8, 9, 10, 11)
}

function rotateMatrixAroundY(to, radians) {
  rotateMatrix(to, radians, 8, 9, 10, 11, 0, 1, 2, 3)
}

function rotateMatrixAroundZ(to, radians) {
  rotateMatrix(to, radians, 0, 1, 2, 3, 4, 5, 6, 7)
}

function scaleMatrix(to, factor, indexA, indexB, indexC, indexD) {
  to[indexA] *= factor
  to[indexB] *= factor
  to[indexC] *= factor
  to[indexD] *= factor
}

function scaleMatrixOnX(to, factor) {
  scaleMatrix(to, factor, 0, 1, 2, 3)
}

function scaleMatrixOnY(to, factor) {
  scaleMatrix(to, factor, 4, 5, 6, 7)
}

function scaleMatrixOnZ(to, factor) {
  scaleMatrix(to, factor, 8, 9, 10, 11)
}

function perspectiveMatrix(to, fieldOfViewRadians, scaleX, scaleY, near, far) {
  const scale = -1 / Math.tan(fieldOfViewRadians * 0.5)
  const reciprocalNearFar = 1 / (far - near)
  to[0] = scale / scaleX
  to[5] = scale / scaleY
  to[10] = -(far + near) * reciprocalNearFar
  to[11] = -1
  to[14] = (far * near * 2) * reciprocalNearFar
  to[1] = to[2] = to[3] = to[4] = to[6] = to[7] = to[8] = to[9] = to[12] = to[13] = to[15] = 0
}