let errorEncountered = false

function handleError(message, source, lineno, colno, error) {
  errorEncountered = true
  setStatus("Unhandled error on line " + lineno + ", column " + colno + " of \"" + source + "\":\n\t\"" + message + "\"\n\t\"" + error + "\"")
  stopRenderLoop()
}