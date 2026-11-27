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

function makeLane(label, run) {
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
  chart.setAttribute("aria-label", label + ". Bus positions by time and distance, from Origin to Terminal.");
  const market = run.visits[4][1];
  const upstream = market.arrival - market.approach;
  const berthWait = market.serviceStart - market.arrival;
  section.querySelector(".focus-detail").textContent =
    "Bus 5 at Market · " + upstream.toFixed(1) + " s before the stop · " + berthWait.toFixed(1) + " s waiting for a berth";
  $("lanes").append(section);
  return {
    run, chart, tracks: run.visits.map(busTrack), finish: section.querySelector(".finish"),
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
    const waitText = drawTimeDistance(chart, shown, elapsed, axisMinutes).join(" · ");
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

function prepare(useReference) {
  if (useReference) {
    $("demand").value = "reference";
    $("variability").value = "reference";
    $("cap").value = "20";
  } else {
    if ($("demand").value === "reference") $("demand").value = "1";
    if ($("variability").value === "reference") $("variability").value = "0.15";
  }
  try {
    const cap = useReference ? 20 : Number($("cap").value);
    const inputs = useReference
      ? model.referenceInputs()
      : model.sampledInputs(Number($("demand").value), Number($("variability").value), 42);
    const runs = [model.simulate(inputs), model.simulate(inputs, cap)];
    $("lanes").replaceChildren();
    const heldLabel = cap === 0 ? "Holding off (0 s cap)" : "Hold up to " + cap + " s";
    lanes = [makeLane("No holding", runs[0]), makeLane(heldLabel, runs[1])];
    duration = Math.max(...runs.map(run => run.end));
    axisMinutes = 5 * Math.ceil(duration / 300);
    $("seek").max = duration;
    resetTime();
    $("scenario").textContent = useReference ? referenceStatus(runs) : "Sample run · seed 42";
  } catch (error) {
    pause();
    $("start").disabled = true;
    $("status").textContent = error.message;
  }
}

function referenceStatus(runs) {
  const reference = globalThis.CORRIDOR_REFERENCE;
  const passing = runs.every((run, index) => {
    const expected = reference.policies[index === 0 ? "baseline" : "holding"];
    const measured = model.metrics(run);
    return measured.completed === expected.completed
      && ["platform_wait", "journey_time", "bus5_market_berth_wait"].every(key =>
        Math.abs(measured[key] - expected[key]) <= reference.tolerance_seconds);
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
    $("status").textContent = "Both runs complete";
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
  $("status").textContent = elapsed >= duration ? "Both runs complete" : "Paused";
});
$("reference").addEventListener("click", () => prepare(true));
for (const id of controls) $(id).addEventListener("change", () => prepare(false));
prepare(true);
$("vehicle-view").addEventListener("change", draw);
window.addEventListener("resize", draw);
