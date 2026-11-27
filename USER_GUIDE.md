# User guide

Open [docs/index.html](docs/index.html) directly in Chrome, Edge, or Firefox. Start moves both corridors with a shared clock. Pause stops playback, and Reset restarts the selected input. The default view shows buses 3–5 from the notebook reference. Select **All ten buses** to show every marker. Both views still simulate ten buses. The Bus 5 readout separates time at the control point from waiting for the Market berth. Change demand, running-time variability, or hold cap to generate a fresh pair from browser seed 42. A ring indicates a bus waiting for a berth. An orange bus is in the control point. Running positions between stops are interpolated from event times.

Choose **Load notebook reference** to run the same 296 passenger trips, scheduled buses and road disruption as the notebook's deterministic case. The demo compares both policies against Python for the passenger count, platform and journey means, and Bus 5's Market berth wait. The tolerance is 0.0000001 seconds for timings. On a complete run the means displayed should be 83.74 s platform and 382.18 s journey without holding, and 84.28 s platform and 382.63 s journey with the cap.

The sampled preview uses a browser-specific random-number generator. It illustrates one matched pair and does not reproduce the notebook's Monte Carlo sequences. The notebook's [results](RESULTS.md) use 30 independent replication pairs per scenario.

## Reproduce and verify

- Run the [notebook](notebook/bus-corridor-simulator.ipynb) from a fresh Python or Colab runtime to regenerate the CSVs, reference case and plots.
- Run `node tests/check-demo.cjs` to check the browser engine against the notebook reference and exercise the 24 combinations of available input controls.
- Run `python tests/check-results.py` with the project dependencies installed to reproduce the notebook in a temporary directory and compare the checked-in numeric exports.

Offline Chrome testing covered opening the HTML directly, the three controls, Start/Pause/Reset, the reference totals, mobile layout and console errors.
