"use strict";

const model = BusCorridor;
const $ = id => document.getElementById(id);
const controls = ["demand", "variability", "cap"];
const focalBuses = new Set([2, 3, 4]); // Zero-based indices for buses 3–5.
const laneNames = ["No holding", "Capped holding"];
let lanes = [];
let elapsed = 0;
let duration = 0;
let frame = 0;
let playing = false;
let previousFrame = 0;
let referenceMode = false;

function makeLane(label, run) {
  const section = document.createElement("section");
  section.className = "lane";
  section.innerHTML = '<h2></h2><div class="road" aria-hidden="true"><div class="track"></div></div>'
    + '<dl class="stats"><div><dt>Mean platform wait</dt><dd data-metric="platform_wait">—</dd></div>'
    + '<div><dt>Mean journey time</dt><dd data-metric="journey_time">—</dd></div>'
    + '<div><dt>Completed trips</dt><dd data-metric="completed">0</dd></div></dl>'
    + '<p class="focus-detail"></p>';
  section.querySelector("h2").textContent = label;
  const road = section.querySelector(".road");
  model.stops.forEach((name, i) => {
    const stop = document.createElement("span");
    stop.className = "stop";
    stop.textContent = name;
    stop.style.left = percent(model.distance[i]);
    if (i === 0) stop.style.transform = "none";
    if (i === model.stops.length - 1) stop.style.transform = "translateX(-100%)";
    road.append(stop);
  });
  const markers = run.visits.map((_, i) => {
    const marker = document.createElement("span");
    marker.className = "bus";
    marker.textContent = i + 1;
    road.append(marker);
    return marker;
  });
  const market = run.visits[4][1];
  const upstream = market.arrival - market.approach;
  const berthWait = market.serviceStart - market.arrival;
  section.querySelector(".focus-detail").textContent =
    "Bus 5 at Market · " + upstream.toFixed(1) + " s at control · " + berthWait.toFixed(1) + " s waiting for berth";
  $("lanes").append(section);
  return { run, section, markers };
}

function percent(km) {
  return (100 * km / model.distance.at(-1)) + "%";
}

function position(bus, time) {
  if (time < bus[0].arrival || time > bus.at(-1).departure) return null;
  for (let i = 0; i < bus.length; i += 1) {
    const visit = bus[i];
    if (i > 0 && time < visit.approach) {
      const before = bus[i - 1].departure;
      const fraction = (time - before) / (visit.approach - before);
      const km = model.distance[i - 1] + fraction * (model.distance[i] - model.distance[i - 1]);
      return { km, state: "moving" };
    }
    if (time <= visit.departure) {
      const state = time < visit.arrival ? "holding" : time < visit.serviceStart ? "waiting" : "boarding";
      return { km: model.distance[i] - (state === "holding" ? 0.11 : 0), state };
    }
  }
  return null;
}

function draw() {
  const seconds = Math.floor(elapsed);
  $("clock").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  for (const { run, section, markers } of lanes) {
    run.visits.forEach((bus, i) => {
      const focusOnly = $("vehicle-view").value === "focus";
      const location = !focusOnly || focalBuses.has(i) ? position(bus, elapsed) : null;
      const marker = markers[i];
      marker.hidden = !location;
      marker.style.display = location ? "" : "none";
      if (location) {
        marker.style.left = percent(location.km);
        marker.style.top = (2 + 15 * (i % 3)) + "px";
        marker.className = "bus " + location.state;
      }
    });
    const metrics = model.metrics(run, elapsed);
    for (const target of section.querySelectorAll("[data-metric]")) {
      const value = metrics[target.dataset.metric];
      target.textContent = target.dataset.metric === "completed" ? value
        : value === null ? "—" : value.toFixed(2) + " s";
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
}

function prepare(useReference) {
  referenceMode = useReference;
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
    lanes = runs.map((run, i) => makeLane(i === 1 ? laneNames[i] + " · " + cap + " s cap" : laneNames[i], run));
    duration = Math.max(...runs.map(run => run.end));
    resetTime();
    $("status").textContent = useReference ? referenceStatus(runs) : "Ready · seed 42";
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
  return passing ? "Notebook reference matched · 296 trips per policy" : "Notebook reference did not match.";
}

function tick(now) {
  if (!playing) return;
  elapsed = Math.min(duration, elapsed + (now - previousFrame) * 0.08);
  previousFrame = now;
  draw();
  if (elapsed < duration) {
    frame = requestAnimationFrame(tick);
  } else {
    pause();
    $("status").textContent = referenceMode
      ? referenceStatus(lanes.map(item => item.run)) : "Finished · both runs complete";
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
$("reset").addEventListener("click", () => prepare(referenceMode));
$("reference").addEventListener("click", () => prepare(true));
for (const id of controls) $(id).addEventListener("change", () => prepare(false));
prepare(true);
$("vehicle-view").addEventListener("change", draw);
