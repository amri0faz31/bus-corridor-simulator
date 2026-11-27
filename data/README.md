# Data sources and outputs

Herath et al. (2024), Table 4, supplies the first three Road 1 mean link times: **104, 98 and 85 s**. Table 3 and equation 9 supply the dwell coefficients. Passenger demand, destinations, the delay to Bus 1, the dispatch schedule and road-time variability are scenario assumptions. [Parameter source](https://doi.org/10.11175/easts.15.2109)

- `browser-reference.json` stores the shared seeded cohorts and road draws used by the browser, the default settings, and the Python reference metrics.
- `paired-replications.csv` records 360 three-bus runs, one per policy and replication.
- `policy-effects.csv` records holding-minus-baseline means and paired 95% confidence intervals.
- `disturbance-propagation.csv` records fixed-dwell and passenger-dependent results with holding off, under matched delay and no-delay runs.
- `monte-carlo-scaling.csv` records RMSE against the analytical fixed-headway mean.

All outputs regenerate from the notebook. Timing columns are in seconds. Generated data accompany the repository's [MIT licence](../LICENSE).
