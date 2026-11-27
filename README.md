# Does holding the middle bus help passengers?

Follow three buses along a four-stop corridor to see whether briefly holding Bus 2 can reduce passenger delay after Bus 1 runs late.

[Open the live demo](https://amri0faz31.github.io/bus-corridor-simulator/)

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/amri0faz31/bus-corridor-simulator/blob/main/notebook/bus-corridor-simulator.ipynb)

![Two policy charts and the passenger comparison for the three-bus replay](figures/demo-middle-bus.png)

## The question

When Bus 1 is delayed on its first road link, does briefly holding Bus 2 before Market improve passenger journeys? The two runs share three dispatches, the same passengers and the same road-time draws. School boarding gaps show how spacing changes downstream.

## Quick start

- **Browser.** Click the live demo link above or open `docs/index.html` directly.
- **Colab.** Open the notebook and choose **Runtime → Run all**.
- **Local Python.** Install the dependencies with `python -m pip install -r requirements.txt` and open the notebook in Jupyter.

## User guide

Press **Start** to run both charts on a shared clock. Change the **Maximum hold** or open **Scenario settings** to change the road delay and passenger demand. The table appears after both runs finish. [Full guide](USER_GUIDE.md)

## Model and mathematics

Three buses dispatch six minutes apart. A next-event calendar handles bus arrivals and releases, passenger arrivals and boarding starts. Stops have one FIFO boarding berth. Dwell is $5.264+2.136B+1.503A$ seconds for $B$ boardings and $A$ alightings. Only Bus 2 can be deliberately held before Market, for up to the chosen cap. [Theory](THEORY.md)

## Verification

The M/M/1 and fixed-headway benchmarks pass, alongside the hand traces and zero-cap check. The browser reproduces the notebook’s School boarding times and passenger averages in the default case. [Verification](VERIFICATION.md)

![Monte Carlo error scaling against a fixed-headway benchmark](figures/monte-carlo-error-scaling.png)

## Concepts applied

- Next-event discrete-event simulation and FIFO queueing.
- Inverse-transform exponential inter-arrivals and seeded lognormal running times.
- Matched Monte Carlo replications and paired confidence intervals.

## Results and limitations

The 20-second cap reduced average journey time in four of six demand and road-variability settings, based on paired intervals. The other two intervals crossed zero. The estimates apply to the assumed passenger demand, stop layout, bus schedule and first-link disruption. [Results](RESULTS.md) · [Experiment design](EXPERIMENT_PLAN.md)

## References, AI assistance and credits

Herath et al. informed road-time means and dwell coefficients. Daganzo and Shen et al. inform the holding comparison. AI assisted with planning, coding, testing and documentation. [References](REFERENCES.md) · [Data credits](data/README.md) · [MIT licence](LICENSE)
