# Tile Game Starter

A small, scalable ASCII-map tile game engine using HTML5 Canvas. No build step —
just static files, so it deploys straight to GitHub Pages.

## File structure

Everything lives flat, next to `index.html` — no subfolders. This is
deliberate: GitHub's web drag-and-drop uploader doesn't preserve folder
structure, so flat files are the most reliable way to upload this way.

```
index.html    entry point
style.css      page styling
tileset.js      the "legend" - what each map character means
maps.js          your ASCII maps
game.js           engine: movement, collision, camera, rendering
(sprite images go here too, e.g. wall.png, player.png)
```

## Try it locally

Browsers block loading local scripts from `file://` for security, so use a
tiny local server. From this folder, run one of:

```
python3 -m http.server 8000
# or
npx serve
```

Then open `http://localhost:8000`.

## Adding your own sprites

1. Save a PNG next to `index.html` — e.g. `wall.png`, `water.png`, `player.png`.
   Square images work best (e.g. 32x32 or 16x16 pixels).
2. In `tileset.js`, point a tile's `sprite` field at the filename:
   ```js
   '#': { name: 'wall', solid: true, sprite: 'wall.png', color: '#4a4a4a' },
   ```
3. Refresh the page. If the image is missing or hasn't loaded yet, the tile
   automatically falls back to its flat `color` — nothing breaks.

The player's sprite works the same way, via `player.png` (see the bottom of
`game.js`).

**Uploading to GitHub:** drag the PNG files onto your repo's file list on
github.com alongside index.html, same as you did with the other files —
no folders needed.

## Adding a new tile type

Open `tileset.js` and add an entry, keyed by any character you like:

```js
'L': {
  name: 'lava',
  solid: false,          // false = walkable, true = blocks movement
  sprite: 'lava.png',
  color: '#c9432a',       // fallback color
  onEnter: (player) => {  // optional: runs when the player steps on it
    console.log('Ouch!');
  },
},
```

Then use `'L'` in any map string in `maps.js`.

## Adding a new map / room

Add an entry to the `MAPS` object in `maps.js`:

```js
cave: {
  rows: [
    "########",
    "#$$$$$$#",
    "#$####$#",
    "#$$$$$$#",
    "########",
  ],
},
```

Every row must be the same length. Mark the player's start with `'P'` in
exactly one tile.

To actually switch maps (e.g. walking through a door), call `loadMap('cave')`
from `game.js` — for example inside an `onEnter` handler on a door tile.

## Where to go from here

This starter deliberately keeps to the basics: walls, walkable ground, and
water-like obstacles, plus a camera that follows the player around maps
bigger than the screen. Natural next steps, all of which fit cleanly into
the existing structure:

- **NPCs/enemies**: an array of `{x, y, sprite}` objects, drawn each frame
  like the player, with their own simple movement or AI.
- **Items & inventory**: a tile's `onEnter` can remove itself from the grid
  and push into a `player.inventory` array.
- **Doors/map transitions**: an `onEnter` handler that calls `loadMap()` and
  repositions the player at the new map's entry point.
- **Multiple animation frames**: swap `sprite` for a small array of filenames
  and cycle through them over time for walk-cycle animation.

## Deploying to GitHub Pages

1. Push/upload this folder's contents to a GitHub repo (root of the repo,
   or a subfolder — your choice, as long as every file listed above stays
   flat, together, in that one location).
2. In the repo: **Settings → Pages → Source**, pick the branch and
   folder you used.
3. GitHub gives you a URL like `https://yourname.github.io/reponame/`
   within a minute or two.

No build tools, bundlers, or config needed — it's just HTML/CSS/JS being
served as-is.
