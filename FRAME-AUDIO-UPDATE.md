# Frame and audio startup update

Apply this patch to your current Pocket Football project, after the cup-exit
update. Extract the ZIP into the project root, keeping the folder structure and
replacing the matching files.

## Install

For a source-based build, run:

```sh
npm run check
npm run build
```

Deploy the rebuilt game through your usual workflow. For a CrazyGames file
upload, upload the complete contents of `dist/client`, with `index.html` at the
upload root.

The ZIP also includes rebuilt `dist/client/game.js` and `dist/client/game.css`.
If updating an existing compiled game folder directly, replace its `game.js`
and `game.css` with these two files. This patch ZIP is not a complete game upload.

Keep your existing art, video, fonts, and audio files. In particular, keep your
latest `pocket-football-menu.wav` in `public/audio` (source project) and `audio`
(compiled game). This patch does not replace the music track.

## Changes

- The game fills the iframe's width and height. Outer padding, width limits,
  scene-specific aspect-ratio limits, and the game's small footer are removed.
- Title artwork and its button regions scale together. Settings spacing and cup
  standings adapt to shorter landscape frames.
- Menu music starts loading and attempts playback when the app opens. It no
  longer waits for a menu button click to begin downloading.
- If the browser blocks audible autoplay, the first tap, pointer interaction,
  or keypress inside the game resumes audio. No particular button is required.
- Saved sound preferences, CrazyGames mute, and background-tab silence remain
  respected. The previous cup-exit behavior is preserved.

Browser autoplay rules can still require a real interaction before sound is
allowed. This cannot be guaranteed away by game code. The CrazyGames toolbar
belongs to the portal and remains outside the game's frame.

## Verification

TypeScript check, production build, and 29 targeted audio, SDK, and title tests
passed. Chromium iframe checks covered nine screens at six landscape sizes,
including 1365 x 724 and 844 x 390. Browser checks also covered permitted autoplay,
blocked autoplay with pointer/keyboard/touch activation, saved sound-off, and
CrazyGames muting and unmuting. These used a local SDK fixture rather than a live
CrazyGames submission.

Browser policy reference:
https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
