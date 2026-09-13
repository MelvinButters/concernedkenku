import { ABILITIES } from '../data/abilities.js';
import { ITEMS } from '../data/items.js';

function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// One Combat instance manages a single fight: player vs one monster instance.
export class Combat {
  constructor(player, monster) {
    this.player = player;
    this.monster = monster; // instance from createMonsterInstance
    this.over = false;
    this.result = null; // 'victory' | 'defeat' | 'fled'
  }

  monsterAlive() { return this.monster.curHp > 0; }

  monsterDef() {
    const buff = this.monster.buffs.filter(b => b.stat === 'def').reduce((s, b) => s + b.amount, 0);
    return this.monster.def + buff;
  }

  monsterAtk() {
    const buff = this.monster.buffs.filter(b => b.stat === 'atk').reduce((s, b) => s + b.amount, 0);
    return this.monster.atk + buff;
  }

  damageMonster(rawAmount, log, defShred = 0) {
    if (defShred) this.monster.def = Math.max(0, this.monster.def - defShred);
    const dmg = Math.max(1, rawAmount - Math.floor(this.monsterDef() * 0.4));
    this.monster.curHp = Math.max(0, this.monster.curHp - dmg);
    return dmg;
  }

  // --- Player actions. Each returns a log array of strings for this round. ---

  basicAttack() {
    const log = [];
    const dmg = this.damageMonster(roll(this.player.atk - 2, this.player.atk + 3), log);
    log.push(`You strike the ${this.monster.name} for ${dmg} damage.`);
    return this._afterPlayerAction(log);
  }

  useAbility(abilityId) {
    const log = [];
    const ability = ABILITIES[abilityId];
    if (!ability) { log.push(`Unknown ability.`); return { log, over: false }; }
    if (this.player.mp < ability.mpCost) {
      log.push(`Not enough MP for ${ability.name} (needs ${ability.mpCost}, you have ${this.player.mp}).`);
      return { log, over: false, noTurn: true };
    }
    this.player.mp -= ability.mpCost;

    if (ability.type === 'damage') {
      const dmg = this.damageMonster(roll(ability.power - ability.variance, ability.power + ability.variance), log, ability.defShred || 0);
      log.push(`You cast ${ability.name}, hitting the ${this.monster.name} for ${dmg} damage.`);
    } else if (ability.type === 'multiHit') {
      let total = 0;
      for (let i = 0; i < ability.hits; i++) {
        total += this.damageMonster(roll(ability.power - ability.variance, ability.power + ability.variance), log);
      }
      log.push(`You unleash ${ability.name}: ${ability.hits} hits for ${total} total damage.`);
    } else if (ability.type === 'heal') {
      const healed = this.player.heal(roll(ability.power - ability.variance, ability.power + ability.variance));
      log.push(`You cast ${ability.name}, recovering ${healed} HP.`);
    } else if (ability.type === 'buffAtk') {
      this.player.addBuff('atk', ability.amount, ability.duration);
      log.push(`You cast ${ability.name}. Attack rises for ${ability.duration} turns.`);
    } else if (ability.type === 'buffDef') {
      this.player.addBuff('def', ability.amount, ability.duration);
      log.push(`You cast ${ability.name}. Defense rises for ${ability.duration} turns.`);
    }
    return this._afterPlayerAction(log);
  }

  useItem(itemId) {
    const log = [];
    const item = ITEMS[itemId];
    if (!item || !this.player.inventory[itemId]) {
      log.push(`You don't have that.`);
      return { log, over: false, noTurn: true };
    }
    this.player.removeItem(itemId);
    if (item.healHp) {
      const healed = this.player.heal(item.healHp);
      log.push(`You use ${item.name}, recovering ${healed} HP.`);
    }
    if (item.healMp) {
      const restored = this.player.restoreMp(item.healMp);
      log.push(`You use ${item.name}, recovering ${restored} MP.`);
    }
    return this._afterPlayerAction(log);
  }

  attemptFlee() {
    const log = [];
    const chance = this.monster.isBoss ? 0.15 : 0.6;
    if (Math.random() < chance) {
      log.push(`You break away and flee the fight.`);
      this.over = true;
      this.result = 'fled';
      return { log, over: true, result: 'fled' };
    }
    log.push(`You try to flee but can't get clear!`);
    return this._monsterTurn(log);
  }

  _afterPlayerAction(log) {
    if (!this.monsterAlive()) {
      log.push(`The ${this.monster.name} falls.`);
      this.over = true;
      this.result = 'victory';
      return { log, over: true, result: 'victory' };
    }
    return this._monsterTurn(log);
  }

  _monsterTurn(log) {
    this.player.tickBuffs();
    const roll1 = Math.random();
    let acc = 0;
    let chosen = this.monster.attacks[0];
    for (const atk of this.monster.attacks) {
      acc += atk.chance;
      if (roll1 <= acc) { chosen = atk; break; }
    }
    const raw = roll(chosen.minDmg, chosen.maxDmg) + Math.floor(this.monsterAtk() - this.monster.atk);
    const dmg = this.player.takeDamage(raw);
    log.push(`The ${this.monster.name} uses ${chosen.name} for ${dmg} damage.`);

    if (!this.player.isAlive()) {
      log.push(`You have fallen.`);
      this.over = true;
      this.result = 'defeat';
      return { log, over: true, result: 'defeat' };
    }
    return { log, over: false };
  }
}
