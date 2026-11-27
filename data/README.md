# Input sources and generated outputs

The main scenario uses five mean link times in seconds (104, 98, 85, 71, 69) from Road 1, Table 4 of Herath et al. (2024), printed p. 2117. Fixed dwell overhead is 5.264 s, boarding takes 2.136 s per passenger and alighting takes 1.503 s per passenger in the baseline. Those coefficients come from Table 3 and Eq. (9). The 1.7088 s boarding coefficient is hypothetical. Passenger arrivals, destinations, dispatches, variability and stop layout are scenario assumptions. The repository distributes generated data alongside the [project licence](../LICENSE). [Parameter source](https://www.jstage.jst.go.jp/article/easts/15/0/15_2109/_pdf/-char/en)

- `paired-replications.csv` has 540 rows, one per scenario, seed pair and policy. It records generated, completed and measured passenger counts and the measured means.
- `policy-effects.csv` records each contrast by scenario, metric, comparison policy and reference policy. `difference` is comparison minus reference. `ci_low` and `ci_high` are the paired 95% confidence limits.
- `monte-carlo-scaling.csv` records the RMSE for each replication count in the 40 s fixed-headway benchmark. Each row uses 64 batches.
- `browser-reference.json` records Python reference values for the original two-policy road disruption, plus the inputs and reference values for a short three-policy published-parameter replay and the default three-bus replay. The browser copy in `docs/reference.js` is checked for parity.

Platform, journey and passenger-weighted component means are in seconds per passenger. Market berth and control means are in seconds per bus. Queue share is a fraction. Each boarding-stop and upstream queue-length metric is the average number of waiting buses over the observation window. Departure-headway standard deviations are in seconds. The notebook regenerates all four exports.
