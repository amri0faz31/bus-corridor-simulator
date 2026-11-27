# User guide

[Open the live demo](https://amri0faz31.github.io/bus-corridor-simulator/) or double-click `docs/index.html`. The two panels share the schedule, passengers, road draws and clock. B1, B2 and B3 start at **1, 5 and 9 minutes**.

1. Press **Start**. Use **Pause** during the run or **Reset** to return to the start. The default replay takes about **35 seconds**.
2. Read the passenger labels during playback. **B2 · 8 aboard** is the current onboard count. **Market · 5 waiting** is the current platform count. Yellow marks Bus 1’s imposed delay. Purple marks additional delay from the no-passing rule. Green marks holding and blue marks queueing.
3. Compare both School boarding gaps as they appear. After both runs finish, use **This run** to compare passenger time. For the default replay, mean journey time increases by **5.81 s per passenger** with holding.

![Default replay with live onboard and waiting passenger counts](figures/demo-middle-bus.png)

**Scenario settings** controls Bus 1’s road delay and passenger demand. **Maximum hold** controls the cap for Bus 2. Restore **2 min**, **Medium** and **20 s** for the default notebook replay. Changing any setting resets both panels. [Research results](RESULTS.md)
