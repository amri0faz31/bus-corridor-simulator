# Experiment design

Run exactly three buses on Origin → Market → School → Terminal. The scheduled starts are 1, 7 and 13 minutes. Delay Bus 1 by 240 seconds on the first link. Compare zero holding with a 20-second cap for Bus 2 at the upstream Market control point using a six-minute target release gap. Buses 1 and 3 have zero deliberate holding.

Cross demand multipliers 0.60, 1.00 and 1.75 with road-time CVs 0.15 and 0.45. Run 30 independent matched pairs per scenario. Each pair shares a seeded passenger manifest and matrix of seeded road times. Passengers enter until the third dispatch at 780 seconds. Verify that each admitted passenger finishes under both policies.

Use mean passenger journey time as the principal result, with platform waiting, both School boarding gaps and mean Market berth waiting alongside it. For each measure compute the mean of the 30 paired holding-minus-baseline differences and its two-sided 95% Student t interval. The browser replays one reference from these modelling assumptions with its own fixed input seeds.
