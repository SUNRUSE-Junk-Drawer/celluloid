// This file is only included with the minified version, and is used to perform
// bootstrapping which should not be done in development or in unit tests.

onerror = function (message, source, lineno, colno, error) {
  setStatus("Unhandled error on line " + lineno + ", column " + colno + " of \"" + source + "\":\n\t\"" + message + "\"\n\t\"" + error + "\"")
}

setStatus("Loading, please wait...")

throw new Error("AHA")