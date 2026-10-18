# Pocket Football — audio update

This updated package includes the original audio update plus the menu music. Apply it on top of the successful CrazyGames SDK version, or over the previous audio update.

## Install

1. Extract this ZIP into your existing project folder (beside `package.json`), keeping the `src` and `tests` folders in place. Replace the included existing files.
2. Run `npm run check` and `npm run build`.
3. Test the rebuilt game, then use your usual upload process for the contents of `dist/client`.

If you already installed the previous audio update, the only game changes you need are the replacement `src/audio.ts` and the new `public/audio/pocket-football-menu.wav`. Copy both, then rebuild. You can also replace everything in this ZIP.

The complete package contains `src/App.tsx`, `src/audio.ts`, `src/matchAudio.ts`, the menu WAV, tests, and the optional music composition script. No new game dependencies are needed.

## Sounds added

- An original 32-second, 120 BPM menu theme with melody, chords, bass, and light drums. It loops across the title, settings, shop, character creator, Cup menus, and room lobby.
- Quiet, looping stadium ambience during matches, including countdown and goal breaks.
- Short menu and selection clicks.
- Countdown beeps and a kickoff whistle.
- A launch swish/thump.
- Goal celebration with a crowd swell.
- A full-time whistle followed by distinct win, loss, or draw notes.
- Coin/reward confirmation for purchases and Cup reward claims.

The effects and music are original synthesized audio; no third-party recordings or samples are used. The crowd is stylized ambience. The menu music is bundled as a WAV and loaded from your game's own files; the other effects are generated during play. The included WAV is already ready to use. `audio-source/create-menu-theme.py` is optional composition source, requiring Python, numpy, and scipy only if you want to regenerate it.

## Controls and behavior

The existing SOUND setting and CrazyGames SDK mute control apply to every sound. A platform mute always takes priority. Turning sound back on does not replay events that happened while muted.

The music starts after the first click, tap, or keyboard gesture that unlocks browser audio. It keeps its place while you navigate menus, stops when a match begins, and resumes its position when you return. It stays off during matches, the pause screen, and match results. It loads once per session and fades in when resumed.

Music and crowd both stop while the tab is hidden. The crowd stops in menus and when paused. Returning to active play starts one crowd loop. Pending match sounds are canceled when leaving the match or result screen. A late music download cannot start music over an active match or bypass mute.

Countdowns, goals, and results use the displayed match state, covering local games and online room snapshots. Online results use the correct player seat. Repeat frames do not replay the same announcement.

## Checks

The preceding effects update passed TypeScript, production build, browser playback, and official CrazyGames SDK smoke checks. This menu music update adds checks for loading only once, preserving playback position, scene changes, mute/background behavior, delayed downloads, and the WAV's loop boundary and audio levels.

Run the focused checks with:

```sh
node --test tests/audio.test.mjs tests/crazygames.test.mjs tests/title.test.mjs tests/room-lobby.test.mjs
```

Before uploading, click into a menu to hear the theme, start a match to hear it stop, then return to the title. Also try SOUND off/on and the CrazyGames preview's mute control. The music should continue across menu pages without restarting or stacking copies.
