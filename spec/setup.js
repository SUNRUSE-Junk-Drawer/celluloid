describe("setup", () => {
  const rewire = require("rewire")
  let index, setupFocus, startRenderLoop
  beforeEach(() => {
    index = rewire("../dist/index")
    setupFocus = jasmine.createSpy("setupFocus")
    index.__set__("setupFocus", setupFocus)
    startRenderLoop = jasmine.createSpy("startRenderLoop")
    index.__set__("startRenderLoop", startRenderLoop)
    index.__get__("setup")()
  })

  it("sets up focus once", () => expect(setupFocus).toHaveBeenCalledTimes(1))
  it("starts the render loop once", () => expect(startRenderLoop).toHaveBeenCalledTimes(1))
})