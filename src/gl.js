let gl = null
let glNonce = 0
let glReady = false

function setupGl() {
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  if (!gl) throw new Error("Failed to open a WebGL context.  Please ensure that your browser and device are up-to-date.")
  handleContextRestored()
}

function handleContextLost(event) {
  glReady = false
  checkRenderLoop()
  event.preventDefault()
}

function handleContextRestored() {
  glReady = true
  checkRenderLoop()
}
