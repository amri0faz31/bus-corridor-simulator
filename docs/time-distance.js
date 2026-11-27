"use strict";

const busColors = ["#126681", "#76529b", "#3a7760"];
const waitColors = { holding: "#a44928", upstream: "#23519b", waiting: "#23519b" };

function busTrack(visits, index, positions) {
  const segments = [];
  function add(from, to, fromKm, toKm, stop, state) {
    if (to > from) segments.push({ from, to, fromKm, toKm, stop, state });
  }
  visits.forEach((visit, stop) => {
    const km = positions[stop];
    if (stop > 0) {
      add(visits[stop - 1].departure, visit.approach, positions[stop - 1], km, stop, "moving");
    }
    add(visit.approach, visit.ready, km, km, stop, "upstream");
    add(visit.ready, visit.arrival, km, km, stop, "holding");
    add(visit.arrival, visit.serviceStart, km, km, stop, "waiting");
    add(visit.serviceStart, visit.departure, km, km, stop, "at stop");
  });
  return { number: index + 1, color: busColors[index % busColors.length], segments };
}

function drawTimeDistance(canvas, buses, time, axisMinutes, distances) {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return [];
  const scale = window.devicePixelRatio || 1;
  const pixelWidth = Math.round(width * scale);
  const pixelHeight = Math.round(height * scale);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const left = 81, right = width - (distances ? 25 : 18), top = 32, bottom = height - 44;
  const maxPosition = distances ? BusCorridor.distance.at(-1) : BusCorridor.stops.length - 1;
  const x = seconds => left + (right - left) * seconds / (60 * axisMinutes);
  const y = km => bottom - (bottom - top) * km / maxPosition;
  function line(x1, y1, x2, y2, color, weight = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.font = "11px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  BusCorridor.stops.forEach((name, index) => {
    const km = distances ? BusCorridor.distance[index] : index;
    line(left, y(km), right, y(km), "#d6e0e2");
    ctx.fillStyle = "#526671";
    ctx.textAlign = "right";
    ctx.fillText(name, left - 6, y(km));
    if (distances) {
      ctx.textAlign = "left";
      ctx.fillText(km.toFixed(1), right + 5, y(km));
    }
  });
  for (let minute = 0; minute <= axisMinutes; minute += axisMinutes / 5) {
    const tick = x(minute * 60);
    line(tick, top, tick, bottom, "#e7edef");
    ctx.fillStyle = "#526671";
    ctx.textAlign = "center";
    ctx.fillText(Math.floor(minute / 60) + ":" + String(minute % 60).padStart(2, "0"), tick, bottom + 13);
  }
  line(left, top, left, bottom, "#93a8b2");
  line(left, bottom, right, bottom, "#93a8b2");
  ctx.fillStyle = "#152a36";
  ctx.textAlign = "left";
  ctx.fillText(distances ? "Distance along route (km)" : "Stops in route order", left, 12);
  ctx.textAlign = "center";
  ctx.fillText("Time since first dispatch (h:mm)", (left + right) / 2, height - 9);
  line(x(time), top - 7, x(time), bottom, "#8d9da5");

  const dots = [];
  for (const { number, color, segments } of buses) {
    let dot;
    for (const segment of segments) {
      if (time < segment.from) break;
      const end = Math.min(time, segment.to);
      const fraction = (end - segment.from) / (segment.to - segment.from);
      const km = segment.fromKm + fraction * (segment.toKm - segment.fromKm);
      const waitColor = waitColors[segment.state];
      line(x(segment.from), y(segment.fromKm), x(end), y(km), waitColor || color, waitColor ? 3 : 1.5);
      dot = {
        x: x(end), y: y(km), number, stop: segment.stop, color: waitColor || color,
        state: time < segment.to ? segment.state : "finished",
      };
      if (time < segment.to) break;
    }
    if (dot) dots.push(dot);
  }

  // Move only the numbered markers when labels overlap. Trails retain the event positions.
  const labels = [];
  for (const dot of dots) {
    const offsets = [0, -18, 18, -36, 36];
    const labelY = offsets.map(offset => dot.y + offset)
      .find(candidate => candidate >= 15 && candidate <= bottom
        && labels.every(label => Math.hypot(dot.x - label.x, candidate - label.y) >= 17)) ?? dot.y;
    labels.push({ x: dot.x, y: labelY });
    if (labelY !== dot.y) line(dot.x, dot.y, dot.x, labelY, dot.color);
    ctx.beginPath();
    ctx.arc(dot.x, labelY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = dot.color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.fillText(String(dot.number), dot.x, labelY);
  }

  return dots.filter(dot => waitColors[dot.state]).map(dot => {
    const action = {
      holding: "holding before", upstream: "waiting at control before", waiting: "waiting for a berth at",
    }[dot.state];
    return "Bus " + dot.number + " " + action + " " + BusCorridor.stops[dot.stop];
  });
}
