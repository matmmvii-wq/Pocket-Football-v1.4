# Pocket Football v1.34.0 — CrazyGames Friends

The existing two-player Online Friendly mode now connects to CrazyGames Play with Friends. Int. Cup, practice, cosmetics, coins, and match physics keep their existing behavior.

## What changed

- A one-player private lobby reports its room code and joinable status through `SDK.game.updateRoom`. Full rooms and matches report `isJoinable: false`. Leaving, disconnecting, or navigating away clears presence through `leftRoom`.
- Opening a CrazyGames invitation joins the specified room directly. The room-join listener also accepts invitations while the game is already open, without a page reload. Invitations received while assets load wait until the game is ready. A second invitation cancels an older connection attempt.
- `isInstantMultiplayer` creates a private normal-mode, 45-second room automatically. An invitation to an existing room takes priority over that flag.
- The lobby has Copy Invite Link using `SDK.game.inviteLink`, alongside the existing Copy Code button. If clipboard access is blocked, the link remains selectable. Invite links are disabled when the room is full.
- CrazyGames usernames appear in the lobby, score HUD, and results. Guests appear as Guest 1 / Guest 2. Account information arriving after room entry updates both clients. Names are display metadata, not authentication or permission checks.
- Custom character labels remain private in the owner's wardrobe. Only predefined cosmetic labels cross the network; player identity comes from the account name or Guest label.
- Full, missing, and invalid invitation destinations show an accessible room-unavailable dialog. There is no spectator mode. Rematches keep both players in the same room.
- There is no chat, image upload, or drawing feature. Chat and disableChat QA fields are N/A for this build.

## Deploy both parts

1. Update the existing GitHub/Railway project with the source changes, including `server/index.mjs` and `src/multiplayer.ts`, and rebuild. An older server will not broadcast the new account names.
2. Keep one Railway replica. Rooms live in memory and end if the service restarts. Confirm the public HTTPS domain and `/health` endpoint work.
3. Before uploading the static client to CrazyGames, put the actual secure WebSocket address in `public/config.js`, then run `npm run build`. The address is `wss://` plus the real Railway hostname and `/ws`. Do not copy an example hostname.
4. ZIP the contents of `dist/client`, with `index.html` at the ZIP root, and upload that ZIP to CrazyGames.
5. Enter a lobby size of **2** in the developer portal. Keep the existing Data Module and SDK mute settings enabled.

The current `POCKET_CUP_SERVER` value is empty. This supports local play and a Railway page served by the same backend. It is **not yet configured for a CrazyGames static upload**. The actual deployed Railway public URL was not available in the project or prior setup notes.

The standalone playable package includes `dist/server.mjs` and its matching client. With Node.js 22 or newer installed, extract it and run `node dist/server.mjs`, or use `START-GAME.cmd` on Windows. Open `http://localhost:3000` in two browsers for room-code play.

## Verification

`npm run check`, `npm run build`, and all **133 automated tests** passed. The server integration test runs a real timed two-player match, checks synchronized physics and room isolation, starts a rematch in the same room, and checks cleanup.

Eleven browser scenarios passed against the production build and a real local WebSocket server, using CrazyGames SDK fixtures: automatic private rooms, startup invitations, runtime invitations, full/missing/invalid rooms, link copying and clipboard fallback, long usernames on desktop and phone layouts, a complete match and same-room rematch, leaving, page exit, stale connection cancellation, late account updates, and standalone guests. There were no browser runtime errors.

This verifies the implementation locally. It does not establish live CrazyGames/Railway approval. After setting the real backend URL, check the uploaded preview with two signed-in CrazyGames accounts: party-leader launch, joining from Friends and a copied invite, username display, a full-room attempt, rematch, and leaving. The portal's automatic room/listener/link detections require exercising those actions in that uploaded build. The deprecated Invite Button is not used; the integration uses Update Room and Invite Link.

Official references:

- https://docs.crazygames.com/requirements/multiplayer/
- https://docs.crazygames.com/sdk/game/#room-data
- https://docs.crazygames.com/sdk/game/#room-join-listener
- https://docs.crazygames.com/sdk/game/#instant-multiplayer
- https://docs.crazygames.com/sdk/game/#invite-link
- https://docs.crazygames.com/sdk/user/
