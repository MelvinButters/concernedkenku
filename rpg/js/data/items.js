// items.js — demo item catalogue. Add your own the same way.
import { Item, ItemType } from '../engine/Inventory.js';

export const items = new Map([
  ['rusty_sword', new Item({
    id: 'rusty_sword', name: 'Rusty Sword', type: ItemType.WEAPON, value: 5, equipSlot: 'weapon',
    description: 'A pitted old blade. Better than fists.',
  })],
  ['leather_vest', new Item({
    id: 'leather_vest', name: 'Leather Vest', type: ItemType.ARMOR, value: 5, equipSlot: 'armor',
    description: 'Worn but sturdy.',
  })],
  ['healing_herb', new Item({
    id: 'healing_herb', name: 'Healing Herb', type: ItemType.CONSUMABLE, value: 3,
    description: 'Chew it fresh to mend wounds.',
    onUse: (character) => {
      character.heal(12);
      return { log: `You chew the herb and recover 12 HP. (${character.health}/${character.maxHealth})` };
    },
  })],
  ['silver_acorn', new Item({
    id: 'silver_acorn', name: 'Silver Acorn', type: ItemType.QUEST, value: 0,
    description: 'A strange acorn, cold to the touch, plated in real silver.',
  })],
  ['sealed_letter', new Item({
    id: 'sealed_letter', name: 'Sealed Letter', type: ItemType.QUEST, value: 0,
    description: 'Wax-sealed with the Elder\'s mark. Not addressed to you.',
  })],
  ['wolf_pelt', new Item({
    id: 'wolf_pelt', name: 'Wolf Pelt', type: ItemType.MISC, value: 8,
    description: 'Coarse grey fur, still warm.',
  })],
]);
