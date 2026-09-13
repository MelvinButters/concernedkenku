// Add a new playable class by adding an entry here. Nothing else needs to change.
// abilities: unlock order — {id, level}. Ability 1 is granted at creation.
export const CLASSES = {
  warrior: {
    id: 'warrior', name: 'Warrior',
    tagline: 'Heavy hitter. High health, blunt-force abilities.',
    base: { hp: 42, mp: 6, atk: 9, def: 6 },
    growth: { hp: 8, mp: 2, atk: 2, def: 2 },
    abilities: [
      { id: 'power_strike', level: 1 },
      { id: 'shield_bash', level: 3 },
      { id: 'rallying_cry', level: 5 },
      { id: 'whirlwind', level: 8 }
    ]
  },
  mage: {
    id: 'mage', name: 'Mage',
    tagline: 'Fragile but devastating. Wins fights before they start.',
    base: { hp: 26, mp: 14, atk: 4, def: 3 },
    growth: { hp: 4, mp: 5, atk: 1, def: 1 },
    abilities: [
      { id: 'firebolt', level: 1 },
      { id: 'ice_shard', level: 3 },
      { id: 'arcane_barrier', level: 5 },
      { id: 'chain_lightning', level: 8 }
    ]
  },
  rogue: {
    id: 'rogue', name: 'Rogue',
    tagline: 'Fast and unpredictable. Big swings, big risk.',
    base: { hp: 32, mp: 8, atk: 7, def: 4 },
    growth: { hp: 6, mp: 3, atk: 2, def: 1 },
    abilities: [
      { id: 'quick_strike', level: 1 },
      { id: 'poison_blade', level: 3 },
      { id: 'smoke_bomb', level: 5 },
      { id: 'backstab', level: 8 }
    ]
  },
  cleric: {
    id: 'cleric', name: 'Cleric',
    tagline: 'Sustains the fight. Heals, wards, and wears enemies down.',
    base: { hp: 34, mp: 10, atk: 5, def: 5 },
    growth: { hp: 6, mp: 4, atk: 1, def: 2 },
    abilities: [
      { id: 'heal', level: 1 },
      { id: 'smite', level: 3 },
      { id: 'bless', level: 5 },
      { id: 'greater_heal', level: 8 }
    ]
  }
};

