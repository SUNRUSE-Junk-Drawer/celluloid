describe("setup", () => {
  const rewire = require("rewire")
  let index, setupFocus, checkRenderLoop
  beforeEach(() => {
    index = rewire("../dist/index")
    setupFocus = jasmine.createSpy("setupFocus")
    index.__set__("setupFocus", setupFocus)
    checkRenderLoop = jasmine.createSpy("checkRenderLoop")
    index.__set__("checkRenderLoop", checkRenderLoop)
    index.__get__("setup")()
  })

  it("sets up focus once", () => expect(setupFocus).toHaveBeenCalledTimes(1))
  it("starts the render loop once", () => expect(checkRenderLoop).toHaveBeenCalledTimes(1))
})