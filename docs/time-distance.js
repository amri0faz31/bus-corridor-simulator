"use strict";

const busColors = ["#126681", "#76529b", "#3a7760"];
const eventStyles = {
  traffic: { fill: "#facc15", outline: "#755b12" },
  holding: { fill: "#a3e635", outline: "#41651c" },
  upstream: { fill: "#60a5fa", outline: "#23519b" },
  waiting: { fill: "#60a5fa", outline: "#23519b" },
};

function busTrack(visits, index, positions) {
  const segments = [];
  function add(from, to, fromPosition, toPosition, stop, state) {
    if (to > from) segments.push({ from, to, fromPosition, toPosition, stop, state });
  }
  visits.forEach((visit, stop) => {
    const position = positions[stop];
    if (stop > 0) {
      const state = visit.roadDelay > 0 ? "traffic" : "moving";
      add(visits[stop - 1].departure, visit.approach, positions[stop - 1], position, stop, state);
    }
    add(visit.approach, visit.ready, position, position, stop, "upstream");
    add(visit.ready, visit.arrival, position, position, stop, "holding");
    add(visit.arrival, visit.serviceStart, position, position, stop, "waiting");
    add(visit.serviceStart, visit.departure, position, position, stop, "at stop");
  });
  return { number: index + 1, color: busColors[index % busColors.length], segments };
}

function trackFrame(track, time) {
  const trail = [];
  for (const segment of track.segments) {
    if (time < segment.from) break;
    const end = Math.min(time, segment.to);
    const fraction = (end - segment.from) / (segment.to - segment.from);
    const position = segment.fromPosition + fraction * (segment.toPosition - segment.fromPosition);
    const part = { ...segment, to: end, toPosition: position };
    trail.push(part);
    if (time < segment.to) return { trail, current: part };
  }
  return { trail, current: null };
}

function drawTimeDistance(canvas, buses, time, axisMinutes, distances, counts) {
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

  const left = 115, right = width - (distances ? 27 : 18), top = 39, bottom = height - 44;
  const positions = distances ? BusCorridor.distance : BusCorridor.stops.map((_, i) => i);
  const x = seconds => left + (right - left) * seconds / (60 * axisMinutes);
  const y = position => bottom - (bottom - top) * position / positions.at(-1);
  function line(x1, y1, x2, y2, color, weight = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.textBaseline = "middle";
  BusCorridor.stops.forEach((name, index) => {
    const row = y(positions[index]);
    line(left, row, right, row, "#d6e0e2");
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#526671";
    ctx.textAlign = "right";
    ctx.fillText(name, left - 33, row);
    ctx.fillStyle = "#eaf2f4";
    ctx.fillRect(left - 29, row - 7, 24, 14);
    ctx.fillStyle = "#152a36";
    ctx.textAlign = "center";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.fillText(String(counts.waiting[index]), left - 17, row);
    if (distances) {
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#526671";
      ctx.fillText(positions[index].toFixed(1), right + 5, row);
    }
  });
  ctx.font = "11px system-ui, sans-serif";
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
  ctx.fillText(distances ? "Distance (km)" : "Stops in route order", left, 12);
  ctx.textAlign = "center";
  ctx.fillText("Time since first dispatch (h:mm)", (left + right) / 2, height - 9);
  line(x(time), top - 7, x(time), bottom, "#8d9da5");

  const frames = buses.map(bus => ({ bus, ...trackFrame(bus, time) }));
  for (const { bus, trail } of frames) {
    if (!trail.length) continue;
    ctx.strokeStyle = bus.color;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(x(trail[0].from), y(trail[0].fromPosition));
    for (const segment of trail) ctx.lineTo(x(segment.to), y(segment.toPosition));
    ctx.stroke();
  }
  for (const { trail } of frames) {
    for (const segment of trail) {
      const style = eventStyles[segment.state];
      if (style && segment.to > segment.from) {
        const coords = [x(segment.from), y(segment.fromPosition), x(segment.to), y(segment.toPosition)];
        line(...coords, style.outline, 4.5);
        line(...coords, style.fill, 2.75);
      }
    }
  }

  const dots = frames.filter(frame => frame.current).map(({ bus, current }) => {
    const style = eventStyles[current.state] || { fill: bus.color, outline: "#fff" };
    return { x: x(current.to), y: y(current.toPosition), number: bus.number, style,
      state: current.state, stop: current.stop };
  });
  drawBusLabels(ctx, dots, counts.onboard, left, right, line);
  const actions = {
    holding: "holding before", upstream: "waiting at control before", waiting: "waiting for a berth at",
  };
  return dots.filter(dot => actions[dot.state]).map(dot =>
    "Bus " + dot.number + " " + actions[dot.state] + " " + BusCorridor.stops[dot.stop]);
}

function drawBusLabels(ctx, dots, onboard, left, right, line) {
  const positioned = [];
  ctx.font = "bold 10px system-ui, sans-serif";
  for (const dot of dots) {
    const label = "B" + dot.number + " · " + onboard[dot.number - 1];
    const half = Math.ceil(ctx.measureText(label).width / 2) + 4;
    let position;
    // The dot stays on the trajectory. Only its text can move to make room.
    for (const offset of [17, 34, 51, -17, -34]) {
      for (const horizontal of [0, -1, 1, -2, 2]) {
        const x = Math.max(left + half, Math.min(right - half, dot.x + horizontal * (2 * half + 4)));
        const y = dot.y - offset;
        if (y < 25 || positioned.some(p => Math.abs(y - p.y) < 16 && Math.abs(x - p.x) < half + p.half + 3)) continue;
        if (dots.some(other => Math.abs(other.y - y) < 11 && Math.abs(other.x - x) < half + 5)) continue;
        position = { x, y, half, label, dot };
        break;
      }
      if (position) break;
    }
    if (position) positioned.push(position);
  }
  for (const { x, y, dot } of positioned) line(dot.x, dot.y, x, y, "#647782");
  for (const { x, y, half, label } of positioned) {
    ctx.fillStyle = "#152a36";
    ctx.fillRect(x - half, y - 7, half * 2, 14);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y);
  }
  for (const dot of dots) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = dot.style.fill;
    ctx.fill();
    ctx.strokeStyle = dot.style.outline;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

if (typeof module !== "undefined") module.exports = { busTrack, trackFrame };
