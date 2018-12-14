let focused = true
function setupFocus() {
  addEventListener("focus", checkRenderLoop)
  addEventListener("blur", checkRenderLoop)
}
