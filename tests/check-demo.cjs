"use strict";
const assert = require("node:assert/strict");
const model = require("../docs/simulation.js");
const reference = require("../data/browser-reference.json");
require("../docs/reference.js");
assert.deepEqual(globalThis.CORRIDOR_REFERENCE, reference);

const policyOptions = { baseline: [0, 0], holding: [20, 0], faster_boarding: [0, 0.20] };
for (const fixture of [
  { inputs: model.referenceInputs(), policies: reference.policies },
  reference.published,
]) {
  for (const [policy, expected] of Object.entries(fixture.policies)) {
    const actual = model.metrics(model.simulate(fixture.inputs, ...policyOptions[policy]));
    assert.equal(actual.completed, expected.completed);
    for (const key of ["platform_wait", "journey_time", "bus5_market_berth_wait"]) {
      assert.ok(Math.abs(actual[key] - expected[key]) <= reference.tolerance_seconds,
        policy + " " + key + ": " + actual[key] + " vs " + expected[key]);
    }
  }
}
assert.equal(reference.published.inputs.disruption, null);
const fixture = reference.published.inputs;
assert.deepEqual(model.simulate(fixture, 0, 0), model.simulate(fixture));

for (const demand of [0.6, 1, 1.75]) {
  for (const cv of [0.15, 0.45]) {
    const input = model.sampledInputs(demand, cv, 42);
    assert.deepEqual(input, model.sampledInputs(demand, cv, 42));
    const baseline = model.simulate(input);
    const faster = model.simulate(input, 0, 0.20);
    assert.equal(model.metrics(faster).completed, input.trips.length);
    for (const cap of [0, 10, 20, 40]) {
      const held = model.simulate(input, cap);
      assert.equal(model.metrics(held).completed, model.metrics(baseline).completed);
      assert.equal(model.metrics(held).completed, input.trips.length);
      if (cap === 0) assert.deepEqual(held, baseline);
    }
  }
}
console.log("PASS: five notebook reference runs, zero boarding improvement, and all 24 preview settings.");
