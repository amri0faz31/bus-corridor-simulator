/* Browser version of the one-berth event model. All times are in seconds. */
(() => {
  const stops = ["Origin", "Market", "School", "Junction", "Health Centre", "Terminal"];
  const distance = [0, 0.5, 1.1, 1.7, 2.3, 2.9];
  const meanTimes = [60, 70, 75, 70, 80];
  const publishedMeanTimes = [104, 98, 85, 71, 69]; // Seconds, Herath et al., Table 4, Road 1.
  const intervals = [13, 8, 10, 11, 12];
  const dispatches = Array.from({ length: 10 }, (_, bus) => bus * 80);
  const [fixedDwell, boardingSeconds, alightingSeconds] = [5.264, 2.136, 1.503];
  const market = 1;
  const priority = { release: 0, passenger: 1, controlArrival: 2, controlRelease: 3, bus: 4, service: 5 };

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return (state + 0.5) / 4294967296;
    };
  }

  function referenceInputs() {
    const trips = [];
    intervals.forEach((interval, origin) => {
      let index = 0;
      for (let time = 5 + 7 * origin; time < 635; time += interval) {
        trips.push([time, origin, index++ % 3 === 0 ? origin + 1 : stops.length - 1]);
      }
    });
    return {
      dispatches, trips, runningTimes: dispatches.map(() => meanTimes),
      disruption: { bus: 3, link: 0, seconds: 100 },
    };
  }

  function sampledInputs(demand, cv, seed, dispatchGap = 80) {
    if (!(Number.isFinite(demand) && demand > 0 && Number.isFinite(cv) && cv >= 0)) {
      throw new Error("Demand must be positive and variability nonnegative.");
    }
    const arrivals = seededRandom(seed);
    const travel = seededRandom(seed + 1);
    const trips = [];
    intervals.forEach((interval, origin) => {
      let time = 0;
      let index = 0;
      while (time < 635) {
        time += -Math.log1p(-arrivals()) * interval / demand;
        if (time < 635) {
          trips.push([time, origin, index++ % 3 === 0 ? origin + 1 : stops.length - 1]);
        }
      }
    });
    trips.sort((a, b) => a[0] - b[0]);
    const logVariance = Math.log1p(cv * cv);
    const previewDispatches = dispatches.map((_, bus) => bus * dispatchGap);
    const runningTimes = previewDispatches.map(() => publishedMeanTimes.map(mean => {
      if (cv === 0) return mean;
      const normal = Math.sqrt(-2 * Math.log(travel())) * Math.cos(2 * Math.PI * travel());
      return Math.exp(Math.log(mean) - logVariance / 2 + Math.sqrt(logVariance) * normal);
    }));
    return { dispatches: previewDispatches, trips, runningTimes, disruption: null };
  }

  function simulate(input, holdCap = 0, boardingImprovement = 0) {
    if (!(Number.isFinite(boardingImprovement) && boardingImprovement >= 0 && boardingImprovement <= 1)) {
      throw new Error("Boarding improvement must be between zero and one.");
    }
    const boardingCoefficient = Number((boardingSeconds * (1 - boardingImprovement)).toFixed(4));
    const calendar = [];
    const busQueues = stops.map(() => []);
    const passengerQueues = stops.map(() => []);
    const berth = stops.map(() => null);
    const lastLinkArrival = meanTimes.map(() => -Infinity);
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
      const hold = previousRelease === null ? 0 : Math.min(holdCap, Math.max(0, 80 - (now - previousRelease)));
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
        visits[id][stop].boarded = boarding.length;
        const dwell = fixedDwell + boardingCoefficient * boarding.length + alightingSeconds * alighted;
        schedule(time + dwell, "release", id, stop);
      } else if (type === "release") {
        berth[stop] = null;
        visits[id][stop].departure = time;
        if (queue.length) schedule(time, "service", queue[0], stop);
        if (stop < meanTimes.length) {
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

  function metrics(run, now = Infinity) {
    const boarded = run.riders.filter(p => p.board <= now);
    const completed = run.riders.filter(p => p.alight <= now);
    const average = (people, select) => people.length
      ? people.reduce((sum, p) => sum + select(p), 0) / people.length
      : null;
    return {
      completed: completed.length,
      platform_wait: average(boarded, p => p.board - p.arrival),
      journey_time: average(completed, p => p.alight - p.arrival),
      bus5_market_berth_wait: run.visits[4][market].serviceStart - run.visits[4][market].arrival,
    };
  }

  function passengerCounts(run, time) {
    const waiting = stops.map(() => 0);
    const onboard = run.visits.map(() => 0);
    for (const rider of run.riders) {
      if (rider.arrival <= time && time < rider.board) waiting[rider.origin]++;
      if (rider.board <= time && time < rider.alight) onboard[rider.bus]++;
    }
    return { waiting, onboard };
  }

  function snapshot(run, time, bus, stop, counts = passengerCounts(run, time)) {
    const visits = run.visits.map(route => route[stop]);
    const recentVisits = visits.filter(v => v.serviceStart <= time)
      .sort((a, b) => a.serviceStart - b.serviceStart);
    const departures = visits.filter(v => v.departure <= time)
      .map(v => v.departure).sort((a, b) => a - b);
    return {
      waiting: counts.waiting[stop],
      onboard: counts.onboard[bus],
      berthQueue: visits.filter(v => v.arrival <= time && time < v.serviceStart).length,
      upstreamQueue: visits.filter(v => v.approach <= time && time < v.ready).length,
      lastBoarded: recentVisits.at(-1)?.boarded ?? null,
      departureGap: departures.length >= 2 ? departures.at(-1) - departures.at(-2) : null,
    };
  }

  const api = { stops, distance, referenceInputs, sampledInputs, simulate, metrics, passengerCounts, snapshot };
  globalThis.BusCorridor = api;
  if (typeof module !== "undefined") module.exports = api;
})();
