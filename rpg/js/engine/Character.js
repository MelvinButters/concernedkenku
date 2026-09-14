// Character.js — classes, leveling, health, abilities.
// Levels run 1..MAX_LEVEL. XP needed per level uses a simple curve you can retune.

export const MAX_LEVEL = 10;

// XP required to go from level N to N+1.
export function xpForLevel(level) {
  return Math.round(20 * Math.pow(level, 1.5));
}

/**
 * An Ability belongs to a CharacterClass and unlocks at a given level.
 * `use(caster, target, game)` returns a { log, damage?, heal?, effect? } result.
 * Passive abilities (type: 'passive') are applied via `onLevelUp` instead of being cast.
 */
export class Ability {
  constructor({ id, name, description, unlockLevel, type = 'active', resourceCost = 0, use, onLevelUp }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.unlockLevel = unlockLevel;
    this.type = type; // 'active' | 'passive'
    this.resourceCost = resourceCost; // cost in the class's resource pool (MP), optional
    this.use = use || (() => ({ log: `${name} does nothing yet.` }));
    this.onLevelUp = onLevelUp || null;
  }
}

/**
 * A CharacterClass is a template: base stats + a full ability list (levels 1-10).
 * Health scales as baseHealth + healthPerLevel * (level - 1).
 */
export class CharacterClass {
  constructor({ id, name, description, baseHealth = 20, healthPerLevel = 8, baseResource = 0, resourcePerLevel = 0, resourceName = 'MP', abilities = [] }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.baseHealth = baseHealth;
    this.healthPerLevel = healthPerLevel;
    this.baseResource = baseResource;
    this.resourcePerLevel = resourcePerLevel;
    this.resourceName = resourceName;
    this.abilities = abilities; // Ability[]
  }

  maxHealthAt(level) {
    return this.baseHealth + this.healthPerLevel * (level - 1);
  }

  maxResourceAt(level) {
    return this.baseResource + this.resourcePerLevel * (level - 1);
  }

  abilitiesUnlockedAt(level) {
    return this.abilities.filter(a => a.unlockLevel === level);
  }

  abilitiesKnownAt(level) {
    return this.abilities.filter(a => a.unlockLevel <= level);
  }
}

export class Character {
  constructor({ name, cls, level = 1 }) {
    this.name = name;
    this.cls = cls;
    this.level = Math.min(level, MAX_LEVEL);
    this.xp = 0;
    this.maxHealth = cls.maxHealthAt(this.level);
    this.health = this.maxHealth;
    this.maxResource = cls.maxResourceAt(this.level);
    this.resource = this.maxResource;
    this.flags = new Set(); // arbitrary story/quest flags earned by this character
  }

  get abilities() {
    return this.cls.abilitiesKnownAt(this.level);
  }

  get xpToNext() {
    return this.level >= MAX_LEVEL ? null : xpForLevel(this.level);
  }

  isAlive() {
    return this.health > 0;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - Math.max(0, amount));
    return this.health;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + Math.max(0, amount));
    return this.health;
  }

  /** Returns an array of level-up log lines (0 or more level-ups can occur at once). */
  gainXP(amount) {
    const logs = [];
    if (this.level >= MAX_LEVEL) return logs;
    this.xp += amount;
    logs.push(`${this.name} gains ${amount} XP.`);
    while (this.level < MAX_LEVEL && this.xp >= xpForLevel(this.level)) {
      this.xp -= xpForLevel(this.level);
      this.level += 1;
      const healthBefore = this.maxHealth;
      this.maxHealth = this.cls.maxHealthAt(this.level);
      this.health += this.maxHealth - healthBefore; // level-up heals the difference
      this.maxResource = this.cls.maxResourceAt(this.level);
      this.resource = this.maxResource;
      logs.push(`✦ ${this.name} reaches level ${this.level}! Max health is now ${this.maxHealth}.`);
      for (const ability of this.cls.abilitiesUnlockedAt(this.level)) {
        logs.push(`  New ability: ${ability.name} — ${ability.description}`);
        if (ability.onLevelUp) ability.onLevelUp(this);
      }
    }
    return logs;
  }

  useAbility(abilityId, target, game) {
    const ability = this.abilities.find(a => a.id === abilityId);
    if (!ability) return { log: `${this.name} doesn't know that ability yet.` };
    if (ability.type !== 'active') return { log: `${ability.name} is passive and triggers automatically.` };
    if (this.resource < ability.resourceCost) {
      return { log: `Not enough ${this.cls.resourceName.toLowerCase()} to use ${ability.name}.` };
    }
    this.resource -= ability.resourceCost;
    return ability.use(this, target, game);
  }
}
