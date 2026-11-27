# When does upstream holding reduce passenger delay?

The main comparison uses the published-parameter scenario, with five link travel-time means and the dwell equation from Herath et al. (2024). Each of six scenarios uses 30 matched baseline and holding replications. The same runs support a separate faster-boarding comparison. Every policy completed the same passenger cohort within each replication.

## Journey time and platform waiting

Mean journey time includes waiting on the platform and time spent aboard held or queued buses. Mean platform waiting ends when the passenger boards. Effects are holding minus baseline in seconds per passenger, followed by paired 95% confidence intervals.

| Demand | Road-time CV | Mean journey time | Mean platform wait |
|---|---:|---:|---:|
| Low | 0.15 | −3.68 [−4.54, −2.81] | −2.22 [−2.60, −1.85] |
| Low | 0.45 | −2.83 [−4.16, −1.50] | −2.16 [−2.74, −1.58] |
| Medium | 0.15 | −9.04 [−11.20, −6.88] | −2.80 [−3.33, −2.27] |
| Medium | 0.45 | −6.34 [−8.93, −3.74] | −2.31 [−2.94, −1.68] |
| High | 0.15 | −1.52 [−5.11, +2.06] | −2.50 [−3.07, −1.92] |
| High | 0.45 | −3.51 [−11.16, +4.14] | −1.92 [−2.83, −1.01] |

Holding improved mean platform wait in all six settings. It reduced mean journey time at low and medium demand. At high demand, the journey-time intervals included both a benefit and an increase in delay. [Passenger effect figure](figures/paired-policy-effects.png)

## Bunching, berth queues and control

Across the scenarios, holding reduced departure-headway standard deviation by **5.61–12.90 s** at Market and **1.97–9.00 s** at Health Centre. It also reduced the time-weighted mean berth queue length at Market in all six. At high demand and CV 0.45, Market averaged **0.370 buses waiting** without holding and **0.255** with holding, a change of **−0.115 [−0.125, −0.105] buses**. A separate average of **0.008 buses** waited upstream for the control point in that setting. That upstream queue excludes the bus actively being held.

At medium demand and CV 0.15, less platform waiting, berth queueing and dwell outweighed the 1.54 s of added deliberate holding per passenger. At high demand and CV 0.45, the Market queue fell, while the corridor-wide passenger-weighted berth queue time changed by **+0.75 s** with an interval spanning zero. The journey-time benefit depends on the delays accumulated across the route. [Queue-length figure](figures/holding-queue-length.png) · [Journey-time breakdown](figures/journey-time-components.png) · [Matched time–distance example](figures/published-time-distance.png)

In the separate deterministic illustration, Bus 4's 100-second road delay makes it board 23 passengers at Market and Bus 5 board 7. Holding shifts 20 seconds of Bus 5's wait upstream while the berth is still busy, so Bus 5 starts boarding at the same time under both policies. [Original disruption figure](figures/holding-comparison.png)

## Supplementary boarding sensitivity

A hypothetical 20% reduction in seconds per boarding passenger shortened mean journeys compared with holding by 3.50–93.70 s per passenger. Holding produced shorter mean platform waits in five of those direct comparisons, with uncertainty in the sixth. The scenario assumes the same boarding improvement at all boarding stops.

These estimates apply to the assumed demand, destinations, dispatches, road-time variability, no-passing rule and one-berth layout. The intervals reflect simulation sampling uncertainty. [Replication records](data/paired-replications.csv) · [All paired estimates](data/policy-effects.csv)
