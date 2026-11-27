# Verification

- Hand traces check simultaneous berth release and arrival, FIFO boarding, complete journeys, and the cap with a separate control queue.
- The single-stop M/M/1 simulation gives a mean berth queue wait of **60.22 s** against **60.00 s** analytically.
- Independent passengers with fixed 80-second headways wait **39.97 s** on average against **40.00 s** analytically. [Analytical checks](figures/analytical-verification.png)
- The Monte Carlo log–log error slope is **−0.454** against the reference **−0.500**. [Error-scaling figure](figures/monte-carlo-error-scaling.png)
- With the controller enabled at zero cap, operational visits, rider records and non-control events match the uncontrolled run. Every admitted passenger finishes. Journey time reconciles against its component delays.
- Browser tests check waiting, onboard and completed counts at the exact boarding and alighting boundaries.
- Python and the browser match all three School boarding times at all four caps, actual Bus 2 hold, mean platform wait, onboard time and total journey time within **10⁻⁷ s**. The browser also checks whether the released Bus 2 was held for the intended amount.

A deterministic School rider arriving at 650 s (after Bus 3 dispatches at 540 s and before the School cutoff at 660 s) boards Bus 3 at 700 s and alights at 780 s. Every main run checks the passenger-time identity. Browser reference checks also reproduce both per-stop rider-switch counts.

Run `python tests/check-results.py` and `node tests/check-demo.cjs` from the repository root. The first executes all notebook cells in a clean directory. The second tests the JavaScript engine across the available controls. With Playwright and Chrome installed, `node tests/check-offline.cjs --screenshot` opens the page from disk offline, verifies playback and checks bunched labels at 375 px. The screenshot flag refreshes the demo image.
