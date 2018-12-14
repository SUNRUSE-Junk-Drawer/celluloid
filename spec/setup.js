describe("setup", () => {
  let setupFocus, setupCanvas, setupGl, checkRenderLoop, setupCanvasCallsAtTimeOfSetupGl
  setup(() => {
    setupFocus = jasmine.createSpy("setupFocus")
    index.__set__("setupFocus", setupFocus)
    setupCanvas = jasmine.createSpy("setupCanvas")
    index.__set__("setupCanvas", setupCanvas)
    setupGl = jasmine.createSpy("setupGl")
    setupGl.and.callFake(() => setupCanvasCallsAtTimeOfSetupGl = setupCanvas.calls.count())
    index.__set__("setupGl", setupGl)
    checkRenderLoop = jasmine.createSpy("checkRenderLoop")
    index.__set__("checkRenderLoop", checkRenderLoop)
    index.__get__("setup")()
  })

  assert({
    "sets up focus once": () => expect(setupFocus).toHaveBeenCalledTimes(1),
    "sets up the canvas once": () => expect(setupCanvas).toHaveBeenCalledTimes(1),
    "sets up webgl once": () => expect(setupGl).toHaveBeenCalledTimes(1),
    "sets up the canvas before webgl": () => expect(setupCanvasCallsAtTimeOfSetupGl).toEqual(1),
    "starts the render loop once": () => expect(checkRenderLoop).toHaveBeenCalledTimes(1)
  })
})
