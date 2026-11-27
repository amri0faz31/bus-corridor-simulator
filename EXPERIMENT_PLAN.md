# Experiment design

Run three buses on Origin → Market → School → Terminal with one berth per stop. The assumed dispatches are 1, 5 and 9 minutes with a four-minute target gap. Sample the road matrix first. Stop admissions at each boarding stop at the third dispatch plus Bus 3’s free-running time to reach that stop. Generate one shared manifest, including destinations, and follow every rider to alighting.

First disable holding. Compare zero disruption with a 30-second first-link shock to Bus 1. Start with free berths, fixed travel and fixed dwell as a hand check. For 30 seeded cohorts, compare the same two delay cases under fixed and passenger-dependent dwell. Report Market boardings and dwell for B1 and B2 and classify how the B1–B2 gap disturbance changes by School.

Then delay Bus 1 by two minutes and compare caps of 0, 20, 40 and 60 seconds for Bus 2 before Market. Cross demand multipliers 0.60, 1.00 and 1.75 with road-time coefficients of variation 0.15 and 0.45. Each scenario has 30 independent matched sets, giving 720 main runs. Dispatch times and seeds stay fixed across caps within a set. Report each run’s completed riders, actual hold, School boarding gaps, Market berth wait and mean platform, onboard and journey times.

Estimate pointwise paired 95% intervals for each cap contrast. Identify the minimum among the four tested estimates and use direct contrasts for incremental effects. For medium demand with CV 0.15, compare onboard costs and platform savings alongside the count of manifest IDs switching from Bus 3 to Bus 2 at Market and School. The separate browser replay uses passenger seed 42 and road seed 73. [Measured results](RESULTS.md)
