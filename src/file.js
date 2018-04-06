function readFileAsArrayBuffer(url, then) {
  const request = new XMLHttpRequest()
  request.open("GET", url, true)
  request.responseType = "arraybuffer"
  request.onerror = event => console.error(event.error)
  request.onload = event => then(request.response)
  request.send()
}

function createParser(arrayBuffer) {
  return {
    dataView: new DataView(arrayBuffer),
    position: 0
  }
}

function parseUint8(parser) {
  const output = parser.dataView.getUint8(parser.position)
  parser.position++
  return output
}

function parseUint8Array(parser, count) {
  const output = new Uint8Array(count)
  for (let i = 0; i < count; i++) output[i] = parseUint8(parser)
  return output
}

function parseUint16(parser) {
  const output = parser.dataView.getUint16(parser.position, true)
  parser.position += 2
  return output
}

function parseUint16Array(parser, count) {
  const output = new Uint16Array(count)
  for (let i = 0; i < count; i++) output[i] = parseUint16(parser)
  return output
}

function parseFloat32(parser) {
  const output = parser.dataView.getFloat32(parser.position, true)
  parser.position += 4
  return output
}

function parseFloat32Array(parser, count) {
  const output = new Float32Array(count)
  for (let i = 0; i < count; i++) output[i] = parseFloat32(parser)
  return output
}

function parseUtf8(parser) {
  let output = ""
  while (true) {
    const firstByte = parseUint8(parser)
    if (!firstByte) return output
    let charCode = firstByte

    if ((firstByte & 224) == 192) {
      charCode = (charCode & 31) * 64
      charCode += parseUint8(parser) & 63
    } else if ((firstByte & 240) == 224) {
      charCode = (charCode & 15) * 4096
      charCode += (parseUint8(parser) & 63) * 64
      charCode += parseUint8(parser) & 63
    } else if ((firstByte & 248) == 240) {
      charCode = (charCode & 7) * 262144
      charCode += (parseUint8(parser) & 63) * 4096
      charCode += (parseUint8(parser) & 63) * 64
      charCode += parseUint8(parser) & 63
    }

    output += String.fromCodePoint(charCode)
  }
}

const fileCache = {}

function createFileHandle(url, callback) {
  if (Object.prototype.hasOwnProperty.call(fileCache, url)) {
    const file = fileCache[url]
    file.callbacks.push(callback)
    if (file.callbacks.length > 1) {
      if (file.data !== null) {
        callback(file.data)
      }
    } else {
      const nonce = file.nonce
      readFileAsArrayBuffer(url, arrayBuffer => {
        if (file.nonce == nonce) {
          file.data = arrayBuffer
          file.callbacks.forEach(callback => callback(arrayBuffer))
        }
      })
    }
  } else {
    const file = {
      nonce: 0,
      data: null,
      callbacks: [callback]
    }
    fileCache[url] = file
    readFileAsArrayBuffer(url, arrayBuffer => {
      if (!file.nonce) {
        file.data = arrayBuffer
        file.callbacks.forEach(callback => callback(arrayBuffer))
      }
    })
  }
}

function handleFileChange(url) {
  if (Object.prototype.hasOwnProperty.call(fileCache, url)) {
    const file = fileCache[url]
    if (file.callbacks.length) {
      file.nonce++
      file.data = null
      const nonce = file.nonce
      readFileAsArrayBuffer(url, arrayBuffer => {
        if (file.nonce == nonce) {
          file.data = arrayBuffer
          file.callbacks.forEach(callback => callback(arrayBuffer))
        }
      })
    }
  }
}

function destroyFileHandle(url, callback) {
  const file = fileCache[url]
  file.callbacks.splice(file.callbacks.indexOf(callback), 1)
  if (!file.callbacks.length) {
    file.nonce++
    file.data = null
  }
}