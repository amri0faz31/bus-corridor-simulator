# Data sources and outputs

Herath et al. (2024), Table 4, supplies the first three Road 1 mean link times: **104, 98 and 85 s**. Table 3 and equation 9 supply the dwell coefficients. Passenger demand, destinations, the delay to Bus 1, the dispatch schedule and road-time variability are scenario assumptions. [Parameter source](https://doi.org/10.11175/easts.15.2109)

- `browser-reference.json` stores the shared seeded cohorts and road draws used by the browser, the default settings, the three admission cutoffs, and Python reference metrics for all four caps.
- `paired-replications.csv` records 720 three-bus runs, one per scenario, replication and maximum hold. Switch counts match manifest IDs across policies.
- `policy-effects.csv` records all six direct cap contrasts per scenario and metric, with paired 95% confidence intervals and counts of identical actual holds.
- `default-cap-mechanism.csv` reports mean actual holds, passenger-time changes and B3-to-B2 switches for medium demand at CV 0.15 across 30 replications.
- `disturbance-propagation.csv` records fixed-dwell and passenger-dependent results with holding off, under matched delay and no-delay runs.
- `monte-carlo-scaling.csv` records RMSE against the analytical fixed-headway mean.

All outputs regenerate from the notebook. Timing columns are in seconds. Generated data accompany the repository's [MIT licence](../LICENSE).
