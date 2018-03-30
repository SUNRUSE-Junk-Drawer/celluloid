describe("file", () => {
  const rewire = require("rewire")
  let index
  beforeEach(() => index = rewire("../dist/index"))

  describe("readFileAsArrayBuffer", () => {
    let XMLHttpRequest, callback, open, send, request, openCallsAtTimeOfCallingSend, responseTypeAtTimeOfCallingSend, console
    beforeEach(() => {
      open = jasmine.createSpy("open")
      send = jasmine.createSpy("send")
      send.and.callFake(() => {
        openCallsAtTimeOfCallingSend = open.calls.count()
        responseTypeAtTimeOfCallingSend = request.responseType
      })
      XMLHttpRequest = jasmine.createSpy("XMLHttpRequest")
      XMLHttpRequest.and.callFake(function () {
        this.open = open
        this.send = send
        this.responseType = "Test Initial Response Type"
        this.testIrrelevantKeyA = "Test Irrelevant Value A"
        this.testIrrelevantKeyB = "Test Irrelevant Value B"
        this.onload = "Test Initial Onload"
        this.onerror = "Test Initial Onerror"
        request = this
      })
      request = null
      index.__set__("XMLHttpRequest", XMLHttpRequest)
      callback = jasmine.createSpy("callback")
      index.__get__("readFileAsArrayBuffer")("Test URL", callback)
      console = {
        testIrrelevantKeyC: "Test Irrelevant Value C",
        error: jasmine.createSpy("console.error"),
        testIrrelevantKeyD: "Test Irrelevant Value D"
      }
      index.__set__("console", console)
    })

    it("creates one XMLHttpRequest", () => expect(XMLHttpRequest).toHaveBeenCalledTimes(1))
    it("does not modify other properties of the XMLHttpRequest", () => {
      expect(request.testIrrelevantKeyA).toEqual("Test Irrelevant Value A")
      expect(request.testIrrelevantKeyB).toEqual("Test Irrelevant Value B")
    })
    it("opens once", () => expect(open).toHaveBeenCalledTimes(1))
    it("opens as a GET", () => expect(open).toHaveBeenCalledWith("GET", jasmine.anything(), jasmine.anything()))
    it("opens the given url", () => expect(open).toHaveBeenCalledWith(jasmine.anything(), "Test URL", jasmine.anything()))
    it("opens asynchronously", () => expect(open).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), true))
    it("sends once", () => expect(send).toHaveBeenCalledTimes(1))
    it("sends after opening", () => expect(openCallsAtTimeOfCallingSend).toEqual(1))
    it("has set the response type by opening", () => expect(responseTypeAtTimeOfCallingSend).toEqual("arraybuffer"))
    it("does not change the response type after opening", () => expect(request.responseType).toEqual("arraybuffer"))
    it("adds an error event handler", () => expect(request.onerror).toEqual(jasmine.any(Function)))
    it("adds a loading event handler", () => expect(request.onload).toEqual(jasmine.any(Function)))
    it("does not execute the callback", () => expect(callback).not.toHaveBeenCalled())
    it("does not log an error", () => expect(console.error).not.toHaveBeenCalled())

    describe("on encountering an error", () => {
      beforeEach(() => request.onerror({
        testIrrelevantKeyE: "Test Irrelevant Value E",
        error: "Test Error",
        testIrrelevantKeyF: "Test Irrelevant Value F"
      }))
      it("does not create another XMLHttpRequest", () => expect(XMLHttpRequest).toHaveBeenCalledTimes(1))
      it("does not open again", () => expect(open).toHaveBeenCalledTimes(1))
      it("does not send again", () => expect(send).toHaveBeenCalledTimes(1))
      it("does not execute the callback", () => expect(callback).not.toHaveBeenCalled())
      it("logs one error", () => expect(console.error).toHaveBeenCalledTimes(1))
      it("logs the error", () => expect(console.error).toHaveBeenCalledWith("Test Error"))
    })

    describe("on loading", () => {
      beforeEach(() => {
        request.response = "Test Array Buffer"
        request.onload({
          testIrrelevantKeyE: "Test Irrelevant Value E",
          testIrrelevantKeyF: "Test Irrelevant Value F"
        })
      })
      it("does not create another XMLHttpRequest", () => expect(XMLHttpRequest).toHaveBeenCalledTimes(1))
      it("does not open again", () => expect(open).toHaveBeenCalledTimes(1))
      it("does not send again", () => expect(send).toHaveBeenCalledTimes(1))
      it("executes the callback once", () => expect(callback).toHaveBeenCalledTimes(1))
      it("executes the callback with the response", () => expect(callback).toHaveBeenCalledWith("Test Array Buffer"))
      it("does not log an error", () => expect(console.error).not.toHaveBeenCalled())
    })
  })
})