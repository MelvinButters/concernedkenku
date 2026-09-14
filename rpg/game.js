// game.js
// Core engine: loads a map, handles grid-based movement/collision,
// and renders everything to a <canvas> with a camera that follows the player.

const TILE_SIZE = 32; // pixel size of each tile on screen
const MOVE_COOLDOWN_MS = 120; // lower = faster movement, higher = slower

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // keeps pixel art crisp instead of blurry

let grid = []; // 2D array of tile objects, [y][x]
let player = { x: 0, y: 0, facing: 'down' };
let lastMoveTime = 0;
const keysDown = new Set();

// ---------- Map parsing ----------

function loadMap(mapKey) {
  const mapDef = MAPS[mapKey];
  if (!mapDef) throw new Error(`Unknown map: "${mapKey}"`);

  grid = [];
  for (let y = 0; y < mapDef.rows.length; y++) {
    const row = mapDef.rows[y];
    const gridRow = [];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === 'P') {
        player.x = x;
        player.y = y;
        gridRow.push(TILE_LEGEND['$'] || UNKNOWN_TILE); // floor under the player's start
      } else {
        gridRow.push(TILE_LEGEND[ch] || UNKNOWN_TILE);
      }
    }
    grid.push(gridRow);
  }
}

function tileAt(x, y) {
  if (y < 0 || y >= grid.length) return UNKNOWN_TILE;
  if (x < 0 || x >= grid[y].length) return UNKNOWN_TILE;
  return grid[y][x];
}

// ---------- Sprite loading ----------
// Images load asynchronously in the background. Until an image finishes
// loading (or if you never add one), tiles just render as flat colors —
// nothing blocks or crashes if assets/sprites/ is empty.

const spriteCache = {};
function getSprite(path) {
  if (!path) return null;
  if (spriteCache[path]) return spriteCache[path];
  const img = new Image();
  img.loaded = false;
  img.onload = () => { img.loaded = true; };
  img.onerror = () => { img.loaded = false; }; // missing file -> silently fall back to color
  img.src = path;
  spriteCache[path] = img;
  return img;
}

const playerSprite = getSprite('assets/sprites/player.png');

// ---------- Input ----------

window.addEventListener('keydown', (e) => keysDown.add(e.key));
window.addEventListener('keyup', (e) => keysDown.delete(e.key));

function tryMove(now) {
  if (now - lastMoveTime < MOVE_COOLDOWN_MS) return;

  let dx = 0, dy = 0;
  if (keysDown.has('ArrowUp') || keysDown.has('w')) { dy = -1; player.facing = 'up'; }
  else if (keysDown.has('ArrowDown') || keysDown.has('s')) { dy = 1; player.facing = 'down'; }
  else if (keysDown.has('ArrowLeft') || keysDown.has('a')) { dx = -1; player.facing = 'left'; }
  else if (keysDown.has('ArrowRight') || keysDown.has('d')) { dx = 1; player.facing = 'right'; }
  else return; // no movement key held, nothing to do

  const target = tileAt(player.x + dx, player.y + dy);
  lastMoveTime = now; // consume the tick either way, so holding a key into a wall doesn't spam

  if (!target.solid) {
    player.x += dx;
    player.y += dy;
    if (typeof target.onEnter === 'function') target.onEnter(player);
  }
}

// ---------- Camera ----------
// Keeps the player roughly centered, but clamps to the map edges so you
// never see past the border. This is what lets maps be bigger than the canvas.

function getCamera() {
  const mapPxW = grid[0].length * TILE_SIZE;
  const mapPxH = grid.length * TILE_SIZE;

  let camX = player.x * TILE_SIZE + TILE_SIZE / 2 - canvas.width / 2;
  let camY = player.y * TILE_SIZE + TILE_SIZE / 2 - canvas.height / 2;

  camX = Math.max(0, Math.min(camX, Math.max(0, mapPxW - canvas.width)));
  camY = Math.max(0, Math.min(camY, Math.max(0, mapPxH - canvas.height)));

  return { x: camX, y: camY };
}

// ---------- Rendering ----------

function drawTile(tile, screenX, screenY) {
  const sprite = tile.sprite ? getSprite(tile.sprite) : null;
  if (sprite && sprite.loaded) {
    ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
  } else {
    ctx.fillStyle = tile.color || '#ff00ff';
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cam = getCamera();

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const screenX = x * TILE_SIZE - cam.x;
      const screenY = y * TILE_SIZE - cam.y;
      // skip tiles that are off-screen — keeps big maps fast
      if (screenX < -TILE_SIZE || screenX > canvas.width) continue;
      if (screenY < -TILE_SIZE || screenY > canvas.height) continue;
      drawTile(grid[y][x], screenX, screenY);
    }
  }

  const px = player.x * TILE_SIZE - cam.x;
  const py = player.y * TILE_SIZE - cam.y;
  if (playerSprite && playerSprite.loaded) {
    ctx.drawImage(playerSprite, px, py, TILE_SIZE, TILE_SIZE);
  } else {
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  }
}

// ---------- Main loop ----------

function loop(now) {
  tryMove(now);
  render();
  requestAnimationFrame(loop);
}

loadMap(STARTING_MAP);
requestAnimationFrame(loop);
