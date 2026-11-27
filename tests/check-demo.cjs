"use strict";
const assert = require("node:assert/strict");
const model = require("../docs/simulation.js");
const { busTrack, trackFrame } = require("../docs/time-distance.js");
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

const disrupted = model.simulate(model.referenceInputs());
const beforeMarketService = model.snapshot(disrupted, 420, 4, 1);
assert.equal(beforeMarketService.waiting, 23);
const duringMarketService = model.snapshot(disrupted, 430, 4, 1);
assert.equal(duringMarketService.waiting, 1);
assert.equal(duringMarketService.lastBoarded, 23);
assert.equal(duringMarketService.onboard, 6);
assert.equal(duringMarketService.berthQueue, 1);
assert.equal(model.snapshot(disrupted, Infinity, 4, 1).onboard, 0);
const counts = model.passengerCounts(disrupted, 430);
assert.equal(counts.waiting[1], 1);
assert.equal(counts.onboard[4], 6);
assert.equal(counts.waiting.reduce((a, b) => a + b) + counts.onboard.reduce((a, b) => a + b)
  + model.metrics(disrupted, 430).completed, disrupted.riders.filter(p => p.arrival <= 430).length);

const delayedTrack = busTrack(disrupted.visits[3], 3, model.distance);
assert.equal(disrupted.visits[3][1].roadDelay, 100);
const road = delayedTrack.segments.find(segment => segment.state === "traffic");
const midpoint = (road.from + road.to) / 2;
const movingFrame = trackFrame(delayedTrack, midpoint);
assert.equal(movingFrame.current.to, midpoint);
assert.equal(movingFrame.current.toPosition, 0.25);
assert.equal(movingFrame.trail.at(-1), movingFrame.current);
for (let index = 1; index < delayedTrack.segments.length; index++) {
  const previous = delayedTrack.segments[index - 1];
  const next = delayedTrack.segments[index];
  assert.equal(previous.to, next.from);
  assert.equal(previous.toPosition, next.fromPosition);
}
assert.deepEqual(trackFrame(delayedTrack, 0), { trail: [], current: null });
assert.equal(trackFrame(delayedTrack, Infinity).current, null);
const held = model.simulate(model.referenceInputs(), 20);
const heldTrack = busTrack(held.visits[4], 4, model.distance);
assert.equal(trackFrame(heldTrack, 430).current.state, "holding");

const shortDispatches = [0, 10, 11, 100];
const shortRun = model.simulate({
  dispatches: shortDispatches, trips: [], runningTimes: shortDispatches.map(() => [1, 10, 10, 10, 10]),
}, 20);
assert.equal(model.snapshot(shortRun, 25, 2, 1).upstreamQueue, 1);
assert.equal(model.snapshot(shortRun, 25, 2, 1).berthQueue, 0);

for (const demand of [0.6, 1, 1.75]) {
  for (const cv of [0.15, 0.45]) {
    const input = model.sampledInputs(demand, cv, 42);
    assert.deepEqual(input, model.sampledInputs(demand, cv, 42));
    const wider = model.sampledInputs(demand, cv, 42, 100);
    assert.equal(wider.dispatches[1] - wider.dispatches[0], 100);
    assert.deepEqual(wider.trips, input.trips);
    assert.deepEqual(wider.runningTimes, input.runningTimes);
    const widest = model.sampledInputs(demand, cv, 42, 120);
    assert.equal(widest.dispatches[1] - widest.dispatches[0], 120);
    assert.deepEqual(widest.trips, input.trips);
    assert.deepEqual(widest.runningTimes, input.runningTimes);
    for (const preview of [input, wider, widest]) {
      const baseline = model.simulate(preview);
      const faster = model.simulate(preview, 0, 0.20);
      assert.equal(model.metrics(faster).completed, preview.trips.length);
      for (const cap of [0, 10, 20, 40]) {
        const held = model.simulate(preview, cap);
        assert.equal(model.metrics(held).completed, model.metrics(baseline).completed);
        assert.equal(model.metrics(held).completed, preview.trips.length);
        if (cap === 0) assert.deepEqual(held, baseline);
      }
    }
  }
}
console.log("PASS: five notebook reference runs, continuous trails, live counts, and all 72 preview settings.");
