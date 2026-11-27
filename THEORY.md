# Model and mathematics

The event engine advances to the next arrival, service start or release. Releases at a timestamp precede arrivals. Stops have one FIFO boarding berth. Passengers board and alight at service start. Dwell in seconds is $d=5.264+2.136B+1.503A$ for boardings $B$ and alightings $A$. Poisson passenger arrivals use exponential inter-arrivals sampled by inverse transform. Free-running times are lognormal with the three published means in the [data notes](data/README.md). The no-passing rule imposes one second of minimum separation at link exits.

At Market, let $g$ be the elapsed time in seconds since the previous control release and $H$ the configured target gap. Only Bus 2 can have a deliberate hold,

$$h=\min(h_{\max},\max(0,H-g)).$$

The scenario uses $H=240$ seconds, with a default cap of 20 seconds. Passengers already onboard experience the hold. Separate event times record the imposed disruption, no-passing delay, waiting for the controller and waiting for the berth.

For boarding stop $j$, the admission cutoff is $C_j=t_3+\sum_{k<j}R_{3k}$, where $t_3$ is the final dispatch and $R_{3k}$ is Bus 3’s sampled free-running time on link $k$. Generate the road matrix first, then sample arrivals strictly before each cutoff. Dwell, queueing and disruption can only postpone service. Every admitted passenger can board by the final bus. Late arrivals beyond the cutoff are outside the study cohort.

Platform wait runs from arrival until boarding. Total journey time runs from arrival until alighting. School gaps are consecutive boarding-start differences. To measure how a disturbance propagates, compare the delayed B1–B2 gap with the corresponding undelayed gap at Market and School using matched inputs. For policy effects, compute replication-level paired differences and 95% Student t intervals. [Results](RESULTS.md)

For each rider, platform wait plus onboard time equals total journey time. Match riders by their index in the shared manifest to count switches from Bus 3 to Bus 2. For caps $a,b$, calculate $d_i=\bar J_{i,b}-\bar J_{i,a}$ on replication $i$. The mean has paired 95% interval $\bar d \pm t_{0.975,29}s_d/\sqrt{30}$. Compare adjacent caps directly on the same seeds. Each replication contributes one observation, independent of its passenger count.
