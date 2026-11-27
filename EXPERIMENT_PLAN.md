# Experiment design

Run three buses on Origin → Market → School → Terminal with one berth per stop. The assumed dispatches are 1, 5 and 9 minutes with a four-minute target gap. Arrivals stop at 9 minutes and every admitted rider completes the journey.

First disable holding. Compare zero disruption with a 30-second first-link shock to Bus 1. Start with free berths, fixed travel and fixed dwell as a hand check. For 30 seeded cohorts, compare the same two delay cases under fixed and passenger-dependent dwell. Report Market boardings and dwell for B1 and B2 and classify how the B1–B2 gap disturbance changes by School.

Then compare no holding against a 20-second cap for Bus 2, with a two-minute Bus 1 delay. Cross demand multipliers 0.60, 1.00 and 1.75 with road-time CVs 0.15 and 0.45. Each of the six scenarios uses 30 independent pairs with identical input manifests and free-running road draws within each pair. Use total journey time as the primary outcome, with platform wait, School gaps and Market berth waiting alongside it. The browser exposes the delay, cap and demand and uses the same default inputs as Python.
