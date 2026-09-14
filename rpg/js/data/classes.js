// classes.js — three starter classes. Each ability's `use(caster, target, game)`
// returns { log, damage? }; Combat.js reads `.damage` off active abilities.
// To add a class: copy this pattern, spread abilities across levels 1-10.
import { CharacterClass, Ability } from '../engine/Character.js';

export const warrior = new CharacterClass({
  id: 'warrior', name: 'Warrior',
  description: 'High health, strong single-target hits, low reliance on resources.',
  baseHealth: 30, healthPerLevel: 10,
  baseResource: 20, resourcePerLevel: 5, resourceName: 'MP',
  abilities: [
    new Ability({
      id: 'slash', name: 'Slash', unlockLevel: 1, resourceCost: 0,
      description: 'A basic sword strike.',
      use: (c) => { const dmg = 6 + c.level; return { log: `${c.name} slashes for ${dmg}.`, damage: dmg }; },
    }),
    new Ability({
      id: 'shield_bash', name: 'Shield Bash', unlockLevel: 3, resourceCost: 5,
      description: 'Slam your shield into the enemy, dazing them.',
      use: (c) => { const dmg = 4 + c.level; return { log: `${c.name} bashes with their shield for ${dmg}, staggering the foe.`, damage: dmg }; },
    }),
    new Ability({
      id: 'second_wind', name: 'Second Wind', unlockLevel: 5, resourceCost: 10,
      description: 'Grit your teeth and recover on the spot.',
      use: (c) => { c.heal(15); return { log: `${c.name} catches a second wind, healing 15 HP.` }; },
    }),
    new Ability({
      id: 'whirlwind', name: 'Whirlwind', unlockLevel: 7, resourceCost: 15,
      description: 'A sweeping strike with real power behind it.',
      use: (c) => { const dmg = 10 + c.level; return { log: `${c.name} unleashes a whirlwind strike for ${dmg}.`, damage: dmg }; },
    }),
    new Ability({
      id: 'executioners_blow', name: "Executioner's Blow", unlockLevel: 10, resourceCost: 20,
      description: 'A devastating finishing blow.',
      use: (c) => { const dmg = 25 + c.level * 2; return { log: `${c.name} delivers an executioner's blow for ${dmg}!`, damage: dmg }; },
    }),
  ],
});

export const mage = new CharacterClass({
  id: 'mage', name: 'Mage',
  description: 'Low health, high burst damage, entirely resource-dependent.',
  baseHealth: 18, healthPerLevel: 6,
  baseResource: 30, resourcePerLevel: 8, resourceName: 'MP',
  abilities: [
    new Ability({
      id: 'spark', name: 'Spark', unlockLevel: 1, resourceCost: 5,
      description: 'A small bolt of arcane energy.',
      use: (c) => { const dmg = 5 + c.level; return { log: `${c.name} flings a spark for ${dmg}.`, damage: dmg }; },
    }),
    new Ability({
      id: 'frost_bolt', name: 'Frost Bolt', unlockLevel: 3, resourceCost: 8,
      description: 'A freezing bolt that slows the target.',
      use: (c) => { const dmg = 8 + c.level; return { log: `${c.name} launches a frost bolt for ${dmg}, chilling the foe.`, damage: dmg }; },
    }),
    new Ability({
      id: 'arcane_ward', name: 'Arcane Ward', unlockLevel: 5, type: 'passive',
      description: 'Passive: a permanent ward toughens you (+10 max HP).',
      onLevelUp: (c) => { c.maxHealth += 10; c.health += 10; },
    }),
    new Ability({
      id: 'fireball', name: 'Fireball', unlockLevel: 7, resourceCost: 15,
      description: 'A classic. Still works great.',
      use: (c) => { const dmg = 18 + c.level * 2; return { log: `${c.name} hurls a fireball for ${dmg}!`, damage: dmg }; },
    }),
    new Ability({
      id: 'meteor', name: 'Meteor', unlockLevel: 10, resourceCost: 25,
      description: 'Bring down the sky itself.',
      use: (c) => { const dmg = 35 + c.level * 2; return { log: `${c.name} calls down a meteor for ${dmg}!!`, damage: dmg }; },
    }),
  ],
});

export const rogue = new CharacterClass({
  id: 'rogue', name: 'Rogue',
  description: 'Moderate health, cheap fast attacks, big payoff on cooldown abilities.',
  baseHealth: 22, healthPerLevel: 7,
  baseResource: 25, resourcePerLevel: 6, resourceName: 'MP',
  abilities: [
    new Ability({
      id: 'quick_strike', name: 'Quick Strike', unlockLevel: 1, resourceCost: 5,
      description: 'A fast, cheap stab.',
      use: (c) => { const dmg = 7 + c.level; return { log: `${c.name} darts in for a quick strike, ${dmg} damage.`, damage: dmg }; },
    }),
    new Ability({
      id: 'poison_blade', name: 'Poison Blade', unlockLevel: 3, resourceCost: 8,
      description: 'A coated blade that leaves the wound burning.',
      use: (c) => { const dmg = 6 + c.level; return { log: `${c.name} nicks the foe with a poisoned blade for ${dmg}.`, damage: dmg }; },
    }),
    new Ability({
      id: 'evasion', name: 'Evasion', unlockLevel: 5, type: 'passive',
      description: 'Passive: years of practice made you hard to pin down (+10 max HP from sheer reflexes).',
      onLevelUp: (c) => { c.maxHealth += 10; c.health += 10; },
    }),
    new Ability({
      id: 'backstab', name: 'Backstab', unlockLevel: 7, resourceCost: 15,
      description: 'Strike where it counts.',
      use: (c) => { const dmg = 20 + c.level; return { log: `${c.name} slips behind the foe and backstabs for ${dmg}.`, damage: dmg }; },
    }),
    new Ability({
      id: 'assassinate', name: 'Assassinate', unlockLevel: 10, resourceCost: 20,
      description: 'One shot, one opportunity.',
      use: (c) => { const dmg = 30 + c.level * 2; return { log: `${c.name} goes for the kill — ${dmg} damage!`, damage: dmg }; },
    }),
  ],
});

export const classes = new Map([
  [warrior.id, warrior],
  [mage.id, mage],
  [rogue.id, rogue],
]);
