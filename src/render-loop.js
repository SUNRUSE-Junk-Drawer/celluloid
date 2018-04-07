let renderLoopAnimationFrame = null
let renderLoopLastTimestamp = null

let render

function statusToShow() {
  return errorEncountered
    || (!focused && "Paused")
    || null
}

function checkRenderLoop() {
  const status = statusToShow()
  if (status) {
    setStatus(status)
    if (renderLoopAnimationFrame !== null) {
      cancelAnimationFrame(renderLoopAnimationFrame)
    }
    renderLoopAnimationFrame = renderLoopLastTimestamp = null
  } else {
    if (renderLoopAnimationFrame === null) {
      renderLoopAnimationFrame = requestAnimationFrame(renderLoop)
      setStatus("Resuming...")
    }
  }
}

function renderLoop(timestamp) {
  const firstFrame = renderLoopLastTimestamp === null
  const lastTimestamp = firstFrame ? timestamp : renderLoopLastTimestamp
  renderLoopAnimationFrame = renderLoopLastTimestamp = null
  render((timestamp - lastTimestamp) / 1000)
  renderLoopAnimationFrame = requestAnimationFrame(renderLoop)
  renderLoopLastTimestamp = timestamp
  if (firstFrame) setStatus()
}