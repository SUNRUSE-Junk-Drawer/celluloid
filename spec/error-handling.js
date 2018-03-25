describe("errorHandling", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines errorEncountered as false", () => expect(index.__get__("errorEncountered")).toBeFalsy())

  describe("handleError", () => {
    let setStatus
    beforeEach(() => {
      setStatus = jasmine.createSpy("setStatus")
      index.__set__("setStatus", setStatus)
      index.__get__("handleError")("Test Message", "Test Source File", 398, 289, "Test Error")
    })
    it("sets the status once", () => expect(setStatus).toHaveBeenCalledTimes(1))
    it("sets the status to describe the error", () => expect(setStatus).toHaveBeenCalledWith(
      `Unhandled error on line 398, column 289 of "Test Source File":
\t"Test Message"
\t"Test Error"`))
    it("sets errorEncountered to true", () => expect(index.__get__("errorEncountered")).toBeTruthy())
  })
})