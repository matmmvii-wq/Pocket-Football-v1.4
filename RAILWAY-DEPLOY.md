# Pocket Football v1.33 Fixed — Railway deployment

1. Upload the **contents** of this folder to a private GitHub repository (not the ZIP itself).
2. In Railway choose New Project > Deploy from GitHub Repo and select that repository.
3. Keep the Dockerfile builder, one replica, and set the healthcheck path to `/health`.
4. Under Networking generate a public domain. Railway provides the `PORT` environment variable automatically.
5. The Docker build runs `npm ci`, `npm run check`, `npm test`, and `npm run build`; if any fail, the deployment stops instead of serving old game files.
6. Test `/health`, load the game page, and test two-browser room join, movement, rematch, and disconnect/reconnect.

## CrazyGames integration (not yet implemented)
CrazyGames hosting and SDK integration must be configured separately. For a CrazyGames static-client upload, the client will need its WebSocket endpoint set to the Railway backend's secure `wss://` URL and the platform SDK integrated/tested. Do not claim CrazyGames integration is complete based on this Railway deployment.

## Important limitations
- Room state is in memory. Deploy one replica; rooms reset when the Railway service restarts.
- Coins/cosmetics stored in the browser are not protected server-side.
- No end-to-end live multiplayer or CrazyGames SDK test has been run for this package.
