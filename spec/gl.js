describe("gl", () => {
  assert({
    "defines gl as null": () => expect(index.__get__("gl")).toBeNull(),
    "defines glNonce as a number": () => expect(index.__get__("glNonce")).toEqual(jasmine.any(Number))
  })

  describe("handleContextLost", () => {
    setup(() => index.__get__("handleContextLost")())
    assert({
      "does nothing": () => { }
    })
  })

  describe("handleContextRestored", () => {
    setup(() => index.__get__("handleContextRestored")())
    assert({
      "does nothing": () => { }
    })
  })
})