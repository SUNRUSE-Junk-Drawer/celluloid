const transformStackItems = [createMatrix()]
let transform = transformStackItems[0]
let transformStackPointer = 0

function pushTransformStack() {
  transformStackPointer++
  if (transformStackPointer >= transformStackItems.length) transformStackItems.push(createMatrix())
  const previousTransform = transform
  transform = transformStackItems[transformStackPointer]
  copyMatrix(previousTransform, transform)
}

function popTransformStack() {
  transformStackPointer--
  transform = transformStackItems[transformStackPointer]
}

function transformStack(contents) {
  pushTransformStack()
  try {
    contents()
  } finally {
    popTransformStack()
  }
}

function translateOnX(meters) {
  translateMatrixOnX(transform, meters)
}

function translateOnY(meters) {
  translateMatrixOnY(transform, meters)
}

function translateOnZ(meters) {
  translateMatrixOnZ(transform, meters)
}

function rotateAroundX(radians) {
  rotateMatrixAroundX(transform, radians)
}

function rotateAroundY(radians) {
  rotateMatrixAroundY(transform, radians)
}

function rotateAroundZ(radians) {
  rotateMatrixAroundZ(transform, radians)
}

function scaleOnX(factor) {
  scaleMatrixOnX(transform, factor)
}

function scaleOnY(factor) {
  scaleMatrixOnY(transform, factor)
}

function scaleOnZ(factor) {
  scaleMatrixOnZ(transform, factor)
}