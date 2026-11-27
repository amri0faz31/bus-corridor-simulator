# Bus Corridor Simulator

Trace how delays spread between buses on a straight urban road, and measure what passengers experience.

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/amri0faz31/bus-corridor-simulator/blob/main/notebook/bus-corridor-simulator.ipynb)

## Corridor and reference run

Origin → Market → School → Junction → Health Centre → Terminal. The example dispatches ten buses along five links. Passengers board at five stops, travel to assigned downstream destinations, and add to dwell as they board or alight. Stop names, distances, demand and running times specify a synthetic scenario.

The notebook compares normal operation with a temporary delay to Bus 4. The same passenger trips and bus schedule feed both runs.

![Time–distance diagrams for normal and disrupted service](figures/corridor-time-distance.png)

## Quick start

Open [the notebook](notebook/bus-corridor-simulator.ipynb) in Google Colab via **File → Upload notebook**, then select **Runtime → Run all**. In local Jupyter, install the dependencies in `requirements.txt` first. Running the figure cell writes the plot to `figures/` under the current working directory.

## Verification

The one-berth fixture checks a 20-second bus wait and FIFO ordering when a berth releases at the same time a bus arrives. A second hand calculation verifies two complete passenger journeys and two consecutive berth queues. Both checks run on the same simulation engine as the six-stop example.

## Model and concepts applied

A next-event clock handles movements, berth ownership and passenger queues. Stops use a linear boarding/alighting dwell model. Service and passenger events provide the time–distance plot and summary measures. See [model equations, assumptions and planned experiments](THEORY.md).

## Results and next stage

In the reference run, the 100-second delay raises mean platform wait from 64.6 to 83.7 seconds across the same 296 passengers. Bus 5 queues for 57.9 seconds at Market. Mean passenger journey time rises from 327.8 to 382.2 seconds. The reference run is deterministic. The policy experiment will add matched random inputs, capped upstream releases and replication-based confidence intervals.

## Browser

The [browser entry point](docs/index.html) summarises the reference corridor. See [the guide](USER_GUIDE.md) to reproduce the runs and interpret the plot.

## References, AI assistance and licence

[References](REFERENCES.md) · [Data sources](data/README.md) · [MIT licence](LICENSE)

AI assisted with planning, starter code and documentation. The notebook contains reproducible calculations and executable checks.
