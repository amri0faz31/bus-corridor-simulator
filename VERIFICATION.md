# Verification

- Hand traces check simultaneous berth release and arrival, FIFO boarding, complete journeys, and the cap with a separate control queue.
- The single-stop M/M/1 simulation gives a mean berth queue wait of **60.22 s** against **60.00 s** analytically.
- Independent passengers with fixed 80-second headways wait **39.97 s** on average against **40.00 s** analytically.
- The Monte Carlo log–log error slope is **−0.454** against the reference **−0.500**. [Error-scaling figure](figures/monte-carlo-error-scaling.png)
- With the controller enabled at zero cap, operational visits, rider records and non-control events match the uncontrolled run. Every admitted passenger finishes. Journey time reconciles against its component delays.
- Browser tests check waiting, onboard and completed counts at the exact boarding and alighting boundaries.
- Python and the browser match all three School boarding times per policy, mean platform wait and total journey time within **10⁻⁷ s**. The browser also checks whether the released Bus 2 was held for the intended amount.
