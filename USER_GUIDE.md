# User guide

Open [docs/index.html](docs/index.html) directly in Chrome, Edge or Firefox. **Start**, **Pause** and **Reset** control both time–distance charts on a shared clock. The default speed is 5×. Select **1× · real time** for one simulated second per real second, or drag **Jump to time** to inspect a specific event.

The horizontal axis shows minutes since first dispatch. The vertical axis shows distance in kilometres and labels each stop. Numbered dots show buses 3–5 by default. A flat trace means the bus stayed in one place. Orange marks holding before Market and blue marks a wait for a berth. Select **All ten buses** under **Scenario options** to show every bus. Passenger averages always use completed trips from all ten buses.

Choose **Load notebook reference** to run the same 296 passenger trips, scheduled buses and road disruption as the notebook's deterministic case. The demo compares both policies against Python for the passenger count, platform and journey means, and Bus 5's Market berth wait. The tolerance is 0.0000001 seconds for timings. On a complete run the means displayed should be 83.74 s platform and 382.18 s journey without holding, and 84.28 s platform and 382.63 s journey with the cap.

In that reference case, jump to about **7:10** to see Bus 5 holding in one panel and waiting for the berth in the other. The final bus clears the terminal at **18:30.3** without holding and **18:46.6** with the cap. Each panel reports its own finish time.

Change demand, travel-time variability or maximum hold under **Scenario options** to preview a matched pair from browser seed 42. The notebook's [results](RESULTS.md) use 30 independent replication pairs per scenario.

## Reproduce and verify

- Run the [notebook](notebook/bus-corridor-simulator.ipynb) from a fresh Python or Colab runtime to regenerate the CSVs, reference case and plots.
- Run `node tests/check-demo.cjs` to check the browser engine against the notebook reference and exercise the 24 combinations of available input controls.
- Run `python tests/check-results.py` with the project dependencies installed to reproduce the notebook in a temporary directory and compare the checked-in numeric exports.

Offline Chrome testing covered playback and seeking, holding and berth-wait colours, separate finish times, the reference totals and mobile layout.
