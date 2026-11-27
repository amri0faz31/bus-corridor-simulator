"use strict";

const model = BusCorridor;
const $ = id => document.getElementById(id);
const controls = ["demand", "traffic-delay", "cap", "dispatch-gap"];
let lanes = [];
let elapsed = 0;
let duration = 0;
let axisMinutes = 0;
let frame = 0;
let playing = false;
let previousFrame = 0;
let demandEnd = 0;

function makeLane(label, run, positions) {
  const section = document.createElement("section");
  section.className = "lane";
  section.innerHTML = '<h2></h2><p class="finish" aria-live="polite"></p><canvas class="time-distance" role="img"></canvas>'
    + '<p class="wait-status"></p>'
    + '<dl class="stats"><div><dt>Mean platform wait</dt><dd data-metric="platform_wait">—</dd></div>'
    + '<div><dt>Mean journey time</dt><dd data-metric="journey_time">—</dd></div>'
    + '<div><dt>Completed trips</dt><dd data-metric="completed">0</dd></div></dl>'
    + '<p class="snapshot last-bus"></p>';
  section.querySelector("h2").textContent = label;
  const chart = section.querySelector("canvas");
  chart.setAttribute("aria-label", label + ". Bus positions by time and route position, from Origin to Terminal.");
  $("lanes").append(section);
  return {
    run, chart, tracks: run.visits.map((visits, index) => busTrack(visits, index, positions)),
    finish: section.querySelector(".finish"),
    waitStatus: section.querySelector(".wait-status"), metrics: section.querySelectorAll("[data-metric]"),
    lastBus: section.querySelector(".last-bus"),
  };
}

function formatTime(time, tenths = false) {
  const seconds = tenths ? Math.round(time * 10) / 10 : Math.floor(time);
  const remainder = (seconds % 60).toFixed(tenths ? 1 : 0);
  const minutes = String(Math.floor(seconds / 60) % 60).padStart(2, "0");
  return Math.floor(seconds / 3600) + ":" + minutes + ":" + remainder.padStart(tenths ? 4 : 2, "0");
}

function formatDuration(time) {
  const seconds = Math.round(time * 100) / 100;
  if (seconds >= 3600) return formatTime(seconds, true);
  const minutes = Math.floor(seconds / 60);
  return (minutes ? minutes + " min " : "") + (seconds % 60).toFixed(2) + " s";
}

function updateText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function draw() {
  $("clock").textContent = formatTime(elapsed);
  $("seek").value = elapsed;
  const phase = elapsed < demandEnd ? "Random arrivals until " + formatTime(demandEnd)
    : "Arrivals closed at " + formatTime(demandEnd) + " · final passengers finish their trips";
  updateText($("arrivals"), phase);
  for (const { run, chart, tracks, finish, waitStatus, metrics, lastBus } of lanes) {
    const finishText = elapsed >= run.end ? "Last bus finished at " + formatTime(run.end, true) : "";
    updateText(finish, finishText);
    const counts = model.passengerCounts(run, elapsed);
    const waitText = drawTimeDistance(chart, tracks, elapsed, axisMinutes, false, counts).join(" · ");
    updateText(waitStatus, waitText);
    const measured = model.metrics(run, elapsed);
    for (const target of metrics) {
      const value = measured[target.dataset.metric];
      const label = target.dataset.metric === "completed" ? String(value)
        : value === null ? "—" : formatDuration(value);
      updateText(target, label);
    }
    const boardings = run.riders.filter(rider => rider.bus === 2 && rider.board <= elapsed).length;
    const gap = run.visits[2][1].departure - run.visits[1][1].departure;
    const gapText = elapsed >= run.visits[2][1].departure ? " · Market gap between Buses 2 and 3: " + formatDuration(gap) : "";
    updateText(lastBus, "Passengers boarded by Bus 3: " + boardings + gapText);
  }
}

function pause() {
  playing = false;
  cancelAnimationFrame(frame);
  $("start").disabled = false;
  $("pause").disabled = true;
}

function resetTime() {
  pause();
  elapsed = 0;
  draw();
  $("status").textContent = "Ready";
}

function prepare(replay) {
  const reference = globalThis.CORRIDOR_REFERENCE;
  if (replay) {
    $("demand").value = "1";
    $("traffic-delay").value = "240";
    $("cap").value = "20";
    $("dispatch-gap").value = "360";
  }
  try {
    const cap = Number($("cap").value);
    const inputs = replay ? reference.three_bus.inputs : model.threeBusInputs(
      Number($("demand").value), 0.15, 42, Number($("dispatch-gap").value), Number($("traffic-delay").value)
    );
    demandEnd = inputs.dispatches.at(-1);
    const baseline = model.simulate(inputs);
    const held = model.simulate(inputs, cap);
    const positions = model.stops.map((_, index) => index);
    $("lanes").replaceChildren();
    lanes = [makeLane("No holding", baseline, positions), makeLane("Hold up to " + cap + " s", held, positions)];
    duration = Math.max(baseline.end, held.end);
    axisMinutes = 5 * Math.ceil(duration / 300);
    $("seek").max = duration;
    $("dispatches").textContent = inputs.dispatches.map((time, index) =>
      "Bus " + (index + 1) + " starts at " + formatTime(time)).join(" · ");
    resetTime();
    const passed = replay && referenceMatches(baseline, reference.three_bus.policies.baseline, reference.tolerance_seconds)
      && referenceMatches(held, reference.three_bus.policies.holding, reference.tolerance_seconds);
    $("scenario").textContent = replay
      ? (passed ? "Notebook example matched" : "Notebook example did not match")
      : "Random sample · seed 42";
  } catch (error) {
    pause();
    $("start").disabled = true;
    $("status").textContent = error.message;
  }
}

function referenceMatches(run, expected, tolerance) {
  const measured = model.metrics(run);
  const boardings = run.riders.filter(rider => rider.bus === 2).length;
  const gap = run.visits[2][1].departure - run.visits[1][1].departure;
  return measured.completed === expected.completed && boardings === expected.bus3_boardings
    && Math.abs(gap - expected.market_departure_gap) <= tolerance
    && ["platform_wait", "journey_time"].every(key => Math.abs(measured[key] - expected[key]) <= tolerance);
}

function tick(now) {
  if (!playing) return;
  const realSeconds = (now - previousFrame) / 1000;
  elapsed = Math.min(duration, elapsed + realSeconds * Number($("speed").value));
  previousFrame = now;
  draw();
  if (elapsed < duration) {
    frame = requestAnimationFrame(tick);
  } else {
    pause();
    $("status").textContent = "All runs complete";
  }
}

$("start").addEventListener("click", () => {
  if (elapsed >= duration) resetTime();
  playing = true;
  previousFrame = performance.now();
  $("start").disabled = true;
  $("pause").disabled = false;
  $("status").textContent = "Running";
  frame = requestAnimationFrame(tick);
});
$("pause").addEventListener("click", () => {
  pause();
  $("status").textContent = "Paused";
});
$("reset").addEventListener("click", resetTime);
$("seek").addEventListener("input", () => {
  pause();
  const requested = Number($("seek").value);
  // Browsers can round a range edge slightly below the exact simulation end.
  elapsed = requested + 1e-6 >= duration ? duration : requested;
  draw();
  $("status").textContent = elapsed >= duration ? "All runs complete" : "Paused";
});
$("reference").addEventListener("click", () => prepare(true));
for (const id of controls) $(id).addEventListener("change", () => prepare(false));
prepare(true);
window.addEventListener("resize", draw);
