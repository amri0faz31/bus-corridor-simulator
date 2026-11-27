# Bus Corridor Simulator

Explore when holding buses before a busy stop can reduce passenger journey time on a six-stop corridor.

[Open the live demo](https://amri0faz31.github.io/bus-corridor-simulator/)

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/amri0faz31/bus-corridor-simulator/blob/main/notebook/bus-corridor-simulator.ipynb)

![Time–distance charts showing Bus 5 waiting for a berth without holding and being held upstream with a 20-second cap](figures/demo-market.png)

## The question

When buses arrive close together, they can queue for the same boarding space. Buses that arrive after a long gap can also take longer to board waiting passengers, which lets the next bus catch up. Can holding a bus briefly before Market reduce mean passenger journey time, including time spent waiting on board?

## Quick start

- **Colab.** Open the notebook using the badge above and select **Runtime → Run all**.
- **Local Python.** From the repository root, install dependencies with `python -m pip install -r requirements.txt`. Open [the notebook](notebook/bus-corridor-simulator.ipynb) in Jupyter and run all cells.
- **Browser.** Use the live demo link above or open `docs/index.html` in Chrome, Edge or Firefox.

## User guide

Use **Start**, **Pause** and **Reset** to control both policies on a shared clock. At **1×**, one real second advances the simulation by one second. In the notebook example, jump to **7:10** to see Bus 5 held upstream in one panel and waiting for a berth in the other. Change demand, travel-time variability and the maximum hold under **Scenario options**. [Full user guide](USER_GUIDE.md)

## Model and mathematics

The corridor has five road links and one bus berth at each stop. A priority queue advances the clock to the next event. Passenger arrivals follow Poisson processes and sampled road running times are lognormal. At each stop, dwell is a fixed time plus a boarding term and an alighting term.

If $g$ is the time since the preceding control release, the deliberate hold is $h=\min(h_{\max},\max(0,H-g))$. The main comparison uses an 80-second target $H$ and a 20-second cap $h_{\max}$. Passenger journey time runs from platform arrival to the start of alighting at the destination. It includes platform waiting, movement, queues, applicable dwell and holding. [Equations and assumptions](THEORY.md)

## Verification

![Simulation errors lie within the stated tolerances for the M/M/1 berth queue and fixed-headway passenger-wait benchmarks](figures/analytical-verification.png)

The simulated mean berth wait was **60.22 s** against the M/M/1 benchmark of **60.00 s**. Mean passenger wait at a fixed 80-second headway was **39.97 s** against the expected **40.00 s**. Hand-traced fixtures check FIFO ordering, passenger completion, and equivalence at zero hold. The browser reproduces the notebook reference within the stated tolerance. [Verification details](VERIFICATION.md)

## Concepts applied

- Next-event discrete-event simulation represents bus movement, passenger boarding and berth occupancy.
- Queueing theory provides independent verification targets for berth and passenger waiting.
- Inverse-transform sampling generates exponential passenger inter-arrival times.
- Paired Monte Carlo replications reuse the same passenger trips and road draws within each policy pair. Replication-level differences provide 95% confidence intervals.

## Results, limitations and future work

The study completed 30 paired replications in each of six scenarios. The paired intervals favoured holding for journey time in five scenarios. The interval for high demand with low travel-time variability crossed zero. Estimated mean platform wait fell by **1.29–2.51 s per passenger** across the six scenarios. In the fixed road-disruption example, holding moved 20 seconds of Bus 5’s berth wait upstream while mean journey time across the cohort rose by 0.45 seconds. [Results, plots and exports](RESULTS.md)

The model uses a synthetic corridor, one berth per stop, unlimited passenger capacity and dwell coefficients transferred from published observations. The results describe these modelled conditions. Future work could check demand and boarding times against urban route observations and test whether passengers left behind change the policy comparison. [Experiment design](EXPERIMENT_PLAN.md)

## Key references

Daganzo (2009) studies headway-based control. Shen et al. (2026) examine the feedback between berth queues and irregular headways. Herath et al. (2024) provide a Sri Lankan boarding-and-alighting dwell model. [Full references and DOIs](REFERENCES.md)

## AI assistance

AI assisted with planning, code, debugging, figures and documentation. The notebook and test scripts contain the reproducible checks used to evaluate the implementation.

## Licence and data credits

[MIT licence](LICENSE) · [Data sources, assumptions and licences](data/README.md)
