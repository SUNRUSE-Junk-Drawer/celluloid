// Rewire time was causing test runtime to be unmanageable; Jasmine's beforeEach
// runs on every it(...), while its beforeAll runs only once.  What we really
// want is something which runs once per scenario, with side-effect-free
// assertions, which is a many-times speed-up as we only rewire once per 
// scenario.

const rewire = require("rewire")
const setupChain = [() => global.index = rewire("../../dist/index")]

global.setup = action => {
  beforeAll(() => setupChain.push(action))
  afterAll(() => setupChain.pop(action))
}

global.assert = assertions => {
  beforeAll(() => setupChain.forEach(step => step()))
  for (const name in assertions) it(name, assertions[name])
}