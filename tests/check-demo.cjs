"use strict";
const assert = require("node:assert/strict");
const model = require("../docs/simulation.js");
const reference = require("../data/browser-reference.json");
require("../docs/reference.js");
assert.deepEqual(globalThis.CORRIDOR_REFERENCE, reference);

const inputs = model.referenceInputs();
for (const [policy, cap] of [["baseline", 0], ["holding", 20]]) {
  const actual = model.metrics(model.simulate(inputs, cap));
  const expected = reference.policies[policy];
  assert.equal(actual.completed, expected.completed);
  for (const key of ["platform_wait", "journey_time", "bus5_market_berth_wait"]) {
    assert.ok(Math.abs(actual[key] - expected[key]) <= reference.tolerance_seconds,
      policy + " " + key + ": " + actual[key] + " vs " + expected[key]);
  }
}

for (const demand of [0.6, 1, 1.75]) {
  for (const cv of [0.15, 0.45]) {
    const input = model.sampledInputs(demand, cv, 42);
    assert.deepEqual(input, model.sampledInputs(demand, cv, 42));
    const baseline = model.simulate(input);
    for (const cap of [0, 10, 20, 40]) {
      const held = model.simulate(input, cap);
      assert.equal(model.metrics(held).completed, model.metrics(baseline).completed);
      assert.equal(model.metrics(held).completed, input.trips.length);
      if (cap === 0) assert.deepEqual(held, baseline);
    }
  }
}
console.log("PASS: both notebook reference policies and all 24 browser control combinations.");
