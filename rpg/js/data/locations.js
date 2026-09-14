// locations.js — the demo map. `description` shows every time you arrive;
// `look` is the longer text shown on "look" (put secrets/extra flavour here).
// `coords` drive the ASCII minimap ("map" command).
import { Location } from '../engine/Location.js';

export const locations = new Map(Object.entries({
  village_square: new Location({
    id: 'village_square', name: 'Village Square', coords: { x: 0, y: 0 },
    description: 'Aldergrove\'s square, quiet at this hour. A well-worn signpost points to the forge.',
    look: 'Smoke curls from a chimney to the east. North, a dirt path vanishes into the treeline. Elder Maren sits near the well, watching the road.',
    npcs: ['elder'],
    exits: { north: 'forest_path', east: 'forge' },
  }),
  forge: new Location({
    id: 'forge', name: "Borin's Forge", coords: { x: 1, y: 0 },
    description: 'Heat rolls off the furnace. Tools hang in neat rows along the wall.',
    look: 'Half-finished blades line a rack by the anvil. Borin nods at you without looking up from his work.',
    npcs: ['blacksmith'],
    exits: { west: 'village_square' },
  }),
  forest_path: new Location({
    id: 'forest_path', name: 'Forest Path', coords: { x: 0, y: -1 },
    description: 'A narrow trail winds between old trees. Something rustles in the undergrowth.',
    look: 'Claw marks score the bark of a nearby tree — recent, and deep.',
    exits: { south: 'village_square', north: 'old_oak', east: 'old_well' },
    enemies: ['forest_wolf'],
  }),
  old_well: new Location({
    id: 'old_well', name: 'Old Well', coords: { x: 1, y: -1 },
    description: 'A stone well, long dry, ringed by pale moss.',
    look: 'Peering in, you see only darkness — and, oddly, a faint cold draft from below.',
    items: ['healing_herb'],
    exits: { west: 'forest_path', north: 'cave_mouth' },
    enemies: ['forest_wolf'],
  }),
  old_oak: new Location({
    id: 'old_oak', name: 'The Old Oak', coords: { x: 0, y: -2 },
    description: 'A massive oak, far older than the village around it. Silver glints among its roots.',
    look: 'Three silver acorns rest in the moss, cold to the touch even in daylight.',
    items: ['silver_acorn', 'silver_acorn', 'silver_acorn'],
    exits: { south: 'forest_path', north: 'ruined_tower' },
  }),
  cave_mouth: new Location({
    id: 'cave_mouth', name: 'Cave Mouth', coords: { x: 1, y: -2 },
    description: 'A jagged crack in the hillside, just wide enough to enter.',
    look: 'A bandit\'s cookfire smolders near the entrance — someone\'s using this cave as a hideout.',
    exits: { south: 'old_well' },
    enemies: ['bandit'],
  }),
  ruined_tower: new Location({
    id: 'ruined_tower', name: 'Ruined Tower', coords: { x: 0, y: -3 },
    description: 'A collapsed watchtower, half swallowed by ivy. The air here feels wrong.',
    look: 'Faint runes still glow along a fallen archstone. Whatever lived here hasn\'t entirely left.',
    exits: { south: 'old_oak' },
    enemies: ['tower_wraith'],
    onFirstVisit: () => ['A cold wind rises as you step inside — the hair on your neck stands up immediately.'],
  }),
}));
