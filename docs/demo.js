"use strict";

const model = BusCorridor;
const $ = id => document.getElementById(id);
const controls = ["demand", "variability", "cap"];
const focalBuses = new Set([2, 3, 4]); // Zero-based indices for buses 3–5.
let lanes = [];
let elapsed = 0;
let duration = 0;
let axisMinutes = 0;
let frame = 0;
let playing = false;
let previousFrame = 0;
let originalDisruption = false;

function makeLane(label, run, positions) {
  const section = document.createElement("section");
  section.className = "lane";
  section.innerHTML = '<h2></h2><p class="finish" aria-live="polite"></p><canvas class="time-distance" role="img"></canvas>'
    + '<p class="wait-status"></p>'
    + '<dl class="stats"><div><dt>Mean platform wait</dt><dd data-metric="platform_wait">—</dd></div>'
    + '<div><dt>Mean journey time</dt><dd data-metric="journey_time">—</dd></div>'
    + '<div><dt>Completed trips</dt><dd data-metric="completed">0</dd></div></dl>'
    + '<p class="focus-detail"></p>';
  section.querySelector("h2").textContent = label;
  const chart = section.querySelector("canvas");
  chart.setAttribute("aria-label", label + ". Bus positions by time and route position, from Origin to Terminal.");
  const market = run.visits[4][1];
  const upstream = market.arrival - market.approach;
  const berthWait = market.serviceStart - market.arrival;
  section.querySelector(".focus-detail").textContent =
    "Bus 5 at Market · " + upstream.toFixed(1) + " s before the stop · " + berthWait.toFixed(1) + " s waiting for a berth";
  $("lanes").append(section);
  return {
    run, chart, tracks: run.visits.map((visits, index) => busTrack(visits, index, positions)),
    finish: section.querySelector(".finish"),
    waitStatus: section.querySelector(".wait-status"), metrics: section.querySelectorAll("[data-metric]"),
  };
}

function formatTime(time, tenths = false) {
  const seconds = tenths ? Math.round(time * 10) / 10 : Math.floor(time);
  const remainder = (seconds % 60).toFixed(tenths ? 1 : 0);
  return Math.floor(seconds / 60) + ":" + remainder.padStart(tenths ? 4 : 2, "0");
}

function draw() {
  $("clock").textContent = formatTime(elapsed);
  $("seek").value = elapsed;
  const focusOnly = $("vehicle-view").value === "focus";
  for (const { run, chart, tracks, finish, waitStatus, metrics } of lanes) {
    const finishText = elapsed >= run.end ? "Last bus finished at " + formatTime(run.end, true) : "Last bus finish · —";
    if (finish.textContent !== finishText) finish.textContent = finishText;
    const shown = focusOnly ? tracks.filter((_, i) => focalBuses.has(i)) : tracks;
    const waitText = drawTimeDistance(chart, shown, elapsed, axisMinutes, originalDisruption).join(" · ");
    if (waitStatus.textContent !== waitText) waitStatus.textContent = waitText;
    const measured = model.metrics(run, elapsed);
    for (const target of metrics) {
      const value = measured[target.dataset.metric];
      const label = target.dataset.metric === "completed" ? String(value)
        : value === null ? "—" : value.toFixed(2) + " s";
      if (target.textContent !== label) target.textContent = label;
    }
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

function prepare(mode) {
  originalDisruption = mode === "disruption";
  const replay = mode !== "preview";
  const reference = globalThis.CORRIDOR_REFERENCE;
  if (replay) {
    $("demand").value = "reference";
    $("variability").value = "reference";
    $("cap").value = "20";
  } else {
    if ($("demand").value === "reference") $("demand").value = "1";
    if ($("variability").value === "reference") $("variability").value = "0.15";
  }
  try {
    const cap = Number($("cap").value);
    const inputs = originalDisruption ? model.referenceInputs()
      : replay ? reference.published.inputs
        : model.sampledInputs(Number($("demand").value), Number($("variability").value), 42);
    const runs = { baseline: model.simulate(inputs), holding: model.simulate(inputs, cap) };
    if (!originalDisruption) runs.faster_boarding = model.simulate(inputs, 0, 0.20);
    const labels = {
      baseline: originalDisruption ? "No holding" : "Baseline",
      holding: cap === 0 ? "Holding off (0 s cap)" : "Hold up to " + cap + " s",
      faster_boarding: "Faster boarding · 20%",
    };
    $("lanes").replaceChildren();
    $("lanes").classList.toggle("original", originalDisruption);
    const positions = originalDisruption ? model.distance : model.stops.map((_, index) => index);
    lanes = Object.entries(runs).map(([policy, run]) => makeLane(labels[policy], run, positions));
    duration = Math.max(...lanes.map(lane => lane.run.end));
    axisMinutes = 5 * Math.ceil(duration / 300);
    $("seek").max = duration;
    resetTime();
    const sample = originalDisruption ? "Original road disruption" : "Published parameters";
    const expected = originalDisruption ? reference.policies : reference.published.policies;
    const status = replay ? referenceStatus(runs, expected, reference.tolerance_seconds) : "Sample run · seed 42";
    $("scenario").textContent = sample + " · " + status;
  } catch (error) {
    pause();
    $("start").disabled = true;
    $("status").textContent = error.message;
  }
}

function referenceStatus(runs, expected, tolerance) {
  const passing = Object.entries(runs).every(([policy, run]) => {
    const target = expected[policy];
    const measured = model.metrics(run);
    return measured.completed === target.completed
      && ["platform_wait", "journey_time", "bus5_market_berth_wait"].every(key =>
        Math.abs(measured[key] - target[key]) <= tolerance);
  });
  return passing ? "Notebook reference matched" : "Notebook reference did not match.";
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
  elapsed = Number($("seek").value);
  draw();
  $("status").textContent = elapsed >= duration ? "All runs complete" : "Paused";
});
$("reference").addEventListener("click", () => prepare("published"));
$("disruption").addEventListener("click", () => prepare("disruption"));
for (const id of controls) $(id).addEventListener("change", () => prepare("preview"));
prepare("published");
$("vehicle-view").addEventListener("change", draw);
window.addEventListener("resize", draw);
