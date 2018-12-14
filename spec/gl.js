describe("gl", () => {
  assert({
    "defines gl as null": () => expect(index.__get__("gl")).toBeNull(),
    "defines glNonce as a number": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number)),
    "defines glReady as false": () => expect(index.__get__("glReady")).toBeFalsy()
  })

  describe("setupGl", () => {
    describe("when no canvas exists", () => {
      let error
      setup(() => {
        index.__set__("canvas", null)
        try {
          index.__get__("setupGl")()
        } catch (e) {
          error = e
        }
      })
      assert({
        "it throws an error": () => expect(error).toEqual(new Error("Canvas not created when opening a WebGL context."))
      })
    })

    describe("when a canvas exists", () => {
      let getContext, handleContextRestored, glAtTimeOfInitializingWebgl
      setup(() => {
        getContext = jasmine.createSpy("getContext")
        index.__set__("canvas", {
          getContext
        })
        handleContextRestored = jasmine.createSpy("handleContextRestored")
        handleContextRestored.and.callFake(() => glAtTimeOfInitializingWebgl = index.__get__("gl"))
        index.__set__("handleContextRestored", handleContextRestored)
      })

      describe("when a \"webgl\" context is available", () => {
        setup(() => {
          getContext.and.returnValue("Test Context")
          index.__get__("setupGl")()
        })
        assert({
          "checks for one context": () => expect(getContext).toHaveBeenCalledTimes(1),
          "checks for a \"webgl\" context": () => expect(getContext).toHaveBeenCalledWith("webgl"),
          "initializes webgl once": () => expect(handleContextRestored).toHaveBeenCalledTimes(1),
          "has set gl by the time of initializing webgl": () => expect(glAtTimeOfInitializingWebgl).toEqual("Test Context"),
          "sets gl": () => expect(index.__get__("gl")).toEqual("Test Context"),
          "does not change the nonce": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number))
        })
      })

      describe("when an \"experimental-webgl\" context is available", () => {
        setup(() => {
          getContext.and.callFake(type => type == "experimental-webgl" ? "Test Context" : null)
          index.__get__("setupGl")()
        })
        assert({
          "checks for two contexts": () => expect(getContext).toHaveBeenCalledTimes(2),
          "checks for a \"webgl\" context": () => expect(getContext).toHaveBeenCalledWith("webgl"),
          "checks for an \"experimental-webgl\" context": () => expect(getContext).toHaveBeenCalledWith("experimental-webgl"),
          "initializes webgl once": () => expect(handleContextRestored).toHaveBeenCalledTimes(1),
          "has set gl by the time of initializing webgl": () => expect(glAtTimeOfInitializingWebgl).toEqual("Test Context"),
          "sets gl": () => expect(index.__get__("gl")).toEqual("Test Context"),
          "does not change the nonce": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number))
        })
      })

      describe("when no context is available", () => {
        let error
        setup(() => {
          getContext.and.returnValue(null)
          error = null
          try {
            index.__get__("setupGl")()
          } catch (e) {
            error = e
          }
        })
        assert({
          "checks for two contexts": () => expect(getContext).toHaveBeenCalledTimes(2),
          "checks for a \"webgl\" context": () => expect(getContext).toHaveBeenCalledWith("webgl"),
          "checks for an \"experimental-webgl\" context": () => expect(getContext).toHaveBeenCalledWith("experimental-webgl"),
          "does not initialize webgl": () => expect(handleContextRestored).not.toHaveBeenCalled(),
          "does not change gl": () => expect(index.__get__("gl")).toBeNull(),
          "does not change the nonce": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number)),
          "it throws an error": () => expect(error).toEqual(new Error("Failed to open a WebGL context.  Please ensure that your browser and device are up-to-date."))
        })
      })
    })
  })

  describe("handleContextLost", () => {
    let checkRenderLoop, glReadyAtTimeOfCheckingRenderLoop, preventDefault
    setup(() => {
      checkRenderLoop = jasmine.createSpy("checkRenderLoop")
      checkRenderLoop.and.callFake(() => glReadyAtTimeOfCheckingRenderLoop = index.__get__("glReady"))
      index.__set__("checkRenderLoop", checkRenderLoop)
      index.__set__("glReady", true)
      preventDefault = jasmine.createSpy("preventDefault")
      index.__get__("handleContextLost")({
        preventDefault
      })
    })
    assert({
      "sets glReady to false": () => expect(index.__get__("glReady")).toBeFalsy(),
      "checks the render loop once": () => expect(checkRenderLoop).toHaveBeenCalledTimes(1),
      "has set glReady to false by the time of checking the render loop": () => expect(glReadyAtTimeOfCheckingRenderLoop).toBeFalsy()
    })
  })

  describe("handleContextRestored", () => {
    let checkRenderLoop, glReadyAtTimeOfCheckingRenderLoop
    setup(() => {
      checkRenderLoop = jasmine.createSpy("checkRenderLoop")
      checkRenderLoop.and.callFake(() => glReadyAtTimeOfCheckingRenderLoop = index.__get__("glReady"))
      index.__set__("checkRenderLoop", checkRenderLoop)
      index.__set__("glReady", false)
      index.__get__("handleContextRestored")()
    })
    assert({
      "sets glReady to true": () => expect(index.__get__("glReady")).toBeTruthy(),
      "checks the render loop once": () => expect(checkRenderLoop).toHaveBeenCalledTimes(1),
      "has set glReady to true by the time of checking the render loop": () => expect(glReadyAtTimeOfCheckingRenderLoop).toBeTruthy()
    })
  })
})
