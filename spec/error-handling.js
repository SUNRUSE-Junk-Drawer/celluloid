describe("errorHandling", () => {
  assert({
    "defines errorEncountered as null": () => expect(index.__get__("errorEncountered")).toBeNull()
  })

  describe("handleError", () => {
    let checkRenderLoop, errorEncounteredAtTimeOfCheckingRenderLoop
    setup(() => {
      checkRenderLoop = jasmine.createSpy("checkRenderLoop")
      checkRenderLoop.and.callFake(() => errorEncounteredAtTimeOfCheckingRenderLoop = index.__get__("errorEncountered"))
      index.__set__("checkRenderLoop", checkRenderLoop)
      errorEncounteredAtTimeOfCheckingRenderLoop = null
      index.__get__("handleError")("Test Message", "Test Source File", 398, 289, "Test Error")
    })
    assert({
      "sets errorEncountered to describe the error": () => expect(index.__get__("errorEncountered")).toEqual(`Unhandled error on line 398, column 289 of "Test Source File":
\t"Test Message"
\t"Test Error"`),
      "checks the render loop once": () => expect(checkRenderLoop).toHaveBeenCalledTimes(1),
      "has set errorEncountered by the time of checking the render loop": () => expect(errorEncounteredAtTimeOfCheckingRenderLoop).toEqual(`Unhandled error on line 398, column 289 of "Test Source File":
\t"Test Message"
\t"Test Error"`)
    })
  })
})