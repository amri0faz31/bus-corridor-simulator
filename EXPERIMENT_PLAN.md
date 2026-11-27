# Intervention experiment specification

## Common model and current implementation

| Topic | Implemented in this checkpoint | Use in the completed experiment |
|---|---|---|
| Discrete-event simulation | A time/priority/insertion-order event heap controls arrivals, control releases, service starts and berth releases. | Used as verified. |
| Queueing | FIFO bus queues, one berth at each stop, independent passenger queue at each platform, and a FIFO upstream control point. | Kept one berth at every stop. |
| Random variates | Inverse-transform exponential passenger inter-arrivals, seeded lognormal bus/link draws, and exponential service draws in the M/M/1 benchmark. | Uses a shared trip manifest and bus/link draw matrix in each pair. |
| Monte Carlo | Independent replications verify the analytical benchmarks. A small baseline-only pilot checks the proposed range. | Uses 30 independent pairs per scenario with separate demand and road seeds. |

Platform queues grow between buses and can increase dwell through passenger counts. Berth queues emerge when a bus arrives during service. The no-passing rule imposes one-second minimum link exit separation, which creates recorded following delay when a bus would otherwise arrive earlier. The one-berth layout, unlimited seating, deterministic one-third short-trip destination rule, arrival processes, route geometry and running-time parameters are modelling assumptions. Dwell coefficients are transferred from the rural Kandy study. See [references](REFERENCES.md) and [verification](VERIFICATION.md).

## Configurations compared

1. **Baseline:** one berth at every stop and no holding.
2. **Holding:** the same one-berth corridor with an upstream control point before Market, an 80-second target gap and a 20-second maximum deliberate hold.

The common model is frozen. The infrastructure alternative and finite vehicle capacity are outside this experiment.

## Numerical settings and baseline-only pilot

The 80-second dispatch interval and mean link running times (60, 70, 75, 70 and 80 s) match the existing reference case. Demand levels multiply the reference rates (4.62, 7.50, 6.00, 5.45 and 5.00 passengers/minute). These are scenario assumptions. The baseline pilot combines 0.60×, 1.00× and 1.75× demand with lognormal running-time CVs of 0.15 and 0.45, holding the specified arithmetic mean fixed.

Approximate Market berth workload is (5.264 + 2.136 × expected boardings + 1.503 × expected alightings) / 80. Expected boardings are the Market rate times 80/60. Expected alightings are one-third of the origin rate times 80/60. This average-load check assumes regular service and does not capture platoons; the pilot measures those effects in the event model. It uses four baseline replications per setting, passenger seeds 7100–7103 and travel seeds 8100–8103. Each table entry averages the corresponding run-level statistic.

| Demand | CV | Approx. Market load | Market buses that queued | Mean Market queue wait (s/bus) | Mean measured passengers |
|---|---:|---:|---:|---:|---:|
| Low | 0.15 | 0.25 | 0.0% | 0.00 | 1045 |
| Low | 0.45 | 0.25 | 8.9% | 2.07 | 1045 |
| Medium | 0.15 | 0.37 | 0.0% | 0.00 | 1712 |
| Medium | 0.45 | 0.37 | 15.6% | 3.48 | 1712 |
| High | 0.15 | 0.60 | 7.8% | 1.09 | 3010 |
| High | 0.45 | 0.60 | 31.7% | 12.16 | 3010 |

Queues are present even with approximate workload below one. The pilot is a diagnostic for the selected demand and variability range. It reports neither a policy effect nor a confidence interval.

## Matched study design

- Generate demand over $[0,4800)$ seconds, with the first 900 s as buildup. Measure passengers arriving in $[900,4500)$ seconds. Continue input demand for 300 s after measurement ends and dispatch the final scheduled bus at 4,800 s. Drain the event calendar and require every generated passenger to complete in all configurations. Stop with an explicit error if any trip is unfinished or if the input cohort differs. Compute stop/headway records over the same measurement window under each configuration.
- Use 30 independent replications per scenario with a seed set distinct from the pilot. Use separate streams for arrivals and running times. In each replication, the dispatch list, passenger IDs and trip manifest, and bus/link free-running time draws are identical in both configurations. Service and the realised bus trajectories can differ.
- Primary outcome: mean journey time in seconds per measured passenger. Secondary outcomes: mean platform wait, berth queueing, sampled road running, extra no-passing time, dwell, upstream queueing and deliberate holding, departure-headway variability at Market and downstream, and generated/measured/completed counts.
- Compare holding against its matched baseline. Compute one difference in the replicate mean per seed and a two-sided paired t interval, $ar d pm t_{0.975,R-1}s_d/sqrt R$. Negative intervention-minus-baseline journey differences favour the intervention. Keep harmful and near-zero estimates, and mark direction uncertain when an interval spans zero.
- Produce a paired-effect plot with confidence intervals, passenger-weighted delay component changes, queue/headway summaries and time–distance diagrams for a reference seed selected before inspecting policy effects. Report comparisons as conditional on route, demand and infrastructure assumptions.

See [RESULTS.md](RESULTS.md) for the executed study.
