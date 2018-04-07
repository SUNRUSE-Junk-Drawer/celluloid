describe("focus", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines focused as true", () => expect(index.__get__("focused")).toBeTruthy())

  describe("setupFocus", () => {
    let addEventListener, checkRenderLoop
    beforeEach(() => {
      addEventListener = jasmine.createSpy("addEventListener")
      index.__set__("addEventListener", addEventListener)
      checkRenderLoop = jasmine.createSpy("checkRenderLoop")
      index.__set__("checkRenderLoop", checkRenderLoop)
      index.__get__("setupFocus")()
    })
    it("adds two event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
    it("adds a focus event listener", () => expect(addEventListener).toHaveBeenCalledWith("focus", jasmine.any(Function)))
    it("adds a blur event listener", () => expect(addEventListener).toHaveBeenCalledWith("blur", jasmine.any(Function)))
    it("does not change focused", () => expect(index.__get__("focused")).toBeTruthy())
    it("does not check the render loop", () => expect(checkRenderLoop).not.toHaveBeenCalled())

    describe("when focused", () => {
      describe("on focus", () => {
        beforeEach(() => addEventListener.calls.allArgs().find(arg => arg[0] == "focus")[1]())
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("does not change focused", () => expect(index.__get__("focused")).toBeTruthy())
        it("does not check the render loop", () => expect(checkRenderLoop).not.toHaveBeenCalled())
      })

      describe("on blur", () => {
        let focusedAtTimeOfCheckingRenderLoop
        beforeEach(() => {
          focusedAtTimeOfCheckingRenderLoop = null
          checkRenderLoop.and.callFake(() => focusedAtTimeOfCheckingRenderLoop = index.__get__("focused"))
          addEventListener.calls.allArgs().find(arg => arg[0] == "blur")[1]()
        })
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("sets focused to false", () => expect(index.__get__("focused")).toBeFalsy())
        it("checks the render loop once", () => expect(checkRenderLoop).toHaveBeenCalledTimes(1))
        it("has set focused to true by the time of checking the render loop", () => expect(focusedAtTimeOfCheckingRenderLoop).toBeFalsy())
      })
    })

    describe("when blurred", () => {
      beforeEach(() => index.__set__("focused", false))
      describe("on focus", () => {
        let focusedAtTimeOfCheckingRenderLoop
        beforeEach(() => {
          focusedAtTimeOfCheckingRenderLoop = null
          checkRenderLoop.and.callFake(() => focusedAtTimeOfCheckingRenderLoop = index.__get__("focused"))
          addEventListener.calls.allArgs().find(arg => arg[0] == "focus")[1]()
        })
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("sets focused to true", () => expect(index.__get__("focused")).toBeTruthy())
        it("checks the render loop once", () => expect(checkRenderLoop).toHaveBeenCalledTimes(1))
        it("has set focused to true by the time of checking the render loop", () => expect(focusedAtTimeOfCheckingRenderLoop).toBeTruthy())
      })

      describe("on blur", () => {
        beforeEach(() => addEventListener.calls.allArgs().find(arg => arg[0] == "blur")[1]())
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("does not change focused", () => expect(index.__get__("focused")).toBeFalsy())
        it("does not check the render loop", () => expect(checkRenderLoop).not.toHaveBeenCalled())
      })
    })
  })
})