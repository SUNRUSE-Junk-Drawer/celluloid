describe("renderLoop", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines renderLoopAnimationFrame as null", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
  it("defines renderLoopLastTimestamp as null", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())

  let requestAnimationFrame, cancelAnimationFrame
  beforeEach(() => {
    requestAnimationFrame = jasmine.createSpy("requestAnimationFrame")
    requestAnimationFrame.and.returnValue("Test Requested Animation Frame")
    index.__set__("requestAnimationFrame", requestAnimationFrame)
    cancelAnimationFrame = jasmine.createSpy("cancelAnimationFrame")
    index.__set__("cancelAnimationFrame", cancelAnimationFrame)
  })

  describe("when a render loop is running", () => {
    beforeEach(() => {
      index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame")
      index.__set__("renderLoopLastTimestamp", 8973.21)
    })
    describe("startRenderLoop", () => {
      beforeEach(() => index.__get__("startRenderLoop")())
      it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
      it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
      it("does not modify the stored animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Existing Animation Frame"))
      it("does not modify the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21))
    })

    describe("stopRenderLoop", () => {
      beforeEach(() => index.__get__("stopRenderLoop")())
      it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
      it("cancels one animation frame", () => expect(cancelAnimationFrame).toHaveBeenCalledTimes(1))
      it("cancels the stored animation frame", () => expect(cancelAnimationFrame).toHaveBeenCalledWith("Test Existing Animation Frame"))
      it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
      it("stores null as the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
    })
  })

  describe("when a render loop is not running", () => {
    describe("startRenderLoop", () => {
      beforeEach(() => index.__get__("startRenderLoop")())
      it("requests one animation frame", () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1))
      it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
      it("requests an animation frame for renderLoop", () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")))
      it("stores the requested animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"))
      it("does not modify the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
    })

    describe("stopRenderLoop", () => {
      beforeEach(() => index.__get__("stopRenderLoop")())
      it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
      it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
      it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
      it("does not modify the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
    })
  })

  describe("renderLoop", () => {
    let render
    beforeEach(() => {
      index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame")

      render = jasmine.createSpy("render")
      index.__set__("render", render)
    })

    describe("on the first frame", () => {
      describe("on success", () => {
        beforeEach(() => index.__get__("renderLoop")(8973.21))
        it("calls render once", () => expect(render).toHaveBeenCalledTimes(1))
        it("calls render with zero delta seconds", () => expect(render).toHaveBeenCalledWith(0))
        it("requests one animation frame", () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1))
        it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
        it("requests an animation frame for renderLoop", () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")))
        it("stores the requested animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"))
        it("stores the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21))
      })

      describe("on an exception", () => {
        beforeEach(() => {
          render.and.callFake(() => { throw "Test Error" })
          expect(() => index.__get__("renderLoop")(8973.21)).toThrow("Test Error")
        })
        it("calls render once", () => expect(render).toHaveBeenCalledTimes(1))
        it("calls render with zero delta seconds", () => expect(render).toHaveBeenCalledWith(0))
        it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
        it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
        it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
        it("stores null as the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
      })
    })

    describe("on a subsequent frame", () => {
      beforeEach(() => index.__set__("renderLoopLastTimestamp", 4216.18))

      describe("on success", () => {
        beforeEach(() => index.__get__("renderLoop")(8973.21))
        it("calls render once", () => expect(render).toHaveBeenCalledTimes(1))
        it("calls render with the delta seconds", () => {
          expect(render).toHaveBeenCalledWith(jasmine.any(Number))
          expect(render.calls.argsFor(0)[0]).toBeCloseTo(4.75703)
        })
        it("requests one animation frame", () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1))
        it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
        it("requests an animation frame for renderLoop", () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")))
        it("stores the requested animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"))
        it("stores the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21))
      })

      describe("on an exception", () => {
        beforeEach(() => {
          render.and.callFake(() => { throw "Test Error" })
          expect(() => index.__get__("renderLoop")(8973.21)).toThrow("Test Error")
        })
        it("calls render once", () => expect(render).toHaveBeenCalledTimes(1))
        it("calls render with the delta seconds", () => {
          expect(render).toHaveBeenCalledWith(jasmine.any(Number))
          expect(render.calls.argsFor(0)[0]).toBeCloseTo(4.75703)
        })
        it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
        it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
        it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
        it("stores null as the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
      })
    })
  })
})