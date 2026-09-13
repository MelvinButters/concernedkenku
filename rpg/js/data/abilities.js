// Every player ability lives here. Classes just reference ids.
// type: 'damage' | 'heal' | 'buffAtk' | 'buffDef' | 'multiHit'
export const ABILITIES = {
  power_strike: {
    id: 'power_strike', name: 'Power Strike', mpCost: 4, type: 'damage',
    power: 9, variance: 4,
    desc: 'A heavy blow that hits harder than a plain attack.'
  },
  shield_bash: {
    id: 'shield_bash', name: 'Shield Bash', mpCost: 6, type: 'damage',
    power: 6, variance: 2, defShred: 2,
    desc: 'Slams the enemy, chipping away at their defense for the fight.'
  },
  rallying_cry: {
    id: 'rallying_cry', name: 'Rallying Cry', mpCost: 8, type: 'buffAtk',
    amount: 4, duration: 3,
    desc: 'Steels your resolve, raising attack for a few turns.'
  },
  whirlwind: {
    id: 'whirlwind', name: 'Whirlwind', mpCost: 12, type: 'damage',
    power: 16, variance: 6,
    desc: 'A reckless spinning strike. Costly, but devastating.'
  },

  firebolt: {
    id: 'firebolt', name: 'Firebolt', mpCost: 5, type: 'damage',
    power: 10, variance: 4,
    desc: 'A bolt of flame flung at the enemy.'
  },
  ice_shard: {
    id: 'ice_shard', name: 'Ice Shard', mpCost: 7, type: 'damage',
    power: 13, variance: 3,
    desc: 'A precise, freezing spear of ice.'
  },
  arcane_barrier: {
    id: 'arcane_barrier', name: 'Arcane Barrier', mpCost: 6, type: 'buffDef',
    amount: 5, duration: 3,
    desc: 'Wraps you in a shimmering ward, raising defense for a few turns.'
  },
  chain_lightning: {
    id: 'chain_lightning', name: 'Chain Lightning', mpCost: 14, type: 'damage',
    power: 19, variance: 7,
    desc: 'Crackling lightning tears through the enemy. Expensive but brutal.'
  },

  quick_strike: {
    id: 'quick_strike', name: 'Quick Strike', mpCost: 3, type: 'multiHit',
    power: 5, variance: 2, hits: 2,
    desc: 'Two fast, light strikes.'
  },
  backstab: {
    id: 'backstab', name: 'Backstab', mpCost: 8, type: 'damage',
    power: 15, variance: 8,
    desc: 'A vicious strike aimed at every weak point at once. High variance.'
  },
  poison_blade: {
    id: 'poison_blade', name: 'Poison Blade', mpCost: 6, type: 'damage',
    power: 7, variance: 2, defShred: 1,
    desc: 'A coated blade that also weakens the enemy\'s hide.'
  },
  smoke_bomb: {
    id: 'smoke_bomb', name: 'Smoke Bomb', mpCost: 10, type: 'buffDef',
    amount: 8, duration: 2,
    desc: 'Vanish into smoke, making you much harder to hit briefly.'
  },

  heal: {
    id: 'heal', name: 'Heal', mpCost: 5, type: 'heal',
    power: 14, variance: 4,
    desc: 'Mends wounds with a warm light.'
  },
  smite: {
    id: 'smite', name: 'Smite', mpCost: 7, type: 'damage',
    power: 11, variance: 3,
    desc: 'A judgement of searing light.'
  },
  bless: {
    id: 'bless', name: 'Bless', mpCost: 6, type: 'buffDef',
    amount: 4, duration: 4,
    desc: 'A protective blessing that steadies your defense.'
  },
  greater_heal: {
    id: 'greater_heal', name: 'Greater Heal', mpCost: 12, type: 'heal',
    power: 28, variance: 6,
    desc: 'A powerful restorative light. Costly but potent.'
  }
};
