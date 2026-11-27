# Model and mathematics

The simulator advances to the next event on a priority queue. Releases at a timestamp precede arrivals and service starts. Each stop has a FIFO bus queue and one berth. Platform passengers can board at the start of service. Dwell in seconds is $d=5.264+2.136B+1.503A$ for boardings $B$ and alightings $A$. Passenger arrivals are Poisson and inter-arrival times use inverse-transform sampling. Free-running times are lognormal using the three published means in the [data notes](data/README.md). The no-passing rule imposes one second of minimum separation at link exits.

At Market, let $g$ be the elapsed seconds since the previous control release. Only Bus 2 can have a deliberate hold, given by $\\min(h_{\\max},\\max(0,360-g))$. Passengers already aboard experience the hold. Upstream queueing and berth queueing follow from the event model.

Platform waiting is time from passenger arrival until boarding. Total journey time is time from passenger arrival until alighting. The two gaps at School are consecutive **boarding-start** differences. The paired confidence intervals use replication-level differences for common passenger and road inputs. [Results](RESULTS.md)
