describe("focus", () => {
  assert({
    "defines focused as true": () => expect(index.__get__("focused")).toBeTruthy()
  })

  describe("setupFocus", () => {
    let addEventListener, checkRenderLoop
    setup(() => {
      addEventListener = jasmine.createSpy("addEventListener")
      index.__set__("addEventListener", addEventListener)
      checkRenderLoop = jasmine.createSpy("checkRenderLoop")
      index.__set__("checkRenderLoop", checkRenderLoop)
      index.__get__("setupFocus")()
    })
    assert({
      "adds two event listeners": () => expect(addEventListener).toHaveBeenCalledTimes(2),
      "adds a focus event listener": () => expect(addEventListener).toHaveBeenCalledWith("focus", jasmine.any(Function)),
      "adds a blur event listener": () => expect(addEventListener).toHaveBeenCalledWith("blur", jasmine.any(Function)),
      "does not change focused": () => expect(index.__get__("focused")).toBeTruthy(),
      "does not check the render loop": () => expect(checkRenderLoop).not.toHaveBeenCalled()
    })

    describe("when focused", () => {
      describe("on focus", () => {
        setup(() => addEventListener.calls.allArgs().find(arg => arg[0] == "focus")[1]())
        assert({
          "does not add further event listeners": () => expect(addEventListener).toHaveBeenCalledTimes(2),
          "does not change focused": () => expect(index.__get__("focused")).toBeTruthy(),
          "does not check the render loop": () => expect(checkRenderLoop).not.toHaveBeenCalled()
        })
      })

      describe("on blur", () => {
        let focusedAtTimeOfCheckingRenderLoop
        setup(() => {
          focusedAtTimeOfCheckingRenderLoop = null
          checkRenderLoop.and.callFake(() => focusedAtTimeOfCheckingRenderLoop = index.__get__("focused"))
          addEventListener.calls.allArgs().find(arg => arg[0] == "blur")[1]()
        })
        assert({
          "does not add further event listeners": () => expect(addEventListener).toHaveBeenCalledTimes(2),
          "sets focused to false": () => expect(index.__get__("focused")).toBeFalsy(),
          "checks the render loop once": () => expect(checkRenderLoop).toHaveBeenCalledTimes(1),
          "has set focused to true by the time of checking the render loop": () => expect(focusedAtTimeOfCheckingRenderLoop).toBeFalsy()
        })
      })
    })

    describe("when blurred", () => {
      setup(() => index.__set__("focused", false))
      describe("on focus", () => {
        let focusedAtTimeOfCheckingRenderLoop
        setup(() => {
          focusedAtTimeOfCheckingRenderLoop = null
          checkRenderLoop.and.callFake(() => focusedAtTimeOfCheckingRenderLoop = index.__get__("focused"))
          addEventListener.calls.allArgs().find(arg => arg[0] == "focus")[1]()
        })
        assert({
          "does not add further event listeners": () => expect(addEventListener).toHaveBeenCalledTimes(2),
          "sets focused to true": () => expect(index.__get__("focused")).toBeTruthy(),
          "checks the render loop once": () => expect(checkRenderLoop).toHaveBeenCalledTimes(1),
          "has set focused to true by the time of checking the render loop": () => expect(focusedAtTimeOfCheckingRenderLoop).toBeTruthy()
        })
      })

      describe("on blur", () => {
        setup(() => addEventListener.calls.allArgs().find(arg => arg[0] == "blur")[1]())
        assert({
          "does not add further event listeners": () => expect(addEventListener).toHaveBeenCalledTimes(2),
          "does not change focused": () => expect(index.__get__("focused")).toBeFalsy(),
          "does not check the render loop": () => expect(checkRenderLoop).not.toHaveBeenCalled()
        })
      })
    })
  })
})
