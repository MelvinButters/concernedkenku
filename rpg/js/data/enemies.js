// enemies.js — combat targets. Kept as plain objects since Combat.js
// wraps them in a fresh Enemy instance per fight.
import { items } from './items.js';

export const enemies = new Map([
  ['forest_wolf', {
    id: 'forest_wolf', name: 'Forest Wolf', health: 16, damage: 4,
    xpReward: 18, goldReward: 4, loot: [{ item: items.get('wolf_pelt'), qty: 1 }],
  }],
  ['bandit', {
    id: 'bandit', name: 'Bandit', health: 35, damage: 7,
    xpReward: 28, goldReward: 12, loot: [],
  }],
  ['tower_wraith', {
    id: 'tower_wraith', name: 'Tower Wraith', health: 55, damage: 9,
    xpReward: 45, goldReward: 20, loot: [{ item: items.get('healing_herb'), qty: 1 }],
  }],
]);
