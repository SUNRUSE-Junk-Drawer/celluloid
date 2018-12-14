function setStatus(to: null | string): void {
  var element = document.getElementById("status")
  if (element) {
    if (to) {
      element.textContent = to
      element.style.display = "block"
    } else {
      element.style.display = "none"
    }
  }
}
