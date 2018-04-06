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

  it("defines fileCache as an empty object", () => expect(index.__get__("fileCache")).toEqual({}))

  const doesNotModifyOtherCachedFiles = () => {
    expect(index.__get__("fileCache")["Test Existing File Without Callbacks"]).toEqual({
      data: null,
      nonce: 8749,
      callbacks: []
    })

    expect(index.__get__("fileCache")["Test Existing File With Callbacks Which Has Not Loaded"]).toEqual({
      data: null,
      nonce: 34545,
      callbacks: ["Test Callback A", "Test Callback B"]
    })

    expect(index.__get__("fileCache")["Test Existing File With Callbacks Which Has Loaded"]).toEqual({
      data: "Test Cached Data With Callbacks",
      nonce: 2355,
      callbacks: ["Test Callback C", "Test Callback D", "Test Callback E", "Test Callback F"]
    })
  }

  describe("createFileHandle", () => {
    let readFileAsArrayBuffer
    beforeEach(() => {
      readFileAsArrayBuffer = jasmine.createSpy("readFileAsArrayBuffer")
      index.__set__("readFileAsArrayBuffer", readFileAsArrayBuffer)

      index.__get__("fileCache")["Test Existing File Without Callbacks"] = {
        data: null,
        nonce: 8749,
        callbacks: []
      }

      index.__get__("fileCache")["Test Existing File With Callbacks Which Has Not Loaded"] = {
        data: null,
        nonce: 34545,
        callbacks: ["Test Callback A", "Test Callback B"]
      }

      index.__get__("fileCache")["Test Existing File With Callbacks Which Has Loaded"] = {
        data: "Test Cached Data With Callbacks",
        nonce: 2355,
        callbacks: ["Test Callback C", "Test Callback D", "Test Callback E", "Test Callback F"]
      }
    })

    describe("when the file is not cached", () => {
      let originalCallback
      beforeEach(() => {
        originalCallback = jasmine.createSpy("originalCallback")
        index.__get__("createFileHandle")("Test File", originalCallback)
      })

      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("loads one file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
      it("loads the changed file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)))
      it("adds the file to the cache", () => expect(index.__get__("fileCache")["Test File"]).toBeTruthy())
      it("initializes data null", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("initializes nonce as zero", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(0))
      it("initializes callbacks as an array containing only the given callback", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([originalCallback]))
      it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB, newCallbackC
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("changes data to the file", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded Data"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(0))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]))
        it("executes the callbacks once", () => {
          expect(newCallbackA).toHaveBeenCalledTimes(1)
          expect(newCallbackB).toHaveBeenCalledTimes(1)
          expect(newCallbackC).toHaveBeenCalledTimes(1)
        })
        it("executes the callbacks with the file", () => {
          expect(newCallbackA).toHaveBeenCalledWith("Test Loaded Data")
          expect(newCallbackB).toHaveBeenCalledWith("Test Loaded Data")
          expect(newCallbackC).toHaveBeenCalledWith("Test Loaded Data")
        })
        it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].nonce = 844
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(844))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
          expect(newCallbackC).not.toHaveBeenCalled()
        })
        it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].nonce = 844
          index.__get__("fileCache")["Test File"].data = "Test Existing Data"
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Existing Data"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(844))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
          expect(newCallbackC).not.toHaveBeenCalled()
        })
        it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      })
    })

    describe("when the file is cached but without callbacks", () => {
      let originalCallback
      beforeEach(() => {
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 7894,
          callbacks: []
        }

        originalCallback = jasmine.createSpy("originalCallback")
        index.__get__("createFileHandle")("Test File", originalCallback)
      })

      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("loads one file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
      it("loads the changed file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)))
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7894))
      it("adds the callback", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([originalCallback]))
      it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB, newCallbackC
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("changes data to the file", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded Data"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7894))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]))
        it("executes the callbacks once", () => {
          expect(newCallbackA).toHaveBeenCalledTimes(1)
          expect(newCallbackB).toHaveBeenCalledTimes(1)
          expect(newCallbackC).toHaveBeenCalledTimes(1)
        })
        it("executes the callbacks with the file", () => {
          expect(newCallbackA).toHaveBeenCalledWith("Test Loaded Data")
          expect(newCallbackB).toHaveBeenCalledWith("Test Loaded Data")
          expect(newCallbackC).toHaveBeenCalledWith("Test Loaded Data")
        })
        it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].nonce = 8442
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(8442))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
          expect(newCallbackC).not.toHaveBeenCalled()
        })
        it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].nonce = 8442
          index.__get__("fileCache")["Test File"].data = "Test Existing Data"
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Existing Data"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(8442))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
          expect(newCallbackC).not.toHaveBeenCalled()
        })
        it("does not execute the original callback", () => expect(originalCallback).not.toHaveBeenCalled())
      })
    })

    describe("when the file is cached with callbacks but has not yet loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC, newCallback
      beforeEach(() => {
        existingCallbackA = jasmine.createSpy("existingCallbackA")
        existingCallbackB = jasmine.createSpy("existingCallbackB")
        existingCallbackC = jasmine.createSpy("existingCallbackC")
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 23798,
          callbacks: [existingCallbackA, existingCallbackB, existingCallbackC]
        }
        newCallback = jasmine.createSpy("newCallback")
        index.__get__("createFileHandle")("Test File", newCallback)
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("does not load a file", () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled())
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(23798))
      it("adds the callback to the array", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC, newCallback]))
      it("does not execute the existing callbacks", () => {
        expect(existingCallbackA).not.toHaveBeenCalled()
        expect(existingCallbackB).not.toHaveBeenCalled()
        expect(existingCallbackC).not.toHaveBeenCalled()
      })
      it("does not execute the new callback", () => expect(newCallback).not.toHaveBeenCalled())
    })

    describe("when the file is cached with callbacks and has loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC, newCallback
      beforeEach(() => {
        existingCallbackA = jasmine.createSpy("existingCallbackA")
        existingCallbackB = jasmine.createSpy("existingCallbackB")
        existingCallbackC = jasmine.createSpy("existingCallbackC")
        index.__get__("fileCache")["Test File"] = {
          data: "Test Existing Data",
          nonce: 23798,
          callbacks: [existingCallbackA, existingCallbackB, existingCallbackC]
        }
        newCallback = jasmine.createSpy("newCallback")
        index.__get__("createFileHandle")("Test File", newCallback)
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("does not load a file", () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled())
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Existing Data"))
      it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(23798))
      it("adds the callback to the array", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC, newCallback]))
      it("does not execute the existing callbacks", () => {
        expect(existingCallbackA).not.toHaveBeenCalled()
        expect(existingCallbackB).not.toHaveBeenCalled()
        expect(existingCallbackC).not.toHaveBeenCalled()
      })
      it("executes the new callback once", () => expect(newCallback).toHaveBeenCalledTimes(1))
      it("executes the new callback with the data", () => expect(newCallback).toHaveBeenCalledWith("Test Existing Data"))
    })
  })

  describe("handleFileChange", () => {
    let readFileAsArrayBuffer
    beforeEach(() => {
      readFileAsArrayBuffer = jasmine.createSpy("readFileAsArrayBuffer")
      index.__set__("readFileAsArrayBuffer", readFileAsArrayBuffer)

      index.__get__("fileCache")["Test Existing File Without Callbacks"] = {
        data: null,
        nonce: 8749,
        callbacks: []
      }

      index.__get__("fileCache")["Test Existing File With Callbacks Which Has Not Loaded"] = {
        data: null,
        nonce: 34545,
        callbacks: ["Test Callback A", "Test Callback B"]
      }

      index.__get__("fileCache")["Test Existing File With Callbacks Which Has Loaded"] = {
        data: "Test Cached Data With Callbacks",
        nonce: 2355,
        callbacks: ["Test Callback C", "Test Callback D", "Test Callback E", "Test Callback F"]
      }
    })
    describe("when the file is not cached", () => {
      beforeEach(() => index.__get__("handleFileChange")("Test File"))
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("does not load a file", () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled())
      it("does not create a key in the file cache for the file", () => expect(index.__get__("fileCache")).not.toEqual(jasmine.objectContaining({ "Test File": jasmine.anything() })))
    })
    describe("when the file is cached without callbacks", () => {
      beforeEach(() => {
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 7894,
          callbacks: []
        }

        index.__get__("handleFileChange")("Test File")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("does not load a file", () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled())
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7894))
      it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([]))
    })
    describe("when the file is cached with callbacks and has not yet loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC
      beforeEach(() => {
        existingCallbackA = jasmine.createSpy("existingCallbackA")
        existingCallbackB = jasmine.createSpy("existingCallbackB")
        existingCallbackC = jasmine.createSpy("existingCallbackC")

        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 7894,
          callbacks: [existingCallbackA, existingCallbackB, existingCallbackC]
        }

        index.__get__("handleFileChange")("Test File")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("loads one file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
      it("loads the changed file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)))
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("increments nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895))
      it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC]))
      it("does not execute the original callbacks", () => {
        expect(existingCallbackA).not.toHaveBeenCalled()
        expect(existingCallbackB).not.toHaveBeenCalled()
        expect(existingCallbackC).not.toHaveBeenCalled()
      })
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("changes data to the file", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded File"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]))
        it("executes the callbacks once", () => {
          expect(newCallbackA).toHaveBeenCalledTimes(1)
          expect(newCallbackB).toHaveBeenCalledTimes(1)
        })
        it("executes the callbacks with the file", () => {
          expect(newCallbackA).toHaveBeenCalledWith("Test Loaded File")
          expect(newCallbackB).toHaveBeenCalledWith("Test Loaded File")
        })
        it("does not execute the original callbacks", () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
        })
        it("does not execute the original callbacks", () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].data = "Test Replaced Data"
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Replaced Data"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
        })
        it("does not execute the original callbacks", () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        })
      })
    })
    describe("when the file is cached with callbacks and has loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC
      beforeEach(() => {
        existingCallbackA = jasmine.createSpy("existingCallbackA")
        existingCallbackB = jasmine.createSpy("existingCallbackB")
        existingCallbackC = jasmine.createSpy("existingCallbackC")

        index.__get__("fileCache")["Test File"] = {
          data: "Test Existing Data",
          nonce: 7894,
          callbacks: [existingCallbackA, existingCallbackB, existingCallbackC]
        }

        index.__get__("handleFileChange")("Test File")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("loads one file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
      it("loads the changed file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)))
      it("sets data to null", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("increments nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895))
      it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC]))
      it("does not execute the original callbacks", () => {
        expect(existingCallbackA).not.toHaveBeenCalled()
        expect(existingCallbackB).not.toHaveBeenCalled()
        expect(existingCallbackC).not.toHaveBeenCalled()
      })
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("changes data to the file", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded File"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]))
        it("executes the callbacks once", () => {
          expect(newCallbackA).toHaveBeenCalledTimes(1)
          expect(newCallbackB).toHaveBeenCalledTimes(1)
        })
        it("executes the callbacks with the file", () => {
          expect(newCallbackA).toHaveBeenCalledWith("Test Loaded File")
          expect(newCallbackB).toHaveBeenCalledWith("Test Loaded File")
        })
        it("does not execute the original callbacks", () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
        })
        it("does not execute the original callbacks", () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB
        beforeEach(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].data = "Test Replaced Data"
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        it("does not modify other cached files", doesNotModifyOtherCachedFiles)
        it("does not load another file", () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1))
        it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Replaced Data"))
        it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932))
        it("does not change callbacks", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]))
        it("does not execute the callbacks", () => {
          expect(newCallbackA).not.toHaveBeenCalled()
          expect(newCallbackB).not.toHaveBeenCalled()
        })
        it("does not execute the original callbacks", () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe("destroyFileHandle", () => {
    beforeEach(() => {
      index.__get__("fileCache")["Test Existing File Without Callbacks"] = {
        data: null,
        nonce: 8749,
        callbacks: []
      }

      index.__get__("fileCache")["Test Existing File With Callbacks Which Has Not Loaded"] = {
        data: null,
        nonce: 34545,
        callbacks: ["Test Callback A", "Test Callback B"]
      }

      index.__get__("fileCache")["Test Existing File With Callbacks Which Has Loaded"] = {
        data: "Test Cached Data With Callbacks",
        nonce: 2355,
        callbacks: ["Test Callback C", "Test Callback D", "Test Callback E", "Test Callback F"]
      }
    })

    describe("when other callbacks exist without cached data", () => {
      beforeEach(() => {
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 38479,
          callbacks: ["Test Other Callback A", "Test Callback", "Test Other Callback B"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38479))
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("removes the callback", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual(["Test Other Callback A", "Test Other Callback B"]))
    })

    describe("when other callbacks exist with cached data", () => {
      beforeEach(() => {
        index.__get__("fileCache")["Test File"] = {
          data: "Test Cached Data",
          nonce: 38479,
          callbacks: ["Test Other Callback A", "Test Callback", "Test Other Callback B"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("does not change nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38479))
      it("does not change data", () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Cached Data"))
      it("removes the callback", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual(["Test Other Callback A", "Test Other Callback B"]))
    })

    describe("when no other callbacks exist without cached data", () => {
      beforeEach(() => {
        index.__get__("fileCache")["Test File"] = {
          data: "Test Cached Data",
          nonce: 38479,
          callbacks: ["Test Callback"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("increments nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38480))
      it("replaces data with null", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("empties the callbacks array", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([]))
    })

    describe("when no other callbacks exist with cached data", () => {
      beforeEach(() => {
        index.__get__("fileCache")["Test File"] = {
          data: "Test Cached Data",
          nonce: 38479,
          callbacks: ["Test Callback"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      it("does not modify other cached files", doesNotModifyOtherCachedFiles)
      it("increments nonce", () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38480))
      it("replaces data with null", () => expect(index.__get__("fileCache")["Test File"].data).toBeNull())
      it("empties the callbacks array", () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([]))
    })
  })
})