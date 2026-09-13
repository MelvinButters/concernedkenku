// To add a monster: add an entry. attacks[] are its own simple move set.
// attacks: { name, minDmg, maxDmg, chance } — weighted by chance, must sum sensibly (not required to sum to 1).
export const MONSTERS = {
  wolf: {
    id: 'wolf', name: 'Grey Wolf', hp: 22, atk: 6, def: 2,
    xp: 14, gold: 4,
    attacks: [{ name: 'Bite', minDmg: 3, maxDmg: 7, chance: 1 }],
    loot: [{ item: 'wolf_pelt', chance: 0.3 }]
  },
  giant_spider: {
    id: 'giant_spider', name: 'Giant Spider', hp: 28, atk: 7, def: 3,
    xp: 18, gold: 6,
    attacks: [
      { name: 'Fang', minDmg: 4, maxDmg: 8, chance: 0.7 },
      { name: 'Web Spit', minDmg: 2, maxDmg: 4, chance: 0.3 }
    ],
    loot: [{ item: 'spider_silk', chance: 0.35 }]
  },
  goblin: {
    id: 'goblin', name: 'Goblin', hp: 20, atk: 5, def: 2,
    xp: 12, gold: 8,
    attacks: [{ name: 'Rusty Dagger', minDmg: 3, maxDmg: 6, chance: 1 }],
    loot: [{ item: 'gold_pouch', chance: 0.4 }]
  },
  bandit: {
    id: 'bandit', name: 'Bandit', hp: 30, atk: 8, def: 4,
    xp: 20, gold: 14,
    attacks: [
      { name: 'Sword Slash', minDmg: 5, maxDmg: 9, chance: 0.75 },
      { name: 'Dirty Trick', minDmg: 2, maxDmg: 3, chance: 0.25 }
    ],
    loot: [{ item: 'health_potion', chance: 0.25 }]
  },
  bog_wraith: {
    id: 'bog_wraith', name: 'Bog Wraith', hp: 34, atk: 9, def: 3,
    xp: 24, gold: 10,
    attacks: [{ name: 'Chilling Touch', minDmg: 5, maxDmg: 10, chance: 1 }],
    loot: [{ item: 'mana_potion', chance: 0.3 }]
  },
  cave_bat: {
    id: 'cave_bat', name: 'Cave Bat', hp: 14, atk: 4, def: 1,
    xp: 8, gold: 2,
    attacks: [{ name: 'Screech Bite', minDmg: 2, maxDmg: 5, chance: 1 }],
    loot: []
  },
  cave_troll: {
    id: 'cave_troll', name: 'Cave Troll', hp: 70, atk: 12, def: 7,
    xp: 55, gold: 30,
    attacks: [
      { name: 'Boulder Fist', minDmg: 8, maxDmg: 14, chance: 0.6 },
      { name: 'Ground Slam', minDmg: 5, maxDmg: 8, chance: 0.4 }
    ],
    loot: [{ item: 'silver_amulet', chance: 1 }],
    isMiniBoss: true
  },
  stone_golem: {
    id: 'stone_golem', name: 'Stone Golem', hp: 95, atk: 13, def: 12,
    xp: 80, gold: 40,
    attacks: [{ name: 'Crushing Blow', minDmg: 9, maxDmg: 16, chance: 1 }],
    loot: [{ item: 'health_potion', chance: 1 }],
    isBoss: true,
    guards: 'ruins_gate'
  },
  lich_king: {
    id: 'lich_king', name: 'The Lich King', hp: 140, atk: 16, def: 9,
    xp: 200, gold: 150,
    attacks: [
      { name: 'Drain Life', minDmg: 10, maxDmg: 16, chance: 0.4 },
      { name: 'Frost Nova', minDmg: 8, maxDmg: 14, chance: 0.35 },
      { name: 'Bone Spear', minDmg: 12, maxDmg: 20, chance: 0.25 }
    ],
    loot: [],
    isBoss: true,
    isFinalBoss: true
  }
};
