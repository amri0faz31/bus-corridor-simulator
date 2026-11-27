# Bus Corridor Simulator

A discrete-event model of bus service on a straight urban road. The study asks whether changing bus departures at an upstream control point can reduce passenger delay.

## Start here

1. Read the model decisions and experiment plan in [THEORY.md](THEORY.md).
2. Upload [the notebook](notebook/bus-corridor-simulator.ipynb) to Google Colab and select **Runtime → Run all**. The baseline uses the Python standard library.
3. Compare the event trace against the hand calculation in the notebook.

## Road and model

Origin → Stop 1 → Stop 2 → Terminal

The baseline uses one direction, one bus route and one berth at each boarding stop. The first verified case isolates Stop 1 with two buses and one passenger. The full corridor will track where passengers board, where they leave, and how long they wait.

## Verification

Bus A occupies the berth from 70 to 100 seconds. Bus B arrives at 80 seconds and waits 20 seconds. A passenger arriving at 85 seconds boards at 100 seconds and waits 15 seconds. The notebook also checks FIFO ordering when another bus arrives at the exact moment the berth frees.

## Concepts applied

- Next-event time advance schedules discrete changes without incrementing the clock by a fixed time step.
- A FIFO bus queue and a one-bus berth impose a resource constraint.
- Inverse-transform arrivals, lognormal running times and paired Monte Carlo comparisons are planned for the full corridor.

## Results and scope

The current result is a deterministic timing check. The completed study will compare normal departures with capped headway-based departures under matched passenger demand and running times.

## Browser demo

[Browser entry point](docs/index.html) · [User guide](USER_GUIDE.md)

## References, AI assistance and licence

[References](REFERENCES.md) · [Data sources](data/README.md) · [MIT licence](LICENSE)

AI assisted with planning and starter code. The notebook includes hand-calculated cases and executable assertions.
