const fs = require("fs")
const path = require("path")

window.XMLHttpRequest = function () {
  const request = this

  request.open = function (method, url, async) {
    request.url = url
  }

  request.send = function () {
    fs.readFile(path.join("dist", request.url), (err, data) => {
      if (err) {
        request.onerror({
          error: err
        })
      } else {
        request.response = data.buffer
        request.onload({})
      }
    })
  }
}