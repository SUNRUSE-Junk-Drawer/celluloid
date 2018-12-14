let renderLoopAnimationFrame: null | number = null
let renderLoopLastTimestamp: null | number = null

function statusToShow(): null | string {
  return errorEncountered || (!document.hasFocus() && "Paused") || (!glReady && "Restarting WebGL...") || null
}

function checkRenderLoop(): void {
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

function renderLoop(timestamp: number): void {
  const firstFrame = renderLoopLastTimestamp === null
  const lastTimestamp = renderLoopLastTimestamp === null ? timestamp : renderLoopLastTimestamp
  renderLoopAnimationFrame = renderLoopLastTimestamp = null
  render((timestamp - lastTimestamp) / 1000)
  renderLoopAnimationFrame = requestAnimationFrame(renderLoop)
  renderLoopLastTimestamp = timestamp
  if (firstFrame) setStatus(null)
}
