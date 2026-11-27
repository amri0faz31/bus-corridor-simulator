# Boarding, bunching and holding the middle bus

## What happens after a 30-second delay?

Holding is off in this comparison. The fixed-road, free-berth hand check gives a B1–B2 boarding gap of 240 s at Market and School. Delaying Bus 1 reduces each gap to 210 s.

The following are means over 30 matched seeds. Gap changes are delayed minus no-delay.

| Dwell model | Market boardings B1 / B2, before → after | Market dwell B1 / B2, before → after (s) | Market gap change | School gap change |
|---|---|---|---:|---:|
| Fixed | 8.07 / 11.10 → 9.63 / 9.53 | 20.00 / 20.00 → 20.00 / 20.00 | −30.00 s | −30.00 s |
| Passenger-dependent | 7.60 / 11.50 → 9.03 / 10.07 | 22.80 / 33.08 → 25.86 / 30.02 | −30.00 s | −36.12 s |

With passenger-dependent dwell, the late bus picks up more riders at Market and stops longer, while its follower boards fewer and leaves earlier relative to it. The disturbance grows between Market and School in **23 of 30** pairs and passes through unchanged in the other seven. With fixed dwell, it passes through unchanged in all 30. [Propagation records](data/disturbance-propagation.csv)

## Default holding replay

With the two-minute road shock, the 20-second hold widens the School B1–B2 gap from **123.10 to 143.10 s** and shortens B2–B3 from **255.33 to 235.33 s**. Both policies serve all **62** people. Mean platform wait **increases by 2.58 s**, and mean total journey time **increases by 5.81 s per passenger**.

## Thirty holding pairs per scenario

Differences are holding minus no holding in seconds per passenger, with paired 95% intervals. The main experiment uses the two-minute delay and the 20-second cap in every scenario.

| Demand | Road CV | Total journey time | Platform wait |
|---|---:|---:|---:|
| Low | 0.15 | −0.05 [−2.24, +2.15] | −2.42 [−4.58, −0.26] |
| Low | 0.45 | 0.00 [−3.03, +3.03] | −1.68 [−4.26, +0.91] |
| Medium | 0.15 | +1.38 [−0.59, +3.36] | −0.71 [−2.61, +1.19] |
| Medium | 0.45 | +1.37 [−0.41, +3.15] | −0.47 [−1.85, +0.92] |
| High | 0.15 | +0.63 [−1.26, +2.51] | −0.43 [−1.72, +0.87] |
| High | 0.45 | +0.67 [−0.87, +2.20] | −0.60 [−2.48, +1.27] |

All six mean journey-time intervals cross zero. The low-demand, low-variability scenario shows shorter platform waits, while the evidence for total journey time remains uncertain. The dot plots show gains and losses within individual pairs. These estimates apply to the assumed four-stop route, dispatches, demand and delays. [Paired effects](figures/paired-policy-effects.png) · [Replication records](data/paired-replications.csv) · [Paired estimates](data/policy-effects.csv)
