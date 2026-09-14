// Location.js — Zork-style rooms. Each Location has a short description
// shown on entry, and a longer `look` description with extra flavour /
// hidden options, revealed only when the player types "look" again.
// `coords` (x,y) are optional but let the UI draw a simple minimap.

export class Location {
  constructor({ id, name, description, look, exits = {}, items = [], npcs = [], enemies = [], coords = { x: 0, y: 0 }, onFirstVisit = null }) {
    this.id = id;
    this.name = name;
    this.description = description;      // shown every time you arrive
    this.look = look || description;      // shown on "look" — put extra detail/flavour here
    this.exits = exits;                   // { north: 'locId', south: 'locId', ... }
    this.items = [...items];              // itemId[] lying on the ground
    this.npcs = [...npcs];                // npcId[] present here
    this.enemies = [...enemies];          // enemyId[] present here (removed once defeated)
    this.coords = coords;                 // for the minimap
    this.visited = false;
    this.onFirstVisit = onFirstVisit;     // (state) => extra log lines, run once
  }

  exitList() {
    return Object.entries(this.exits);
  }
}

export const DIRECTION_ALIASES = {
  n: 'north', s: 'south', e: 'east', w: 'west',
  ne: 'northeast', nw: 'northwest', se: 'southeast', sw: 'southwest',
  u: 'up', d: 'down',
};

/** Renders a small ASCII minimap centered on `currentId`, using coords on each location. */
export function renderMinimap(locations, currentId, radius = 2) {
  const current = locations.get(currentId);
  if (!current) return '';
  const { x: cx, y: cy } = current.coords;
  const rows = [];
  for (let y = cy - radius; y <= cy + radius; y++) {
    let row = '';
    for (let x = cx - radius; x <= cx + radius; x++) {
      const loc = [...locations.values()].find(l => l.coords.x === x && l.coords.y === y);
      if (!loc) { row += '   '; continue; }
      if (loc.id === currentId) row += ' @ ';
      else row += loc.visited ? ' o ' : ' · ';
    }
    rows.push(row);
  }
  return rows.join('\n');
}
