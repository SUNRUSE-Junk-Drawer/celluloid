function readFileAsArrayBuffer(url, then) {
  const request = new XMLHttpRequest()
  request.open("GET", url, true)
  request.responseType = "arraybuffer"
  request.onerror = event => console.error(event.error)
  request.onload = event => then(request.response)
  request.send()
}