describe("gl", () => {
  assert({
    "defines gl as null": () => expect(index.__get__("gl")).toBeNull(),
    "defines glNonce as a number": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number))
  })

  describe("setupGl", () => {
    let getContext, initializeGl, glAtTimeOfInitializingWebgl
    setup(() => {
      getContext = jasmine.createSpy("getContext")
      index.__set__("canvas", {
        getContext
      })
      initializeGl = jasmine.createSpy("initializeGl")
      initializeGl.and.callFake(() => glAtTimeOfInitializingWebgl = index.__get__("gl"))
      index.__set__("initializeGl", initializeGl)
    })

    describe("when a \"webgl\" context is available", () => {
      setup(() => {
        getContext.and.returnValue("Test Context")
        index.__get__("setupGl")()
      })
      assert({
        "checks for one context": () => expect(getContext).toHaveBeenCalledTimes(1),
        "checks for a \"webgl\" context": () => expect(getContext).toHaveBeenCalledWith("webgl"),
        "initializes webgl once": () => expect(initializeGl).toHaveBeenCalledTimes(1),
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
        "initializes webgl once": () => expect(initializeGl).toHaveBeenCalledTimes(1),
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
        "does not initialize webgl": () => expect(initializeGl).not.toHaveBeenCalled(),
        "does not change gl": () => expect(index.__get__("gl")).toBeNull(),
        "does not change the nonce": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number)),
        "it throws an error": () => expect(error).toEqual(new Error("Failed to open a WebGL context.  Please ensure that your browser and device are up-to-date."))
      })
    })
  })

  describe("initializeGl", () => {
    setup(() => index.__get__("initializeGl")())
    assert({
      "does nothing": () => { }
    })
  })

  describe("handleContextLost", () => {
    setup(() => index.__get__("handleContextLost")())
    assert({
      "does nothing": () => { }
    })
  })

  describe("handleContextRestored", () => {
    setup(() => index.__get__("handleContextRestored")())
    assert({
      "does nothing": () => { }
    })
  })
})