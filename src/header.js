// This file is only included with the minified version, and is used to perform
// bootstrapping which should not be done in development or in unit tests.

onerror = handleError

setStatus("Loading, please wait...")

onload = setup