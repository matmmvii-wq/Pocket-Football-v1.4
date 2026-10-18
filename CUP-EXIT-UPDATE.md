# Cup exit update

Copy the contents of this ZIP into your current Pocket Football project folder,
keeping the folder structure and replacing matching files.

The ZIP includes the changed source files and the rebuilt `dist/client/game.js`
and `dist/client/game.css`. Restart your local game server and refresh the page.
For a source-based deployment, run `npm run build` and deploy as usual. Keep your
existing art and audio files in place.

## Behavior

- The title screen no longer offers **Continue Cup**.
- Returning to the main menu abandons the current cup, including an active match
  or unsubmitted full-time result.
- Reloading, closing, or navigating away from the game ends that run. Returning
  with the browser's Back button cannot restore the abandoned cup.
- Starting Int. Cup opens team selection and creates a fresh tournament.
- Existing tournament saves are ignored; new tournaments are never saved.
- Pause/Resume and Update Tables & Continue work during the active run.
- Earned coins, purchases, characters, preferences, and collected reward receipts
  remain saved. Abandoning an unfinished cup does not award coins.

Leaving a cup also clears its active-round lock, so a new cup's Play Match button
works immediately after exiting the previous match.

## Verification

TypeScript check, production build, and 39 targeted tests passed. Browser checks
covered existing old saves, cup-hub exit, pause/resume, mid-match exit, full-time
exit, normal round advancement, reload, page navigation, and starting new matches.
The browser checks used both the SDK test fixture and standalone browser storage.
