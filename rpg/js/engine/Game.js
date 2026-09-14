// Game.js — the glue. Owns game state, parses text commands, and reports
// what happened via callbacks so any front-end (this demo's DOM UI, or your
// own) can render it however it wants.

import { DIRECTION_ALIASES, renderMinimap } from './Location.js';
import { resolveFight } from './Combat.js';

export class Game {
  /**
   * @param {object} opts
   * @param {Character} opts.character
   * @param {Inventory} opts.inventory
   * @param {Map<string, Location>} opts.locations
   * @param {Map<string, NPC>} opts.npcs
   * @param {Map<string, Item>} opts.items
   * @param {QuestManager} opts.questManager
   * @param {string} opts.startLocationId
   * @param {(line:string)=>void} opts.onLog       called for every line of output
   * @param {()=>void} opts.onStateChange           called whenever state changes (for sidebar refresh)
   */
  constructor({ character, inventory, locations, npcs, items, enemies = new Map(), questManager, startLocationId, onLog = () => {}, onStateChange = () => {} }) {
    this.character = character;
    this.inventory = inventory;
    this.locations = locations;
    this.npcs = npcs;
    this.items = items;
    this.enemies = enemies; // id -> enemy template
    this.quests = questManager;
    this.currentLocationId = startLocationId;
    this.currentDialogue = null; // { npc, node } while a conversation is open
    this.flags = new Set();
    this.onLog = onLog;
    this.onStateChange = onStateChange;
    this.log([`Welcome, ${character.name} the level ${character.level} ${character.cls.name}.`, `Type "help" to see what you can do.`]);
    this.enterLocation(startLocationId, true);
  }

  log(lines) {
    const arr = Array.isArray(lines) ? lines : [lines];
    for (const l of arr) if (l) this.onLog(l);
  }

  get location() {
    return this.locations.get(this.currentLocationId);
  }

  // ---------- movement & rooms ----------

  enterLocation(id, silent = false) {
    const loc = this.locations.get(id);
    if (!loc) return;
    this.currentLocationId = id;
    const firstTime = !loc.visited;
    loc.visited = true;
    this.log(`\n— ${loc.name} —`);
    this.log(loc.description);
    if (firstTime && loc.onFirstVisit) this.log(loc.onFirstVisit(this));
    const questLogs = this.quests.onLocationVisited(id);
    this.log(questLogs);
    this.onStateChange();
  }

  move(direction) {
    const dir = DIRECTION_ALIASES[direction] || direction;
    const loc = this.location;
    const nextId = loc.exits[dir];
    if (!nextId) {
      this.log(`You can't go ${dir} from here.`);
      return;
    }
    this.enterLocation(nextId);
  }

  look() {
    const loc = this.location;
    this.log(loc.look);
    if (loc.items.length) {
      const names = loc.items.map(id => this.items.get(id)?.name || id).join(', ');
      this.log(`You notice: ${names}.`);
    }
    if (loc.npcs.length) {
      const names = loc.npcs.map(id => this.npcs.get(id)?.name || id).join(', ');
      this.log(`Also here: ${names}.`);
    }
    if (loc.enemies.length) {
      const names = loc.enemies.map(id => this.enemies.get(id)?.name || id).join(', ');
      this.log(`Danger: ${names}.`);
    }
    if (loc.exitList().length) {
      this.log(`Exits: ${loc.exitList().map(([d]) => d).join(', ')}.`);
    }
  }

  // ---------- combat ----------

  rest() {
    const loc = this.location;
    if (loc.enemies.length) {
      this.log(`You can't rest with danger nearby (${loc.enemies.map(id => this.enemies.get(id)?.name).join(', ')}).`);
      return;
    }
    this.character.health = this.character.maxHealth;
    this.character.resource = this.character.maxResource;
    this.log(`${this.character.name} rests and recovers fully.`);
    this.onStateChange();
  }

  fight(enemyName, abilityName = null) {
    if (!this.character.isAlive()) {
      this.log(`${this.character.name} is too wounded to fight — find somewhere safe and "rest" first.`);
      return;
    }
    const loc = this.location;
    const enemyId = loc.enemies.find(id => this.matchesName(this.enemies.get(id), enemyName));
    if (!enemyId) { this.log(`There's nothing called "${enemyName}" to fight here.`); return; }
    const template = this.enemies.get(enemyId);
    let abilityId = null;
    if (abilityName) {
      const ability = this.character.abilities.find(a => a.name.toLowerCase().includes(abilityName.toLowerCase()));
      if (ability) abilityId = ability.id;
    }
    const { logs, victory, enemy } = resolveFight(this.character, template, this, abilityId);
    this.log(logs);
    if (victory) {
      loc.enemies.splice(loc.enemies.indexOf(enemyId), 1);
      if (enemy.goldReward) { this.inventory.gold += enemy.goldReward; this.log(`You find ${enemy.goldReward} gold.`); }
      for (const { item, qty = 1 } of enemy.loot || []) { this.inventory.add(item, qty); this.log(`You loot ${qty}x ${item.name}.`); }
      this.log(this.quests.onEnemyDefeated(enemyId));
    }
    this.onStateChange();
  }

  // ---------- items ----------

  take(itemName) {
    const loc = this.location;
    const itemId = loc.items.find(id => this.matchesName(this.items.get(id), itemName));
    if (!itemId) {
      this.log(`There's no "${itemName}" here to take.`);
      return;
    }
    loc.items.splice(loc.items.indexOf(itemId), 1);
    this.inventory.add(this.items.get(itemId), 1);
    this.log(`You pick up the ${this.items.get(itemId).name}.`);
    this.log(this.quests.onItemObtained(itemId, 1));
    this.onStateChange();
  }

  useItem(itemName) {
    const entry = this.inventory.list().find(e => this.matchesName(e.item, itemName));
    if (!entry) { this.log(`You aren't carrying "${itemName}".`); return; }
    const result = this.inventory.use(entry.item.id, this.character, this);
    this.log(result.log);
    this.onStateChange();
  }

  equipItem(itemName) {
    const entry = this.inventory.list().find(e => this.matchesName(e.item, itemName));
    if (!entry) { this.log(`You aren't carrying "${itemName}".`); return; }
    const result = this.inventory.equip(entry.item.id);
    this.log(result.log);
    this.onStateChange();
  }

  matchesName(item, query) {
    if (!item) return false;
    return item.name.toLowerCase().includes(query.toLowerCase());
  }

  // ---------- npcs / dialogue ----------

  talkTo(npcName) {
    const loc = this.location;
    const npcId = loc.npcs.find(id => this.matchesName(this.npcs.get(id), npcName) || this.npcs.get(id)?.name.toLowerCase() === npcName.toLowerCase());
    if (!npcId) { this.log(`There's no one called "${npcName}" here.`); return; }
    const npc = this.npcs.get(npcId);
    this.currentDialogue = { npc, node: npc.node(npc.startNode) };
    this.log(this.quests.onNPCTalked(npc.id));
    this.printDialogueNode();
    this.onStateChange();
  }

  printDialogueNode() {
    if (!this.currentDialogue) return;
    const { npc, node } = this.currentDialogue;
    this.log(`\n${npc.name}: "${node.getText(this)}"`);
    const opts = node.visibleOptions(this);
    opts.forEach((o, i) => this.log(`  ${i + 1}) ${o.label}`));
    if (opts.length === 0) this.currentDialogue = null; // dead end, auto-close
  }

  chooseDialogueOption(index) {
    if (!this.currentDialogue) { this.log('You are not in a conversation.'); return; }
    const { node } = this.currentDialogue;
    const opts = node.visibleOptions(this);
    const choice = opts[index - 1];
    if (!choice) { this.log('Not a valid choice.'); return; }
    if (choice.action) this.log(choice.action(this) || []);
    if (choice.next) {
      this.currentDialogue.node = this.currentDialogue.npc.node(choice.next);
      this.printDialogueNode();
    } else {
      this.log(`(conversation ends)`);
      this.currentDialogue = null;
    }
    this.onStateChange();
  }

  // ---------- quests ----------

  startQuest(id) {
    const q = this.quests.start(id, this.inventory);
    if (q) this.log(`\n✦ New quest: ${q.title}\n${q.description}`);
    this.onStateChange();
    return q;
  }

  turnInQuest(id) {
    const logs = this.quests.turnIn(id, this.character, this.inventory);
    if (logs) this.log(logs);
    this.onStateChange();
  }

  // ---------- command parser ----------

  handleCommand(raw) {
    const input = raw.trim();
    if (!input) return;
    this.log(`\n> ${input}`);

    // While mid-conversation, bare numbers pick a dialogue option.
    if (this.currentDialogue && /^\d+$/.test(input)) {
      this.chooseDialogueOption(parseInt(input, 10));
      return;
    }

    const [cmd, ...rest] = input.toLowerCase().split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
        this.log([
          'Commands:',
          '  look                — examine your surroundings',
          '  go <direction>      — move (n/s/e/w/up/down...)',
          '  take <item>         — pick something up',
          '  inventory / i       — show what you\'re carrying',
          '  use <item>          — use/consume an item',
          '  equip <item>        — equip a weapon or armor',
          '  talk <name>         — start a conversation',
          '  fight <name> [with <ability>] — fight an enemy, optionally naming an ability',
          '  <number>            — pick a dialogue option mid-conversation',
          '  status              — show character sheet',
          '  quests              — show your quest log',
          '  map                 — show a minimap',
          '  rest                — fully recover HP/resource (only when no enemies are near)',
        ]);
        break;
      case 'look': case 'l':
        this.look();
        break;
      case 'go': case 'move':
        this.move(rest[0]);
        break;
      case 'north': case 'south': case 'east': case 'west':
      case 'n': case 's': case 'e': case 'w':
      case 'up': case 'down': case 'u': case 'd':
        this.move(cmd);
        break;
      case 'take': case 'get': case 'pickup':
        this.take(arg);
        break;
      case 'inventory': case 'inv': case 'i':
        this.printInventory();
        break;
      case 'use':
        this.useItem(arg);
        break;
      case 'equip': case 'wear': case 'wield':
        this.equipItem(arg);
        break;
      case 'talk': case 'speak':
        this.talkTo(arg.replace(/^to\s+/, ''));
        break;
      case 'fight': case 'attack': {
        const [target, ability] = arg.split(/\s+with\s+/);
        this.fight(target, ability);
        break;
      }
      case 'status': case 'stats': case 'sheet':
        this.printStatus();
        break;
      case 'quests': case 'journal': case 'log':
        this.printQuests();
        break;
      case 'map':
        this.printMap();
        break;
      case 'rest': case 'sleep':
        this.rest();
        break;
      default:
        this.log(`I don't understand "${input}". Type "help" for a list of commands.`);
    }
  }

  printInventory() {
    const entries = this.inventory.list();
    if (!entries.length) { this.log('Your pack is empty.'); return; }
    this.log(`Gold: ${this.inventory.gold}`);
    for (const { item, qty } of entries) {
      this.log(`  ${item.name}${qty > 1 ? ` x${qty}` : ''} — ${item.description}`);
    }
  }

  printStatus() {
    const c = this.character;
    this.log([
      `${c.name} — Level ${c.level} ${c.cls.name}`,
      `HP: ${c.health}/${c.maxHealth}`,
      c.maxResource ? `${c.cls.resourceName}: ${c.resource}/${c.maxResource}` : null,
      `XP: ${c.xp}${c.xpToNext ? `/${c.xpToNext}` : ' (max level)'}`,
      `Abilities: ${c.abilities.map(a => a.name).join(', ') || 'none yet'}`,
    ]);
  }

  printQuests() {
    const active = this.quests.active();
    const done = this.quests.completed();
    if (!active.length && !done.length) { this.log('No quests yet — go talk to someone.'); return; }
    if (active.length) {
      this.log('Active quests:');
      for (const q of active) this.log(`  ${q.title}\n${q.describe().split('\n').map(l => '    ' + l).join('\n')}`);
    }
    if (done.length) {
      this.log('Completed: ' + done.map(q => q.title).join(', '));
    }
  }

  printMap() {
    this.log('\n' + renderMinimap(this.locations, this.currentLocationId) + '\n(@ = here, o = visited, · = unexplored)');
  }
}
