// tileset.js
//
// This is your "legend" — it defines what each character in a map string means.
// Edit this file to add new tile types or change how existing ones behave.
//
//   key      the character used in your ASCII map (e.g. '#')
//   name     human-readable label (not used by the engine, just for your sanity)
//   solid    true = player cannot walk onto this tile (walls, deep water, etc.)
//   sprite   path to an image under assets/sprites/. Set to null to just use "color".
//   color    fallback fill color, used until the sprite image loads (or if sprite is null)
//   onEnter  optional function(player) run every time the player steps onto this tile

const TILE_LEGEND = {
  '#': {
    name: 'wall',
    solid: true,
    sprite: 'assets/sprites/wall.png',
    color: '#4a4a4a',
  },
  '$': {
    name: 'floor',
    solid: false,
    sprite: 'assets/sprites/floor.png',
    color: '#c9a06a',
  },
  '^': {
    name: 'grass',
    solid: false,
    sprite: 'assets/sprites/grass.png',
    color: '#4a7c3f',
  },
  '~': {
    name: 'water',
    solid: true, // flip to false if you want the player to be able to wade/swim
    sprite: 'assets/sprites/water.png',
    color: '#2a6fbd',
  },
  '%': {
    name: 'bridge',
    solid: false,
    sprite: 'assets/sprites/bridge.png',
    color: '#8a5a2b',
  },
  '.': {
    name: 'void',
    solid: true,
    sprite: null,
    color: '#000000',
  },

  // Example of a tile with a custom effect — uncomment and adapt when you want it:
  // 'L': {
  //   name: 'lava',
  //   solid: false,
  //   sprite: 'assets/sprites/lava.png',
  //   color: '#c9432a',
  //   onEnter: (player) => {
  //     console.log('Ouch! Stepped in lava.');
  //   },
  // },
};

// Used for any character found in a map that ISN'T in TILE_LEGEND above,
// so a typo in your map doesn't crash the game — it just renders bright pink
// so you can spot the mistake immediately.
const UNKNOWN_TILE = {
  name: 'unknown',
  solid: true,
  sprite: null,
  color: '#ff00ff',
};
