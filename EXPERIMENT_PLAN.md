# Experiment design

Under different passenger demand and travel-time variability, does faster boarding reduce mean passenger journey time more than capped holding?

## Inputs and policies

The main scenario uses 104, 98, 85, 71 and 69 s, the first five Road 1 link means from Herath et al. (2024), Table 4, printed p. 2117. The dwell equation uses 5.264 s fixed, 2.136 s per boarding passenger and 1.503 s per alighting passenger from Table 3 and Eq. (9). The stop labels and layout, 80 s dispatch interval, demand and destination rules, and lognormal variability are modelling assumptions. Plots use stop order in the published-parameter scenario. [Parameter source](https://www.jstage.jst.go.jp/article/easts/15/0/15_2109/_pdf/-char/en)

| Configuration | Holding before Market | Boarding seconds per passenger |
|---|---|---:|
| Baseline | Off | 2.136 |
| Capped holding | 80 s target and 20 s cap | 2.136 |
| Faster boarding | Off | 1.7088 at all boarding stops |

All policies use one berth per stop. Fixed dwell overhead and the alighting coefficient are shared. Faster boarding is a hypothetical service improvement. Holding targets a short release gap before Market to limit downstream bunching. Its cost is additional time aboard held buses, so the primary measure includes that time.

## Matched comparisons

- Use passenger demand of 0.60×, 1.00× and 1.75× the reference stop arrival rates (4.62, 7.50, 6.00, 5.45 and 5.00 passengers/minute). Cross these with lognormal travel-time CVs 0.15 and 0.45.
- Generate passenger arrivals from time 0 to 4,800 s. Measure passengers arriving from 900 s up to 4,500 s. The first 900 s form the buildup, and service continues until the cohort completes. The last scheduled dispatch is at 4,800 s.
- Generate one passenger manifest and one road draw matrix per replication. All three policies receive those same inputs, including passenger destinations and the dispatch schedule. Use separate passenger and travel seeds and 30 independent replications in each scenario.
- Enforce identical input cohorts and complete journeys. The fixed 100-second disruption is a separate illustration on the original synthetic links.
- Compute mean journey time as the primary outcome. Track platform wait, passenger-weighted berth queueing, dwell, upstream queueing and deliberate holding. At Market, report bus queue statistics and departure-headway standard deviation. Also measure departure-headway standard deviation at Health Centre, the last boarding stop.
- Compute matched replication-level differences for holding minus baseline, faster boarding minus baseline, and faster boarding minus holding. Report separate two-sided 95% Student t intervals for the mean differences.

The four-run baseline pilot checks Market's approximate berth workload and the frequency and duration of queues. The notebook also compares six original synthetic-link replication pairs against their historical results and checks that a zero boarding improvement reproduces the complete baseline records and event trace. The illustrative main trajectories use medium demand, CV 0.45, replication 1 and buses 13–18, selected by their dispatches just after the measurement window opens.

[Executed results](RESULTS.md) · [Verification](VERIFICATION.md)
