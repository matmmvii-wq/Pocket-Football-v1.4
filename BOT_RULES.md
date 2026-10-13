# Committed shots and blocks — v1.4.0

The CPU tracks the ball and updates charge/defend/recover targets every active frame. Tracking does not grant movement control in flight.

## Impulse rules

- One launch, then physical momentum and collisions determine the flight.
- No additional launches or recovery motor impulses in free flight, including on hard difficulty.
- Another launch requires 0.08 seconds of support and at least 0.6 seconds since the previous launch, plus reaction delay and the shared launch cooldown.
- Support means the floor or goal frame, including hanging/contacting its edge. A nearly stationary ball resting on the floor or roof can also support the ragdoll. An airborne ball cannot.
- These restrictions apply to the CPU only. Human controls and multiplayer are unchanged.

## Behavior

Charge: aim a deliberate slide or jump toward a reachable ball. Hard biases contact toward the opposing goal. Do not repeatedly add little airborne touches.

Defend: return toward the right post when the ball passes the player or threatens to go overhead. Aim the next grounded launch to block or clear it. Once launched, the bot cannot correct a missed block in midair.

Recover: when overturned and slow on a supporting surface, briefly use a bounded angular motor and a small recovery jump. No angle or position teleporting; the motor stops in free flight.

Goal roof: use a higher committed arc to reach the roof, land, then sweep back toward the pitch. Recovery can take longer without airborne corrections.

## Difficulty

| Setting | Reaction delay | Maximum launch speed |
| --- | ---: | ---: |
| Easy | 0.48 s | 14 |
| Normal | 0.18 s | 18 |
| Hard | 0.04 s | 18.5 |

These are additional parameters; none overrides the landing requirement or the 0.6-second minimum interval. The targeting rules never directly change the ball's velocity or the human player's body. Version 1.5 adds a shared collision-driven ball impulse for either player; see HIT_TUNING.md. Practice and multiplayer disable it.
