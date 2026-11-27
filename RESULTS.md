# Results of the capped holding comparison

Thirty paired replications in each of six scenarios produced 360 completed simulation runs. Each run pair used the same trips, dispatch schedule and bus/link running-time draws. Journey-time changes below are **holding minus no holding**, in seconds per passenger. Negative values favour holding.

| Demand | Travel-time CV | Journey change (s/passenger) | Paired 95% interval |
|---|---:|---:|---:|
| Low | 0.15 | -2.00 | [-2.75, -1.25] |
| Low | 0.45 | -2.32 | [-3.98, -0.66] |
| Medium | 0.15 | -5.37 | [-7.16, -3.58] |
| Medium | 0.45 | -7.79 | [-11.25, -4.33] |
| High | 0.15 | -4.43 | [-9.99, +1.12] |
| High | 0.45 | -8.65 | [-16.08, -1.23] |

With an 80-second target and a 20-second cap, the paired 95% journey-time interval favoured holding in five scenarios. The interval for high demand and CV 0.15 crossed zero. Platform waiting fell in all six comparisons, by 1.29–2.51 seconds per passenger on average. At high demand and CV 0.45, holding added 1.63 seconds of deliberate onboard delay per passenger while reducing mean total journey time by 8.65 seconds. The earlier single road shock still shows a case where the queue shrank while passenger time increased.

The high-demand, high-variability breakdown shows that the passenger-weighted dwell and berth-wait changes offset deliberate holding on average. Identical bus/link draws can yield slightly different passenger-weighted road times because passengers can board different buses under the two policies.

These estimates apply to the assumed one-berth corridor, shared passenger cohort, fixed 80-second dispatches, independent random inputs and specified cap. The intervals are per scenario and reflect stochastic sampling. They do not quantify uncertainty about an actual route, validate the transferred dwell coefficients, or price an intervention. A second berth and finite vehicle capacity are outside the completed comparison.

- [Paired intervals for journey time and platform waiting](figures/paired-policy-effects.png)
- [High-demand, high-variability journey-time breakdown](figures/journey-time-components.png)
- [Deterministic time–distance comparison](figures/holding-comparison.png)
- [One row per policy and replication](data/paired-replications.csv)
- [Scenario contrasts and intervals](data/policy-effects.csv)
