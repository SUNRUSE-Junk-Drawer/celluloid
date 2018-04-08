describe("status", () => {
  describe("setStatus", () => {
    let document, getElementById
    setup(() => {
      getElementById = jasmine.createSpy("getElementById")

      document = {
        testIrrelevantKeyA: "Test Irrelevant Value A",
        getElementById: getElementById,
        testIrrelevantKeyB: "Test Irrelevant Value B"
      }

      index.__set__("document", document)
    })

    describe("when no element exists", () => {
      setup(() => getElementById.and.returnValue(null))
      describe("when no message is given", () => {
        setup(() => index.__get__("setStatus")())
        assert({
          "checks once for an element": () => expect(getElementById).toHaveBeenCalledTimes(1),
          "checks for the status element": () => expect(getElementById).toHaveBeenCalledWith("status")
        })
      })
      describe("when a message is given", () => {
        setup(() => index.__get__("setStatus")("Test Message"))
        assert({
          "checks once for an element": () => expect(getElementById).toHaveBeenCalledTimes(1),
          "checks for the status element": () => expect(getElementById).toHaveBeenCalledWith("status")
        })
      })
    })
    describe("when an element exists", () => {
      let element
      setup(() => {
        element = {
          testIrrelevantKeyC: "Test Irrelevant Value C",
          textContent: "Test Existing Text Content",
          style: {
            testIrrelevantKeyE: "Test Irrelevant Value E",
            display: "Test Existing Display",
            testIrrelevantKeyF: "Test Irrelevant Value F"
          },
          testIrrelevantKeyD: "Test Irrelevant Value D"
        }

        getElementById.and.returnValue(element)
      })

      describe("when no message is given", () => {
        setup(() => index.__get__("setStatus")())
        assert({
          "checks once for an element": () => expect(getElementById).toHaveBeenCalledTimes(1),
          "checks for the status element": () => expect(getElementById).toHaveBeenCalledWith("status"),
          "changes the style's display to none": () => expect(element.style.display).toEqual("none"),
          "does not change other properties of the element": () => {
            expect(element.testIrrelevantKeyC).toEqual("Test Irrelevant Value C")
            expect(element.testIrrelevantKeyD).toEqual("Test Irrelevant Value D")
          },
          "does not change other properties of the style": () => {
            expect(element.style.testIrrelevantKeyE).toEqual("Test Irrelevant Value E")
            expect(element.style.testIrrelevantKeyF).toEqual("Test Irrelevant Value F")
          },
        })
      })
      describe("when a message is given", () => {
        setup(() => index.__get__("setStatus")("Test Message"))
        assert({
          "checks once for an element": () => expect(getElementById).toHaveBeenCalledTimes(1),
          "checks for the status element": () => expect(getElementById).toHaveBeenCalledWith("status"),
          "changes the style's display to block": () => expect(element.style.display).toEqual("block"),
          "changes the textContent to the message": () => expect(element.textContent).toEqual("Test Message"),
          "does not change other properties of the element": () => {
            expect(element.testIrrelevantKeyC).toEqual("Test Irrelevant Value C")
            expect(element.testIrrelevantKeyD).toEqual("Test Irrelevant Value D")
          },
          "does not change other properties of the style": () => {
            expect(element.style.testIrrelevantKeyE).toEqual("Test Irrelevant Value E")
            expect(element.style.testIrrelevantKeyF).toEqual("Test Irrelevant Value F")
          }
        })
      })
    })
  })
})