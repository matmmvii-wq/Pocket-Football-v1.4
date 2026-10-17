# Pocket Football — audio update

Apply this update on top of the successful CrazyGames SDK version.

## Install

1. Extract this ZIP into your existing project folder (beside `package.json`), keeping the `src` and `tests` folders in place. Replace the included existing files.
2. Run `npm run check` and `npm run build`.
3. Test the rebuilt game, then use your usual upload process for the contents of `dist/client`.

The three game files are `src/App.tsx`, `src/audio.ts`, and the new `src/matchAudio.ts`. The tests are included for future checks. No dependency install or additional audio downloads are needed if your existing project already builds.

## Sounds added

- Quiet, looping stadium ambience during matches, including countdown and goal breaks.
- Short menu and selection clicks.
- Countdown beeps and a kickoff whistle.
- A launch swish/thump.
- Goal celebration with a crowd swell.
- A full-time whistle followed by distinct win, loss, or draw notes.
- Coin/reward confirmation for purchases and Cup reward claims.

These are original synthesized arcade sounds. The crowd is a stylized ambience, not a recorded crowd. Everything is generated inside the game with Web Audio; no MP3/WAV assets, music licenses, or remote audio requests are required.

## Controls and behavior

The existing SOUND setting and CrazyGames SDK mute control apply to every sound. A platform mute always takes priority. Turning sound back on does not replay events that happened while muted.

The crowd stops in menus, when paused, and when the tab is hidden. Returning to active play starts one crowd loop. Pending match sounds are canceled when leaving the match or result screen. Audio unlocks through a click, tap, or keyboard gesture, as required by browsers.

Countdowns, goals, and results use the displayed match state, covering local games and online room snapshots. Online results use the correct player seat. Repeat frames do not replay the same announcement.

## Checks

Verified: 25 focused tests, TypeScript checking, production build, and Chromium browser checks for countdown timing, crowd lifecycle, pause/resume, hidden tabs, and both mute controls. All cues were rendered through Web Audio and checked for finite, non-clipping output. The official CrazyGames SDK smoke checks also passed.

Run the focused checks with:

```sh
node --test tests/audio.test.mjs tests/crazygames.test.mjs tests/title.test.mjs tests/room-lobby.test.mjs
```

Before uploading, try one match with sound enabled, pause/resume, return to the menu, and toggle SOUND off/on. In the CrazyGames preview, also test the platform mute control. The crowd is deliberately quieter than the match cues.
