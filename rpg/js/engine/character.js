import { CLASSES } from '../data/classes.js';
import { ABILITIES } from '../data/abilities.js';
import { ITEMS } from '../data/items.js';

export class Player {
  constructor(name, classId) {
    const cls = CLASSES[classId];
    this.name = name;
    this.classId = classId;
    this.className = cls.name;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 30;
    this.gold = 20;

    this.maxHp = cls.base.hp;
    this.hp = this.maxHp;
    this.maxMp = cls.base.mp;
    this.mp = this.maxMp;
    this.baseAtk = cls.base.atk;
    this.baseDef = cls.base.def;
    this.growth = cls.growth;

    this.abilityIds = cls.abilities.filter(a => a.level <= this.level).map(a => a.id);
    this.classAbilities = cls.abilities; // full unlock schedule, kept for future level-ups
    this.inventory = { health_potion: 2 }; // starting kit
    this.equipment = { weapon: null, trinket: null };
    this.buffs = []; // { stat: 'atk'|'def', amount, turnsLeft }
    this.quests = {}; // questId -> 'active' | 'completed'
    this.npcTalkCount = {}; // npcId -> number of times talked to (for rotating flavor lines)
  }

  get atk() {
    const equip = (this.equipment.weapon && ITEMS[this.equipment.weapon].atkBonus) || 0;
    const buff = this.buffs.filter(b => b.stat === 'atk').reduce((s, b) => s + b.amount, 0);
    return this.baseAtk + equip + buff;
  }

  get def() {
    const equip = (this.equipment.trinket && ITEMS[this.equipment.trinket].defBonus) || 0;
    const buff = this.buffs.filter(b => b.stat === 'def').reduce((s, b) => s + b.amount, 0);
    return this.baseDef + equip + buff;
  }

  get abilities() {
    return this.abilityIds.map(id => ABILITIES[id]);
  }

  get lockedAbilities() {
    return (this.classAbilities || [])
      .filter(a => !this.abilityIds.includes(a.id))
      .map(a => ({ name: ABILITIES[a.id].name, level: a.level }))
      .sort((a, b) => a.level - b.level);
  }

  isAlive() { return this.hp > 0; }

  takeDamage(amount) {
    const dmg = Math.max(1, amount - Math.floor(this.def * 0.5));
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }

  heal(amount) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }

  restoreMp(amount) {
    const before = this.mp;
    this.mp = Math.min(this.maxMp, this.mp + amount);
    return this.mp - before;
  }

  fullRest() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.buffs = [];
  }

  addBuff(stat, amount, duration) {
    this.buffs.push({ stat, amount, turnsLeft: duration });
  }

  tickBuffs() {
    this.buffs.forEach(b => b.turnsLeft--);
    this.buffs = this.buffs.filter(b => b.turnsLeft > 0);
  }

  questState(questId) { return this.quests[questId] || null; }
  startQuest(questId) { this.quests[questId] = 'active'; }
  completeQuest(questId) { this.quests[questId] = 'completed'; }

  addItem(itemId, qty = 1) {
    this.inventory[itemId] = (this.inventory[itemId] || 0) + qty;
  }

  removeItem(itemId, qty = 1) {
    if (!this.inventory[itemId]) return false;
    this.inventory[itemId] -= qty;
    if (this.inventory[itemId] <= 0) delete this.inventory[itemId];
    return true;
  }

  gainXp(amount) {
    this.xp += amount;
    const levelUps = [];
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.maxHp += this.growth.hp;
      this.maxMp += this.growth.mp;
      this.baseAtk += this.growth.atk;
      this.baseDef += this.growth.def;
      this.hp = this.maxHp;
      this.mp = this.maxMp;
      this.xpToNext = Math.floor(this.xpToNext * 1.35);

      const unlocked = (this.classAbilities || [])
        .filter(a => a.level === this.level && !this.abilityIds.includes(a.id))
        .map(a => { this.abilityIds.push(a.id); return ABILITIES[a.id].name; });

      levelUps.push({ level: this.level, unlocked });
    }
    return levelUps;
  }

  toJSON() {
    return { ...this, buffs: [] }; // buffs don't persist across save/load
  }
}

export function createMonsterInstance(template) {
  return {
    ...template,
    curHp: template.hp,
    buffs: []
  };
}
