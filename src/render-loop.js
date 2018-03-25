let renderLoopAnimationFrame = null
let renderLoopLastTimestamp = null

let render

function shouldStartRenderLoop() {
  if (errorEncountered) return false
  if (!focused) return false
  return true
}

function startRenderLoop() {
  if (!shouldStartRenderLoop()) return
  if (renderLoopAnimationFrame !== null) return
  renderLoopAnimationFrame = requestAnimationFrame(renderLoop)
}

function stopRenderLoop() {
  if (renderLoopAnimationFrame === null) return
  cancelAnimationFrame(renderLoopAnimationFrame)
  renderLoopAnimationFrame = renderLoopLastTimestamp = null
}

function renderLoop(timestamp) {
  const lastTimestamp = renderLoopLastTimestamp === null ? timestamp : renderLoopLastTimestamp
  renderLoopAnimationFrame = renderLoopLastTimestamp = null
  render((timestamp - lastTimestamp) / 1000)
  renderLoopAnimationFrame = requestAnimationFrame(renderLoop)
  renderLoopLastTimestamp = timestamp
}