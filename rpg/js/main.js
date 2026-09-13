import { CLASSES } from './data/classes.js';
import { ABILITIES } from './data/abilities.js';
import { ITEMS } from './data/items.js';
import { MONSTERS } from './data/monsters.js';
import { QUESTS } from './data/quests.js';
import { Player } from './engine/character.js';
import { Combat } from './engine/combat.js';
import { World } from './engine/world.js';
import { parseCommand } from './engine/parser.js';
import {
  findNpc, npcsAtLocation, tryGiveItem, findNpcForItem,
  questsAwaitingTurnIn, questRequirementsMet, nextIdleLine, getNode, resolveOption
} from './engine/quests.js';

const SAVE_KEY = 'text-crpg-save-v1';

const logEl = document.getElementById('log');
const inputEl = document.getElementById('input');
const formEl = document.getElementById('input-form');
const sidebarEl = document.getElementById('sidebar');
const chipsEl = document.getElementById('chips');

let state = 'intro'; // intro | naming | classpick | explore | combat | dialogue | shop
let player = null;
let world = null;
let combat = null;
let pendingName = null;
let conversation = null; // { npc, node } while state === 'dialogue'

function print(text, cls = '') {
  const div = document.createElement('div');
  div.className = 'entry' + (cls ? ' ' + cls : '');
  div.textContent = text;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function printBlock(text, cls = '') {
  text.split('\n').forEach(line => print(line, cls));
}

function setChips(list) {
  chipsEl.innerHTML = '';
  list.forEach(word => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = word;
    b.addEventListener('click', () => { inputEl.value = word; formEl.requestSubmit(); });
    chipsEl.appendChild(b);
  });
}

function renderSidebar() {
  if (!player) { sidebarEl.innerHTML = ''; return; }
  const hpPct = Math.max(0, Math.round((player.hp / player.maxHp) * 100));
  const mpPct = Math.max(0, Math.round((player.mp / player.maxMp) * 100));
  const invLines = Object.entries(player.inventory)
    .map(([id, qty]) => `${ITEMS[id] ? ITEMS[id].name : id} x${qty}`)
    .join('\n') || '(empty)';

  sidebarEl.innerHTML = `
    <div class="sheet-block">
      <div class="sheet-name">${player.name}</div>
      <div class="sheet-sub">Lvl ${player.level} ${player.className}</div>
    </div>
    <div class="sheet-block">
      <div class="bar-label">HP ${player.hp}/${player.maxHp}</div>
      <div class="bar"><div class="bar-fill hp" style="width:${hpPct}%"></div></div>
      <div class="bar-label">MP ${player.mp}/${player.maxMp}</div>
      <div class="bar"><div class="bar-fill mp" style="width:${mpPct}%"></div></div>
    </div>
    <div class="sheet-block">
      <div class="sheet-sub">ATK ${player.atk}  DEF ${player.def}</div>
      <div class="sheet-sub">XP ${player.xp}/${player.xpToNext}</div>
      <div class="sheet-sub">Gold ${player.gold}</div>
    </div>
    <div class="sheet-block">
      <div class="sheet-sub">Inventory</div>
      <pre class="inv">${invLines}</pre>
    </div>
  `;
}

// ---------- Intro / character creation ----------

function beginIntro() {
  printBlock(
`# Text CRPG

A graphicless adventure. Type commands to play — "look", "go north", "attack", "help".

What is your name?`);
  state = 'naming';
  setChips([]);
}

function beginClassPick() {
  print(`Choose your class:`);
  Object.values(CLASSES).forEach(c => {
    print(`${c.name} — ${c.tagline}`, 'flavor');
  });
  state = 'classpick';
  setChips(Object.keys(CLASSES));
}

function startGame() {
  world = new World('crossroads');
  print(`Welcome, ${player.name} the ${player.className}. Your journey begins at ${world.location.name}.`, 'good');
  printBlock(world.describe());
  state = 'explore';
  setChips(['look', 'inventory', 'stats', 'help']);
  renderSidebar();
}

// ---------- Explore mode ----------

function handleExplore(verb, args) {
  switch (verb) {
    case 'look':
      printBlock(world.describe());
      break;
    case 'go': {
      const res = world.move(args[0] || '');
      if (!res.ok) { print(res.message, 'bad'); break; }
      printBlock(res.message);
      if (res.encounter) {
        startCombat(res.encounter);
      }
      break;
    }
    case 'inventory':
      printInventory();
      break;
    case 'stats':
      printStats();
      break;
    case 'rest':
      if (world.location.safe) {
        player.fullRest();
        print(`You rest. HP and MP fully restored.`, 'good');
        renderSidebar();
      } else {
        print(`It's too dangerous to rest here.`, 'bad');
      }
      break;
    case 'take':
      print(`There's nothing specific to take right now — items turn up after fights and exploring.`);
      break;
    case 'shop':
    case 'buy':
    case 'sell':
      if (world.location.shop) {
        handleShop(verb, args);
      } else {
        print(`There's no shop here.`, 'bad');
      }
      break;
    case 'talk': {
      const npcsHere = npcsAtLocation(world.currentId);
      const npc = args.length ? findNpc(args.join(' '), world.currentId) : npcsHere[0];
      if (!npc) { print(`There's no one here to talk to.`, 'bad'); break; }

      const ready = questsAwaitingTurnIn(npc, player).filter(q => questRequirementsMet(player, q));
      ready.forEach(q => {
        print(`(You have what they need for "${q.name}" — try "give ${ITEMS[q.requires[0].item].name.toLowerCase()}".)`, 'flavor');
      });

      const node = getNode(npc, 'start', player);
      if (node) {
        startConversation(npc, node);
      } else {
        print(`${npc.name}: "${nextIdleLine(npc, player)}"`);
      }
      renderSidebar();
      break;
    }
    case 'give':
      handleGive(args);
      break;
    case 'quests':
      printQuests();
      break;
    case 'use': {
      const itemId = resolveItemArg(args.join(' '));
      if (!itemId || !player.inventory[itemId]) { print(`You don't have that.`, 'bad'); break; }
      const item = ITEMS[itemId];
      player.removeItem(itemId);
      if (item.healHp) print(`You use ${item.name}. Recovered ${player.heal(item.healHp)} HP.`, 'good');
      if (item.healMp) print(`You use ${item.name}. Recovered ${player.restoreMp(item.healMp)} MP.`, 'good');
      renderSidebar();
      break;
    }
    case 'save':
      doSave();
      break;
    case 'load':
      doLoad();
      break;
    case 'help':
      printHelpExplore();
      break;
    default:
      print(`Not sure what you mean. Type "help" for commands.`);
  }
}

function resolveItemArg(arg) {
  if (!arg) return null;
  const direct = Object.keys(ITEMS).find(id =>
    id === arg || id.replace(/_/g, ' ') === arg || ITEMS[id].name.toLowerCase() === arg
  );
  return direct || null;
}

function printInventory() {
  const entries = Object.entries(player.inventory);
  if (!entries.length) { print(`Your bag is empty.`); return; }
  entries.forEach(([id, qty]) => {
    const it = ITEMS[id];
    print(`${it ? it.name : id} x${qty}${it ? ' — ' + it.desc : ''}`);
  });
}

function printStats() {
  print(`${player.name}, Level ${player.level} ${player.className}`);
  print(`HP ${player.hp}/${player.maxHp}   MP ${player.mp}/${player.maxMp}`);
  print(`ATK ${player.atk}   DEF ${player.def}   XP ${player.xp}/${player.xpToNext}   Gold ${player.gold}`);
  print(`Abilities: ${player.abilities.map(a => a.name).join(', ')}`);
  if (player.lockedAbilities.length) {
    print(`Locked: ${player.lockedAbilities.map(a => `${a.name} (lvl ${a.level})`).join(', ')}`, 'flavor');
  }
}

// ---------- Dialogue mode ----------

function startConversation(npc, node) {
  conversation = { npc, node };
  state = 'dialogue';
  renderConversationNode();
}

function renderConversationNode() {
  const { npc, node } = conversation;
  node.text.forEach(line => print(`${npc.name}: ${line}`, 'flavor'));
  node.options.forEach((opt, i) => print(`  ${i + 1}. ${opt.label}`));
  print(`(Type a number, or "leave" to end the conversation.)`, 'flavor');
  setChips([...node.options.map((_, i) => String(i + 1)), 'leave']);
}

function handleDialogueRaw(raw) {
  const trimmed = raw.trim().toLowerCase();
  if (['leave', 'bye', 'exit', 'goodbye'].includes(trimmed)) { endConversation(); return; }
  if (trimmed === 'help') { renderConversationNode(); return; }

  const { npc, node } = conversation;
  let idx = -1;
  if (/^\d+$/.test(trimmed)) {
    idx = parseInt(trimmed, 10) - 1;
  } else {
    idx = node.options.findIndex(o => o.label.toLowerCase() === trimmed || o.label.toLowerCase().includes(trimmed));
  }
  const option = node.options[idx];
  if (!option) { print(`Not sure what you mean. Type a number, or "leave".`, 'bad'); return; }

  const { log, ended, nextNodeId } = resolveOption(option, player);
  log.forEach(line => print(line, 'good'));
  renderSidebar();

  if (ended) { endConversation(); return; }
  const nextNode = getNode(npc, nextNodeId, player);
  if (!nextNode) { endConversation(); return; }
  conversation.node = nextNode;
  renderConversationNode();
}

function endConversation() {
  conversation = null;
  state = 'explore';
  setChips(['look', 'inventory', 'stats', 'help']);
  renderSidebar();
}

function handleGive(args) {
  if (!args.length) { print(`Give what? Try "give sealed letter" or "give sealed letter to old hunter".`); return; }

  const toIdx = args.indexOf('to');
  const itemPhrase = (toIdx !== -1 ? args.slice(0, toIdx) : args).join(' ');
  const npcPhrase = toIdx !== -1 ? args.slice(toIdx + 1).join(' ') : null;

  const itemId = resolveItemArg(itemPhrase);
  if (!itemId || !player.inventory[itemId]) { print(`You don't have that.`, 'bad'); return; }

  const npc = npcPhrase ? findNpc(npcPhrase, world.currentId) : findNpcForItem(player, itemId, world.currentId);
  if (!npc) { print(`No one here wants that.`, 'bad'); return; }

  const result = tryGiveItem(player, itemId, npc);
  if (!result) { print(`${npc.name} has no use for that.`, 'bad'); return; }
  if (result.missing) { print(`You need more ${ITEMS[itemId].name} than that.`, 'bad'); return; }

  result.log.forEach(line => print(line, 'good'));
  result.levelUps.forEach(lvl => {
    print(`You reached level ${lvl.level}!`, 'good');
    lvl.unlocked.forEach(name => print(`New ability unlocked: ${name}!`, 'good'));
  });
  renderSidebar();
}

function printQuests() {
  const entries = Object.entries(player.quests);
  if (!entries.length) { print(`No quests yet. Try talking to people you meet.`); return; }
  entries.forEach(([id, status]) => {
    const q = QUESTS[id];
    if (!q) return;
    print(`${q.name} — ${status}`, status === 'completed' ? 'flavor' : '');
  });
}

function printHelpExplore() {
  printBlock(
`Commands: look | go <north/south/east/west> | inventory | stats | rest | use <item> | talk <name> | give <item> [to <name>] | quests | shop (in villages) | save | load
Talking to someone with something to say opens a conversation — type the number of a choice, or "leave" to end it.`);
}

function handleShop(verb, args) {
  if (verb === 'shop') {
    print(`Merchant's wares:`);
    Object.values(ITEMS).filter(i => i.price).forEach(i => print(`${i.name} — ${i.price}g — ${i.desc}`));
    print(`Type "buy <item>" or "sell <item>".`);
    return;
  }
  const itemId = resolveItemArg(args.join(' '));
  if (verb === 'buy') {
    if (!itemId || !ITEMS[itemId].price) { print(`They don't sell that.`, 'bad'); return; }
    const item = ITEMS[itemId];
    if (player.gold < item.price) { print(`Not enough gold.`, 'bad'); return; }
    player.gold -= item.price;
    player.addItem(itemId);
    print(`Bought ${item.name} for ${item.price}g.`, 'good');
    renderSidebar();
  } else if (verb === 'sell') {
    if (!itemId || !player.inventory[itemId]) { print(`You don't have that.`, 'bad'); return; }
    const item = ITEMS[itemId];
    if (item.type === 'quest') { print(`That's important to someone. You shouldn't sell it.`, 'bad'); return; }
    const price = Math.floor((item.price || 4) / 2);
    player.removeItem(itemId);
    player.gold += price;
    print(`Sold ${item.name} for ${price}g.`, 'good');
    renderSidebar();
  }
}

// ---------- Combat mode ----------

function startCombat(monsterTemplate) {
  const instance = world.newMonsterInstance(monsterTemplate);
  combat = new Combat(player, instance);
  state = 'combat';
  print(`--- A ${monsterTemplate.name} appears! ---`, 'warn');
  printCombatStatus();
  setChips(['attack', 'cast', 'use', 'flee']);
}

function printCombatStatus() {
  print(`${combat.monster.name}: ${combat.monster.curHp}/${combat.monster.hp} HP   |   You: ${player.hp}/${player.maxHp} HP, ${player.mp}/${player.maxMp} MP`);
}

function resolveCombatOutcome(res) {
  res.log.forEach(line => print(line));
  renderSidebar();
  if (res.noTurn) return; // invalid action, no turn consumed, stay in combat
  if (!res.over) { printCombatStatus(); return; }

  if (res.result === 'victory') {
    const m = combat.monster;
    print(`You defeated the ${m.name}! +${m.xp} XP, +${m.gold} gold.`, 'good');
    player.gainXp(m.xp).forEach(lvl => {
      print(`You reached level ${lvl.level}!`, 'good');
      lvl.unlocked.forEach(name => print(`New ability unlocked: ${name}!`, 'good'));
    });
    player.gold += m.gold;
    (m.loot || []).forEach(l => {
      if (Math.random() < l.chance) {
        player.addItem(l.item);
        print(`You found ${ITEMS[l.item] ? ITEMS[l.item].name : l.item}.`, 'good');
      }
    });
    if (m.isBoss || m.isMiniBoss) world.markBossDefeated(m.id);
    if (m.isFinalBoss) {
      printBlock(`\n=== The Lich King crumbles to dust. The ruins fall silent. ===\n=== You have won. Thanks for playing. ===`, 'good');
      state = 'won';
      setChips([]);
      combat = null;
      renderSidebar();
      return;
    }
    combat = null;
    state = 'explore';
    setChips(['look', 'inventory', 'stats', 'help']);
  } else if (res.result === 'defeat') {
    print(`--- You have been defeated. ---`, 'bad');
    print(`Type "restart" to try again.`, 'bad');
    state = 'dead';
    setChips(['restart']);
    combat = null;
  } else if (res.result === 'fled') {
    state = 'explore';
    setChips(['look', 'inventory', 'stats', 'help']);
    combat = null;
  }
  renderSidebar();
}

function handleCombat(verb, args) {
  // Bare number (e.g. "2") after seeing the ability list = pick that ability.
  if (/^\d+$/.test(verb) && args.length === 0) {
    const ability = resolveAbilityArg(verb);
    if (!ability) { print(`No ability numbered ${verb}.`, 'bad'); return; }
    resolveCombatOutcome(combat.useAbility(ability.id));
    return;
  }
  if (verb === 'attack') {
    resolveCombatOutcome(combat.basicAttack());
  } else if (verb === 'cast') {
    if (!args[0]) {
      print(`Cast what? Your abilities:`);
      player.abilities.forEach((a, i) => print(`${i + 1}. ${a.name} (${a.mpCost} MP) — ${a.desc}`));
      return;
    }
    const ability = resolveAbilityArg(args.join(' '));
    if (!ability) { print(`You don't know that ability.`, 'bad'); return; }
    resolveCombatOutcome(combat.useAbility(ability.id));
  } else if (verb === 'use') {
    if (!args[0]) { print(`Use what? Try "use health potion".`); return; }
    const itemId = resolveItemArg(args.join(' '));
    if (!itemId) { print(`You don't have that.`, 'bad'); return; }
    resolveCombatOutcome(combat.useItem(itemId));
  } else if (verb === 'flee') {
    resolveCombatOutcome(combat.attemptFlee());
  } else if (verb === 'stats') {
    printStats();
  } else if (verb === 'help') {
    print(`Combat commands: attack | cast <ability> | use <item> | flee`);
    player.abilities.forEach((a, i) => print(`  ${i + 1}. ${a.name} (${a.mpCost} MP)`));
  } else {
    print(`In combat you can: attack, cast <ability>, use <item>, flee.`);
  }
}

function resolveAbilityArg(arg) {
  const num = parseInt(arg, 10);
  if (!isNaN(num) && player.abilities[num - 1]) return player.abilities[num - 1];
  return player.abilities.find(a => a.id === arg || a.id.replace(/_/g, ' ') === arg || a.name.toLowerCase() === arg) || null;
}

// ---------- Save / load ----------

function doSave() {
  if (!player || !world) { print(`Nothing to save yet.`, 'bad'); return; }
  const data = {
    player: { ...player, buffs: [] },
    worldId: world.currentId,
    defeated: Array.from(world.defeatedBosses)
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  print(`Game saved.`, 'good');
}

function doLoad() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) { print(`No save found.`, 'bad'); return; }
  const data = JSON.parse(raw);
  player = Object.assign(new Player(data.player.name, data.player.classId), data.player);
  player.buffs = [];
  world = new World(data.worldId);
  data.defeated.forEach(id => world.defeatedBosses.add(id));
  state = 'explore';
  print(`Game loaded.`, 'good');
  printBlock(world.describe());
  setChips(['look', 'inventory', 'stats', 'help']);
  renderSidebar();
}

// ---------- Input handling ----------

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = inputEl.value;
  inputEl.value = '';
  if (!raw.trim()) return;
  print('> ' + raw, 'echo');
  handleInput(raw);
});

function handleInput(raw) {
  if (state === 'naming') {
    pendingName = raw.trim().slice(0, 20) || 'Wanderer';
    beginClassPick();
    return;
  }
  if (state === 'classpick') {
    const classId = raw.trim().toLowerCase();
    if (!CLASSES[classId]) { print(`Choose one of: ${Object.keys(CLASSES).join(', ')}`, 'bad'); return; }
    player = new Player(pendingName, classId);
    startGame();
    return;
  }
  if (state === 'dead') {
    if (raw.trim().toLowerCase() === 'restart') {
      logEl.innerHTML = '';
      player = null; world = null; combat = null; pendingName = null; conversation = null;
      beginIntro();
    } else {
      print(`Type "restart" to try again.`);
    }
    return;
  }
  if (state === 'won') {
    print(`The story ends here. Refresh the page to play again.`);
    return;
  }
  if (state === 'dialogue') {
    handleDialogueRaw(raw);
    return;
  }

  const { verb, args } = parseCommand(raw);
  if (!verb) return;

  if (state === 'explore') handleExplore(verb, args);
  else if (state === 'combat') handleCombat(verb, args);
}

beginIntro();
inputEl.focus();
