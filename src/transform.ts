const transformStackItems: mat4[] = [createMatrix()]
let transform: mat4 = transformStackItems[0]
let transformStackPointer: number = 0

function pushTransformStack(): void {
  transformStackPointer++
  if (transformStackPointer >= transformStackItems.length) transformStackItems.push(createMatrix())
  const previousTransform = transform
  transform = transformStackItems[transformStackPointer]
  copyMatrix(previousTransform, transform)
}

function popTransformStack(): void {
  transformStackPointer--
  transform = transformStackItems[transformStackPointer]
}

function transformStack(contents: () => void): void {
  pushTransformStack()
  contents()
  popTransformStack()
}

function translateOnX(meters: number): void {
  translateMatrixOnX(transform, meters)
}

function translateOnY(meters: number): void {
  translateMatrixOnY(transform, meters)
}

function translateOnZ(meters: number): void {
  translateMatrixOnZ(transform, meters)
}

function rotateAroundX(radians: number): void {
  rotateMatrixAroundX(transform, radians)
}

function rotateAroundY(radians: number): void {
  rotateMatrixAroundY(transform, radians)
}

function rotateAroundZ(radians: number): void {
  rotateMatrixAroundZ(transform, radians)
}

function scaleOnX(factor: number): void {
  scaleMatrixOnX(transform, factor)
}

function scaleOnY(factor: number): void {
  scaleMatrixOnY(transform, factor)
}

function scaleOnZ(factor: number): void {
  scaleMatrixOnZ(transform, factor)
}
