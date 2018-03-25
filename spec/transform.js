describe("transform", () => {
  const rewire = require("rewire")
  let transform
  beforeEach(() => transform = rewire("../dist/index"))

  it("defines transform, a matrix", () => {
    expect(transform.__get__("transform")).toEqual(jasmine.any(Float32Array))
    expect(transform.__get__("transform").length).toEqual(16)
  })

  it("defines transform as identity by default", () => {
    expect(Array.from(transform.__get__("transform"))).toEqual([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
  })

  describe("transformStack", () => {
    let events
    beforeEach(() => events = [])

    const runSuccessfully = (callbacks, expectedEvents) => describe("when successful", () => {
      it("generates the expected events", () => {
        transform.__set__("pushTransformStack", () => events.push("Stack Pushed"))
        transform.__set__("popTransformStack", () => events.push("Stack Popped"))

        callbacks.forEach(callback => transform.__get__("transformStack")(callback))

        expect(events).toEqual(expectedEvents)
      })
    })

    const runWithException = (description, callbacks, expectedEvents) => describe(description, () => {
      it("generates the expected events", () => {
        transform.__set__("pushTransformStack", () => events.push("Stack Pushed"))
        transform.__set__("popTransformStack", () => events.push("Stack Popped"))

        callbacks.slice(0, -1).forEach(callback => transform.__get__("transformStack")(callback))
        expect(() => transform.__get__("transformStack")(callbacks[callbacks.length - 1])).toThrow("Test Exception")

        expect(events).toEqual(expectedEvents)
      })
    })

    describe("one call", () => {
      runSuccessfully([
        () => events.push("Callback A")
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped"
        ])

      runWithException("when the callback throws an exception", [
        () => {
          events.push("Callback A")
          throw "Test Exception"
        }
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped"
        ])
    })

    describe("two calls", () => {
      runSuccessfully([
        () => events.push("Callback A"),
        () => events.push("Callback B")
      ], [
          "Stack Pushed",
          "Callback A",
          "Stack Popped",
          "Stack Pushed",
          "Callback B",
          "Stack Popped"
        ])


      runWithException("when the second callback throws an exception", [
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
        ])
    })

    describe("two nested calls", () => {
      runSuccessfully([
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
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
        ])


      runWithException("when the nested callback throws an exception", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => {
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
        ])

      runWithException("when an exception is thrown after the nested callback", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => {
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
        ])
    })

    describe("two calls containing one each", () => {
      runSuccessfully([
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C Start")
          transform.__get__("transformStack")(() => events.push("Callback D"))
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
        ])

      runWithException("when an exception is thrown before the second nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
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
        ])

      runWithException("when an exception is thrown during the second nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C Start")
          transform.__get__("transformStack")(() => {
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
        ])

      runWithException("when an exception is thrown after the second nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A End")
        },
        () => {
          events.push("Callback C Start")
          transform.__get__("transformStack")(() => {
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
        ])
    })

    describe("one call containing two calls", () => {
      runSuccessfully([
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A Between")
          transform.__get__("transformStack")(() => events.push("Callback C"))
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
        ])

      runWithException("when an exception is thrown during the second nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A Between")
          transform.__get__("transformStack")(() => {
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
        ])

      runWithException("when an exception is thrown after the second nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => events.push("Callback B"))
          events.push("Callback A Between")
          transform.__get__("transformStack")(() => {
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
        ])
    })

    describe("three nested calls", () => {
      runSuccessfully([
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => {
            events.push("Callback B Start")
            transform.__get__("transformStack")(() => events.push("Callback C"))
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
        ])

      runWithException("when an exception is thrown after the nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => {
            events.push("Callback B Start")
            transform.__get__("transformStack")(() => events.push("Callback C"))
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
        ])

      runWithException("when an exception is thrown during the nested call", [
        () => {
          events.push("Callback A Start")
          transform.__get__("transformStack")(() => {
            events.push("Callback B Start")
            transform.__get__("transformStack")(() => {
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

    beforeEach(() => transform.__get__("copyMatrix")(transformA, transform.__get__("transform")))

    const pushTransformStack = (expected, changeTo, then) => describe("pushTransformStack", () => {
      beforeEach(() => transform.__get__("pushTransformStack")())
      it("does not change the transform", () => {
        for (let i = 0; i < 16; i++) {
          expect(transform.__get__("transform")[i]).toBeCloseTo(expected[i])
        }
      })
      if (then) {
        describe("then", () => {
          beforeEach(() => transform.__get__("copyMatrix")(changeTo, transform.__get__("transform")))
          then()
        })
      }
    })

    const popTransformStack = (expected, then) => describe("popTransformStack", () => {
      beforeEach(() => transform.__get__("popTransformStack")())
      it("reverses the transform", () => {
        for (let i = 0; i < 16; i++) {
          expect(transform.__get__("transform")[i]).toBeCloseTo(expected[i])
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
})