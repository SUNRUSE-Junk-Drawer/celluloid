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

  describe("createParser", () => {
    let arrayBuffer, parser
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116]).buffer
      parser = index.__get__("createParser")(arrayBuffer)
    })
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116]))
    it("returns a data view", () => expect(parser.dataView).toEqual(jasmine.any(DataView)))
    it("returns a data view into the array buffer", () => expect(parser.dataView.buffer).toBe(arrayBuffer))
    it("returns a data view from the start of the array buffer", () => expect(parser.dataView.byteOffset).toEqual(0))
    it("returns a data view to the end of the array buffer", () => expect(parser.dataView.byteLength).toEqual(5))
    it("returns a position of zero", () => expect(parser.position).toEqual(0))
  })

  describe("parseUint8", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint8")(parser)
    })
    it("returns the correct number", () => expect(result).toEqual(240))
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(3))
  })

  describe("parseUint8Array", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint8Array")(parser, 3)
    })
    it("returns a Uint8Array", () => expect(result).toEqual(jasmine.any(Uint8Array)))
    it("returns the correct quantity of numbers", () => expect(result.length).toEqual(3))
    it("returns the correct number", () => {
      expect(result[0]).toEqual(240)
      expect(result[1]).toEqual(195)
      expect(result[2]).toEqual(116)
    })
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(5))
  })

  describe("parseUint16", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 111, 8]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint16")(parser)
    })
    it("returns the correct number", () => expect(result).toEqual(50160))
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 111, 8]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(4))
  })

  describe("parseUint16Array", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint16Array")(parser, 3)
    })
    it("returns a Uint16Array", () => expect(result).toEqual(jasmine.any(Uint16Array)))
    it("returns the correct quantity of numbers", () => expect(result.length).toEqual(3))
    it("returns the correct number", () => {
      expect(result[0]).toEqual(50160)
      expect(result[1]).toEqual(16756)
      expect(result[2]).toEqual(5384)
    })
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(8))
  })

  describe("parseFloat32", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseFloat32")(parser)
    })
    it("returns the correct number", () => expect(result).toBeCloseTo(15.2978363037109))
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(6))
  })

  describe("parseFloat32Array", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 96, 213, 117, 64, 111, 8, 21, 66, 250, 201, 102, 70, 9, 211, 53, 41, 77, 191, 67, 77, 212, 23, 30, 211, 203, 119, 10, 48, 68, 173, 151, 147, 20, 144, 97]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseFloat32Array")(parser, 3)
    })
    it("returns a Float32Array", () => expect(result).toEqual(jasmine.any(Float32Array)))
    it("returns the correct quantity of numbers", () => expect(result.length).toEqual(3))
    it("returns the correct number", () => {
      expect(result[0]).toBeCloseTo(15.2978363037109)
      expect(result[1]).toBeCloseTo(3.84114837646484)
      expect(result[2]).toBeCloseTo(37.2582359313965)
    })
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 96, 213, 117, 64, 111, 8, 21, 66, 250, 201, 102, 70, 9, 211, 53, 41, 77, 191, 67, 77, 212, 23, 30, 211, 203, 119, 10, 48, 68, 173, 151, 147, 20, 144, 97]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(14))
  })

  describe("parseUtf8", () => {
    let arrayBuffer, dataView, parser, result
    beforeEach(() => {
      arrayBuffer = new Uint8Array([77, 27, 0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x57, 0x69, 0x74, 0x68, 0x20, 0x53, 0x79, 0x6d, 0x62, 0x6f, 0x6c, 0x73, 0x3a, 0x20, 0xe3, 0x81, 0xb2, 0xc3, 0xa9, 0xf0, 0xa1, 0x81, 0xaf, 0x21, 0, 147, 20, 144, 97]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUtf8")(parser)
    })
    it("returns the correct string", () => expect(result).toEqual("Test String With Symbols: ひé𡁯!"))
    it("does not modify the array buffer", () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x57, 0x69, 0x74, 0x68, 0x20, 0x53, 0x79, 0x6d, 0x62, 0x6f, 0x6c, 0x73, 0x3a, 0x20, 0xe3, 0x81, 0xb2, 0xc3, 0xa9, 0xf0, 0xa1, 0x81, 0xaf, 0x21, 0, 147, 20, 144, 97]))
    it("does not modify the data view", () => expect(parser.dataView).toBe(dataView))
    it("increments the position to clear the read data", () => expect(parser.position).toEqual(39))
  })
})