# v1.31 — Cleanup, rewards and stadiums

All ten shop skins now have nameless clothing descriptions. The sky blue and
sky blue striped skins have finished original raster artwork. Existing purchases
and equipped skins migrate automatically; prices remain unchanged.

Hard is the default. Settings offers Easy, Regular and Hard. Their bot reaction
delays are 0.48, 0.18 and 0.04 seconds respectively, with different launch power
and goal-aim offsets. Only a cup started and kept on Hard earns coins.

Cup payout is awarded once when your run ends, after updating the final result:
- Group-stage exit: 5 coins
- Knockout playoff exit: 10
- Round-of-16 exit: 15
- Quarter-final exit: 20
- Semi-final exit: 25
- Runner-up: 30
- Winner: 35 plus one equally likely bonus of 15, 25, 35, 45, 60 or 100

The winner bonus uses a reveal animation. Balance and the cup receipt save
together, preventing duplicate payouts or rerolls. Simulating remaining matches
after your elimination awards no further coins. Abandoning an unfinished cup
does not award an exit payout. The existing Join Room test code is retained.

All eight approved stadiums are available in Int. Cup and Online Friendly.
Selection is random without immediate repeats. Room stadium selection is shared
by the server and changes on rematches. The new stadiums are framed to hide
reference captions while keeping the original art and existing match geometry.

Extract the full ZIP and launch START-GAME.cmd. Built server and client included.

Known verification limit: the earlier bot incoming-shot defense test still fails
on the same shot in both v1.30 and v1.31. Difficulty timing and launch checks pass.
No browser binary is available here, so interactive browser testing is still needed.

---

## v1.28 — Equal gameplay arms, two approved arenas, one watch

Gameplay uses equal-sized mirrored arm art for all six Cup characters; selection previews retain their perspective. Custom watches appear on one wrist. Removed the old stadium art and procedural stadium generator; only Dusk Arena (PF-STADIUM-01) and Sunset Arena (PF-STADIUM-02) are available, alternating between Cup matches after the initial random pick. Other modes use Dusk Arena. Physics unchanged.

## v1.27 — Approved dimensions for all six

All six Cup characters now use the approved Alex match dimensions and selection framing. Removed adjacent jersey material from the arm cutouts below the sleeve using source material masks, preserving skin and shoulder overlap. Gameplay physics and custom avatars unchanged.

## v1.26 — Alex-only size prototype

Only Alex has revised render sizing: broader silhouette, small height increase, grounded sole placement and adjusted menu framing. Other five characters and all physics, collisions, launch speed and custom avatars are unchanged. SIZE-COMPARISON.png shows Alex against the existing custom avatar at equal game scale. This remains a visual sizing trial, not an exact silhouette-to-hitbox match.

## v1.25 — Complete-character artwork and shared rig

Rebuilt Alex, Jordan, Sam, Casey, Riley and Morgan as complete voxel characters using the original Lamine style reference. Selection portraits use the whole drawing. Match limbs are cut from that same drawing, retaining one coordinate system and overlapping joint regions. Physics joint angles drive the artwork around shoulder, neck and hip pivots attached to the torso. No independent limb stretching or opponent offset patches. National-kit recoloring and character choices remain supported.

Art: public/art/cup-v25. Generated with the built-in image generator; complete prompts in prompts.json. Match collision geometry and physics tuning remain unchanged; artwork follows the torso and joint angles rather than transient solver separation.

## v1.24 — Shoulder refinement

Fully removed the leftover painted sleeve edges, moved the articulated arms in front of the torso, shortened preview arms and aligned the shoulder overlap for both facing directions.

## v1.23 — Cup arm assembly fix

Removed duplicate torso sleeves and protruding fists from the rendered Cup characters. Both arms now share a forward-facing straight forearm, overlap the shoulders, and retain their inward attachment when the opponent is mirrored. Original painted heads, national kits, physics and custom characters are preserved.

# Pocket Cup — standalone ragdoll football

A standalone HTML5 game with a solo cup, practice, golden goal, and private two-player rooms. The artwork and physics are carried over from the previous version. No ChatGPT account, Sites service, database, or platform-specific runtime is needed.

## Play on your own computer

Install Node.js 22 or newer. On Windows, extract the ZIP and double-click **START-GAME.cmd**, then open **http://localhost:3000**. Keep the launcher window open while playing.

If an older server is running, close it first (Ctrl+C in its PowerShell window). Refresh your browser after starting the new build.

Or open a terminal in the extracted folder and run:

```sh
node dist/server.mjs
```

Open **http://localhost:3000** in a browser. The included `dist` folder is already built; you do not need to install npm dependencies to play or host this build.

- **Mode: Int Cup → PLAY** opens national-team selection.
- **Mode: Online Friendly → PLAY → CREATE ROOM** creates a six-character room code.
- Your friend opens the game on the same server and chooses **JOIN ROOM**.
- Both can equip a saved character before readying up, then press **READY UP**.
- The creator plays left; the friend plays right. Each player's arrow starts at their own character.
- **Drag toward your target, then release.** A longer drag means more power. Keyboard: left/right rotates the aim; hold/release Space to launch.
- Match mode and duration use the creator's settings. Practice remains solo.
- After full time, both players press **REMATCH** to start again.
- The online match continues if someone opens the menu or switches tabs. Leaving/disconnecting closes that room; create a new one to play again.

## Reference-style voxel characters (1.22.0)

The six Cup assets have been regenerated directly against the original PF-LAMINE-01 reference and a matching base sprite sheet. Square heads, white rectangular eyes, block-cluster hair, simple cuboid limbs and planar voxel shading replace the rounded anatomical style of v1.21. Each is still an original image asset; the custom-character builder is not used for Cup players.

The active six atlases and their complete built-in image generation prompts are in `public/art/cup-v22/`. `PREVIEW.png` shows the assembled selection lineup. The same artwork is used in matches, with national colors and the existing six character choices. Stadiums, physics and tournament behavior are unchanged.

## Original Cup character assets (1.21.0)

The six Cup players now use six original high-detail raster sprite atlases, created with built-in image generation. They no longer use the custom-character renderer or its hair/face parts. Each has a distinct illustrated face, hairstyle, body, clothing shading and footwear. Separate head, torso, arms and legs animate on the existing ragdoll rig. National kit colors and patterns are applied through color masks while retaining the asset shading.

Selection and Cup previews use the same artwork as matches, rendered at higher resolution. The selected character remains consistent throughout the tournament; the custom creator and saved online/practice characters remain separate. Original sprite atlases and the full generation prompt set are included in `public/art/cup/`. Crop bounds are in `src/cupAssetRects.json`; kit masking, caching and assembly are in `src/characters.ts`. No image-generation service is needed to play.

## Int Cup characters, kits and stadiums (1.20.0)

Use the arrows on either side of the player in national-team selection to choose Alex, Jordan, Sam, Casey, Riley or Morgan. These are six generic cosmetic characters with different hair, skin and facial details. Changing nation applies that nation's kit to the same selected character. Your choice persists through group, knockout and champion screens and every played Cup match. Opponents use a deterministic generic character per nation.

All 70 national kits preserve their existing shirt/shorts base colors, with distinct shirt patterns, contrasting trims, cuffs and hem details. Argentina retains vertical stripes and Croatia has checks. Previews and match sprites use the same kits. Ratings, teams, tournament rules and physics are unchanged.

There are ten stadiums: Classic Ground (the original), Harbor Park, Mountain Bowl, Metro Arena, Desert Stadium, Forest Field, Night Grandstand, Coastal Oval, Garden Stadium and Royal Dome. Nine new pixel grounds use different structures, backdrops and palettes. Each new played Int Cup match randomly selects a stadium, excluding the immediately previous one. Golden-goal continuation stays at the same venue. Stadium changes are visual only; ground, goals and collisions stay in the same positions.

## My Characters and custom rooms (1.19.0)

Online Friendly no longer has a national-team selector. The **My Characters** tab at the top of the custom-room screen shows your saved characters and a built-in Default Player. Press **Equip** to select a character; it is used in the room preview, online matches and Practice. The default works immediately when you have no saved characters.

**Create New** opens a fresh character draft. **Save Player** adds it to your collection and equips it. **Edit** updates that saved character without replacing any others. Further saves in the same editor update that character. The title-screen Create Character button also starts a new character. Your previous single saved character is imported automatically. Characters and equipped selection persist in the same browser/site address.

Inside a waiting room, equipping updates both clients and resets both players to Unready. Create/edit are available before joining; leave the room to use them. Characters cannot be changed during an active match. Room cards show character names instead of national teams. Int Cup still uses its separate national-team selection.

## Character creator (1.18.0)

Warrior cut and middle part have revised silhouettes; the full beard connects at both ends. Shoe Color is a separate row and preserves your selected boot/trainer shape.

Choose **Create Character** on the title screen. The PF-CHAR-CREATOR-01-inspired layout has a large live player preview, scrollable illustrated option rows, gold selection borders and a **Save Player** button. Scroll vertically for all categories; row arrows, touch scrolling and keyboard focus reach additional options horizontally.

- 20 natural human skin tones, with no free color input.
- 11 hairstyles: mod cut, short/long dreads, warrior cut, crop, long, buzz cut, bald, middle part, highlights and afro.
- 14 natural hair colors: two each of black, dark brown, light brown, ginger, red/auburn, grey and white.
- Five eyebrow styles with five independent natural colors; seven eye colors and three eye shapes.
- Seven facial-hair choices (including none), with five independent natural colors; three expressions.
- 20 original generic tops, including 12 short-sleeve and eight long-sleeve designs. No real team branding.
- 10 bottoms (seven shorts and three full-length pants), eight sock colors, and two footwear shapes in white, black, red, blue, green or gold.
- 14 accessories: headband, cap, beanie, four glasses styles, studs, hoops, wristbands, watch, chain, pendant and beads. Different slots can be combined. Click an equipped option to remove it; selecting another in the same slot replaces it.

Save stores the player in this browser and site address, without an account/cloud sync. Back discards unsaved changes. Reset and Randomize change the draft only. Storage errors leave the draft intact and show an error. Older saves migrate automatically; previously unrestricted skin/hair/eye colors map to the nearest allowed palette color, and new brow/beard colors start from the old hair color. Other old clothing choices are retained until changed.

Your saved character appears in Practice and Online Friendly, in both room previews and matches. Int Cup continues using national-team characters. Customization preserves the existing six-part rig, body geometry, physics and launch controls. Clear site data to remove a save. Asset catalogs live in `src/avatar.ts`; native pixel sprite drawing lives in `src/avatarArt.ts`.

## Custom room lobby (1.15.0)

Choose Online Friendly on the title screen and press Play. The lobby follows your sketch in the established pixel style: one character preview before joining, Create Room and a code/Join row on the right. The team dropdown beneath your character remains available before connecting. No assigned room code appears before a room is successfully created or joined.

Inside the room, Code appears on the left with Copy Code. Each of the maximum two players has a separate character box wearing their team’s simple kit. Ready or Unready appears above each occupied box; an empty slot waits for your friend. The bottom-right Ready Up button toggles your readiness and becomes Unready while ready. Either player can undo readiness before the match starts. The server starts a match only when two players are present and both are ready; third-player joins are rejected. Leaving closes the room as before.

The advanced server address remains available before joining for separately hosted servers. Existing rematches, match physics, cup modes and ratings are unchanged.

## Continuous cup style (1.14.0)

The stadium background, pixel trophy/header, dark blue panels and gold actions now continue through the playoffs, round of 16, quarter-finals, semi-finals, final and champion screen. Round tabs let you browse the knockout bracket; cards show actual scores, winners and the next bracket match. Your fixture has a gold outline, and advancing teams are highlighted. Group Results keeps all final group tables and fixtures available.

The next-match panel always shows your current opponent using the same two simple-kit characters. A bye shows your character and explains that your opponent awaits the playoff result. After elimination, Cup Watch previews a real remaining match and lets you simulate each round. The final winner receives a trophy/character panel in the same style. Browsing old or future rounds never changes your playable opponent or any result.

Tournament rules, ratings, simulation, match physics and multiplayer remain unchanged.

## Group stage and next match (1.13.0)

After Confirm Team, the PF-GROUP-STAGE-01-inspired screen shows all 12 live groups in a four-by-three grid. Your group has a gold border and your country is highlighted. Each group card shows matches played and points; click any card for the complete table, ratings, all three matchdays and recorded results, then use All Groups to return.

The right panel previews your actual next fixture with two simple-kit pixel characters, country names, flags and capped star displays. Your player is on the left, as on the pitch; the opponent faces inward from the right. When the schedule lists your team away, the preview still uses the correct opponent. The fixture list below keeps the schedule’s home/away ordering and shows both games in your group’s current matchday. Play Match launches the previewed opponent. Completing a matchday updates all tables and both previews for the next game.

The existing group simulation, top-two qualification and knockout flow remain intact. No ratings, match physics, bots or multiplayer rules were changed. The reference is preserved in design/PF-GROUP-STAGE-01.png; controls and previews are rendered live rather than baked into the image.

## Pixel team selection and custom ratings (1.12.0)

Team selection follows the refined PF-TEAM-SELECT-01 layout: Int. Cup heading, dark pixel panels, a scrollable flag grid, region filters, a selected-team panel, and the yellow Confirm Team button. Search and all 70 teams remain available. Oceania is included so Australia has its own region filter.

The single character preview redraws when a country is selected, using that team’s existing shirt and shorts colors. Its kit is intentionally simple, with no copied Spain jersey, sponsors, crest or number. The preview uses the game's pixel character parts in a standing pose. There are no character arrows, kit choices or in-game rating editor. The match physics and existing match character renderer are unchanged.

Every rating matches your submitted list. France and Spain retain 5.5 internally; Brazil and Portugal retain 4.7, and all other fractions are preserved. Simulated games use the full value. Displayed stars cap at five, with partial stars for values below five (for example 4.7). The same capped stars appear in selection and group tables. The team panel shows Overall only; attack, midfield and defense values have not been invented.

Reference artwork is included as design/PF-TEAM-SELECT-01.png. The interface is built from live controls, local flags and a dynamic canvas character so it responds to your selections.

## Int Cup (1.11.0)

Select any of 70 national teams, using the searchable roster. Press Confirm Team to draw the cup. The draw always includes your choice and randomly selects 47 other teams, then shuffles all 48 into 12 groups of four. Flags and character kit colors are included locally.

Play each of your three group opponents once. After full time, choose **Update tables & continue** to record your score and simulate all other games in that matchday. Browse Groups A–L to see every table and fixture. A win is three points, a draw one, a loss zero. Only the top two in each group qualify; there is no fixed points threshold. Tables break ties by goal difference, then goals scored, then random lots drawn once when the cup starts.

The 24 qualifiers enter a knockout playoff: the eight best group winners (ranked by points, goal difference, goals scored, then the same drawn lots) get a bye; the remaining 16 teams play for eight places. Each bye team faces a playoff winner in the round of 16. Thereafter the bracket follows through the quarter-finals, semi-finals and final. Player knockout draws use golden goal. Simulated knockout draws use a star-weighted shootout winner, shown below the score. If eliminated, you can simulate subsequent rounds to see who wins.

Stars affect **simulated games**. Expected goals depend on the difference in the teams’ stars, with random goal counts so draws and upsets remain possible. The difficulty setting still controls the bot in played matches; this update does not alter the game's physics or bot mechanics. Completed scores never change when browsing tables. The cup is held in memory: reloading the page or starting another cup resets it.

Roster snapshot: FIFA men's ranking dated **1 April 2026**, reproduced at https://wildstat.com/p/7001/ddate/2026-04-01 . This is a dated roster, not a claim to be the latest live ranking. Ratings are the user’s custom values from 6 October 2026, preserved in design/user-team-ratings.json. These are game ratings, not official FIFA star ratings. The random draw and 24-qualifier playoff are custom rules for this game.

## Animated title screen and modes (1.10.0)

Your supplied five-second video is the title screen, set to autoplay muted, loop and play inline. A still from the video appears while loading or if the video fails. Live controls align with the Mode and Play buttons in the artwork.

Choose a mode from the dropdown, then press Play:
- Int Cup: 70-team selection and the full 48-team tournament described below.
- Online Friendly: existing create/join room screen.
- Ranked: label can be selected; Play stays disabled. No ranked system is implemented.
- Practice: starts the practice pitch with only your player.

Create character and Shop are inactive placeholders. Settings opens the existing settings screen, which now also contains difficulty. Returning to the title keeps the selected mode. The football simulation is unchanged from v1.9.

The video uses its native loop; no additional animation or generated replacement was added.

## Flight, collisions and goal celebration (introduced in 1.9.0)

Players face inward at kickoff. The aiming arrow has a 10-pixel shaft and a 26-pixel head, up from 6 and 18. Player parts are 15% heavier, have slightly more surface friction, and lower restitution (0.10 instead of 0.18) for less bouncy clashes. Air resistance rises from 0.0008 to 0.003, so the initial launch stays familiar and speed tapers during flight. Ball mass, size, gravity and impact boost remain unchanged.

A goal triggers 2.4 real seconds at 8% physics speed. The ball can rebound naturally, and the centered GOAL! announcement stays visible. Goals count only once, the match clock pauses during the celebration, and the next kickoff resumes at normal speed. The same simulation runs in online rooms.

CPU roof approach timing is adjusted for the changed flight behavior. A defensive-shot regression remains unresolved; see TEST_RESULTS.md.

## PF-LAMINE-01 character artwork (introduced in 1.8.0)

Characters now use the saved Voxel Soccer Character Concept Sheet as their visual reference: blond-tipped blocky curls, bright eyes, shaded skin and side planes, collar and sleeve details, patterned national kits, shorts, socks and white boots. All 14 national teams retain their original colors. This is an adaptation to the existing six-part ragdoll, rather than a change to its proportions or physics rig.

Rendering uses a 1000 × 562 canvas so the new details survive at gameplay size. Input coordinates still use the same 1000 × 562 game world. The larger hair silhouette is cosmetic; collider geometry is unchanged.

The v1.8 artwork update preserved the v1.7 simulation. The flight and collision adjustments in v1.10 are described above. The known bot defensive-shot regression remains. See CHARACTER_PREVIEW.png for the in-game adaptation, design/PF-LAMINE-01.png for the original reference, and src/characters.ts for the editable art.

## Flexible, connected ragdolls (carried over from 1.7.0)

Arms and legs swing on firm shoulder and hip pivots; the neck stays attached. The rigid torso-to-limb braces from v1.6 are removed. Gentle springs and rotation stops keep the limbs from folding indefinitely while allowing broad movement during flight, impacts and landing. These work relative to the torso, so the whole player can still tumble or turn upside down.

Each launch starts with one shared motion and rotation, then the limbs respond independently to physics. Center-of-mass launch speed is unchanged. The ball keeps its 37-pixel diameter (about 9% larger than v1.5) and original mass, and the stronger player-hit impulse remains enabled.

The CPU's roof recovery now checks its actual limb reach near the wall. It still cannot freely relaunch in midair. The defensive-shot regression remains unresolved; see TEST_RESULTS.md.

## Stronger impacts (carried over from 1.5.0)

Player launch speed is unchanged. A player–ball collision now adds an outward ball impulse proportional to the closing speed, after the normal collision resolves. Both sides use the same boost. Gentle contacts do not get a boost, and overlapping limbs cannot stack boosts within a 120 ms contact burst.

The ball speed cap increases from 34 to 42. The player speed cap, launch power, masses, gravity and floor/wall restitution stay unchanged. The CPU still cannot relaunch in free flight. Match balance changes with the stronger ball; this update does not retune the opponent.

Stop the old server, extract the entire ZIP and run START-GAME.cmd. Refresh http://localhost:3000 and check for v1.10.

## CPU behavior carried over from 1.4.0

The CPU keeps its accurate tracking, but now makes committed shots and defensive blocks. It cannot launch again or use its recovery motor in free flight. It needs 0.08 seconds of grounded support and at least 0.6 seconds since its last launch before acting again. The floor, goal frame, or a stationary ball supported by those surfaces can provide support. It cannot use an airborne ball as a platform.

This removes the repeated airborne impulses that let it carry/dribble the ball. Ordinary collisions and rebounds remain physical. Human controls and multiplayer are unchanged.

Choose NORMAL mode and NORMAL difficulty. Practice intentionally has no opponent. The menu footer must say v1.10. Stop the old server, extract the entire ZIP and run START-GAME.cmd, then refresh the browser.

## Let a friend connect

`localhost` only reaches your own computer. For two devices on the same Wi-Fi, give your friend `http://YOUR-LAN-IP:3000` and allow inbound TCP port 3000 through your firewall.

For internet play, deploy the included server to a Node-capable host or VPS. Serve it behind an HTTPS reverse proxy that forwards WebSocket upgrades. Point your domain to that server. Share that domain with your friend. Room codes only work within the same running server.

Example Caddy configuration (replace the domain):

```caddyfile
game.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

Caddy must be installed/configured separately, and the domain must resolve to your host. Use one server process: rooms live in memory. Restarting loses active rooms. Scaling to multiple processes requires sticky routing or shared room infrastructure, which is not included.

### Docker

The Docker image uses the prebuilt game and server:

```sh
docker build -t pocket-cup .
docker run --rm -p 3000:3000 --name pocket-cup pocket-cup
```

For HTTPS, place the same reverse proxy in front of the container. No paid service or specific provider is required by the game.

### Server settings

- `PORT`: default `3000`.
- `HOST`: default `0.0.0.0`.
- `ALLOWED_ORIGINS`: optional comma-separated exact browser origins. If omitted, any origin can connect, so static game builds can use this backend. Set to your game host(s) when appropriate.
- `MAX_ROOMS`: default `100`.
- `MAX_CONNECTIONS`: default `400`; at most 12 connections per direct IP.

The HTTP `/health` endpoint reports server health and active room count. The WebSocket endpoint is `/ws`. Message sizes, input rates, launch strengths and room capacity are checked on the server. A server runs all physics, scores and match timers; clients submit launch directions only. Snapshots are sent at 20 Hz and rendered with a small interpolation buffer. Higher internet latency will add input delay. No accounts, chat, matchmaking, persistence, reconnect/resume, or global leaderboard are included.

## Separate static hosting / game portals

`dist/client/` is the portable HTML5 game. Upload all its contents with `index.html` at the root. It supports relative paths and does not need React or Node on the static host. Solo play works without a room backend.

For multiplayer from a separate static host, edit **dist/client/config.js**:

```js
window.POCKET_CUP_SERVER = "wss://YOUR-SERVER.example.com/ws";
```

The backend must remain online. An HTTPS game requires a `wss://` endpoint. Do not leave this pointing to `localhost` for an internet release. The room menu has a server-address override for testing. For a source rebuild, make the equivalent change in **public/config.js** first.

## CrazyGames submission status

This is an independent self-hosting build, **not a CrazyGames-approved or submitted release**. The portable HTML5 client is included. A portal release still needs its current SDK integration, portal-specific invite/link handling, metadata, thumbnails and QA. It also needs a public multiplayer backend configured above. No portal SDK or ads are bundled, and no game has been submitted on your behalf.

Official submission/integration references:
- https://docs.crazygames.com/
- https://docs.crazygames.com/sdk/intro/
- https://docs.crazygames.com/requirements/multiplayer/

The standalone title is **Pocket Cup**. It uses the project's generated pixel art rather than shipping the reference game's files.

## Edit and rebuild

```sh
npm install
npm run check
npm run build
npm test
npm start
```

`npm test` runs automated CPU scoring, defense, crossbar recovery and launch-limit tests, plus a real two-client WebSocket match (~50 seconds), checks synchronization, right/left launch direction, invalid input, room isolation/capacity, rematch, and disconnect cleanup. Source dependencies are pinned in package.json. The prebuilt distribution is provided so hosting does not depend on installing development tools.

- `src/App.tsx`: menus, controls, solo play and room UI.
- `src/game.ts`: shared Matter.js simulation and canvas renderer.
- `src/network.ts`: room client and interpolated snapshot rendering.
- `server/index.mjs`: HTTP/static files, WebSocket room management, authoritative match simulation.
- `public/`: generated artwork, team flags, font, configuration.
- `scripts/build.mjs`: creates the standalone distribution.
- `tests/rooms.test.mjs`: room integration test.

The server and client include third-party libraries; see THIRD_PARTY_NOTICES.md. The generated source/artwork is supplied as part of your project. No existing ChatGPT-hosted deployment is modified by this export.


## v1.29 — Player shop

Open SHOP from the title screen. Ten cosmetic player entries have coin prices,
owned states and an Equip button. Ownership, balance and the equipped shop skin
are saved together in this browser. Purchases do not change match physics.
Shop skins are used in Practice and Online Friendly and appear in My Characters.
Int Cup keeps its national kits and existing character selection.

Lamine Yamal: 1,400; Mbappé: 1,500; Haaland: 1,400; Gilberto Mora: 800;
Kvaratskhelia: 1,100; Harry Kane: 1,200; Vozinha: 600; Messi: 1,800;
Cristiano Ronaldo: 1,800; Raphinha: 1,000. Total: 12,600 coins.

The wallet starts at zero. Coin earning is not implemented yet. For testing,
choose Online Friendly, paste this exact case-sensitive text into the Join Room
code field and press JOIN:

    coins124325)#((#K

This grants enough balance to buy all skins still unowned (12,600 on a fresh
wallet). It does not create or join a room. Repeating the code preserves higher
balances and existing purchases. This development wallet and test code are local;
no real-money purchase or production account economy is included.

Eight skins have new original raster art. Haaland and Messi currently use
explicitly labeled temporary generic Cup artwork with the requested kit colors;
the image service blocked their requested artwork in this generation batch.
All ten entries can be bought, equipped and played.

Extract the entire archive before running START-GAME.cmd. The built
dist/server.mjs and all client assets are included; no build step is needed.


## v1.30 — Polished title screen
Updated to the supplied 1912 × 1084 title animation, with the audio track removed
from the MP4 itself. The menu loops silently and has an updated poster fallback.
Original button artwork remains visible, with transparent hit areas and internal
hover/press/keyboard-focus feedback instead of extra rectangular frames.
The mode picker now uses a matching pixel-style dropdown with keyboard navigation,
Escape dismissal and outside-click dismissal. Existing mode routes and shop links
are preserved. Ranked remains unavailable.
