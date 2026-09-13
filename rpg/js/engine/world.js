import { LOCATIONS } from '../data/locations.js';
import { MONSTERS } from '../data/monsters.js';
import { createMonsterInstance } from './character.js';

const DIR_ALIASES = {
  n: 'north', s: 'south', e: 'east', w: 'west',
  north: 'north', south: 'south', east: 'east', west: 'west'
};

export class World {
  constructor(startId = 'crossroads') {
    this.currentId = startId;
    this.defeatedBosses = new Set();
  }

  get location() { return LOCATIONS[this.currentId]; }

  describe() {
    const loc = this.location;
    const lines = [`# ${loc.name}`, loc.description];
    const exits = Object.keys(loc.exits);
    if (loc.boss && !this.defeatedBosses.has(loc.boss)) {
      const m = MONSTERS[loc.boss];
      lines.push(`${m.name} blocks your way here. You'll need to fight or leave.`);
    }
    lines.push(`Exits: ${exits.join(', ')}`);
    return lines.join('\n');
  }

  // Returns { ok, message, encounter (monster template or null), blocked }
  move(dirWord) {
    const dir = DIR_ALIASES[dirWord.toLowerCase()];
    if (!dir) return { ok: false, message: `Not a direction. Try north, south, east, or west.` };

    const loc = this.location;
    if (!loc.exits[dir]) return { ok: false, message: `You can't go that way.` };

    // A boss can block a specific exit until defeated
    if (loc.boss && loc.guardsExit === dir && !this.defeatedBosses.has(loc.boss)) {
      return { ok: false, message: `The ${MONSTERS[loc.boss].name} blocks that path. Deal with it first.` };
    }
    // A boss with no guardsExit blocks ALL movement out until defeated (e.g. a chamber boss)
    if (loc.boss && !loc.guardsExit && !this.defeatedBosses.has(loc.boss)) {
      return { ok: false, message: `The ${MONSTERS[loc.boss].name} won't let you leave. Fight, or find another way.` };
    }

    this.currentId = loc.exits[dir];
    const newLoc = this.location;

    // Fixed boss encounter on arrival
    if (newLoc.boss && !this.defeatedBosses.has(newLoc.boss)) {
      return { ok: true, message: this.describe(), encounter: MONSTERS[newLoc.boss] };
    }

    // Random encounter roll
    if (!newLoc.safe && newLoc.encounters && newLoc.encounters.length) {
      for (const enc of newLoc.encounters) {
        if (Math.random() < enc.chance) {
          return { ok: true, message: this.describe(), encounter: MONSTERS[enc.monster] };
        }
      }
    }
    return { ok: true, message: this.describe(), encounter: null };
  }

  markBossDefeated(bossId) {
    this.defeatedBosses.add(bossId);
  }

  rollEncounterHere() {
    const loc = this.location;
    if (loc.safe || !loc.encounters) return null;
    for (const enc of loc.encounters) {
      if (Math.random() < enc.chance) return MONSTERS[enc.monster];
    }
    return null;
  }

  newMonsterInstance(template) {
    return createMonsterInstance(template);
  }
}
