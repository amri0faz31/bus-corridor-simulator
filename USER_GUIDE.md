# User guide

[Open the live demo](https://amri0faz31.github.io/bus-corridor-simulator/) or open `docs/index.html` directly. The default example compares **No holding** and **Hold up to 20 s** for the same three buses and the same passengers and road times.

## Start with the three-bus example

- **Bus 1 starts at 0:01:00, Bus 2 at 0:07:00, and Bus 3 at 0:13:00.** A four-minute road delay affects Bus 2 on the first link. Six minutes between dispatches is the target release gap for this example.
- Random passengers arrive from opening through the final dispatch. Arrivals then close and the buses finish serving that cohort. This lets every generated passenger complete with three departures.
- Both policies complete **129 trips**. Bus 3 boards **10 passengers**. With holding, the Market departure gap between Buses 2 and 3 grows from **1 min 1.79 s** to **1 min 21.79 s**, while mean platform wait is **4 min 57.76 s** in both panels. Mean journey time is **10 min 18.63 s** without holding and **10 min 19.25 s** with holding.
- Use **Start**, **Pause**, and **Reset** on a shared clock. Jump to **0:15:35** to see Bus 3 held before Market. Change the passenger demand, road delay, cap, or dispatch gap under **Change the experiment**. **Restore notebook example** returns to the verified sample.

![Three buses shown in the matched browser replay](figures/demo-holding-preview.png)

## Read the chart

The number beside a stop counts people still waiting there. **B3 · 6** means Bus 3 has six people onboard. A sloping line represents travel between stops, while a flat line represents time at the stop or its approach. Yellow marks a road leg with a delay, green marks holding, and blue marks queueing. The summary beneath each chart reports how many people Bus 3 picked up across its whole route.

The three-bus replay illustrates one event sequence. The notebook uses its longer 80-second-dispatch corridor and 30 matched replications per scenario to estimate average intervention effects with confidence intervals. The browser verifies the short example against Python within 0.0000001 seconds. [Research results](RESULTS.md) · [Notebook](notebook/bus-corridor-simulator.ipynb)

## Reproduce

Run the notebook to regenerate the plots, CSVs and browser reference. Run `node tests/check-demo.cjs` for browser-engine parity and preview checks, and `python tests/check-results.py` for a fresh notebook comparison.
