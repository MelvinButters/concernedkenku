// npcs.js — dialogue trees. `condition`/`action` receive the live Game
// instance, so you can branch on quest status, inventory, flags, etc.
import { NPC, DialogueNode } from '../engine/Dialogue.js';
import { items } from './items.js';

const questStatus = (game, id) => game.quests.get(id)?.status || 'unstarted';

export const elder = new NPC({
  id: 'elder', name: 'Elder Maren', locationId: 'village_square',
  description: 'The village elder, wrapped in a travel-worn shawl.',
  startNode: 'start',
  nodes: [
    new DialogueNode({
      id: 'start',
      text: (g) => questStatus(g, 'silver_acorns') === 'turnedin'
        ? 'The tower still troubles me. Will you look into it?'
        : 'Welcome, traveler. The woods have been restless lately.',
      options: [
        { label: 'What is this place?', next: 'lore' },
        { label: 'Any work for me?', next: 'work' },
        {
          label: 'Here\'s a letter from the blacksmith.',
          condition: (g) => g.inventory.has('sealed_letter'),
          action: (g) => g.quests.onDelivery('elder', 'sealed_letter', g.inventory),
          next: 'start',
        },
        { label: 'Farewell.' },
      ],
    }),
    new DialogueNode({
      id: 'lore',
      text: 'This is Aldergrove — a quiet village, or it was, before strange lights started over the old tower.',
      options: [{ label: 'Back', next: 'start' }],
    }),
    new DialogueNode({
      id: 'work',
      text: (g) => {
        const s = questStatus(g, 'silver_acorns');
        if (s === 'unstarted') return 'Silver acorns have started falling from the old oak. Bring me three and I\'ll pay well.';
        if (s === 'active') return 'Still hunting those silver acorns?';
        if (s === 'complete') return 'You found them! Wonderful.';
        return 'The tower — someone needs to see what\'s stirring up there.';
      },
      options: [
        {
          label: 'I\'ll gather the acorns.',
          condition: (g) => questStatus(g, 'silver_acorns') === 'unstarted',
          action: (g) => { g.startQuest('silver_acorns'); },
        },
        {
          label: 'Here are the acorns.',
          condition: (g) => questStatus(g, 'silver_acorns') === 'complete',
          action: (g) => { g.turnInQuest('silver_acorns'); },
        },
        {
          label: 'I\'ll investigate the tower.',
          condition: (g) => questStatus(g, 'silver_acorns') === 'turnedin' && questStatus(g, 'explore_tower') === 'unstarted',
          action: (g) => { g.startQuest('explore_tower'); },
        },
        {
          label: 'I found something strange up there.',
          condition: (g) => questStatus(g, 'explore_tower') === 'complete',
          action: (g) => { g.turnInQuest('explore_tower'); },
        },
        { label: 'Back', next: 'start' },
      ],
    }),
  ],
});

export const blacksmith = new NPC({
  id: 'blacksmith', name: 'Borin the Blacksmith', locationId: 'forge',
  description: 'A broad-shouldered smith, sparks still glowing in the forge behind him.',
  startNode: 'start',
  nodes: [
    new DialogueNode({
      id: 'start',
      text: 'Careful of the wolves on the forest path — they\'ve been bolder than usual.',
      options: [
        { label: 'Got any work?', next: 'work' },
        {
          label: 'Can you send word to the Elder?',
          condition: (g) => questStatus(g, 'clear_wolves') === 'turnedin' && questStatus(g, 'deliver_letter') === 'unstarted',
          action: (g) => { g.startQuest('deliver_letter'); g.inventory.add(items.get('sealed_letter'), 1); },
          next: 'letter_given',
        },
        { label: 'Just looking, thanks.' },
      ],
    }),
    new DialogueNode({
      id: 'letter_given',
      text: 'Take this to Elder Maren — she\'ll want to know the path is clear.',
      options: [{ label: 'Will do.' }],
    }),
    new DialogueNode({
      id: 'work',
      text: (g) => {
        const s = questStatus(g, 'clear_wolves');
        if (s === 'unstarted') return 'Two wolves have been harassing travelers on the forest path. Deal with them?';
        if (s === 'active') return 'Those wolves still out there?';
        return 'You\'re making the roads safer. I appreciate it.';
      },
      options: [
        {
          label: 'I\'ll clear the wolves.',
          condition: (g) => questStatus(g, 'clear_wolves') === 'unstarted',
          action: (g) => { g.startQuest('clear_wolves'); },
        },
        {
          label: 'The wolves are dealt with.',
          condition: (g) => questStatus(g, 'clear_wolves') === 'complete',
          action: (g) => { g.turnInQuest('clear_wolves'); },
        },
        { label: 'Back', next: 'start' },
      ],
    }),
  ],
});

export const npcs = new Map([
  [elder.id, elder],
  [blacksmith.id, blacksmith],
]);
