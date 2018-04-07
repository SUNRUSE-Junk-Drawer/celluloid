describe("renderLoop", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines renderLoopAnimationFrame as null", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
  it("defines renderLoopLastTimestamp as null", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())

  describe("statusToShow", () => {
    describe("when focused", () => {
      beforeEach(() => index.__set__("focused", true))
      describe("when an error has been encountered", () => {
        beforeEach(() => index.__set__("errorEncountered", "Test Error"))
        it("returns the encountered error", () => expect(index.__get__("statusToShow")()).toEqual("Test Error"))
      })
      describe("when an error has not been encountered", () => {
        beforeEach(() => index.__set__("errorEncountered", null))
        it("returns null", () => expect(index.__get__("statusToShow")()).toBeNull())
      })
    })

    describe("when not focused", () => {
      beforeEach(() => index.__set__("focused", false))
      describe("when an error has been encountered", () => {
        beforeEach(() => index.__set__("errorEncountered", "Test Error"))
        it("returns the encountered error", () => expect(index.__get__("statusToShow")()).toEqual("Test Error"))
      })
      describe("when an error has not been encountered", () => {
        beforeEach(() => index.__set__("errorEncountered", null))
        it("returns \"Paused\"", () => expect(index.__get__("statusToShow")()).toEqual("Paused"))
      })
    })
  })

  describe("checkRenderLoop", () => {
    let requestAnimationFrame, cancelAnimationFrame, setStatus, statusToShow
    beforeEach(() => {
      requestAnimationFrame = jasmine.createSpy("requestAnimationFrame")
      requestAnimationFrame.and.returnValue("Test Requested Animation Frame")
      index.__set__("requestAnimationFrame", requestAnimationFrame)
      cancelAnimationFrame = jasmine.createSpy("cancelAnimationFrame")
      index.__set__("cancelAnimationFrame", cancelAnimationFrame)
      index.__set__("renderLoop", "Test Render Loop")
      setStatus = jasmine.createSpy("setStatus")
      index.__set__("setStatus", setStatus)
      statusToShow = jasmine.createSpy("statusToShow")
      index.__set__("statusToShow", statusToShow)
    })

    describe("when a status should be shown", () => {
      beforeEach(() => statusToShow.and.returnValue("Test Status To Show"))

      describe("when a render loop is running", () => {
        beforeEach(() => index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame"))

        describe("without a stored timestamp", () => {
          beforeEach(() => {
            index.__set__("renderLoopLastTimestamp", null)
            index.__get__("checkRenderLoop")()
          })
          it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
          it("cancels one animation frame", () => expect(cancelAnimationFrame).toHaveBeenCalledTimes(1))
          it("cancels the stored animation frame", () => expect(cancelAnimationFrame).toHaveBeenCalledWith("Test Existing Animation Frame"))
          it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
          it("does not change the stored timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
          it("sets one status", () => expect(setStatus).toHaveBeenCalledTimes(1))
          it("sets the status to the message which should be shown", () => expect(setStatus).toHaveBeenCalledWith("Test Status To Show"))
        })

        describe("with a stored timestamp", () => {
          beforeEach(() => {
            index.__set__("renderLoopLastTimestamp", 2369.23)
            index.__get__("checkRenderLoop")()
          })
          it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
          it("cancels one animation frame", () => expect(cancelAnimationFrame).toHaveBeenCalledTimes(1))
          it("cancels the stored animation frame", () => expect(cancelAnimationFrame).toHaveBeenCalledWith("Test Existing Animation Frame"))
          it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
          it("stores null as the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
          it("sets one status", () => expect(setStatus).toHaveBeenCalledTimes(1))
          it("sets the status to the message which should be shown", () => expect(setStatus).toHaveBeenCalledWith("Test Status To Show"))
        })
      })

      describe("when a render loop is not running", () => {
        beforeEach(() => {
          index.__set__("renderLoopAnimationFrame", null)
          index.__set__("renderLoopLastTimestamp", null)
          index.__get__("checkRenderLoop")()
        })
        it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
        it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
        it("does not change the stored animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
        it("does not change the stored timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
        it("sets one status", () => expect(setStatus).toHaveBeenCalledTimes(1))
        it("sets the status to the message which should be shown", () => expect(setStatus).toHaveBeenCalledWith("Test Status To Show"))
      })
    })

    describe("when a status should not be shown", () => {
      beforeEach(() => statusToShow.and.returnValue(null))

      describe("when a render loop is running", () => {
        beforeEach(() => index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame"))

        describe("without a stored timestamp", () => {
          beforeEach(() => {
            index.__set__("renderLoopLastTimestamp", null)
            index.__get__("checkRenderLoop")()
          })
          it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
          it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
          it("does not change the stored animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Existing Animation Frame"))
          it("does not change the stored timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
          it("does not set a status", () => expect(setStatus).not.toHaveBeenCalled())
        })

        describe("with a stored timestamp", () => {
          beforeEach(() => {
            index.__set__("renderLoopLastTimestamp", 2369.23)
            index.__get__("checkRenderLoop")()
          })
          it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
          it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
          it("does not change the stored animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Existing Animation Frame"))
          it("does not change the stored timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(2369.23))
          it("does not set a status", () => expect(setStatus).not.toHaveBeenCalled())
        })
      })

      describe("when a render loop is not running", () => {
        beforeEach(() => {
          index.__set__("renderLoopAnimationFrame", null)
          index.__set__("renderLoopLastTimestamp", null)
          index.__get__("checkRenderLoop")()
        })
        it("requests one animation frame", () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1))
        it("requests an animation frame for renderLoop", () => expect(requestAnimationFrame).toHaveBeenCalledWith("Test Render Loop"))
        it("does not cancel an animation frame", () => expect(cancelAnimationFrame).not.toHaveBeenCalled())
        it("stores the requested animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"))
        it("does not change the stored timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
        it("sets one status", () => expect(setStatus).toHaveBeenCalledTimes(1))
        it("sets the status to indicate that the first frame is coming", () => expect(setStatus).toHaveBeenCalledWith("Resuming..."))
      })
    })
  })

  describe("renderLoop", () => {
    let requestAnimationFrame, cancelAnimationFrame, render, setStatus
    beforeEach(() => {
      index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame")
      requestAnimationFrame = jasmine.createSpy("requestAnimationFrame")
      requestAnimationFrame.and.returnValue("Test Requested Animation Frame")
      index.__set__("requestAnimationFrame", requestAnimationFrame)
      render = jasmine.createSpy("render")
      index.__set__("render", render)
      setStatus = jasmine.createSpy("setStatus")
      index.__set__("setStatus", setStatus)
    })

    describe("on the first frame", () => {
      describe("on success", () => {
        beforeEach(() => index.__get__("renderLoop")(8973.21))
        it("calls render once", () => expect(render).toHaveBeenCalledTimes(1))
        it("calls render with zero delta seconds", () => expect(render).toHaveBeenCalledWith(0))
        it("requests one animation frame", () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1))
        it("requests an animation frame for renderLoop", () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")))
        it("stores the requested animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"))
        it("stores the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21))
        it("sets the status once", () => expect(setStatus).toHaveBeenCalledTimes(1))
        it("clears the status message", () => expect(setStatus).toHaveBeenCalledWith())
      })

      describe("on an exception", () => {
        beforeEach(() => {
          render.and.callFake(() => { throw "Test Error" })
          expect(() => index.__get__("renderLoop")(8973.21)).toThrow("Test Error")
        })
        it("calls render once", () => expect(render).toHaveBeenCalledTimes(1))
        it("calls render with zero delta seconds", () => expect(render).toHaveBeenCalledWith(0))
        it("does not request an animation frame", () => expect(requestAnimationFrame).not.toHaveBeenCalled())
        it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
        it("stores null as the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
        it("does not set the status", () => expect(setStatus).not.toHaveBeenCalled())
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
        it("requests an animation frame for renderLoop", () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")))
        it("stores the requested animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"))
        it("stores the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21))
        it("does not set the status", () => expect(setStatus).not.toHaveBeenCalled())
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
        it("stores null as the animation frame", () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull())
        it("stores null as the timestamp", () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull())
        it("does not set the status", () => expect(setStatus).not.toHaveBeenCalled())
      })
    })
  })
})