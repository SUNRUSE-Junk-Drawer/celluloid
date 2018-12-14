let errorEncountered: null | string = null

onerror = (message: Event | string, source?: string, lineno?: number, colno?: number, error?: Error): void => {
  errorEncountered = "Unhandled error on line " + lineno + ", column " + colno + " of \"" + source + "\":\n\t\"" + message + "\"\n\t\"" + error + "\""
  checkRenderLoop()
}
