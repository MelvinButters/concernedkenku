// Each location is a node in a graph. exits map a direction to another location id.
// encounters: [{monster: id, chance}] rolled once per arrival (not while safe).
// safe: no random encounters, usually can rest here.
export const LOCATIONS = {
  crossroads: {
    id: 'crossroads', name: 'The Crossroads',
    description: 'Four rutted roads meet at a weathered stone marker. Moss creeps up its base. This is as good a place as any to get your bearings.',
    exits: { north: 'forest', east: 'village', south: 'plains', west: 'swamp' },
    safe: true, encounters: [], items: []
  },
  forest: {
    id: 'forest', name: 'Whispering Forest',
    description: 'Tall pines block most of the light. Something rustles constantly just out of sight.',
    exits: { south: 'crossroads', north: 'cave' },
    safe: false,
    encounters: [{ monster: 'wolf', chance: 0.35 }, { monster: 'giant_spider', chance: 0.25 }],
    items: []
  },
  village: {
    id: 'village', name: 'Millbrook Village',
    description: 'A small trading post. A tired-looking merchant sits behind a cart of supplies. You can rest here.',
    exits: { west: 'crossroads' },
    safe: true, shop: true, encounters: [], items: []
  },
  plains: {
    id: 'plains', name: 'Open Plains',
    description: 'Wind-flattened grass stretches toward a distant broken gate. Little cover, little mercy.',
    exits: { north: 'crossroads', east: 'ruins_gate' },
    safe: false,
    encounters: [{ monster: 'goblin', chance: 0.3 }, { monster: 'bandit', chance: 0.25 }],
    items: []
  },
  swamp: {
    id: 'swamp', name: 'Murkwater Swamp',
    description: 'Stagnant water and the smell of rot. The ground barely holds your weight.',
    exits: { east: 'crossroads', south: 'bog' },
    safe: false,
    encounters: [{ monster: 'giant_spider', chance: 0.2 }, { monster: 'bog_wraith', chance: 0.3 }],
    items: []
  },
  bog: {
    id: 'bog', name: 'The Deep Bog',
    description: 'The swamp thickens into something worse. Pale lights flicker between the reeds.',
    exits: { north: 'swamp' },
    safe: false,
    encounters: [{ monster: 'bog_wraith', chance: 0.45 }],
    items: [{ item: 'healing_herb', chance: 0.5 }]
  },
  cave: {
    id: 'cave', name: 'Damp Cave Mouth',
    description: 'Cold air pours out of a jagged opening in the hillside. Water drips somewhere in the dark.',
    exits: { south: 'forest', north: 'cave_depths' },
    safe: false,
    encounters: [{ monster: 'cave_bat', chance: 0.35 }, { monster: 'goblin', chance: 0.2 }],
    items: [{ item: 'rusty_sword', chance: 0.4 }]
  },
  cave_depths: {
    id: 'cave_depths', name: 'Cave Depths',
    description: 'The tunnel opens into a wide chamber. Something very large is breathing in the dark ahead.',
    exits: { south: 'cave' },
    safe: false,
    boss: 'cave_troll',
    encounters: [],
    items: []
  },
  ruins_gate: {
    id: 'ruins_gate', name: 'Ruined Gate',
    description: 'A collapsed archway, half-swallowed by rubble. A stone golem stands motionless before the only clear path east.',
    exits: { west: 'plains', east: 'ruins_inner' },
    safe: false,
    boss: 'stone_golem',
    guardsExit: 'east',
    encounters: [],
    items: []
  },
  ruins_inner: {
    id: 'ruins_inner', name: 'The Inner Sanctum',
    description: 'Broken pillars ring a dais lit by cold blue fire. Something ancient and patient waits at its center.',
    exits: { west: 'ruins_gate' },
    safe: false,
    boss: 'lich_king',
    encounters: [],
    items: []
  }
};
