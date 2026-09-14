// Quest.js — quest types, objective tracking, and a manager that listens
// for game events (item picked up, location visited, NPC talked to, enemy
// defeated) and advances the right objectives automatically.

export const QuestType = {
  FETCH: 'fetch',       // bring N of an item back
  KILL: 'kill',         // defeat N of an enemy/target
  EXPLORE: 'explore',   // visit a location
  DELIVERY: 'delivery', // carry an item to a specific NPC
  TALK: 'talk',         // speak to an NPC (e.g. to learn something)
};

export class Objective {
  constructor({ id, description, type, target, count = 1 }) {
    this.id = id;
    this.description = description;
    this.type = type;     // one of QuestType
    this.target = target; // itemId / enemyId / locationId / npcId depending on type
    this.required = count;
    this.progress = 0;
  }

  get isComplete() {
    return this.progress >= this.required;
  }

  advance(amount = 1) {
    this.progress = Math.min(this.required, this.progress + amount);
  }

  describe() {
    const box = this.isComplete ? '[x]' : '[ ]';
    const counter = this.required > 1 ? ` (${this.progress}/${this.required})` : '';
    return `${box} ${this.description}${counter}`;
  }
}

export class Quest {
  constructor({ id, title, description, giver = null, objectives = [], rewards = {} }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.giver = giver; // npc id, optional
    this.objectives = objectives; // Objective[]
    this.rewards = { xp: 0, gold: 0, items: [], ...rewards }; // items: [{itemId, qty}]
    this.status = 'unstarted'; // unstarted | active | complete | turnedin
  }

  get isComplete() {
    return this.objectives.every(o => o.isComplete);
  }

  describe() {
    return this.objectives.map(o => o.describe()).join('\n');
  }
}

/**
 * QuestManager owns quest instances and reacts to game events.
 * Wire it up once with `manager.bind(game)`; after that, calling
 * game.emit('itemObtained', {itemId, qty}) etc. keeps quests in sync.
 */
export class QuestManager {
  constructor(questDefs) {
    // questDefs: array of factory functions () => new Quest({...})
    // stored as fresh instances so re-starting a game gives clean state
    this.templates = new Map(questDefs.map(make => {
      const q = make();
      return [q.id, make];
    }));
    this.quests = new Map(); // id -> Quest instance (only once started)
  }

  /**
   * Starts a quest. If an `inventory` is passed, FETCH objectives are
   * immediately credited for matching items the player already holds —
   * without this, picking up quest items *before* accepting the quest
   * would silently not count, which feels like a bug to a player.
   */
  start(id, inventory = null) {
    if (this.quests.has(id)) return this.quests.get(id);
    const make = this.templates.get(id);
    if (!make) return null;
    const quest = make();
    quest.status = 'active';
    if (inventory) {
      for (const obj of quest.objectives) {
        if (obj.type === QuestType.FETCH) obj.advance(inventory.countOf(obj.target));
      }
    }
    if (quest.isComplete) quest.status = 'complete';
    this.quests.set(id, quest);
    return quest;
  }

  get(id) {
    return this.quests.get(id) || null;
  }

  active() {
    return [...this.quests.values()].filter(q => q.status === 'active');
  }

  completed() {
    return [...this.quests.values()].filter(q => q.status === 'complete' || q.status === 'turnedin');
  }

  /** Call after collecting rewards to lock the quest in as finished. */
  turnIn(id, character, inventory) {
    const quest = this.quests.get(id);
    if (!quest || !quest.isComplete) return null;
    quest.status = 'turnedin';
    const logs = [`Quest complete: ${quest.title}!`];
    if (quest.rewards.xp) logs.push(...character.gainXP(quest.rewards.xp));
    if (quest.rewards.gold) {
      inventory.gold += quest.rewards.gold;
      logs.push(`You receive ${quest.rewards.gold} gold.`);
    }
    for (const { item, qty = 1 } of quest.rewards.items) {
      inventory.add(item, qty);
      logs.push(`You receive ${qty}x ${item.name}.`);
    }
    return logs;
  }

  // --- event handlers, call these from Game whenever something happens ---

  _forEachActiveObjective(type, cb) {
    const logs = [];
    for (const quest of this.active()) {
      for (const obj of quest.objectives) {
        if (obj.type === type && !obj.isComplete) cb(obj, quest, logs);
      }
      if (quest.isComplete && quest.status === 'active') {
        quest.status = 'complete';
        logs.push(`✦ Objectives complete for "${quest.title}" — return to turn it in.`);
      }
    }
    return logs;
  }

  onItemObtained(itemId, qty = 1) {
    return this._forEachActiveObjective(QuestType.FETCH, (obj, quest, logs) => {
      if (obj.target === itemId) {
        obj.advance(qty);
        logs.push(`Quest "${quest.title}": ${obj.describe()}`);
      }
    });
  }

  onLocationVisited(locationId) {
    return this._forEachActiveObjective(QuestType.EXPLORE, (obj, quest, logs) => {
      if (obj.target === locationId) {
        obj.advance(1);
        logs.push(`Quest "${quest.title}": ${obj.describe()}`);
      }
    });
  }

  onNPCTalked(npcId) {
    return this._forEachActiveObjective(QuestType.TALK, (obj, quest, logs) => {
      if (obj.target === npcId) {
        obj.advance(1);
        logs.push(`Quest "${quest.title}": ${obj.describe()}`);
      }
    });
  }

  onEnemyDefeated(enemyId) {
    return this._forEachActiveObjective(QuestType.KILL, (obj, quest, logs) => {
      if (obj.target === enemyId) {
        obj.advance(1);
        logs.push(`Quest "${quest.title}": ${obj.describe()}`);
      }
    });
  }

  /** Delivery objectives are advanced manually (usually from a dialogue option). */
  onDelivery(npcId, itemId, inventory) {
    return this._forEachActiveObjective(QuestType.DELIVERY, (obj, quest, logs) => {
      if (obj.target === npcId && inventory.has(itemId)) {
        inventory.remove(itemId, 1);
        obj.advance(1);
        logs.push(`Quest "${quest.title}": ${obj.describe()}`);
      }
    });
  }
}
