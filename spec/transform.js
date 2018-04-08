describe("transform", () => {
  assert({
    "defines transform, a matrix": () => {
      expect(index.__get__("transform")).toEqual(jasmine.any(Float32Array))
      expect(index.__get__("transform").length).toEqual(16)
    },
    "defines transform as identity by default": () => {
      expect(Array.from(index.__get__("transform"))).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    }
  })

  describe("transformStack", () => {
    const events = []
    setup(() => {
      index.__set__("pushTransformStack", () => events.push("Stack Pushed"))
      index.__set__("popTransformStack", () => events.push("Stack Popped"))
    })

    const runSuccessfully = (callbacks, expectedEvents) => () => {
      events.length = 0

      callbacks.forEach(callback => index.__get__("transformStack")(callback))

      expect(events).toEqual(expectedEvents)
    }

    const runWithException = (callbacks, expectedEvents) => () => {
      events.length = 0

      callbacks.slice(0, -1).forEach(callback => index.__get__("transformStack")(callback))
      expect(() => index.__get__("transformStack")(callbacks[callbacks.length - 1])).toThrow("Test Exception")

      expect(events).toEqual(expectedEvents)
    }

    assert({
      "one call": runSuccessfully([
        () => events.push("Callback A")
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped"
        ]),
      "one call when the callback throws an exception": runWithException([
        () => {
          events.push("Callback A")
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped"
        ]),
      "two calls": runSuccessfully([
        () => events.push("Callback A"),
        () => events.push("Callback B")
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped",
          "Stack Pushed",
          "Callback B",
          "Stack Popped"
        ]),
      "two calls when the second callback throws an exception": runWithException([
        () => events.push("Callback A"),
        () => {
          events.push("Callback B")
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped",
          "Stack Pushed",
          "Callback B",
          "Stack Popped"
        ]),
      "two nested calls": runSuccessfully([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A End",
          "Stack Popped"
        ]),
      "two nested calls when the nested callback throws an exception": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => {
            events.push("Callback B")
            throw "Test Exception"
          })
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Stack Popped"
        ]),
      "two nested calls when an exception is thrown after the nested callback": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => {
            events.push("Callback B")
          })
          events.push("Callback A End")
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A End",
          "Stack Popped"
        ]),
      "two calls containing one each": runSuccessfully([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C Start")
          index.__get__("transformStack")(() => events.push("Callback D"))
          events.push("Callback C End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A End",
          "Stack Popped",
          "Stack Pushed",
          "Callback C Start",
          "Stack Pushed",
          "Callback D",
          "Stack Popped",
          "Callback C End",
          "Stack Popped"
        ]),
      "two calls containing one each when an exception is thrown before the second nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C")
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A End",
          "Stack Popped",
          "Stack Pushed",
          "Callback C",
          "Stack Popped"
        ]),
      "two calls containing one each when an exception is thrown during the second nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C Start")
          index.__get__("transformStack")(() => {
            events.push("Callback D")
            throw "Test Exception"
          })
          events.push("Callback C End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A End",
          "Stack Popped",
          "Stack Pushed",
          "Callback C Start",
          "Stack Pushed",
          "Callback D",
          "Stack Popped",
          "Stack Popped"
        ]),
      "two calls containing one each when an exception is thrown after the second nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C Start")
          index.__get__("transformStack")(() => {
            events.push("Callback D")
          })
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A End",
          "Stack Popped",
          "Stack Pushed",
          "Callback C Start",
          "Stack Pushed",
          "Callback D",
          "Stack Popped",
          "Stack Popped"
        ]),
      "one call containing two calls": runSuccessfully([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A Between")
          index.__get__("transformStack")(() => events.push("Callback C"))
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A Between",
          "Stack Pushed",
          "Callback C",
          "Stack Popped",
          "Callback A End",
          "Stack Popped"
        ]),
      "one call containing two calls when an exception is thrown during the second nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A Between")
          index.__get__("transformStack")(() => {
            events.push("Callback C")
            throw "Test Exception"
          })
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A Between",
          "Stack Pushed",
          "Callback C",
          "Stack Popped",
          "Stack Popped"
        ]),
      "one call containing two calls when an exception is thrown after the second nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A Between")
          index.__get__("transformStack")(() => {
            events.push("Callback C")
          })
          events.push("Callback A End")
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B",
          "Stack Popped",
          "Callback A Between",
          "Stack Pushed",
          "Callback C",
          "Stack Popped",
          "Callback A End",
          "Stack Popped"
        ]),
      "three nested calls": runSuccessfully([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => {
            events.push("Callback B Start")
            index.__get__("transformStack")(() => events.push("Callback C"))
            events.push("Callback B End")
          })
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B Start",
          "Stack Pushed",
          "Callback C",
          "Stack Popped",
          "Callback B End",
          "Stack Popped",
          "Callback A End",
          "Stack Popped"
        ]),
      "three nested calls when an exception is thrown after the nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => {
            events.push("Callback B Start")
            index.__get__("transformStack")(() => events.push("Callback C"))
            events.push("Callback B End")
            throw "Test Exception"
          })
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B Start",
          "Stack Pushed",
          "Callback C",
          "Stack Popped",
          "Callback B End",
          "Stack Popped",
          "Stack Popped"
        ]),
      "three nested calls when an exception is thrown during the nested call": runWithException([
        () => {
          events.push("Callback A Start")
          index.__get__("transformStack")(() => {
            events.push("Callback B Start")
            index.__get__("transformStack")(() => {
              events.push("Callback C")
              throw "Test Exception"
            })
            events.push("Callback B End")
          })
          events.push("Callback A End")
        }
      ], [
          "Stack Pushed",
          "Callback A Start",
          "Stack Pushed",
          "Callback B Start",
          "Stack Pushed",
          "Callback C",
          "Stack Popped",
          "Stack Popped",
          "Stack Popped"
        ])
    })
  })

  describe("pushTransformStack/popTransformStack", () => {
    function generateRandomMatrix() {
      const matrix = new Float32Array(16)
      for (let i = 0; i < 16; i++) matrix[i] = Math.random()
      return matrix
    }

    const transformA = generateRandomMatrix()
    const transformB = generateRandomMatrix()
    const transformC = generateRandomMatrix()
    const transformD = generateRandomMatrix()
    const transformE = generateRandomMatrix()
    const transformF = generateRandomMatrix()
    const transformG = generateRandomMatrix()
    const transformH = generateRandomMatrix()

    setup(() => index.__get__("copyMatrix")(transformA, index.__get__("transform")))

    const pushTransformStack = (expected, changeTo, then) => describe("pushTransformStack", () => {
      setup(() => index.__get__("pushTransformStack")())
      assert({
        "does not change the transform": () => {
          for (let i = 0; i < 16; i++) {
            expect(index.__get__("transform")[i]).toBeCloseTo(expected[i])
          }
        }
      })
      if (then) {
        describe("then", () => {
          setup(() => index.__get__("copyMatrix")(changeTo, index.__get__("transform")))
          then()
        })
      }
    })

    const popTransformStack = (expected, then) => describe("popTransformStack", () => {
      setup(() => index.__get__("popTransformStack")())
      assert({
        "reverses the transform": () => {
          for (let i = 0; i < 16; i++) {
            expect(index.__get__("transform")[i]).toBeCloseTo(expected[i])
          }
        }
      })
      if (then) describe("then", then)
    })

    pushTransformStack(transformA, transformB, () => {
      pushTransformStack(transformB, transformC, () => {
        pushTransformStack(transformC, transformD, () => {
          pushTransformStack(transformD, transformE, () => {
            pushTransformStack(transformE, transformF, () => {
              pushTransformStack(transformF)
              popTransformStack(transformE)
            })
            popTransformStack(transformD, () => {
              pushTransformStack(transformD)
              popTransformStack(transformC)
            })
          })
          popTransformStack(transformC, () => {
            pushTransformStack(transformC, transformE, () => {
              pushTransformStack(transformE)
              popTransformStack(transformC)
            })
            popTransformStack(transformB, () => {
              pushTransformStack(transformB)
              popTransformStack(transformA)
            })
          })
        })
        popTransformStack(transformB, () => {
          pushTransformStack(transformB, transformD, () => {
            pushTransformStack(transformD, transformE, () => {
              pushTransformStack(transformE)
              popTransformStack(transformD)
            })
            popTransformStack(transformB, () => {
              pushTransformStack(transformB)
              popTransformStack(transformA)
            })
          })
          popTransformStack(transformA, () => {
            pushTransformStack(transformA, transformE, () => {
              pushTransformStack(transformE)
              popTransformStack(transformA)
            })
          })
        })
      })
      popTransformStack(transformA, () => {
        pushTransformStack(transformA, transformC, () => {
          pushTransformStack(transformC, transformD, () => {
            pushTransformStack(transformD, transformE, () => {
              pushTransformStack(transformE)
              popTransformStack(transformD)
            })
            popTransformStack(transformC, () => {
              pushTransformStack(transformC)
              popTransformStack(transformA)
            })
          })
          popTransformStack(transformA, () => {
            pushTransformStack(transformA, transformD, () => {
              pushTransformStack(transformD)
              popTransformStack(transformA)
            })
          })
        })
      })
    })
  })

  describe("translateOnX", () => {
    let translateMatrixOnX
    setup(() => {
      translateMatrixOnX = jasmine.createSpy("translateMatrixOnX")
      index.__set__("translateMatrixOnX", translateMatrixOnX)
      index.__set__("transform", "Test Transform")

      index.__get__("translateOnX")(37.4)
    })

    assert({
      "calls translateMatrixOnX once": () => expect(translateMatrixOnX).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(translateMatrixOnX).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the number of meters": () => expect(translateMatrixOnX).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("translateOnY", () => {
    let translateMatrixOnY
    setup(() => {
      translateMatrixOnY = jasmine.createSpy("translateMatrixOnY")
      index.__set__("translateMatrixOnY", translateMatrixOnY)
      index.__set__("transform", "Test Transform")

      index.__get__("translateOnY")(37.4)
    })

    assert({
      "calls translateMatrixOnY once": () => expect(translateMatrixOnY).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(translateMatrixOnY).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the number of meters": () => expect(translateMatrixOnY).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("translateOnZ", () => {
    let translateMatrixOnZ
    setup(() => {
      translateMatrixOnZ = jasmine.createSpy("translateMatrixOnZ")
      index.__set__("translateMatrixOnZ", translateMatrixOnZ)
      index.__set__("transform", "Test Transform")

      index.__get__("translateOnZ")(37.4)
    })

    assert({
      "calls translateMatrixOnZ once": () => expect(translateMatrixOnZ).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(translateMatrixOnZ).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the number of meters": () => expect(translateMatrixOnZ).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("rotateAroundX", () => {
    let rotateMatrixAroundX
    setup(() => {
      rotateMatrixAroundX = jasmine.createSpy("rotateMatrixAroundX")
      index.__set__("rotateMatrixAroundX", rotateMatrixAroundX)
      index.__set__("transform", "Test Transform")

      index.__get__("rotateAroundX")(37.4)
    })

    assert({
      "calls rotateMatrixAroundX once": () => expect(rotateMatrixAroundX).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(rotateMatrixAroundX).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the number of radians": () => expect(rotateMatrixAroundX).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("rotateAroundY", () => {
    let rotateMatrixAroundY
    setup(() => {
      rotateMatrixAroundY = jasmine.createSpy("rotateMatrixAroundY")
      index.__set__("rotateMatrixAroundY", rotateMatrixAroundY)
      index.__set__("transform", "Test Transform")

      index.__get__("rotateAroundY")(37.4)
    })

    assert({
      "calls rotateMatrixAroundY once": () => expect(rotateMatrixAroundY).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(rotateMatrixAroundY).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the number of radians": () => expect(rotateMatrixAroundY).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("rotateAroundZ", () => {
    let rotateMatrixAroundZ
    setup(() => {
      rotateMatrixAroundZ = jasmine.createSpy("rotateMatrixAroundZ")
      index.__set__("rotateMatrixAroundZ", rotateMatrixAroundZ)
      index.__set__("transform", "Test Transform")

      index.__get__("rotateAroundZ")(37.4)
    })

    assert({
      "calls rotateMatrixAroundZ once": () => expect(rotateMatrixAroundZ).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(rotateMatrixAroundZ).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the number of radians": () => expect(rotateMatrixAroundZ).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("scaleOnX", () => {
    let scaleMatrixOnX
    setup(() => {
      scaleMatrixOnX = jasmine.createSpy("scaleMatrixOnX")
      index.__set__("scaleMatrixOnX", scaleMatrixOnX)
      index.__set__("transform", "Test Transform")

      index.__get__("scaleOnX")(37.4)
    })

    assert({
      "calls scaleMatrixOnX once": () => expect(scaleMatrixOnX).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(scaleMatrixOnX).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the scale factor": () => expect(scaleMatrixOnX).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("scaleOnY", () => {
    let scaleMatrixOnY
    setup(() => {
      scaleMatrixOnY = jasmine.createSpy("scaleMatrixOnY")
      index.__set__("scaleMatrixOnY", scaleMatrixOnY)
      index.__set__("transform", "Test Transform")

      index.__get__("scaleOnY")(37.4)
    })

    assert({
      "calls scaleMatrixOnY once": () => expect(scaleMatrixOnY).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(scaleMatrixOnY).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the scale factor": () => expect(scaleMatrixOnY).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })

  describe("scaleOnZ", () => {
    let scaleMatrixOnZ
    setup(() => {
      scaleMatrixOnZ = jasmine.createSpy("scaleMatrixOnZ")
      index.__set__("scaleMatrixOnZ", scaleMatrixOnZ)
      index.__set__("transform", "Test Transform")

      index.__get__("scaleOnZ")(37.4)
    })

    assert({
      "calls scaleMatrixOnZ once": () => expect(scaleMatrixOnZ).toHaveBeenCalledTimes(1),
      "uses the transform": () => expect(scaleMatrixOnZ).toHaveBeenCalledWith("Test Transform", jasmine.anything()),
      "uses the scale factor": () => expect(scaleMatrixOnZ).toHaveBeenCalledWith(jasmine.anything(), 37.4)
    })
  })
})