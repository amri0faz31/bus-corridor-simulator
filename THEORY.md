# Model and mathematics

## 1. Model decisions for the baseline

| Decision | Why it matters |
|---|---|
| One straight road, one direction, one route | Isolates delay caused by bus operations along one corridor. |
| Origin → Stop 1 → Stop 2 → Terminal | Allows a delay at one boarding stop to change service at the next. |
| One bus berth per boarding stop | A second bus queues if the berth is occupied. Keep bus queues separate from passenger queues. |
| Unlimited seats initially | Keeps berth congestion separate from passengers being left behind because of a full bus. |
| Board passengers present at service start | Gives a definite boarding time and a clear rule to verify. Passengers arriving after service begins wait for a later bus. |
| Normal departures in the baseline | Gives a reference case before changing the departure rule. |

The initial notebook represents one berth with fixed bus arrival and dwell times and one fixed passenger arrival. These are synthetic verification inputs. The remaining stops and passenger destinations are the next increment.

## 2. Stage 1 mathematics and event sequence

- The clock advances to the earliest scheduled event.
- A bus entering the queue can start service when the berth becomes free and the bus is first in line.
- At a common timestamp, process berth releases and arrivals before starting service. Record insertion order for otherwise equal events.
- Berth wait is service start minus bus arrival at the stop. Passenger platform wait is boarding time minus passenger arrival time.

The first fixture has bus arrivals at 70 and 80 s, with fixed dwell times of 30 and 10 s. The passenger arrives at 85 s. Bus B's service starts at 100 s, after a 20 s berth wait. The passenger waits 15 s.

## 3. Next increments and their mathematics

| Increment | What to model | Mathematics and evidence |
|---|---|---|
| Deterministic corridor | Connect origin, two boarding stops and terminal. Trace a few buses and passengers with fixed times and destinations. | Arrival at next stop = departure + running time. Journey time = alighting time − arrival time at origin stop. Hand-check a complete journey and plot a time–distance diagram. |
| Random baseline | Add demand, running times and passenger-dependent dwell. | Generate each Poisson arrival stream using exponential intervals, $-\ln(1-U)/\lambda$. Use positive lognormal running times with stated mean and variability. Use $d=d_0+\beta_b B+\beta_a A$ for dwell. Check limiting cases and state which inputs are assumed. |
| Departure policy | Add a control point after origin boarding. Compare immediate release with capped headway-based release. | Command $h=\min(h_{\max},\max(0,H-g))$, where $g$ is time since the previous actual release. Check the zero cap, cap binding and simultaneous events. Account for both deliberate holds and the queue behind a held bus. |
| Scenario comparison | Vary demand and running-time variability while matching dispatches, passenger inputs and bus running-time draws within each pair. | Pair differences by replication and compute 95% confidence intervals. Report platform waiting and end-to-end journey time separately. Use queue lengths and headway variation to explain the result. |

Use the [sources](REFERENCES.md) to choose dwell parameters and defensible ranges. Treat unavailable demand and running-time inputs as assumptions. Release control changes only the departure rule while comparing matched scenarios.
