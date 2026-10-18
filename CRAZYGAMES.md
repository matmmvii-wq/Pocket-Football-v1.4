# CrazyGames integration

Apply this update to the current Pocket Football v1.33.4 project. Copy the included files into the project root, keeping the `src` and `tests` folders, and replace the matching files. Then run:

```sh
npm run check
npm run build
npm test
```

For the submission form, select **Yes, using the Data Module from the CrazyGames SDK** and check **CrazyGames muting audio through SDK**. The Data Module must be enabled in the submission settings before testing the uploaded game.

The integration loads the official HTML5 SDK v3 and awaits initialization before opening the game. Coins, owned/equipped skins, custom characters, and sound/difficulty preferences are saved through `SDK.data` on CrazyGames, for guests and signed-in players. The SDK handles account synchronization and reloads the game when accounts change. Outside CrazyGames, when the SDK reports `disabled`, existing browser saves continue to work.

Int. Cup runs exist only during the current session. Returning to the main menu, reloading, or closing the game abandons the current tournament; starting again creates a new cup. Old tournament saves are ignored, and there is no **Continue Cup** option. Pausing and resuming the active match still works. **Update Tables & Continue** advances the current tournament normally. Collected coins and reward receipts remain saved, while abandoning an unfinished cup awards no coins.

The SDK's initial `game.settings.muteAudio` value and settings-change listener control the master audio output. Portal mute overrides the player's sound preference, including effects already playing. Unmuting the portal restores that preference. Decorative video remains permanently muted. The fullscreen button and its handler have been removed.

Loading events surround game-asset loading. Gameplay starts only when a match becomes playable, stops for explicit pauses, goal/countdown breaks, results, and menus, and resumes with play. Visibility changes are left to CrazyGames for event reporting.

The update also includes the regression tests for the CPU v2 and roof recovery already present in `game.ts`, replacing tests that expected the old CPU controller.

## Hosting and preview

Deploy your rebuilt game through the existing hosting workflow. If uploading the static client to CrazyGames, upload the contents of `dist/client` with `index.html` at the root. Set `public/config.js` to your existing public `wss://.../ws` room-server address before building for separate static hosting. The current empty value means “use this website's server,” which is appropriate when the game and backend share a host.

Use the CrazyGames Developer Portal preview to check a guest save, a signed-in account save across reloads/devices, and portal mute. Local browser verification used the official SDK's `?muteAudio=true` option; account-backed behavior was tested with an SDK fixture and still needs that portal check. No game submission or deployment is performed by this update.

Official references:

- https://docs.crazygames.com/sdk/intro/
- https://docs.crazygames.com/sdk/data/
- https://docs.crazygames.com/sdk/game/#game-settings
- https://docs.crazygames.com/requirements/account-integration/#progress-save
