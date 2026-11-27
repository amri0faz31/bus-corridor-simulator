"use strict";

const busColors = ["#126681", "#76529b", "#3a7760"];
const eventStyles = {
  shock: { fill: "#facc15", outline: "#755b12" },
  following: { fill: "#c4b5fd", outline: "#5b4283" },
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
      const state = visit.imposedDelay > 0 ? "shock" : visit.noPassingDelay > 0 ? "following" : "moving";
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

function drawTimeDistance(canvas, buses, time, axisMinutes, counts) {
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

  const left = 126, right = width - 18, top = 39, bottom = height - 44;
  const positions = BusCorridor.stops.map((_, i) => i);
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
    const highlighted = name === "Market" || name === "School";
    if (highlighted) {
      ctx.fillStyle = name === "Market" ? "#edf7dd" : "#e4f1f6";
      ctx.fillRect(left, row - 8, right - left, 16);
    }
    line(left, row, right, row, highlighted ? "#9fb5b9" : "#d6e0e2");
    ctx.font = highlighted ? "bold 11px system-ui, sans-serif" : "11px system-ui, sans-serif";
    ctx.fillStyle = "#152a36";
    ctx.textAlign = "right";
    const label = index < positions.length - 1 ? name + " · " + counts.waiting[index] + " waiting" : name;
    ctx.fillText(label, left - 7, row, left - 12);
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
  ctx.fillText("Stops in route order", left, 12);
  ctx.textAlign = "center";
  ctx.fillText("Elapsed time (h:mm)", (left + right) / 2, height - 9);
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

  const dots = frames.filter(frame => frame.trail.length).map(({ bus, current, trail }) => {
    const endpoint = current || trail.at(-1);
    const style = eventStyles[endpoint.state] || { fill: bus.color, outline: "#fff" };
    return { x: x(endpoint.to), y: y(endpoint.toPosition), style,
      label: "B" + bus.number + (current ? " · " + counts.aboard[bus.number - 1] + " aboard" : ""),
      active: Boolean(current) };
  });
  drawBusLabels(ctx, dots, left, right, line);
}

function drawBusLabels(ctx, dots, left, right, line) {
  const positioned = [];
  ctx.font = "bold 10px system-ui, sans-serif";
  for (const dot of dots) {
    const label = dot.label;
    const half = Math.ceil(ctx.measureText(label).width / 2) + 4;
    let position;
    // The dot stays on the trajectory. Only its text can move to make room.
    for (const offset of [17, 34, 51, 68, -17, -34, -51]) {
      for (const horizontal of [0, -1, 1, -2, 2]) {
        const x = Math.max(left + half, Math.min(right - half, dot.x + horizontal * (2 * half + 4)));
        const y = dot.y - offset;
        if (y < 25 || y > ctx.canvas.clientHeight - 24
          || positioned.some(p => Math.abs(y - p.y) < 16 && Math.abs(x - p.x) < half + p.half + 3)) continue;
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
  for (const dot of dots.filter(dot => dot.active)) {
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
