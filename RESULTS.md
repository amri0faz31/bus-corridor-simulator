# Faster boarding and capped holding

The published-parameter experiment completed **540 runs**. Each of six scenarios used 30 independent replications with one baseline, one holding run and one faster-boarding run per replication. Every policy completed the same passenger cohort within its replication.

## Mean passenger journey time

Each entry is a paired mean difference in seconds per passenger, followed by its 95% confidence interval. A negative value favours the first-named policy.

| Demand | Road-time CV | Holding − baseline | Faster boarding − baseline | Faster boarding − holding |
|---|---:|---:|---:|---:|
| Low | 0.15 | −3.68 [−4.54, −2.81] | −7.18 [−7.57, −6.78] | −3.50 [−4.41, −2.59] |
| Low | 0.45 | −2.83 [−4.16, −1.50] | −10.76 [−11.90, −9.62] | −7.93 [−9.23, −6.64] |
| Medium | 0.15 | −9.04 [−11.20, −6.88] | −16.05 [−17.00, −15.09] | −7.01 [−9.01, −5.01] |
| Medium | 0.45 | −6.34 [−8.93, −3.74] | −23.11 [−25.92, −20.29] | −16.77 [−19.85, −13.70] |
| High | 0.15 | −1.52 [−5.11, +2.06] | −94.38 [−99.88, −88.87] | −92.85 [−99.47, −86.24] |
| High | 0.45 | −3.51 [−11.16, +4.14] | −97.21 [−109.28, −85.15] | −93.70 [−106.39, −81.02] |

Faster boarding reduced mean journey time against both alternatives in all six scenarios. Holding reduced journey time at low and medium demand. At high demand, its intervals included both improvements and increases in journey time.

## What changes during a journey

- **Holding.** Spacing buses at the control point reduced departure-headway standard deviation at Market by 5.61–12.90 s and at Health Centre by 1.97–9.00 s. Platform waiting fell by 1.92–2.80 s per passenger. At medium demand and CV 0.15, savings in platform waiting, berth queueing and dwell outweighed the 1.54 s of added deliberate hold per passenger. At high demand and CV 0.45, the Market berth wait fell by 9.22 s **per bus**, while corridor-wide berth queueing changed by +0.75 s **per passenger** with an interval spanning zero. This helps explain why better spacing at Market did not yield a clear net journey benefit in that setting.
- **Faster boarding.** At high demand and CV 0.45, the 97.21 s journey-time saving against baseline came mainly from 75.43 s less berth queueing across the corridor and 21.24 s less dwell per passenger. In the direct policy comparison, holding had shorter platform waits in five settings with intervals excluding zero. In the sixth, high demand and CV 0.45, the platform-wait difference was uncertain. Faster boarding's lower total journey times reflect savings after boarding.
- **Original deterministic illustration.** The separate 100-second shock to Bus 4 uses the original synthetic link times. For Bus 5, a 20 s hold changes Market berth wait from 57.90 s to 37.90 s and leaves the time boarding starts unchanged. Across those 296 passengers the mean journey change was +0.46 s. The main stochastic experiment has no injected shock.

The estimates depend on the assumed corridor, demand, destinations, dispatch interval, road-time variability and one-berth layout. The faster boarding configuration applies a hypothetical 20% reduction at all boarding stops. Its effect is conditional on that service-time change. Each interval describes simulation sampling uncertainty for its scenario. Costs and field performance were outside the comparison.

- [Paired interval plots](figures/paired-policy-effects.png)
- [Journey-time components at high demand and high variability](figures/journey-time-components.png)
- [Matched time–distance example, using stop order](figures/published-time-distance.png)
- [Original road disruption example](figures/holding-comparison.png)
- [Replication records](data/paired-replications.csv) and [paired effect estimates](data/policy-effects.csv)
