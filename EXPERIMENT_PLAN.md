# Intervention experiment specification

## Common model and current implementation

| Topic | Implemented in this checkpoint | Remaining for the experiment |
|---|---|---|
| Discrete-event simulation | A time/priority/insertion-order event heap controls arrivals, control releases, service starts and berth releases. | Add bay-aware admission and release at Market. |
| Queueing | FIFO bus queues, one berth at each stop, independent passenger queue at each platform, and a FIFO upstream control point. | Test the two-bay stop's allocation and occupancy. |
| Random variates | Inverse-transform exponential passenger inter-arrivals, seeded lognormal bus/link draws, and exponential service draws in the M/M/1 benchmark. | Pre-generate and reuse a trip manifest and a bus/link draw matrix per comparison pair. |
| Monte Carlo | Independent replications verify the analytical benchmarks. A small baseline-only pilot checks the proposed range. | Collect paired intervention effects and confidence intervals over 30 independent replications per scenario. |

Platform queues grow between buses and can increase dwell through passenger counts. Berth queues emerge when a bus arrives during service. The no-passing rule imposes one-second minimum link exit separation, which creates recorded following delay when a bus would otherwise arrive earlier. The one-berth layout, unlimited seating, deterministic one-third short-trip destination rule, arrival processes, route geometry and running-time parameters are modelling assumptions. Dwell coefficients are transferred from the rural Kandy study. See [references](REFERENCES.md) and [verification](VERIFICATION.md).

## Three configurations for the next stage

1. **Baseline:** one berth at every stop and no holding.
2. **Operational:** one berth at every stop and the existing Market control point, 80-second target gap and 20-second hold cap. The queue behind a held bus is accounted for separately.
3. **Infrastructure:** two independent bays at Market, free entry to either empty bay and free exit from either bay, no holding, and one berth everywhere else. Bay geometry and independent access are assumptions. This is a capacity change with different resource and cost implications from changing a release rule.

The second bay is pending implementation. Buses queue FIFO for the next open bay. If both bays are free they are assigned in FIFO bus order, using a deterministic bay ID. The platform remains one shared FIFO passenger queue. Alighting precedes boarding at each service start. The first service start takes the riders then waiting, and simultaneous starts use admission order to allocate each rider once. A rider arriving during a visit waits for the next service start at either bay. A bus may depart before a bus in the other bay; on the next road link the no-passing rule follows the actual departure order. Verify with three buses, two occupied bays, a waiting bus, simultaneous releases and arrivals, a single boarding of each rider, and a later-admitted bus finishing first.

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
- Use 30 independent replications per scenario with a seed set distinct from the pilot. Use separate streams for arrivals and running times. In each replication, the dispatch list, passenger IDs and trip manifest, and bus/link free-running time draws are identical in all three configurations. Service and the realised bus trajectories can differ.
- Primary outcome: mean journey time in seconds per measured passenger. Secondary outcomes: mean platform wait, berth queueing, sampled road running, extra no-passing time, dwell, upstream queueing and deliberate holding, departure-headway variability at Market and downstream, and generated/measured/completed counts.
- Compare each intervention against its matched baseline. Compute one difference in the replicate mean per seed and a two-sided paired t interval, $ar d pm t_{0.975,R-1}s_d/sqrt R$. Negative intervention-minus-baseline journey differences favour the intervention. Keep harmful and near-zero estimates, and mark direction uncertain when an interval spans zero.
- Produce a paired-effect plot with confidence intervals, passenger-weighted delay component changes, queue/headway summaries and time–distance diagrams for a reference seed selected before inspecting policy effects. Report comparisons as conditional on route, demand and infrastructure assumptions.
