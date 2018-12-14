function readFileAsArrayBuffer(url: string, then: (arrayBuffer: ArrayBuffer) => void): void {
  const request = new XMLHttpRequest()
  request.open("GET", url, true)
  request.responseType = "arraybuffer"
  request.onerror = event => console.error(`Failed to read file "${url}" as an ArrayBuffer.`)
  request.onload = event => then(request.response)
  request.send()
}

type parser = {
  readonly dataView: DataView
  position: number
}

function createParser(arrayBuffer: ArrayBuffer): parser {
  return {
    dataView: new DataView(arrayBuffer),
    position: 0
  }
}

function parseUint8(parser: parser): number {
  const output = parser.dataView.getUint8(parser.position)
  parser.position++
  return output
}

function parseUint8Array(parser: parser, count: number): Uint8Array {
  const output = new Uint8Array(count)
  for (let i = 0; i < count; i++) output[i] = parseUint8(parser)
  return output
}

function parseUint16(parser: parser): number {
  const output = parser.dataView.getUint16(parser.position, true)
  parser.position += 2
  return output
}

function parseUint16Array(parser: parser, count: number): Uint16Array {
  const output = new Uint16Array(count)
  for (let i = 0; i < count; i++) output[i] = parseUint16(parser)
  return output
}

function parseFloat32(parser: parser): number {
  const output = parser.dataView.getFloat32(parser.position, true)
  parser.position += 4
  return output
}

function parseFloat32Array(parser: parser, count: number): Float32Array {
  const output = new Float32Array(count)
  for (let i = 0; i < count; i++) output[i] = parseFloat32(parser)
  return output
}

function parseUtf8(parser: parser): string {
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

    // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint#Polyfill.
    if (charCode <= 0xFFFF) {
      output += String.fromCharCode(charCode)
    } else {
      charCode -= 0x10000
      output += String.fromCharCode(
        (charCode >> 10) + 0xD800,
        (charCode % 0x400) + 0xDC00
      )
    }
  }
}

type cachedFile = {
  nonce: number
  data: null | ArrayBuffer
  readonly callbacks: ((arrayBuffer: ArrayBuffer) => void)[]
}
const fileCache: { [url: string]: cachedFile } = {}

function createFileHandle(url: string, callback: (arrayBuffer: ArrayBuffer) => void): void {
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
    const file: cachedFile = {
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

function handleFileChange(url: string): void {
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

function destroyFileHandle(url: string, callback: (arrayBuffer: ArrayBuffer) => void): void {
  const file = fileCache[url]
  file.callbacks.splice(file.callbacks.indexOf(callback), 1)
  if (!file.callbacks.length) {
    file.nonce++
    file.data = null
  }
}
