describe("status", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  describe("setStatus", () => {
    let document, getElementById
    beforeEach(() => {
      getElementById = jasmine.createSpy("getElementById")

      document = {
        testIrrelevantKeyA: "Test Irrelevant Value A",
        getElementById: getElementById,
        testIrrelevantKeyB: "Test Irrelevant Value B"
      }

      index.__set__("document", document)
    })

    describe("when no element exists", () => {
      const scenario = (description, action) => describe(description, () => {
        beforeEach(() => {
          getElementById.and.returnValue(null)
          action()
        })

        it("checks once for an element", () => expect(getElementById).toHaveBeenCalledTimes(1))
        it("checks for the status element", () => expect(getElementById).toHaveBeenCalledWith("status"))
      })

      scenario("when no message is given", () => index.__get__("setStatus")())
      scenario("when a message is given", () => index.__get__("setStatus")("Test Message"))
    })
    describe("when an element exists", () => {
      let element
      beforeEach(() => {
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
        beforeEach(() => index.__get__("setStatus")())
        it("checks once for an element", () => expect(getElementById).toHaveBeenCalledTimes(1))
        it("checks for the status element", () => expect(getElementById).toHaveBeenCalledWith("status"))
        it("changes the style's display to none", () => expect(element.style.display).toEqual("none"))
        it("does not change other properties of the element", () => {
          expect(element.testIrrelevantKeyC).toEqual("Test Irrelevant Value C")
          expect(element.testIrrelevantKeyD).toEqual("Test Irrelevant Value D")
        })
        it("does not change other properties of the style", () => {
          expect(element.style.testIrrelevantKeyE).toEqual("Test Irrelevant Value E")
          expect(element.style.testIrrelevantKeyF).toEqual("Test Irrelevant Value F")
        })
      })
      describe("when a message is given", () => {
        beforeEach(() => index.__get__("setStatus")("Test Message"))
        it("checks once for an element", () => expect(getElementById).toHaveBeenCalledTimes(1))
        it("checks for the status element", () => expect(getElementById).toHaveBeenCalledWith("status"))
        it("changes the style's display to block", () => expect(element.style.display).toEqual("block"))
        it("changes the textContent to the message", () => expect(element.textContent).toEqual("Test Message"))
        it("does not change other properties of the element", () => {
          expect(element.testIrrelevantKeyC).toEqual("Test Irrelevant Value C")
          expect(element.testIrrelevantKeyD).toEqual("Test Irrelevant Value D")
        })
        it("does not change other properties of the style", () => {
          expect(element.style.testIrrelevantKeyE).toEqual("Test Irrelevant Value E")
          expect(element.style.testIrrelevantKeyF).toEqual("Test Irrelevant Value F")
        })
      })
    })
  })
})