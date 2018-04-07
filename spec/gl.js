describe("gl", () => {
  const rewire = require("rewire")
  let index
  index = rewire("../dist/index")

  it("defines gl as null", () => expect(index.__get__("gl")).toBeNull())
  it("defines glNonce as a number", () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number)))

  describe("handleContextLost", () => {
    beforeEach(() => index.__get__("handleContextLost")())
    it("does nothing", () => { })
  })

  describe("handleContextRestored", () => {
    beforeEach(() => index.__get__("handleContextRestored")())
    it("does nothing", () => { })
  })
})