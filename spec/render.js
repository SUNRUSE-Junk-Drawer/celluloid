describe("render", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  describe("render", () => {
    beforeEach(() => index.__get__("render")())

    it("does nothing", () => { })
  })
})