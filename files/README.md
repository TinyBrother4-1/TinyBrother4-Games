# TinyBrother4 Games (GitHub Pages)

Static site, no server. Put these files at the root of your repo, then **Settings -> Pages -> Deploy from a branch -> main / (root)**.

## Add a game
1. Put the game in `games/<name>/` (a playable game needs an `index.html`; or use a `.zip` for download only).
2. Add an entry to `games.json`:
```json
{ "id": "my-game", "title": "My Game", "genre": "Action", "desc": "What it is.",
  "author": "TinyBrother4", "added": "2026-10-25",
  "cover": "games/my-game/cover.jpg",
  "play": "games/my-game/index.html",
  "download": "games/my-game/my-game.zip" }
```
- `cover`, `play`, `download` are all optional. `added` (YYYY-MM-DD) drives the "New releases" row and notifications.
- Games run in a sandbox. If one needs saves or loads its own data files, add `"sameOrigin": true`.
- Keep files under 100 MB each.

## Requests
Visitors can't upload. "Request a game" copies their request and opens your Discord. Set `SITE_REPO` at the top of `script.js` (e.g. `"TinyBrother4-1/games"`) to also get an "Open GitHub issue" button. Only add games you have checked.
