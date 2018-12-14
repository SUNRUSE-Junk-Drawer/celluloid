describe("canvas", () => {
  assert({
    "defines canvas as null": () => expect(index.__get__("canvas")).toBeNull()
  })

  describe("setupCanvas", () => {
    let appendChild, createElement, addEventListener, canvas
    setup(() => {
      addEventListener = jasmine.createSpy("addEventListener")
      canvas = {
        style: {
          position: "Test Existing Position",
          left: "Test Existing Left",
          top: "Test Existing Top",
          width: "Test Existing Width",
          height: "Test Existing Height",
          visibility: "Test Existing Visibility",
          testMiscellaneousKey: "Test Miscellaneous Value"
        },
        addEventListener
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
      index.__set__("handleContextLost", "Test Handle Context Lost")
      index.__set__("handleContextRestored", "Test Handle Context Restored")

      index.__get__("setupCanvas")()
    })
    assert({
      "creates one element": () => expect(createElement).toHaveBeenCalledTimes(1),
      "creates a canvas": () => expect(createElement).toHaveBeenCalledWith("canvas"),
      "sets the canvas's style's position to fixed": () => expect(canvas.style.position).toEqual("fixed"),
      "sets the canvas's style's left to zero": () => expect(canvas.style.left).toEqual("0"),
      "sets the canvas's style's top to zero": () => expect(canvas.style.top).toEqual("0"),
      "sets the canvas's style's width to full": () => expect(canvas.style.width).toEqual("100%"),
      "sets the canvas's style's height to full": () => expect(canvas.style.height).toEqual("100%"),
      "sets the canvas's style's visibility to hidden": () => expect(canvas.style.visibility).toEqual("hidden"),
      "does not modify other aspects of the canvas's style": () => expect(canvas.style.testMiscellaneousKey).toEqual("Test Miscellaneous Value"),
      "appends one element to the document body": () => expect(appendChild).toHaveBeenCalledTimes(1),
      "appends the canvas to the document body": () => expect(appendChild).toHaveBeenCalledWith(canvas),
      "adds two event listeners": () => expect(addEventListener).toHaveBeenCalledTimes(2),
      "adds a context lost event listener": () => expect(addEventListener).toHaveBeenCalledWith("webglcontextlost", "Test Handle Context Lost"),
      "adds a context restored event listener": () => expect(addEventListener).toHaveBeenCalledWith("webglcontextrestored", "Test Handle Context Restored"),
      "exposes the canvas": () => expect(index.__get__("canvas")).toBe(canvas)
    })
  })

  describe("stopCanvas", () => {
    describe("when there is not a canvas", () => {
      setup(() => index.__get__("stopCanvas")())
      assert({
        "does nothing": () => { }
      })
    })
    describe("when there is a canvas", () => {
      let removeEventListener
      setup(() => {
        removeEventListener = jasmine.createSpy("removeEventListener")
        index.__set__("canvas", {
          removeEventListener
        })
        index.__set__("handleContextLost", "Test Handle Context Lost")
        index.__set__("handleContextRestored", "Test Handle Context Restored")
        index.__get__("stopCanvas")()
      })
      assert({
        "removes two event listeners": () => expect(removeEventListener).toHaveBeenCalledTimes(2),
        "removes a context lost event listener": () => expect(removeEventListener).toHaveBeenCalledWith("webglcontextlost", "Test Handle Context Lost"),
        "removes a context restored event listener": () => expect(removeEventListener).toHaveBeenCalledWith("webglcontextrestored", "Test Handle Context Restored"),
      })
    })
  })
})
