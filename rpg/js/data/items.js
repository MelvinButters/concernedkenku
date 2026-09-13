export const ITEMS = {
  health_potion: {
    id: 'health_potion', name: 'Health Potion', type: 'consumable',
    healHp: 25, price: 15, desc: 'Restores 25 HP.'
  },
  mana_potion: {
    id: 'mana_potion', name: 'Mana Potion', type: 'consumable',
    healMp: 20, price: 15, desc: 'Restores 20 MP.'
  },
  healing_herb: {
    id: 'healing_herb', name: 'Healing Herb', type: 'consumable',
    healHp: 12, price: 6, desc: 'A crude field remedy. Restores 12 HP.'
  },
  rusty_sword: {
    id: 'rusty_sword', name: 'Rusty Sword', type: 'equip', slot: 'weapon',
    atkBonus: 3, price: 20, desc: 'Old, but the edge still bites. +3 ATK.'
  },
  silver_amulet: {
    id: 'silver_amulet', name: 'Silver Amulet', type: 'equip', slot: 'trinket',
    defBonus: 4, price: 35, desc: 'Cold to the touch. +4 DEF.'
  },
  wolf_pelt: { id: 'wolf_pelt', name: 'Wolf Pelt', type: 'junk', price: 5, desc: 'Sells for a little coin.' },
  spider_silk: { id: 'spider_silk', name: 'Spider Silk', type: 'junk', price: 6, desc: 'Sells for a little coin.' },
  gold_pouch: { id: 'gold_pouch', name: 'Gold Pouch', type: 'gold', amount: 10, desc: 'A small pouch of coin.' }
};
