// Combat.js — deliberately simple turn-based combat, just enough to make
// KILL-type quest objectives (and abilities that deal damage) meaningful.
// Swap this out for something richer without touching the rest of the engine.

export class Enemy {
  constructor({ id, name, health, damage, xpReward = 0, goldReward = 0, loot = [] }) {
    this.id = id;
    this.name = name;
    this.maxHealth = health;
    this.health = health;
    this.damage = damage;
    this.xpReward = xpReward;
    this.goldReward = goldReward;
    this.loot = loot; // [{item, qty}]
  }

  isAlive() {
    return this.health > 0;
  }
}

/**
 * Resolves a full fight between `character` and a fresh copy of `enemyTemplate`.
 * Returns { logs, victory }. Very simple: character attacks (using the given
 * ability if provided, else a flat basic attack), then enemy attacks back,
 * repeat until someone drops.
 */
export function resolveFight(character, enemyTemplate, game, abilityId = null) {
  const enemy = new Enemy(enemyTemplate);
  const logs = [`A ${enemy.name} blocks your way! (${enemy.health} HP)`];
  let round = 1;
  while (enemy.isAlive() && character.isAlive() && round <= 30) {
    // player turn
    if (abilityId) {
      const result = character.useAbility(abilityId, enemy, game);
      if (result.log) logs.push(result.log);
      if (result.damage) enemy.health = Math.max(0, enemy.health - result.damage);
    } else {
      const dmg = 3 + character.level; // flat basic attack, scales gently with level
      enemy.health = Math.max(0, enemy.health - dmg);
      logs.push(`${character.name} strikes the ${enemy.name} for ${dmg}.`);
    }
    if (!enemy.isAlive()) break;
    // enemy turn
    character.takeDamage(enemy.damage);
    logs.push(`The ${enemy.name} hits back for ${enemy.damage}. (${character.health}/${character.maxHealth} HP)`);
    round += 1;
  }

  const victory = !enemy.isAlive();
  if (victory) {
    logs.push(`The ${enemy.name} is defeated!`);
    if (enemy.xpReward) logs.push(...character.gainXP(enemy.xpReward));
  } else if (!character.isAlive()) {
    logs.push(`${character.name} has fallen! (this demo doesn't implement death/respawn — heal up and keep going)`);
  }
  return { logs, victory, enemy };
}
