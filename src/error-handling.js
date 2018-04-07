let errorEncountered = null

function handleError(message, source, lineno, colno, error) {
  errorEncountered = "Unhandled error on line " + lineno + ", column " + colno + " of \"" + source + "\":\n\t\"" + message + "\"\n\t\"" + error + "\""
  setStatus(errorEncountered)
  stopRenderLoop()
}