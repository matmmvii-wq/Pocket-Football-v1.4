# Pocket Football v1.33.2 — Railway deployment patch

- Dockerfile runs TypeScript checks, **build**, then tests (rooms tests require dist/server.mjs).
- Replaced obsolete goal-roof bot scoring test with a ball-only anti-stuck regression test.
- Removed the special goal-roof bot target override; normal bot targeting is preserved.
- No gameplay tuning or tournament rules changed.

## Deploy
Extract the ZIP, copy the **contents** of `pocket-football/` into your GitHub repository root, commit and push. Use Railway Dockerfile builder.

## Build validation
Run `npm ci && npm run check && npm run build && npm test` locally or let Railway perform it.
