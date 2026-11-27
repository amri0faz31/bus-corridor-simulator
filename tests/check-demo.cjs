"use strict";
const assert = require("node:assert/strict");
const model = require("../docs/simulation.js");
const { busTrack, trackFrame } = require("../docs/time-distance.js");
const reference = require("../data/browser-reference.json");
require("../docs/reference.js");
assert.deepEqual(globalThis.CORRIDOR_REFERENCE, reference);

const input = {
  dispatches: reference.dispatches, runningTimes: reference.runningTimes,
  targetGap: reference.targetGap, trips: reference.trips[reference.defaults.demand],
  disruption: { bus: 0, link: 0, seconds: reference.defaults.delay },
};
assert.deepEqual(model.stops, ["Origin", "Market", "School", "Terminal"]);
assert.deepEqual(input.dispatches, [60, 420, 780]);
const close = (actual, expected) => assert(Math.abs(actual - expected) <= reference.tolerance_seconds,
  actual + " differs from " + expected);
for (const [policy, cap] of [["baseline", 0], ["holding", reference.defaults.cap]]) {
  const run = model.simulate(input, cap);
  const actual = model.metrics(run), expected = reference.policies[policy];
  assert.equal(actual.completed, expected.completed);
  assert.equal(actual.school_boarding.length, 3);
  actual.school_boarding.forEach((time, i) => close(time, expected.school_boarding[i]));
  for (const key of ["platform_wait", "journey_time", "bus2_hold"]) close(actual[key], expected[key]);
  for (const bus of [0, 2]) close(run.visits[bus][1].arrival, run.visits[bus][1].ready);
  for (const [index, route] of run.visits.entries()) {
    const track = busTrack(route, index, [0, 1, 2, 3]);
    assert.deepEqual(trackFrame(track, 0), { trail: [], current: null });
    assert.equal(trackFrame(track, Infinity).current, null);
    assert.equal(track.segments.filter(s => s.state === "holding").length, index === 1 && cap ? 1 : 0);
    for (let segment = 1; segment < track.segments.length; segment++) {
      const before = track.segments[segment - 1], after = track.segments[segment];
      close(before.to, after.from);
      close(before.toPosition, after.fromPosition);
    }
  }
}
for (const trips of Object.values(reference.trips)) {
  for (const delay of [0, 120, 240, 360]) {
    const selected = { ...input, trips, disruption: { ...input.disruption, seconds: delay } };
    const baseline = model.simulate(selected);
    assert.deepEqual(model.simulate(selected, 0), baseline);
    for (const cap of [20, 40, 60]) {
      const held = model.simulate(selected, cap);
      assert.deepEqual(held.riders.map(p => [p.arrival, p.origin, p.destination]),
        baseline.riders.map(p => [p.arrival, p.origin, p.destination]));
      assert(held.riders.every(p => p.alight !== null));
      const hold = model.metrics(held).bus2_hold;
      assert(hold >= 0 && hold <= cap + reference.tolerance_seconds);
    }
  }
}
console.log("PASS: School boarding times, passenger parity, zero cap, and 48 control combinations.");
