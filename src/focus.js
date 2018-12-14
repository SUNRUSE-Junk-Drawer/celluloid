let focused = true
function setupFocus() {
  addEventListener("focus", () => {
    if (focused) return
    focused = true
    checkRenderLoop()
  })

  addEventListener("blur", () => {
    if (!focused) return
    focused = false
    checkRenderLoop()
  })
}
