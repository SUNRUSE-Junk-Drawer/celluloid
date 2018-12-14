let focused: boolean = true
function setupFocus(): void {
  addEventListener("focus", checkRenderLoop)
  addEventListener("blur", checkRenderLoop)
}
