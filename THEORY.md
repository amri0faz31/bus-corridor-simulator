# Model and mathematics

## 1. Corridor layout and assumptions

Origin → Market → School → Junction → Health Centre → Terminal. Use a one-direction route, one berth per stop, unlimited seats and a FIFO bus queue at each stop. Passengers arrive at assigned origins and alight at downstream destinations. At service start, alighting precedes boarding. Dwell then occupies the berth.

The reference corridor is synthetic, with ten bus dispatches 80 seconds apart, five road links and an assumed 2.9 km total length. The simulator takes the stop list, link times, dispatches and passenger manifest as inputs. The small hand traces are special cases of that engine.

## 2. Movement, dwell and waiting

The calendar advances to the earliest scheduled event. At tied times, berth releases and arrivals precede new service. Buses already waiting keep their places. Between stops, a bus arrives at its departure plus link running time, subject to a one-second minimum separation behind the preceding link arrival. This explicit no-passing assumption can cause time lost on one link to be shared by the following bus.

At service start, the boarding count $B$ and alighting count $A$ determine dwell:

$$d=d_0+\beta_b B+\beta_a A.$$

The reference values 5.264 s fixed, 2.136 s per boarding and 1.503 s per alighting come from the rural Kandy study by Herath et al. Their transfer to this synthetic urban corridor is a modelling assumption. See [REFERENCES.md](REFERENCES.md).

- Bus berth waiting = service start − stop arrival.
- Passenger platform waiting = boarding − passenger arrival.
- Passenger journey time = alighting − passenger arrival, including platform wait.

## 3. Evidence and experiment progression

| Stage | Evidence |
|---|---|
| One berth | Hand trace: 20 s bus wait and correct FIFO order at an exact timestamp tie. |
| Three-stop reference | Hand trace: 74 s and 44 s passenger journeys, 0 s and 2 s platform waits, and a bus queuing at two consecutive stops. |
| Six-stop corridor | Report total completed trips, passenger platform and journey time, and bus berth waiting. Compare nominal service with a 100 s road delay to Bus 4 on the first link. Use the same input cohort and dispatches. |
| Random arrivals and running times | Draw exponential inter-arrivals via inverse transform and positive lognormal running times. Check the M/M/1 and fixed-headway passenger benchmarks under their own assumptions. |
| Departure policy | Add a control point after the initial approach. Compare immediate release with $h=\min(h_{\max},\max(0,H-g))$, where $g$ is time since the previous actual release. Include waiting behind a held bus and delay experienced by its riders. |
| Policy comparison | Use common inputs within policy pairs and separate seeds across pairs. Evaluate paired differences in journey time and platform wait with 95% intervals across demand and travel-time variability. |
