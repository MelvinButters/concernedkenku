// quests.js — one example of every quest type. Each entry is a *factory*
// (not an instance) so QuestManager can hand out fresh copies.
import { Quest, Objective, QuestType } from '../engine/Quest.js';
import { items } from './items.js';

export const questDefs = [
  () => new Quest({
    id: 'meet_blacksmith', title: 'A Friendly Face',
    description: 'Elder Maren mentioned a blacksmith at the forge. Go say hello.',
    giver: null,
    objectives: [new Objective({ id: 'o1', description: 'Talk to Borin the Blacksmith', type: QuestType.TALK, target: 'blacksmith' })],
    rewards: { xp: 10 },
  }),
  () => new Quest({
    id: 'silver_acorns', title: 'Silver Acorns',
    description: 'Bring Elder Maren 3 silver acorns from the forest.',
    giver: 'elder',
    objectives: [new Objective({ id: 'o1', description: 'Collect silver acorns', type: QuestType.FETCH, target: 'silver_acorn', count: 3 })],
    rewards: { xp: 60, gold: 20 },
  }),
  () => new Quest({
    id: 'explore_tower', title: 'The Ruined Tower',
    description: 'Elder Maren wants to know what\'s stirring at the old tower.',
    giver: 'elder',
    objectives: [new Objective({ id: 'o1', description: 'Reach the Ruined Tower', type: QuestType.EXPLORE, target: 'ruined_tower' })],
    rewards: { xp: 100 },
  }),
  () => new Quest({
    id: 'clear_wolves', title: 'Wolf Trouble',
    description: 'Borin wants the wolves on the forest path dealt with.',
    giver: 'blacksmith',
    objectives: [new Objective({ id: 'o1', description: 'Defeat forest wolves', type: QuestType.KILL, target: 'forest_wolf', count: 2 })],
    rewards: { xp: 60, gold: 10, items: [{ item: items.get('rusty_sword'), qty: 1 }] },
  }),
  () => new Quest({
    id: 'deliver_letter', title: 'Sealed Letter',
    description: 'Carry Borin\'s sealed letter to Elder Maren.',
    giver: 'blacksmith',
    objectives: [new Objective({ id: 'o1', description: 'Deliver the letter to Elder Maren', type: QuestType.DELIVERY, target: 'elder' })],
    rewards: { xp: 40, gold: 15, items: [{ item: items.get('leather_vest'), qty: 1 }] },
  }),
];
