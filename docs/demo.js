"use strict";

const model = BusCorridor;
const reference = CORRIDOR_REFERENCE;
const $ = id => document.getElementById(id);
const controls = ["cap", "traffic-delay", "demand"];
const playbackRate = 26;
let lanes = [];
let elapsed = 0;
let duration = 0;
let axisMinutes = 0;
let frame = 0;
let previousFrame = 0;
let playing = false;

function minutesSeconds(seconds) {
  const tenths = Math.round(seconds * 10);
  return Math.floor(tenths / 600) + " min " + (tenths % 600 / 10).toFixed(1) + " s";
}

function clockTime(seconds) {
  const whole = Math.floor(seconds);
  return Math.floor(whole / 3600) + ":" + [Math.floor(whole / 60) % 60, whole % 60]
    .map(value => String(value).padStart(2, "0")).join(":");
}

function makeLane(label, run) {
  const section = document.createElement("section");
  section.className = "lane";
  section.innerHTML = '<h2></h2><canvas class="time-distance" role="img"></canvas>'
    + '<dl class="school-gaps" aria-label="School boarding gaps">'
    + '<div><dt>School · B1 to B2</dt><dd>—</dd></div><div><dt>School · B2 to B3</dt><dd>—</dd></div></dl>';
  section.querySelector("h2").textContent = label;
  const chart = section.querySelector("canvas");
  chart.setAttribute("aria-label", label + " time–distance diagram for buses 1, 2 and 3");
  $("lanes").append(section);
  return {
    run, chart, tracks: run.visits.map((route, index) => busTrack(route, index, [0, 1, 2, 3])),
    metrics: model.metrics(run), gaps: section.querySelectorAll("dd"), market: run.visits[1][1],
  };
}

function updateText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function draw() {
  updateText($("clock"), clockTime(elapsed));
  for (const lane of lanes) {
    drawTimeDistance(lane.chart, lane.tracks, elapsed, axisMinutes, model.passengerCounts(lane.run, elapsed));
    const board = lane.metrics.school_boarding;
    lane.gaps.forEach((element, index) => updateText(element, elapsed >= board[index + 1]
      ? minutesSeconds(board[index + 1] - board[index]) : "—"));
  }
  const held = lanes[1];
  let message = "";
  if (held && elapsed >= held.market.ready) {
    const seconds = Number(held.metrics.bus2_hold.toFixed(2));
    message = elapsed < held.market.arrival ? "Holding Bus 2 before Market…"
      : "Bus 2 held for " + seconds + " s before Market.";
  }
  updateText($("event"), message);
}

function pause() {
  playing = false;
  cancelAnimationFrame(frame);
  $("start").disabled = false;
  $("pause").disabled = true;
}

function reset() {
  pause();
  elapsed = 0;
  $("results").hidden = true;
  draw();
}

function displayResults() {
  const [baseline, held] = lanes.map(lane => lane.metrics);
  const table = $("results").querySelector("tbody");
  table.replaceChildren();
  for (const [metric, label] of [["platform_wait", "Mean platform wait"], ["journey_time", "Mean total journey time"]]) {
    const row = table.insertRow();
    const heading = document.createElement("th");
    heading.scope = "row";
    heading.textContent = label;
    row.append(heading);
    const difference = held[metric] - baseline[metric];
    const rounded = Number(difference.toFixed(2));
    const signed = (rounded > 0 ? "+" : "") + rounded.toFixed(2);
    for (const value of [minutesSeconds(baseline[metric]), minutesSeconds(held[metric]), signed]) {
      row.insertCell().textContent = value;
    }
  }
  $("cohort").textContent = baseline.completed + " identical passengers completed each run.";
  $("results").hidden = false;
}

function matchesReference(actual, expected) {
  const close = (value, target) => Math.abs(value - target) <= reference.tolerance_seconds;
  return actual.completed === expected.completed
    && close(actual.platform_wait, expected.platform_wait)
    && close(actual.journey_time, expected.journey_time)
    && actual.school_boarding.every((time, index) => close(time, expected.school_boarding[index]));
}

function prepare() {
  const delay = Number($("traffic-delay").value);
  const cap = Number($("cap").value);
  const demand = $("demand").value;
  const input = {
    dispatches: reference.dispatches,
    trips: reference.trips[demand],
    runningTimes: reference.runningTimes,
    targetGap: reference.targetGap,
    disruption: { bus: 0, link: 0, seconds: delay },
  };
  $("dispatches").textContent = input.dispatches.map((time, index) => "B" + (index + 1) + " at "
    + time / 60 + " min").join(" · ");
  const baseline = model.simulate(input);
  const held = model.simulate(input, cap, true);
  $("lanes").replaceChildren();
  lanes = [makeLane("No holding", baseline), makeLane("Hold Bus 2", held)];
  duration = Math.max(baseline.end, held.end);
  axisMinutes = 5 * Math.ceil(duration / 300);
  const defaults = delay === reference.defaults.delay && cap === reference.defaults.cap
    && demand === reference.defaults.demand;
  $("reference-status").textContent = defaults
    ? (matchesReference(lanes[0].metrics, reference.policies.baseline)
      && matchesReference(lanes[1].metrics, reference.policies.holding)
      ? "Default School boarding times and passenger averages match the notebook."
      : "Default run did not match the notebook reference.")
    : "Restore the default controls to check this replay against the notebook.";
  reset();
}

function tick(now) {
  if (!playing) return;
  elapsed = Math.min(duration, elapsed + (now - previousFrame) * playbackRate / 1000);
  previousFrame = now;
  draw();
  if (elapsed < duration) {
    frame = requestAnimationFrame(tick);
  } else {
    pause();
    displayResults();
  }
}

$("start").addEventListener("click", () => {
  if (elapsed >= duration) reset();
  playing = true;
  previousFrame = performance.now();
  $("start").disabled = true;
  $("pause").disabled = false;
  frame = requestAnimationFrame(tick);
});
$("pause").addEventListener("click", pause);
$("reset").addEventListener("click", reset);
for (const id of controls) $(id).addEventListener("change", prepare);
window.addEventListener("resize", draw);
$("traffic-delay").value = reference.defaults.delay;
$("demand").value = reference.defaults.demand;
$("cap").value = reference.defaults.cap;
prepare();
