let focused = true
function setupFocus() {
  addEventListener("focus", () => {
    if (focused) return
    focused = true
    startRenderLoop()
  })

  addEventListener("blur", () => {
    if (!focused) return
    focused = false
    stopRenderLoop()
  })
}