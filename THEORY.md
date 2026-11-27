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

## 3. Upstream holding

A single FIFO control queue sits after the first link and before the Market berth. The first bus departs immediately. For a later bus at the front, let $t$ be its decision time and $R$ be the last actual release. The commanded hold is

$$h=\min(h_{\max},\max(0,H-(t-R))).$$

The control point must be clear before the next bus reaches the front. The delay before it reaches the front is queueing, and $h$ is the deliberate hold. The cap limits the hold. Total control time can be longer than the cap. Released buses enter the stop's separate berth queue immediately.

The reference policy uses an 80-second target and a 20-second cap. Both fixed-input runs use the same 100-second road disruption and follow the same passenger cohort.

## 4. Evidence and experiment progression

| Stage | Evidence |
|---|---|
| One berth | Hand trace: 20 s bus wait and correct FIFO order at an exact timestamp tie. |
| Three-stop reference | Hand trace: 74 s and 44 s passenger journeys, 0 s and 2 s platform waits, and a bus queuing at two consecutive stops. |
| Six-stop corridor | Report total completed trips, passenger platform and journey time, and bus berth waiting. Compare nominal service with a 100 s road delay to Bus 4 on the first link. Use the same input cohort and dispatches. |
| Random arrivals and running times | Exponential passenger inter-arrivals and positive lognormal running times are seeded. The M/M/1 and fixed-headway checks run through the common engine under their own assumptions. |
| Departure policy | Four-bus hand trace checks first release, short and long headways, maximum hold and queueing. A zero cap must reproduce both original runs. |
| Policy comparison | Use common inputs within policy pairs and separate seeds across pairs. Evaluate paired differences in journey time and platform wait with 95% intervals across demand and travel-time variability. |


Incoming link records separate sampled road running time, any imposed road shock and extra no-passing time. Stop records separate berth waiting and dwell. Control records separate waiting for the holding point from the deliberate hold. The passenger ledger includes the boarding and intermediate dwells and ends at the start of destination alighting. A run that ends with unfinished passengers raises an error.

See the executed [verification evidence](VERIFICATION.md) and the [experiment specification](EXPERIMENT_PLAN.md) for the two-bay assumptions, baseline pilots, cohort and paired comparison design.
