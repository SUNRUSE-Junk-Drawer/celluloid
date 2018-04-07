describe("canvas", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  it("defines canvas as null", () => expect(index.__get__("canvas")).toBeNull())

  describe("setupCanvas", () => {
    let appendChild, createElement, canvas
    beforeEach(() => {
      canvas = {
        style: {
          position: "Test Existing Position",
          left: "Test Existing Left",
          top: "Test Existing Top",
          width: "Test Existing Width",
          height: "Test Existing Height",
          visibility: "Test Existing Visibility",
          testMiscellaneousKey: "Test Miscellaneous Value"
        }
      }
      createElement = jasmine.createSpy("createElement")
      createElement.and.returnValue(canvas)
      appendChild = jasmine.createSpy("appendChild")
      index.__set__("document", {
        createElement,
        body: {
          appendChild
        }
      })

      index.__get__("setupCanvas")()
    })
    it("creates one element", () => expect(createElement).toHaveBeenCalledTimes(1))
    it("creates a canvas", () => expect(createElement).toHaveBeenCalledWith("CANVAS"))
    it("sets the canvas's style's position to fixed", () => expect(canvas.style.position).toEqual("fixed"))
    it("sets the canvas's style's left to zero", () => expect(canvas.style.left).toEqual("0"))
    it("sets the canvas's style's top to zero", () => expect(canvas.style.top).toEqual("0"))
    it("sets the canvas's style's width to full", () => expect(canvas.style.width).toEqual("100%"))
    it("sets the canvas's style's height to full", () => expect(canvas.style.height).toEqual("100%"))
    it("sets the canvas's style's visibility to hidden", () => expect(canvas.style.visibility).toEqual("hidden"))
    it("does not modify other aspects of the canvas's style", () => expect(canvas.style.testMiscellaneousKey).toEqual("Test Miscellaneous Value"))
    it("appends one element to the document body", () => expect(appendChild).toHaveBeenCalledTimes(1))
    it("appends the canvas to the document body", () => expect(appendChild).toHaveBeenCalledWith(canvas))
    it("exposes the canvas", () => expect(index.__get__("canvas")).toBe(canvas))
  })
})