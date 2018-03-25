describe("errorHandling", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines errorEncountered as false", () => expect(index.__get__("errorEncountered")).toBeFalsy())

  describe("handleError", () => {
    let setStatus, stopRenderLoop
    beforeEach(() => {
      setStatus = jasmine.createSpy("setStatus")
      index.__set__("setStatus", setStatus)
      stopRenderLoop = jasmine.createSpy("stopRenderLoop")
      index.__set__("stopRenderLoop", stopRenderLoop)
      index.__get__("handleError")("Test Message", "Test Source File", 398, 289, "Test Error")
    })
    it("sets the status once", () => expect(setStatus).toHaveBeenCalledTimes(1))
    it("sets the status to describe the error", () => expect(setStatus).toHaveBeenCalledWith(
      `Unhandled error on line 398, column 289 of "Test Source File":
\t"Test Message"
\t"Test Error"`))
    it("stops the render loop once", () => expect(stopRenderLoop).toHaveBeenCalledTimes(1))
    it("sets errorEncountered to true", () => expect(index.__get__("errorEncountered")).toBeTruthy())
  })
})