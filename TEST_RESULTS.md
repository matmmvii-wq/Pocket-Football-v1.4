## v1.28

TypeScript and production build passed. All 37 targeted checks passed, including two-stadium rotation and a single custom watch. Match renders inspected for both arenas and raised-arm character poses. Browser playtesting remains unverified.

## v1.27

Production build and 36 targeted checks pass, including source-material checks on both arm cutouts for all six characters. Visually checked the lineup and rotated poses. Browser playtesting remains unverified.

## v1.26

TypeScript and production build pass. All 35 targeted checks pass. Side-by-side canvas render inspected at equal world scale. Browser playtesting remains unverified.

## v1.25 complete character rig

TypeScript, production build and all 35 targeted avatar/Cup/room/title checks passed. Visually inspected six complete portraits, both match directions and five rig poses with raised arms, tilted heads and rotated legs using the real canvas renderer. No browser click-through verification. Collision bodies and physical behavior are unchanged.

## v1.24 shoulder refinement

TypeScript, production build and all 35 targeted checks passed. All six selection portraits and both match-facing directions visually inspected with the canvas renderer. Browser click-through remains unverified.

## v1.23 arm correction

TypeScript and production build passed. All 35 avatar/Cup/room/title checks passed. Visually inspected all six assembled characters and both match-facing directions with the real canvas renderer. Browser click-through was not tested. Physics unchanged.

# Validation — reference-style voxel art v1.22

- TypeScript and production build pass; all 35 targeted avatar, Cup, lobby and title checks pass.
- All six regenerated sheets contain six usable parts. Six distinct characters and 70 distinct kit renders verified by existing pixel checks.
- Actual assembled lineup and game-rendered match inspected against PF-LAMINE-01: square heads, white rectangular eyes, block hair and cuboid limbs. Player facing and part alignment checked visually.
- Extracted ZIP starts without dependencies and serves all six active voxel atlas assets.
- Browser layout/click-through remains unverified; no physics or bot changes.

# Validation — original Cup asset characters v1.21

- TypeScript and production builds pass. 35 targeted avatar, Cup, lobby and title tests pass.
- Six original raster atlases loaded and sliced into six sprite parts each. All six characters and 70 kit variants remain visually distinct; existing base kit colors and Cup selection persistence checks pass.
- Assembled six-character gallery and actual game-rendered match visually inspected. Shoulder fit adjusted, higher-resolution previews retained, and raster characters face inward correctly at kickoff. Custom-avatar facing is unchanged.
- Extracted ZIP starts without dependencies and serves all six PNG atlases.
- Browser layout/click-through remains unverified. Physics and bot behavior are unchanged.

# Validation — Cup characters, kits and stadiums v1.20

- TypeScript and production builds pass. 31 targeted avatar, Cup and title tests pass.
- Six generic bodies and 70 visually distinct national kits verified with actual canvas pixels. Existing shirt and shorts colors remain exact.
- Character choice survives a full winning tournament for each of the six options. Selection exposes previous/next controls.
- Ten stadium entries, nine unique new renders, all valid random choices and exclusion of consecutive repeats verified.
- Stadium gallery, all six characters and representative similar-color kits visually inspected. Existing six-part rig and collision geometry are retained.
- Extracted ZIP startup and updated client verified without dependencies.
- Browser layout/click-through remains unverified; pre-existing bot defensive-shot limitation is unchanged.

# Validation — My Characters v1.19

- TypeScript and production build pass. 14 targeted avatar, room-lobby and title tests pass.
- Collection coverage verifies empty/default state, automatic import of the old single save, multiple characters retained, edits by stable identity, equipped selection after reload, and storage errors.
- Lobby markup verifies no team selector, My Characters tab, default/named avatar previews, capacity, readiness and errors.
- Two-client integration checks equip broadcasts and readiness reset, followed by full match, rematch and cleanup.
- Extracted prebuilt ZIP starts without dependencies and serves the collection UI.
- Browser interaction/layout remain unverified; existing physics and bot limitations are unchanged.

# Validation — hair, beard and shoes v1.18

- TypeScript and production build pass; seven avatar tests pass, including distinct pixels for shoe color presets, all cosmetic options, save/reload and migration.
- Revised warrior cut, middle part, connected beard and all six shoe colors visually inspected with the actual canvas renderer.
- Extracted prebuilt package startup passes without node_modules.
- Browser click-through remains unverified. Physics, tournament and room behavior are unchanged.

# Validation — expanded character creator v1.17

- TypeScript and production builds pass.
- 31 targeted avatar/lobby/cup/title tests pass. New catalog counts, natural-only palette normalization, old-save migration, save/reload, distinct pixels for all options and unique clothing/accessory presets pass. Six sprite dimensions remain unchanged.
- Real two-player integration passes: custom profiles and sanitization, readiness, launches, match completion, rematch, isolation, capacity and cleanup.
- Hair/outfit and accessory galleries visually inspected using the native canvas renderer. UI follows the provided PF-CHAR-CREATOR-01 reference with an illustrated scrolling catalog and fixed preview/save areas.
- Extracted ZIP starts without node_modules and serves the expanded creator.
- Browser layout and interactive click-through remain unverified: Chromium is unavailable. Existing bot defensive-shot limitation remains unchanged.

# Validation — character creator v1.16

- TypeScript and production client/server build pass.
- 29 targeted avatar, lobby, tournament and title checks pass. Avatar coverage checks save/reload, malformed saves, storage failure, valid random profiles, enabled creator entry and all starter asset/color variants against actual canvas pixels. All six sprite dimensions remain compatible with the existing rig.
- Real two-player integration passes, including shared custom profiles, server normalization, older clients without profiles, ready/unready, two-player capacity, launches, isolation, full match, rematch and disconnect cleanup.
- Four representative custom characters visually inspected with the canvas renderer.
- Extracted standalone package startup and client assets verified without node_modules.
- Browser layout/click-through was not verified in this environment. The existing bot defensive-shot limitation is unchanged; no physics or bot behavior was modified.

# Validation — custom room lobby v1.15

- TypeScript and production client/server build pass.
- 24 targeted lobby/cup/title tests pass. Lobby tests cover hidden assigned code before joining, pre-room character/create/join controls, host-only waiting state, two independent character boxes and statuses, guest-specific ready state, connecting controls and visible errors.
- Real two-client integration passes: rejects a third member, broadcasts ready/unready, does not start for a single ready player, starts when both ready, supports direct launches, isolated rooms, rematches, leave and cleanup.
- Extracted package starts without dependencies and serves the updated lobby, styles and character assets.
- Browser layout/click-through was not verified here. The known defensive-shot bot limitation remains unchanged; gameplay and tournament mechanics are not changed by this lobby update.

# Validation — continuous cup style v1.14

- TypeScript and production build pass.
- All 20 targeted tournament/title checks pass. Added checks follow 12 complete winning runs through both bye/playoff paths, verify the matching knockout screen and real opponent previews, validate one-character bye/champion panels, and follow an eliminated team through the remaining real fixtures to the winner.
- Existing group tables, all 70 custom ratings, display cap, simulation, knockout rules and title routing checks pass.
- Extracted package startup/assets checked without node_modules.
- Browser layout remains unverified in this environment. The known defensive-shot bot regression is unchanged; this is a tournament presentation update.

# Validation — group stage v1.13

- TypeScript and production build pass.
- All 18 targeted cup/title checks pass. New coverage verifies 12 groups / 48 displayed entrants, exactly two correctly identified character previews, actual upcoming opponents across all three matchdays including away fixtures, mirrored opponent, full group details with all six fixtures, read-only table browsing, and knockout availability after the group stage.
- Existing custom-rating precision, five-star display cap, simulation weighting, selection and title tests pass.
- Freshly extracted standalone ZIP starts without installed dependencies and serves the updated client, styles, flags and title video.
- Browser layout/click-through remains unverified in this environment. Tests inspect rendered React markup and tournament behavior. The known bot defensive-shot limitation is unchanged.

# Validation — pixel selection and ratings v1.12

- TypeScript and production client / server build pass.
- 15 targeted tournament/title checks pass, including exact comparison of all 70 supplied ratings; fractional star clipping; visual cap at five; 5.5 simulation advantage over 5.0; selected-team preview identity; roster completeness; complete knockout progression; and unchanged title mode routing.
- Spain, Argentina and Brazil preview renders visually inspected: simplified shirts, correct national-team colors, one character with a football, no copied jersey crest/sponsors/number.
- Selection matches the refined reference through live pixel panels, a flag grid, continent filters, team detail panel and Confirm Team. No invented attack/midfield/defense stats.
- Actual browser layout/click-through was not verified because Chromium is unavailable. React markup and character canvas rendering were checked separately.
- Gameplay physics and bot logic are unchanged; the existing defensive-shot limitation remains. No claim of a new bot fix is made.
- Extracted standalone package startup and asset serving checked without node_modules.

# Validation — Int Cup v1.11

- TypeScript and production client / standalone server builds pass.
- Nine new tournament checks pass: all 70 local flags and ratings; 48 unique entrants and complete round-robin schedules; player-away score orientation; immutable scores and duplicate-submission guard; standings-based qualification (three points can qualify, four can fail); stable tie breaks; stronger-team advantage with upsets/draws; complete 24-qualifier knockout progression across 100 seeded cups, including both player byes and playoffs; elimination, golden-goal requirement, and rendered selection/table markup.
- Existing title screen checks pass. Ragdoll, impact, flight and celebration checks pass. The earlier incoming-shot bot regression still fails; this update leaves that gameplay logic unchanged.
- Full initial run: 30 of 32 tests passed. One failure was the retained bot regression. The other was an outdated room test expecting “Pocket Cup” in the page title instead of “Pocket Football”; that assertion now checks the actual title.
- Corrected two-client multiplayer regression rerun passed (room creation/joining, direct launches, room isolation, rematch and cleanup). Current outcome: 31 passing checks and the one known bot defensive-shot failure.
- Extracted ZIP startup smoke check serves the game, Int Cup bundle, new flags and title video without installed dependencies.
- Browser layout and human click-through are not verified: Chromium is unavailable in this environment. UI checks use rendered React markup, and the tournament engine is tested independently.
- Star ratings are game tiers based on the documented 1 April 2026 ranking snapshot, not official ratings or a live ranking feed.

# Validation — animated title v1.10

- TypeScript, production client and standalone server build pass.
- Two automated title checks pass: selected labels and four options, muted/inline/autoplay/loop video attributes, poster fallback, independent mode routing, and disabled Ranked play.
- The video was inspected locally: H.264, 864 × 496, approximately 5.04 seconds. Controls use percentages to follow the video at different display sizes.
- Existing simulation source is unchanged in this update.
- Browser playback and click-through were not verified: Chromium was unavailable and its download failed. Automated checks cover rendered markup and routing functions, not actual video decoding or browser layout.
- The earlier bot defensive-shot regression remains unresolved.

# Validation — flight and goal celebration v1.9

Targeted checks pass:
- Flight loses speed gradually while preserving the requested initial launch velocity.
- Goal physics advances at roughly 8% normal speed; the ball can rebound out of the goal.
- Score increments once, match time pauses during celebration, and the next kickoff resumes at normal physics speed.
- Body articulation, attachment limits, shared launch motion and ball size/mass checks.
- Player impact amplification, wall/floor behavior, speed caps and burst cooldown checks. Controlled peak ball speed without/with boost: left 12.16/12.37; right 12.00/12.43. These fixtures do not promise a universal speed multiplier.
- Eighteen seeded matches completed with CPU scoring and repeated contacts, with no 12-second ball stall.

Known failing regression: CPU incoming-shot suite, shot starting at (650,370) with velocity (12,-1). The assertion is retained. Human playtesting remains necessary for glide and collision feel.

Player mass increases by 15%, restitution falls to 0.10, friction rises to 0.48, and air resistance rises to 0.003. Physics geometry and ball properties are unchanged. The CPU roof approach uses a shorter minimum lead to reach roof balls with the new drag.

Final validation: TypeScript and production build passed. Full suite: 20 passes, one retained defensive-shot failure. Two-client multiplayer integration passed. Extracted ZIP successfully served health, v1.9 and the goal announcement without installed dependencies. Facing and thicker arrow visually inspected.


## v1.29 — Shop verification
- TypeScript check and client/server production build: passed.
- 45 unit/render/data tests: passed (8 shop + 37 existing).
- Purchase debit, duplicate protection, insufficient balance, ownership, equip rules, persisted wallet, exact test code and normalization: passed.
- All ten skins render six visible raster rig layers at the existing dimensions; poses visually inspected.
- Built server serves shop assets and preserves the skin identifier in a live WebSocket room.
- Full browser interaction was not tested: this environment has no installed browser binary.
- Haaland and Messi have labeled temporary generic artwork.


## v1.30 — Title screen
- TypeScript check and production build passed.
- Title rendering and all mode routing tests passed.
- ffprobe confirms a single 1912 × 1084 video stream, no audio.
- Frames at 1 and 7 seconds inspected for button positions and alignment.
- Browser interaction not tested: no installed browser binary in this environment.


## v1.31
- TypeScript and production client/server build passed.
- Reward tests cover all exit stages, byes, all six bonus outcomes, persisted one-time receipts, no payouts on ineligible runs, and watching after elimination.
- Actual physics checks verify Easy, Regular and Hard reaction timing and distinct first-launch times.
- Live two-client room test verifies shared stadium and rematch rotation.
- All eight stadiums inspected using the actual canvas renderer, with the two new skin rigs.
- Existing incoming-shot bot-defense test fails on shot [650,370,12,-1], reproduced unchanged against v1.30. Other bot checks pass.
- No full browser interaction test (no installed browser binary).
