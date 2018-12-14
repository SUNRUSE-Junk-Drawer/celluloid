function setupFocus(): void {
  addEventListener("focus", checkRenderLoop)
  addEventListener("blur", checkRenderLoop)
}
