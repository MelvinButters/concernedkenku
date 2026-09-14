// Inventory.js — items, stacking, equipment slots, gold.

export const ItemType = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  CONSUMABLE: 'consumable',
  QUEST: 'quest',
  MISC: 'misc',
};

export class Item {
  constructor({ id, name, description, type = ItemType.MISC, value = 0, equipSlot = null, stackable = true, onUse = null }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.value = value; // gold value
    this.equipSlot = equipSlot; // 'weapon' | 'armor' | null
    this.stackable = stackable;
    this.onUse = onUse; // (character, game) => { log, consumed? }
  }
}

export class Inventory {
  constructor({ gold = 0 } = {}) {
    this.gold = gold;
    this.stacks = new Map(); // itemId -> { item, qty }
    this.equipped = { weapon: null, armor: null };
  }

  add(item, qty = 1) {
    const existing = this.stacks.get(item.id);
    if (existing) existing.qty += qty;
    else this.stacks.set(item.id, { item, qty });
  }

  remove(itemId, qty = 1) {
    const existing = this.stacks.get(itemId);
    if (!existing || existing.qty < qty) return false;
    existing.qty -= qty;
    if (existing.qty <= 0) this.stacks.delete(itemId);
    return true;
  }

  has(itemId, qty = 1) {
    const existing = this.stacks.get(itemId);
    return !!existing && existing.qty >= qty;
  }

  countOf(itemId) {
    return this.stacks.get(itemId)?.qty ?? 0;
  }

  list() {
    return [...this.stacks.values()];
  }

  equip(itemId) {
    const entry = this.stacks.get(itemId);
    if (!entry) return { log: `You aren't carrying that.` };
    if (!entry.item.equipSlot) return { log: `${entry.item.name} can't be equipped.` };
    this.equipped[entry.item.equipSlot] = entry.item;
    return { log: `You equip the ${entry.item.name}.` };
  }

  use(itemId, character, game) {
    const entry = this.stacks.get(itemId);
    if (!entry) return { log: `You aren't carrying that.` };
    if (!entry.item.onUse) return { log: `You can't use the ${entry.item.name} right now.` };
    const result = entry.item.onUse(character, game) || {};
    if (result.consumed !== false) this.remove(itemId, 1);
    return result;
  }
}
