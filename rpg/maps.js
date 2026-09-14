// maps.js
//
// Draw your maps as plain ASCII grids, just like you sketched out.
// Every character must exist in TILE_LEGEND (see tileset.js), with one
// exception: 'P' marks where the player starts, and sits on a floor tile.
//
// IMPORTANT: every row in a given map must be the same length, or the
// grid will be ragged. Pad short rows with a tile character (not spaces).

const MAPS = {
  overworld: {
    rows: [
      "######################",
      "#$$$$$$$$$$$$$$$$$$$$#",
      "#$^^^^^^$$$$~~~~~$$$$#",
      "#$^^P^^^$$$$~~~~~$$$$#",
      "#$^^^^^^$$$$%%%%%$$$$#",
      "#$$$$$$$$$$$$$$$$$$$$#",
      "#$$$$####$$$$$$$$$$$$#",
      "######################",
    ],
  },

  // Add more rooms/maps here, e.g.:
  // cave: {
  //   rows: [
  //     "########",
  //     "#$$$$$$#",
  //     "#$####$#",
  //     "#$$$$$$#",
  //     "########",
  //   ],
  // },
};

const STARTING_MAP = 'overworld';
