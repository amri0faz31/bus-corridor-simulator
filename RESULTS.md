# When Bus 1 is delayed, does holding Bus 2 help?

## One replay

All 89 riders finish in both policies. A 20-second hold increases the B1–B2 School boarding gap from 126.74 to 151.02 seconds and decreases B2–B3 from 364.02 to 335.48 seconds. The School gaps measure boarding starts. Mean platform wait falls by 5.07 seconds and mean total journey time falls by 1.60 seconds per passenger.

## Thirty matched pairs per scenario

The table shows holding minus no holding in seconds per passenger, with paired 95% confidence intervals. Every run uses exactly three buses and a four-minute road delay on Bus 1.

| Demand | Road-time CV | Platform wait | Total journey time |
|---|---:|---:|---:|
| Low | 0.15 | −7.42 [−11.23, −3.62] | −5.44 [−9.33, −1.54] |
| Low | 0.45 | −4.43 [−7.75, −1.11] | −3.02 [−6.49, +0.45] |
| Medium | 0.15 | −5.08 [−7.26, −2.90] | −3.51 [−5.85, −1.17] |
| Medium | 0.45 | −1.15 [−2.74, +0.44] | +0.78 [−1.27, +2.82] |
| High | 0.15 | −4.15 [−5.97, −2.33] | −5.00 [−7.00, −3.01] |
| High | 0.45 | −3.51 [−5.39, −1.63] | −2.65 [−4.89, −0.41] |

Journey time fell in four settings with intervals entirely below zero. The effect was uncertain at low and medium demand with higher road variability. Holding adds time to passengers already onboard Bus 2. The net outcome depends on whether improvements later in the trip outweigh that cost. The intervals reflect sampling variability under this assumed scenario. [Effect plots](figures/paired-policy-effects.png) · [Replication records](data/paired-replications.csv) · [Paired estimates and School gaps](data/policy-effects.csv)
