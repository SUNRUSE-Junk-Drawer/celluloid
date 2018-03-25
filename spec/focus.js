describe("focus", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines focused as true", () => expect(index.__get__("focused")).toBeTruthy())

  describe("setupFocus", () => {
    let addEventListener, startRenderLoop, stopRenderLoop
    beforeEach(() => {
      addEventListener = jasmine.createSpy("addEventListener")
      index.__set__("addEventListener", addEventListener)
      startRenderLoop = jasmine.createSpy("startRenderLoop")
      index.__set__("startRenderLoop", startRenderLoop)
      stopRenderLoop = jasmine.createSpy("stopRenderLoop")
      index.__set__("stopRenderLoop", stopRenderLoop)
      index.__get__("setupFocus")()
    })
    it("adds two event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
    it("adds a focus event listener", () => expect(addEventListener).toHaveBeenCalledWith("focus", jasmine.any(Function)))
    it("adds a blur event listener", () => expect(addEventListener).toHaveBeenCalledWith("blur", jasmine.any(Function)))
    it("does not change focused", () => expect(index.__get__("focused")).toBeTruthy())
    it("does not start the render loop", () => expect(startRenderLoop).not.toHaveBeenCalled())
    it("does not stop the render loop", () => expect(stopRenderLoop).not.toHaveBeenCalled())

    describe("when focused", () => {
      describe("on focus", () => {
        beforeEach(() => addEventListener.calls.allArgs().find(arg => arg[0] == "focus")[1]())
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("does not change focused", () => expect(index.__get__("focused")).toBeTruthy())
        it("does not start the render loop", () => expect(startRenderLoop).not.toHaveBeenCalled())
        it("does not stop the render loop", () => expect(stopRenderLoop).not.toHaveBeenCalled())
      })

      describe("on blur", () => {
        beforeEach(() => addEventListener.calls.allArgs().find(arg => arg[0] == "blur")[1]())
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("sets focused to false", () => expect(index.__get__("focused")).toBeFalsy())
        it("does not start the render loop", () => expect(startRenderLoop).not.toHaveBeenCalled())
        it("stops the render loop once", () => expect(stopRenderLoop).toHaveBeenCalledTimes(1))
      })
    })

    describe("when blurred", () => {
      beforeEach(() => index.__set__("focused", false))
      describe("on focus", () => {
        let focusedAtTimeOfStartingRenderLoop
        beforeEach(() => {
          startRenderLoop.and.callFake(() => focusedAtTimeOfStartingRenderLoop = index.__get__("focused"))
          addEventListener.calls.allArgs().find(arg => arg[0] == "focus")[1]()
        })
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("sets focused to true", () => expect(index.__get__("focused")).toBeTruthy())
        it("starts the render loop once", () => expect(startRenderLoop).toHaveBeenCalledTimes(1))
        it("had set focused to true by the time of starting the render loop", () => expect(focusedAtTimeOfStartingRenderLoop).toBeTruthy())
        it("does not stop the render loop", () => expect(stopRenderLoop).not.toHaveBeenCalled())
      })

      describe("on blur", () => {
        beforeEach(() => addEventListener.calls.allArgs().find(arg => arg[0] == "blur")[1]())
        it("does not add further event listeners", () => expect(addEventListener).toHaveBeenCalledTimes(2))
        it("does not change focused", () => expect(index.__get__("focused")).toBeFalsy())
        it("does not start the render loop", () => expect(startRenderLoop).not.toHaveBeenCalled())
        it("does not stop the render loop", () => expect(stopRenderLoop).not.toHaveBeenCalled())
      })
    })
  })
})