/* Browser version of the one-berth event model. All times are in seconds. */
(() => {
  const stops = ["Origin", "Market", "School", "Terminal"];
  const [fixedDwell, boardingSeconds, alightingSeconds] = [5.264, 2.136, 1.503];
  const market = 1;
  const school = 2;
  const middleBus = 1; // Zero-based Bus 2.
  const priority = { release: 0, passenger: 1, controlArrival: 2, controlRelease: 3, bus: 4, service: 5 };

  function simulate(input, holdCap = 0) {
    const calendar = [];
    const busQueues = stops.map(() => []);
    const passengerQueues = stops.map(() => []);
    const berth = stops.map(() => null);
    const lastLinkArrival = stops.slice(1).map(() => -Infinity);
    const visits = input.dispatches.map(() => []);
    const roadDelays = input.dispatches.map(() => []);
    const onboard = input.dispatches.map(() => []);
    const riders = input.trips.map(([arrival, origin, destination]) => ({
      arrival, origin, destination, board: null, alight: null, bus: null,
    }));
    const controlQueue = [];
    const controlTimes = [];
    let activeControlBus = null;
    let previousRelease = null;
    const targetGap = input.targetGap;

    function schedule(time, type, id, stop) {
      const event = { time, type, id, stop };
      let left = 0;
      let right = calendar.length;
      // Insert after existing events at the same time and priority.
      while (left < right) {
        const middle = Math.floor((left + right) / 2);
        const other = calendar[middle];
        if (other.time < time || (other.time === time && priority[other.type] <= priority[type])) {
          left = middle + 1;
        } else {
          right = middle;
        }
      }
      calendar.splice(left, 0, event);
    }

    function decide(now) {
      if (activeControlBus !== null || !controlQueue.length) return;
      const bus = controlQueue.shift();
      activeControlBus = bus;
      const hold = bus !== middleBus || previousRelease === null ? 0 : Math.min(holdCap, Math.max(0, targetGap - (now - previousRelease)));
      controlTimes[bus].ready = now;
      schedule(now + hold, "controlRelease", bus, market);
    }

    input.dispatches.forEach((time, bus) => schedule(time, "bus", bus, 0));
    riders.forEach((p, id) => schedule(p.arrival, "passenger", id, p.origin));
    while (calendar.length) {
      const { time, type, id, stop } = calendar.shift();
      const queue = busQueues[stop];
      if (type === "passenger") {
        passengerQueues[stop].push(id);
      } else if (type === "controlArrival") {
        controlTimes[id] = { approach: time };
        controlQueue.push(id);
        decide(time);
      } else if (type === "controlRelease") {
        previousRelease = time;
        activeControlBus = null;
        schedule(time, "bus", id, stop);
        decide(time);
      } else if (type === "bus") {
        const control = stop === market ? controlTimes[id] : null;
        visits[id][stop] = {
          arrival: time,
          approach: control?.approach ?? time,
          ready: control?.ready ?? time,
          roadDelay: roadDelays[id][stop] ?? 0,
        };
        queue.push(id);
        if (berth[stop] === null && queue.length === 1) schedule(time, "service", id, stop);
      } else if (type === "service") {
        if (berth[stop] !== null || queue.shift() !== id) throw new Error("Berth FIFO violated.");
        berth[stop] = id;
        const remaining = [];
        let alighted = 0;
        for (const rider of onboard[id]) {
          if (riders[rider].destination === stop) {
            riders[rider].alight = time;
            alighted += 1;
          } else {
            remaining.push(rider);
          }
        }
        const boarding = passengerQueues[stop].splice(0);
        for (const rider of boarding) {
          riders[rider].board = time;
          riders[rider].bus = id;
          remaining.push(rider);
        }
        onboard[id] = remaining;
        visits[id][stop].serviceStart = time;
        const dwell = fixedDwell + boardingSeconds * boarding.length + alightingSeconds * alighted;
        schedule(time + dwell, "release", id, stop);
      } else if (type === "release") {
        berth[stop] = null;
        visits[id][stop].departure = time;
        if (queue.length) schedule(time, "service", queue[0], stop);
        if (stop < stops.length - 1) {
          const disruption = input.disruption;
          const shock = disruption && disruption.bus === id && disruption.link === stop
            ? disruption.seconds : 0;
          const freeArrival = time + input.runningTimes[id][stop] + shock;
          const arrival = Math.max(freeArrival, lastLinkArrival[stop] + 1);
          roadDelays[id][stop + 1] = shock + (arrival - freeArrival);
          lastLinkArrival[stop] = arrival;
          schedule(arrival, stop + 1 === market && holdCap > 0 ? "controlArrival" : "bus", id, stop + 1);
        }
      }
    }
    if (riders.some(p => p.alight === null)) throw new Error("Service ended before every passenger completed.");
    return {
      visits, riders,
      end: Math.max(...visits.map(bus => bus.at(-1).departure)),
    };
  }

  function metrics(run) {
    const schoolBoarding = run.visits.map(bus => bus[school].serviceStart);
    const approach = run.visits[middleBus][market];
    return {
      completed: run.riders.length,
      platform_wait: run.riders.reduce((sum, p) => sum + (p.board - p.arrival), 0) / run.riders.length,
      journey_time: run.riders.reduce((sum, p) => sum + (p.alight - p.arrival), 0) / run.riders.length,
      school_boarding: schoolBoarding,
      bus2_hold: approach.arrival - approach.ready,
    };
  }

  const api = { stops, simulate, metrics };
  globalThis.BusCorridor = api;
  if (typeof module !== "undefined") module.exports = api;
})();
