# Ball impact update — v1.5

- Launch vectors and the 18.5 launch limit are unchanged.
- At a player–ball contact closing faster than 2 velocity units, add 0.65 times the normal closing speed to the ball's outward velocity after the physical collision resolves.
- Select the strongest player contact in a collision-start batch. A 120 ms burst guard prevents several limbs from multiplying the boost at once.
- This applies equally to both players, CPU or human, and the authoritative room server.
- Raise only the ball's safety speed cap from 34 to 42. Player cap remains 34.
- No changes to mass, gravity, air drag, floor/wall restitution, or CPU launch/landing rules.

The added impulse is an arcade hit-strength adjustment, not an increase in player launch speed. Actual outgoing speed depends on impact angle, incoming ball speed and ragdoll orientation; it is not a fixed percentage boost to every touch.

For source tuning, PLAYER_BALL_IMPACT_BOOST and BALL_SPEED_LIMIT are declared near the top of src/game.ts. Setting Match.impactBoost to zero disables the extra impact for controlled comparisons.
