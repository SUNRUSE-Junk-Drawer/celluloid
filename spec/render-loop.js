describe("renderLoop", () => {
  assert({
    "defines renderLoopAnimationFrame as null": () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull(),
    "defines renderLoopLastTimestamp as null": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull()
  })

  describe("statusToShow", () => {
    describe("when gl is ready", () => {
      setup(() => index.__set__("glReady", true))
      describe("when focused", () => {
        setup(() => index.__set__("document", { hasFocus: () => true }))
        describe("when an error has been encountered", () => {
          setup(() => index.__set__("errorEncountered", "Test Error"))
          assert({
            "returns the encountered error": () => expect(index.__get__("statusToShow")()).toEqual("Test Error")
          })
        })
        describe("when an error has not been encountered", () => {
          setup(() => index.__set__("errorEncountered", null))
          assert({
            "returns null": () => expect(index.__get__("statusToShow")()).toBeNull()
          })
        })
      })

      describe("when not focused", () => {
        setup(() => index.__set__("document", { hasFocus: () => false }))
        describe("when an error has been encountered", () => {
          setup(() => index.__set__("errorEncountered", "Test Error"))
          assert({
            "returns the encountered error": () => expect(index.__get__("statusToShow")()).toEqual("Test Error")
          })
        })
        describe("when an error has not been encountered", () => {
          setup(() => index.__set__("errorEncountered", null))
          assert({
            "returns \"Paused\"": () => expect(index.__get__("statusToShow")()).toEqual("Paused")
          })
        })
      })
    })
    describe("when gl is not ready", () => {
      setup(() => index.__set__("glReady", false))
      describe("when focused", () => {
        setup(() => index.__set__("document", { hasFocus: () => true }))
        describe("when an error has been encountered", () => {
          setup(() => index.__set__("errorEncountered", "Test Error"))
          assert({
            "returns the encountered error": () => expect(index.__get__("statusToShow")()).toEqual("Test Error")
          })
        })
        describe("when an error has not been encountered", () => {
          setup(() => index.__set__("errorEncountered", null))
          assert({
            "returns null": () => expect(index.__get__("statusToShow")()).toEqual("Restarting WebGL...")
          })
        })
      })

      describe("when not focused", () => {
        setup(() => index.__set__("document", { hasFocus: () => false }))
        describe("when an error has been encountered", () => {
          setup(() => index.__set__("errorEncountered", "Test Error"))
          assert({
            "returns the encountered error": () => expect(index.__get__("statusToShow")()).toEqual("Test Error")
          })
        })
        describe("when an error has not been encountered", () => {
          setup(() => index.__set__("errorEncountered", null))
          assert({
            "returns \"Paused\"": () => expect(index.__get__("statusToShow")()).toEqual("Paused")
          })
        })
      })
    })
  })

  describe("checkRenderLoop", () => {
    let requestAnimationFrame, cancelAnimationFrame, setStatus, statusToShow
    setup(() => {
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
      setup(() => statusToShow.and.returnValue("Test Status To Show"))

      describe("when a render loop is running", () => {
        setup(() => index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame"))

        describe("without a stored timestamp", () => {
          setup(() => {
            index.__set__("renderLoopLastTimestamp", null)
            index.__get__("checkRenderLoop")()
          })
          assert({
            "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
            "cancels one animation frame": () => expect(cancelAnimationFrame).toHaveBeenCalledTimes(1),
            "cancels the stored animation frame": () => expect(cancelAnimationFrame).toHaveBeenCalledWith("Test Existing Animation Frame"),
            "stores null as the animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull(),
            "does not change the stored timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
            "sets one status": () => expect(setStatus).toHaveBeenCalledTimes(1),
            "sets the status to the message which should be shown": () => expect(setStatus).toHaveBeenCalledWith("Test Status To Show")
          })
        })

        describe("with a stored timestamp", () => {
          setup(() => {
            index.__set__("renderLoopLastTimestamp", 2369.23)
            index.__get__("checkRenderLoop")()
          })
          assert({
            "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
            "cancels one animation frame": () => expect(cancelAnimationFrame).toHaveBeenCalledTimes(1),
            "cancels the stored animation frame": () => expect(cancelAnimationFrame).toHaveBeenCalledWith("Test Existing Animation Frame"),
            "stores null as the animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull(),
            "stores null as the timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
            "sets one status": () => expect(setStatus).toHaveBeenCalledTimes(1),
            "sets the status to the message which should be shown": () => expect(setStatus).toHaveBeenCalledWith("Test Status To Show")
          })
        })
      })

      describe("when a render loop is not running", () => {
        setup(() => {
          index.__set__("renderLoopAnimationFrame", null)
          index.__set__("renderLoopLastTimestamp", null)
          index.__get__("checkRenderLoop")()
        })
        assert({
          "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
          "does not cancel an animation frame": () => expect(cancelAnimationFrame).not.toHaveBeenCalled(),
          "does not change the stored animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull(),
          "does not change the stored timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
          "sets one status": () => expect(setStatus).toHaveBeenCalledTimes(1),
          "sets the status to the message which should be shown": () => expect(setStatus).toHaveBeenCalledWith("Test Status To Show")
        })
      })
    })

    describe("when a status should not be shown", () => {
      setup(() => statusToShow.and.returnValue(null))

      describe("when a render loop is running", () => {
        setup(() => index.__set__("renderLoopAnimationFrame", "Test Existing Animation Frame"))

        describe("without a stored timestamp", () => {
          setup(() => {
            index.__set__("renderLoopLastTimestamp", null)
            index.__get__("checkRenderLoop")()
          })
          assert({
            "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
            "does not cancel an animation frame": () => expect(cancelAnimationFrame).not.toHaveBeenCalled(),
            "does not change the stored animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Existing Animation Frame"),
            "does not change the stored timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
            "does not set a status": () => expect(setStatus).not.toHaveBeenCalled()
          })
        })

        describe("with a stored timestamp", () => {
          setup(() => {
            index.__set__("renderLoopLastTimestamp", 2369.23)
            index.__get__("checkRenderLoop")()
          })
          assert({
            "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
            "does not cancel an animation frame": () => expect(cancelAnimationFrame).not.toHaveBeenCalled(),
            "does not change the stored animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Existing Animation Frame"),
            "does not change the stored timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(2369.23),
            "does not set a status": () => expect(setStatus).not.toHaveBeenCalled()
          })
        })
      })

      describe("when a render loop is not running", () => {
        setup(() => {
          index.__set__("renderLoopAnimationFrame", null)
          index.__set__("renderLoopLastTimestamp", null)
          index.__get__("checkRenderLoop")()
        })
        assert({
          "requests one animation frame": () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1),
          "requests an animation frame for renderLoop": () => expect(requestAnimationFrame).toHaveBeenCalledWith("Test Render Loop"),
          "does not cancel an animation frame": () => expect(cancelAnimationFrame).not.toHaveBeenCalled(),
          "stores the requested animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"),
          "does not change the stored timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
          "sets one status": () => expect(setStatus).toHaveBeenCalledTimes(1),
          "sets the status to indicate that the first frame is coming": () => expect(setStatus).toHaveBeenCalledWith("Resuming...")
        })
      })
    })
  })

  describe("renderLoop", () => {
    let requestAnimationFrame, cancelAnimationFrame, render, setStatus
    setup(() => {
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
        setup(() => index.__get__("renderLoop")(8973.21))
        assert({
          "calls render once": () => expect(render).toHaveBeenCalledTimes(1),
          "calls render with zero delta seconds": () => expect(render).toHaveBeenCalledWith(0),
          "requests one animation frame": () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1),
          "requests an animation frame for renderLoop": () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")),
          "stores the requested animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"),
          "stores the timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21),
          "sets the status once": () => expect(setStatus).toHaveBeenCalledTimes(1),
          "clears the status message": () => expect(setStatus).toHaveBeenCalledWith(null)
        })
      })

      describe("on an exception", () => {
        setup(() => {
          render.and.callFake(() => { throw "Test Error" })
          expect(() => index.__get__("renderLoop")(8973.21)).toThrow("Test Error")
        })
        assert({
          "calls render once": () => expect(render).toHaveBeenCalledTimes(1),
          "calls render with zero delta seconds": () => expect(render).toHaveBeenCalledWith(0),
          "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
          "stores null as the animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull(),
          "stores null as the timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
          "does not set the status": () => expect(setStatus).not.toHaveBeenCalled()
        })
      })
    })

    describe("on a subsequent frame", () => {
      setup(() => index.__set__("renderLoopLastTimestamp", 4216.18))

      describe("on success", () => {
        setup(() => index.__get__("renderLoop")(8973.21))
        assert({
          "calls render once": () => expect(render).toHaveBeenCalledTimes(1),
          "calls render with the delta seconds": () => {
            expect(render).toHaveBeenCalledWith(jasmine.any(Number))
            expect(render.calls.argsFor(0)[0]).toBeCloseTo(4.75703)
          },
          "requests one animation frame": () => expect(requestAnimationFrame).toHaveBeenCalledTimes(1),
          "requests an animation frame for renderLoop": () => expect(requestAnimationFrame).toHaveBeenCalledWith(index.__get__("renderLoop")),
          "stores the requested animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toEqual("Test Requested Animation Frame"),
          "stores the timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toEqual(8973.21),
          "does not set the status": () => expect(setStatus).not.toHaveBeenCalled()
        })
      })

      describe("on an exception", () => {
        setup(() => {
          render.and.callFake(() => { throw "Test Error" })
          expect(() => index.__get__("renderLoop")(8973.21)).toThrow("Test Error")
        })
        assert({
          "calls render once": () => expect(render).toHaveBeenCalledTimes(1),
          "calls render with the delta seconds": () => {
            expect(render).toHaveBeenCalledWith(jasmine.any(Number))
            expect(render.calls.argsFor(0)[0]).toBeCloseTo(4.75703)
          },
          "does not request an animation frame": () => expect(requestAnimationFrame).not.toHaveBeenCalled(),
          "stores null as the animation frame": () => expect(index.__get__("renderLoopAnimationFrame")).toBeNull(),
          "stores null as the timestamp": () => expect(index.__get__("renderLoopLastTimestamp")).toBeNull(),
          "does not set the status": () => expect(setStatus).not.toHaveBeenCalled()
        })
      })
    })
  })
})
