# Common model verification

Run the [notebook](notebook/bus-corridor-simulator.ipynb) from top to bottom. The tables below are from the executed verification cells. Units are seconds unless stated otherwise.

| Check | Expected | Simulated | Tolerance | Observations | Result |
|---|---:|---:|---:|---:|---|
| M/M/1 berth queue | 60.00 | 60.22 | ±4.8 | 32,000 | Pass |
| Fixed headway passenger wait | 40.00 | 39.97 | ±2.0 | 18,973 | Pass |

The M/M/1 observations are bus queue waits. Each of eight replications discards 1,000 arrival observations before recording 4,000. Replication means are averaged with equal weight. The fixed-headway observations are passenger waits from eight runs of 300 complete 80-second intervals. Every passenger boards and alights.

| Deterministic check | Observed result |
|---|---|
| One berth, release tied with an arrival | The earlier bus waited 20 s and kept its FIFO place. |
| Three-stop route | Journey times were 74 s and 44 s. Platform waits were 0 s and 2 s. |
| Control point | First release, cap, FIFO queue and long-gap release matched the hand trace. |
| Zero-cap regression | Stop times and passenger records matched between the zero-cap and original configurations in both fixed examples. |
| Original stochastic inputs | One pair per scenario reproduces its historical mean journey time, platform wait and Market headway standard deviation. |
| Zero boarding improvement | Every bus record, passenger record and event matches the baseline in a published-parameter regression run. |
| Passenger completion | Each fixed policy run completed the identical 296-passenger cohort. A deliberately short dispatch schedule raised an error reporting the unserved rider. |
| Delay accounting | Every fixed-run bus visit and passenger journey reconciled with its component times. |

## Passenger journey components for the deterministic disruption

These are passenger-weighted means over the same 296 individual trips. Platform wait and the components below it sum to journey time, before rounding. This fixed example illustrates the accounting and is separate from the published-parameter experiment.

| Component (s/passenger) | No holding | 20 s cap |
|---|---:|---:|
| Platform waiting | 83.743 | 84.284 |
| Sampled road running | 173.311 | 173.311 |
| Imposed road shock | 2.365 | 2.365 |
| No-passing delay | 0.469 | 0.469 |
| Berth queueing | 39.115 | 37.002 |
| Dwell | 83.174 | 83.174 |
| Upstream queueing | 0.000 | 0.000 |
| Deliberate holding | 0.000 | 2.027 |
