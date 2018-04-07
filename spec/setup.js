describe("setup", () => {
  const rewire = require("rewire")
  let index, setupFocus, setupCanvas, checkRenderLoop
  beforeEach(() => {
    index = rewire("../dist/index")
    setupFocus = jasmine.createSpy("setupFocus")
    index.__set__("setupFocus", setupFocus)
    setupCanvas = jasmine.createSpy("setupCanvas")
    index.__set__("setupCanvas", setupCanvas)
    checkRenderLoop = jasmine.createSpy("checkRenderLoop")
    index.__set__("checkRenderLoop", checkRenderLoop)
    index.__get__("setup")()
  })

  it("sets up focus once", () => expect(setupFocus).toHaveBeenCalledTimes(1))
  it("sets up the canvas once", () => expect(setupCanvas).toHaveBeenCalledTimes(1))
  it("starts the render loop once", () => expect(checkRenderLoop).toHaveBeenCalledTimes(1))
})