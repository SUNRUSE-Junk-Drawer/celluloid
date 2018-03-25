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