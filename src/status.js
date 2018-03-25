function setStatus(to) {
  var element = document.getElementById("status")
  if (element) {
    if (to) {
      element.textContent = to
      element.display = "block"
    } else {
      element.display = "none"
    }
  }
}