let gl: null | WebGLRenderingContext = null
let glNonce: number = 0
let glReady: boolean = false

function setupGl(): void {
  if (!canvas) {
    throw new Error(`Canvas not created when opening a WebGL context.`)
  }
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  if (!gl) throw new Error("Failed to open a WebGL context.  Please ensure that your browser and device are up-to-date.")
  handleContextRestored()
}

function handleContextLost(event: Event): void {
  glReady = false
  checkRenderLoop()
  event.preventDefault()
}

function handleContextRestored(): void {
  glReady = true
  checkRenderLoop()
}
