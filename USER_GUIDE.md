# User guide

[Open the live demo](https://amri0faz31.github.io/bus-corridor-simulator/) or double-click `docs/index.html`. Buses 1, 2 and 3 dispatch at **1, 7 and 13 minutes**. Both panels use the same three buses, passengers and road travel draws.

1. Keep the default 20-second cap and press **Start**. The complete replay takes about 37 seconds. Use **Pause** to inspect a point or **Reset** to start again.
2. Watch for the event message when Bus 2 reaches the control point before Market. It reports the actual hold. Check the two School gaps as B2 and B3 start boarding.
3. At the end, **This run** compares mean platform waiting and total journey time for the same 89 passengers. A negative difference favours holding.

**Scenario settings** contains Bus 1’s road delay and the passenger-demand level. Changing any model parameter resets both panels. The default settings are **20 s maximum hold**, **4 min road delay**, and **Medium** demand. Restoring all three restores the verified notebook case.

Yellow marks a delay on the road, green marks deliberate holding and blue marks queueing. Market and School are shaded on both charts. Both panels share the elapsed clock. [Research results](RESULTS.md)
