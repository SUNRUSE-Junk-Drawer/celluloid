describe("file", () => {
  describe("readFileAsArrayBuffer", () => {
    let XMLHttpRequest, callback, open, send, request, openCallsAtTimeOfCallingSend, responseTypeAtTimeOfCallingSend, console
    setup(() => {
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

    assert({
      "creates one XMLHttpRequest": () => expect(XMLHttpRequest).toHaveBeenCalledTimes(1),
      "does not modify other properties of the XMLHttpRequest": () => {
        expect(request.testIrrelevantKeyA).toEqual("Test Irrelevant Value A")
        expect(request.testIrrelevantKeyB).toEqual("Test Irrelevant Value B")
      },
      "opens once": () => expect(open).toHaveBeenCalledTimes(1),
      "opens as a GET": () => expect(open).toHaveBeenCalledWith("GET", jasmine.anything(), jasmine.anything()),
      "opens the given url": () => expect(open).toHaveBeenCalledWith(jasmine.anything(), "Test URL", jasmine.anything()),
      "opens asynchronously": () => expect(open).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), true),
      "sends once": () => expect(send).toHaveBeenCalledTimes(1),
      "sends after opening": () => expect(openCallsAtTimeOfCallingSend).toEqual(1),
      "has set the response type by opening": () => expect(responseTypeAtTimeOfCallingSend).toEqual("arraybuffer"),
      "does not change the response type after opening": () => expect(request.responseType).toEqual("arraybuffer"),
      "adds an error event handler": () => expect(request.onerror).toEqual(jasmine.any(Function)),
      "adds a loading event handler": () => expect(request.onload).toEqual(jasmine.any(Function)),
      "does not execute the callback": () => expect(callback).not.toHaveBeenCalled(),
      "does not log an error": () => expect(console.error).not.toHaveBeenCalled()
    })

    describe("on encountering an error", () => {
      setup(() => request.onerror({
        testIrrelevantKeyE: "Test Irrelevant Value E",
        error: "Test Error",
        testIrrelevantKeyF: "Test Irrelevant Value F"
      }))
      assert({
        "does not create another XMLHttpRequest": () => expect(XMLHttpRequest).toHaveBeenCalledTimes(1),
        "does not open again": () => expect(open).toHaveBeenCalledTimes(1),
        "does not send again": () => expect(send).toHaveBeenCalledTimes(1),
        "does not execute the callback": () => expect(callback).not.toHaveBeenCalled(),
        "logs one error": () => expect(console.error).toHaveBeenCalledTimes(1),
        "logs the error": () => expect(console.error).toHaveBeenCalledWith("Test Error")
      })
    })

    describe("on loading", () => {
      setup(() => {
        request.response = "Test Array Buffer"
        request.onload({
          testIrrelevantKeyE: "Test Irrelevant Value E",
          testIrrelevantKeyF: "Test Irrelevant Value F"
        })
      })
      assert({
        "does not create another XMLHttpRequest": () => expect(XMLHttpRequest).toHaveBeenCalledTimes(1),
        "does not open again": () => expect(open).toHaveBeenCalledTimes(1),
        "does not send again": () => expect(send).toHaveBeenCalledTimes(1),
        "executes the callback once": () => expect(callback).toHaveBeenCalledTimes(1),
        "executes the callback with the response": () => expect(callback).toHaveBeenCalledWith("Test Array Buffer"),
        "does not log an error": () => expect(console.error).not.toHaveBeenCalled()
      })
    })
  })

  describe("createParser", () => {
    let arrayBuffer, parser
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116]).buffer
      parser = index.__get__("createParser")(arrayBuffer)
    })
    assert({
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116]),
      "returns a data view": () => expect(parser.dataView).toEqual(jasmine.any(DataView)),
      "returns a data view into the array buffer": () => expect(parser.dataView.buffer).toBe(arrayBuffer),
      "returns a data view from the start of the array buffer": () => expect(parser.dataView.byteOffset).toEqual(0),
      "returns a data view to the end of the array buffer": () => expect(parser.dataView.byteLength).toEqual(5),
      "returns a position of zero": () => expect(parser.position).toEqual(0)
    })
  })

  describe("parseUint8", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint8")(parser)
    })
    assert({
      "returns the correct number": () => expect(result).toEqual(240),
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(3)
    })
  })

  describe("parseUint8Array", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint8Array")(parser, 3)
    })
    assert({
      "returns a Uint8Array": () => expect(result).toEqual(jasmine.any(Uint8Array)),
      "returns the correct quantity of numbers": () => expect(result.length).toEqual(3),
      "returns the correct number": () => {
        expect(result[0]).toEqual(240)
        expect(result[1]).toEqual(195)
        expect(result[2]).toEqual(116)
      },
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(5)
    })
  })

  describe("parseUint16", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 111, 8]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint16")(parser)
    })
    assert({
      "returns the correct number": () => expect(result).toEqual(50160),
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 111, 8]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(4)
    })
  })

  describe("parseUint16Array", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUint16Array")(parser, 3)
    })
    assert({
      "returns a Uint16Array": () => expect(result).toEqual(jasmine.any(Uint16Array)),
      "returns the correct quantity of numbers": () => expect(result.length).toEqual(3),
      "returns the correct number": () => {
        expect(result[0]).toEqual(50160)
        expect(result[1]).toEqual(16756)
        expect(result[2]).toEqual(5384)
      },
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(8)
    })
  })

  describe("parseFloat32", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseFloat32")(parser)
    })
    assert({
      "returns the correct number": () => expect(result).toBeCloseTo(15.2978363037109),
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 8, 21, 77, 250]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(6)
    })
  })

  describe("parseFloat32Array", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 240, 195, 116, 65, 96, 213, 117, 64, 111, 8, 21, 66, 250, 201, 102, 70, 9, 211, 53, 41, 77, 191, 67, 77, 212, 23, 30, 211, 203, 119, 10, 48, 68, 173, 151, 147, 20, 144, 97]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseFloat32Array")(parser, 3)
    })
    assert({
      "returns a Float32Array": () => expect(result).toEqual(jasmine.any(Float32Array)),
      "returns the correct quantity of numbers": () => expect(result.length).toEqual(3),
      "returns the correct number": () => {
        expect(result[0]).toBeCloseTo(15.2978363037109)
        expect(result[1]).toBeCloseTo(3.84114837646484)
        expect(result[2]).toBeCloseTo(37.2582359313965)
      },
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 240, 195, 116, 65, 96, 213, 117, 64, 111, 8, 21, 66, 250, 201, 102, 70, 9, 211, 53, 41, 77, 191, 67, 77, 212, 23, 30, 211, 203, 119, 10, 48, 68, 173, 151, 147, 20, 144, 97]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(14)
    })
  })

  describe("parseUtf8", () => {
    let arrayBuffer, dataView, parser, result
    setup(() => {
      arrayBuffer = new Uint8Array([77, 27, 0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x57, 0x69, 0x74, 0x68, 0x20, 0x53, 0x79, 0x6d, 0x62, 0x6f, 0x6c, 0x73, 0x3a, 0x20, 0xe3, 0x81, 0xb2, 0xc3, 0xa9, 0xf0, 0xa1, 0x81, 0xaf, 0x21, 0, 147, 20, 144, 97]).buffer
      dataView = new DataView(arrayBuffer)
      parser = {
        dataView: dataView,
        position: 2
      }
      result = index.__get__("parseUtf8")(parser)
    })
    assert({
      "returns the correct string": () => expect(result).toEqual("Test String With Symbols: ひé𡁯!"),
      "does not modify the array buffer": () => expect(Array.from(new Uint8Array(arrayBuffer))).toEqual([77, 27, 0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x57, 0x69, 0x74, 0x68, 0x20, 0x53, 0x79, 0x6d, 0x62, 0x6f, 0x6c, 0x73, 0x3a, 0x20, 0xe3, 0x81, 0xb2, 0xc3, 0xa9, 0xf0, 0xa1, 0x81, 0xaf, 0x21, 0, 147, 20, 144, 97]),
      "does not modify the data view": () => expect(parser.dataView).toBe(dataView),
      "increments the position to clear the read data": () => expect(parser.position).toEqual(39)
    })
  })

  assert({
    "defines fileCache as an empty object": () => expect(index.__get__("fileCache")).toEqual({})
  })

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
    setup(() => {
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
      setup(() => {
        originalCallback = jasmine.createSpy("originalCallback")
        index.__get__("createFileHandle")("Test File", originalCallback)
      })

      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "loads one file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
        "loads the changed file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)),
        "adds the file to the cache": () => expect(index.__get__("fileCache")["Test File"]).toBeTruthy(),
        "initializes data null": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "initializes nonce as zero": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(0),
        "initializes callbacks as an array containing only the given callback": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([originalCallback]),
        "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
      })
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB, newCallbackC
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "changes data to the file": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded Data"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(0),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]),
          "executes the callbacks once": () => {
            expect(newCallbackA).toHaveBeenCalledTimes(1)
            expect(newCallbackB).toHaveBeenCalledTimes(1)
            expect(newCallbackC).toHaveBeenCalledTimes(1)
          },
          "executes the callbacks with the file": () => {
            expect(newCallbackA).toHaveBeenCalledWith("Test Loaded Data")
            expect(newCallbackB).toHaveBeenCalledWith("Test Loaded Data")
            expect(newCallbackC).toHaveBeenCalledWith("Test Loaded Data")
          },
          "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        setup(() => {
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
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(844),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
            expect(newCallbackC).not.toHaveBeenCalled()
          },
          "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        setup(() => {
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
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Existing Data"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(844),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
            expect(newCallbackC).not.toHaveBeenCalled()
          },
          "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
        })
      })
    })

    describe("when the file is cached but without callbacks", () => {
      let originalCallback
      setup(() => {
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 7894,
          callbacks: []
        }

        originalCallback = jasmine.createSpy("originalCallback")
        index.__get__("createFileHandle")("Test File", originalCallback)
      })

      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "loads one file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
        "loads the changed file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7894),
        "adds the callback": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([originalCallback]),
        "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
      })
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB, newCallbackC
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          newCallbackC = jasmine.createSpy("newCallbackC")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackC)
          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded Data")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "changes data to the file": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded Data"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7894),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]),
          "executes the callbacks once": () => {
            expect(newCallbackA).toHaveBeenCalledTimes(1)
            expect(newCallbackB).toHaveBeenCalledTimes(1)
            expect(newCallbackC).toHaveBeenCalledTimes(1)
          },
          "executes the callbacks with the file": () => {
            expect(newCallbackA).toHaveBeenCalledWith("Test Loaded Data")
            expect(newCallbackB).toHaveBeenCalledWith("Test Loaded Data")
            expect(newCallbackC).toHaveBeenCalledWith("Test Loaded Data")
          },
          "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        setup(() => {
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
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(8442),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
            expect(newCallbackC).not.toHaveBeenCalled()
          },
          "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB, newCallbackC
        setup(() => {
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
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Existing Data"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(8442),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB, newCallbackC]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
            expect(newCallbackC).not.toHaveBeenCalled()
          },
          "does not execute the original callback": () => expect(originalCallback).not.toHaveBeenCalled()
        })
      })
    })

    describe("when the file is cached with callbacks but has not yet loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC, newCallback
      setup(() => {
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
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "does not load a file": () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled(),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(23798),
        "adds the callback to the array": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC, newCallback]),
        "does not execute the existing callbacks": () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        },
        "does not execute the new callback": () => expect(newCallback).not.toHaveBeenCalled()
      })
    })

    describe("when the file is cached with callbacks and has loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC, newCallback
      setup(() => {
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
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "does not load a file": () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled(),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Existing Data"),
        "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(23798),
        "adds the callback to the array": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC, newCallback]),
        "does not execute the existing callbacks": () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        },
        "executes the new callback once": () => expect(newCallback).toHaveBeenCalledTimes(1),
        "executes the new callback with the data": () => expect(newCallback).toHaveBeenCalledWith("Test Existing Data")
      })
    })
  })

  describe("handleFileChange", () => {
    let readFileAsArrayBuffer
    setup(() => {
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
      setup(() => index.__get__("handleFileChange")("Test File"))
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "does not load a file": () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled(),
        "does not create a key in the file cache for the file": () => expect(index.__get__("fileCache")).not.toEqual(jasmine.objectContaining({ "Test File": jasmine.anything() }))
      })
    })
    describe("when the file is cached without callbacks", () => {
      setup(() => {
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 7894,
          callbacks: []
        }

        index.__get__("handleFileChange")("Test File")
      })
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "does not load a file": () => expect(readFileAsArrayBuffer).not.toHaveBeenCalled(),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7894),
        "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([])
      })
    })
    describe("when the file is cached with callbacks and has not yet loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC
      setup(() => {
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
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "loads one file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
        "loads the changed file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "increments nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895),
        "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC]),
        "does not execute the original callbacks": () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        }
      })
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "changes data to the file": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded File"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]),
          "executes the callbacks once": () => {
            expect(newCallbackA).toHaveBeenCalledTimes(1)
            expect(newCallbackB).toHaveBeenCalledTimes(1)
          },
          "executes the callbacks with the file": () => {
            expect(newCallbackA).toHaveBeenCalledWith("Test Loaded File")
            expect(newCallbackB).toHaveBeenCalledWith("Test Loaded File")
          },
          "does not execute the original callbacks": () => {
            expect(existingCallbackA).not.toHaveBeenCalled()
            expect(existingCallbackB).not.toHaveBeenCalled()
            expect(existingCallbackC).not.toHaveBeenCalled()
          }
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
          },
          "does not execute the original callbacks": () => {
            expect(existingCallbackA).not.toHaveBeenCalled()
            expect(existingCallbackB).not.toHaveBeenCalled()
            expect(existingCallbackC).not.toHaveBeenCalled()
          }
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].data = "Test Replaced Data"
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Replaced Data"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
          },
          "does not execute the original callbacks": () => {
            expect(existingCallbackA).not.toHaveBeenCalled()
            expect(existingCallbackB).not.toHaveBeenCalled()
            expect(existingCallbackC).not.toHaveBeenCalled()
          }
        })
      })
    })
    describe("when the file is cached with callbacks and has loaded", () => {
      let existingCallbackA, existingCallbackB, existingCallbackC
      setup(() => {
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
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "loads one file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
        "loads the changed file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledWith("Test File", jasmine.any(Function)),
        "sets data to null": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "increments nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895),
        "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([existingCallbackA, existingCallbackB, existingCallbackC]),
        "does not execute the original callbacks": () => {
          expect(existingCallbackA).not.toHaveBeenCalled()
          expect(existingCallbackB).not.toHaveBeenCalled()
          expect(existingCallbackC).not.toHaveBeenCalled()
        }
      })
      describe("when the file is loaded and the nonce has not changed", () => {
        let newCallbackA, newCallbackB
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "changes data to the file": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Loaded File"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7895),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]),
          "executes the callbacks once": () => {
            expect(newCallbackA).toHaveBeenCalledTimes(1)
            expect(newCallbackB).toHaveBeenCalledTimes(1)
          },
          "executes the callbacks with the file": () => {
            expect(newCallbackA).toHaveBeenCalledWith("Test Loaded File")
            expect(newCallbackB).toHaveBeenCalledWith("Test Loaded File")
          },
          "does not execute the original callbacks": () => {
            expect(existingCallbackA).not.toHaveBeenCalled()
            expect(existingCallbackB).not.toHaveBeenCalled()
            expect(existingCallbackC).not.toHaveBeenCalled()
          }
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has not yet been loaded", () => {
        let newCallbackA, newCallbackB
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
          },
          "does not execute the original callbacks": () => {
            expect(existingCallbackA).not.toHaveBeenCalled()
            expect(existingCallbackB).not.toHaveBeenCalled()
            expect(existingCallbackC).not.toHaveBeenCalled()
          }
        })
      })
      describe("when the file is loaded and the nonce has changed; other data has been loaded", () => {
        let newCallbackA, newCallbackB
        setup(() => {
          newCallbackA = jasmine.createSpy("newCallbackA")
          newCallbackB = jasmine.createSpy("newCallbackB")
          index.__get__("fileCache")["Test File"].nonce = 7932
          index.__get__("fileCache")["Test File"].data = "Test Replaced Data"
          index.__get__("fileCache")["Test File"].callbacks.length = 0
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackA)
          index.__get__("fileCache")["Test File"].callbacks.push(newCallbackB)

          readFileAsArrayBuffer.calls.argsFor(0)[1]("Test Loaded File")
        })
        assert({
          "does not modify other cached files": doesNotModifyOtherCachedFiles,
          "does not load another file": () => expect(readFileAsArrayBuffer).toHaveBeenCalledTimes(1),
          "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Replaced Data"),
          "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(7932),
          "does not change callbacks": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([newCallbackA, newCallbackB]),
          "does not execute the callbacks": () => {
            expect(newCallbackA).not.toHaveBeenCalled()
            expect(newCallbackB).not.toHaveBeenCalled()
          },
          "does not execute the original callbacks": () => {
            expect(existingCallbackA).not.toHaveBeenCalled()
            expect(existingCallbackB).not.toHaveBeenCalled()
            expect(existingCallbackC).not.toHaveBeenCalled()
          }
        })
      })
    })
  })

  describe("destroyFileHandle", () => {
    setup(() => {
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
      setup(() => {
        index.__get__("fileCache")["Test File"] = {
          data: null,
          nonce: 38479,
          callbacks: ["Test Other Callback A", "Test Callback", "Test Other Callback B"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38479),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "removes the callback": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual(["Test Other Callback A", "Test Other Callback B"])
      })
    })

    describe("when other callbacks exist with cached data", () => {
      setup(() => {
        index.__get__("fileCache")["Test File"] = {
          data: "Test Cached Data",
          nonce: 38479,
          callbacks: ["Test Other Callback A", "Test Callback", "Test Other Callback B"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "does not change nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38479),
        "does not change data": () => expect(index.__get__("fileCache")["Test File"].data).toEqual("Test Cached Data"),
        "removes the callback": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual(["Test Other Callback A", "Test Other Callback B"])
      })
    })

    describe("when no other callbacks exist without cached data", () => {
      setup(() => {
        index.__get__("fileCache")["Test File"] = {
          data: "Test Cached Data",
          nonce: 38479,
          callbacks: ["Test Callback"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "increments nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38480),
        "replaces data with null": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "empties the callbacks array": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([])
      })
    })

    describe("when no other callbacks exist with cached data", () => {
      setup(() => {
        index.__get__("fileCache")["Test File"] = {
          data: "Test Cached Data",
          nonce: 38479,
          callbacks: ["Test Callback"]
        }

        index.__get__("destroyFileHandle")("Test File", "Test Callback")
      })
      assert({
        "does not modify other cached files": doesNotModifyOtherCachedFiles,
        "increments nonce": () => expect(index.__get__("fileCache")["Test File"].nonce).toEqual(38480),
        "replaces data with null": () => expect(index.__get__("fileCache")["Test File"].data).toBeNull(),
        "empties the callbacks array": () => expect(index.__get__("fileCache")["Test File"].callbacks).toEqual([])
      })
    })
  })
})