let gl = null
let glNonce = 0

function setupGl() {
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  if (!gl) throw new Error("Failed to open a WebGL context.  Please ensure that your browser and device are up-to-date.")
  initializeGl()
}

function initializeGl() {

}

function handleContextLost() {

}

function handleContextRestored() {

}