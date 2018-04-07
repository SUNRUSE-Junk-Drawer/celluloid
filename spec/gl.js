describe("gl", () => {
  const rewire = require("rewire")
  let index
  index = rewire("../dist/index")

  describe("handleContextLost", () => {
    beforeEach(() => index.__get__("handleContextLost")())
    it("does nothing", () => { })
  })

  describe("handleContextRestored", () => {
    beforeEach(() => index.__get__("handleContextRestored")())
    it("does nothing", () => { })
  })
})