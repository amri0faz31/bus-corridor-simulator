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
assert.deepEqual(input.dispatches, [60, 300, 540]);
assert.equal(input.targetGap, 240);
const close = (actual, expected) => assert(Math.abs(actual - expected) <= reference.tolerance_seconds,
  actual + " differs from " + expected);
const baseline = model.simulate(input);
const cutoffs = [
  input.dispatches[2],
  input.dispatches[2] + input.runningTimes[2][0],
  input.dispatches[2] + input.runningTimes[2][0] + input.runningTimes[2][1],
];
reference.cutoffs.forEach((time, i) => close(time, cutoffs[i]));
for (const [arrival, origin] of input.trips) assert(arrival < cutoffs[origin]);
assert(input.trips.some(([arrival, origin]) => origin === 2 && arrival > input.dispatches[2]));
for (const cap of [0, 20, 40, 60]) {
  const run = model.simulate(input, cap, true);
  const actual = model.metrics(run), expected = reference.caps[cap];
  assert.equal(actual.completed, expected.completed);
  assert.equal(actual.school_boarding.length, 3);
  actual.school_boarding.forEach((time, i) => close(time, expected.school_boarding[i]));
  for (const key of ["platform_wait", "onboard_time", "journey_time", "bus2_hold"]) close(actual[key], expected[key]);
  const switches = model.caughtBus2(baseline, run);
  assert.equal(switches.market_switches, expected.market_switches);
  assert.equal(switches.school_switches, expected.school_switches);
  for (const rider of run.riders) close(rider.board - rider.arrival + (rider.alight - rider.board), rider.alight - rider.arrival);
  for (const bus of [0, 2]) close(run.visits[bus][1].arrival, run.visits[bus][1].ready);
  for (const [index, route] of run.visits.entries()) {
    const track = busTrack(route, index, [0, 1, 2, 3]);
    assert.deepEqual(trackFrame(track, 0), { trail: [], current: null });
    assert.equal(trackFrame(track, Infinity).current, null);
    assert.equal(track.segments.filter(s => s.state === "holding").length, index === 1 && cap ? 1 : 0);
    assert.equal(track.segments.filter(s => s.state === "shock").length, index === 0 ? 1 : 0);
    for (let segment = 1; segment < track.segments.length; segment++) {
      const before = track.segments[segment - 1], after = track.segments[segment];
      close(before.to, after.from);
      close(before.toPosition, after.fromPosition);
    }
  }
  for (const time of new Set(run.riders.flatMap(rider =>
    [rider.arrival, rider.board - 1e-6, rider.board, rider.alight - 1e-6, rider.alight]))) {
    const counts = model.passengerCounts(run, time);
    const waiting = counts.waiting.reduce((sum, n) => sum + n, 0);
    const aboard = counts.aboard.reduce((sum, n) => sum + n, 0);
    assert.equal(counts.arrived, waiting + aboard + counts.completed);
  }
  const rider = { arrival: 1, board: 2, alight: 3, origin: 1, bus: 1 };
  const single = { visits: run.visits, riders: [rider] };
  assert.equal(model.passengerCounts(single, 2 - 1e-6).waiting[1], 1);
  assert.equal(model.passengerCounts(single, 2).waiting[1], 0);
  assert.equal(model.passengerCounts(single, 2).aboard[1], 1);
  assert.equal(model.passengerCounts(single, 3 - 1e-6).aboard[1], 1);
  assert.equal(model.passengerCounts(single, 3).aboard[1], 0);
  assert.equal(model.passengerCounts(single, 3).completed, 1);
}
for (const trips of Object.values(reference.trips)) {
  for (const delay of [0, 120, 240, 360]) {
    const selected = { ...input, trips, disruption: { ...input.disruption, seconds: delay } };
    const baseline = model.simulate(selected);
    const zero = model.simulate(selected, 0, true);
    assert.equal(zero.controlReleases, 3);
    assert.equal(baseline.controlReleases, 0);
    assert.deepEqual(zero.visits, baseline.visits);
    assert.deepEqual(zero.riders, baseline.riders);
    assert.equal(zero.end, baseline.end);
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
console.log("PASS: School boarding times, count boundaries, enabled zero cap, and 48 control combinations.");
