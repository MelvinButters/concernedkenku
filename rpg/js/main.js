import { Character } from './engine/Character.js';
import { Inventory } from './engine/Inventory.js';
import { QuestManager } from './engine/Quest.js';
import { Game } from './engine/Game.js';

import { classes } from './data/classes.js';
import { items } from './data/items.js';
import { npcs } from './data/npcs.js';
import { enemies } from './data/enemies.js';
import { locations } from './data/locations.js';
import { questDefs } from './data/quests.js';

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const nameInput = document.getElementById('hero-name');
const classGrid = document.getElementById('class-grid');
const beginBtn = document.getElementById('begin-btn');
const logEl = document.getElementById('log');
const inputEl = document.getElementById('command-input');
const formEl = document.getElementById('command-form');

let selectedClassId = null;

function renderClassPicker() {
  classGrid.innerHTML = '';
  for (const cls of classes.values()) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'class-card';
    card.dataset.classId = cls.id;
    card.innerHTML = `
      <h3>${cls.name}</h3>
      <p>${cls.description}</p>
      <dl>
        <dt>HP</dt><dd>${cls.baseHealth} +${cls.healthPerLevel}/lvl</dd>
        <dt>${cls.resourceName}</dt><dd>${cls.baseResource} +${cls.resourcePerLevel}/lvl</dd>
      </dl>
      <p class="ability-preview">${cls.abilities[0].name} at lvl 1 → ${cls.abilities[cls.abilities.length - 1].name} at lvl ${cls.abilities[cls.abilities.length - 1].unlockLevel}</p>
    `;
    card.addEventListener('click', () => {
      selectedClassId = cls.id;
      [...classGrid.children].forEach(c => c.classList.toggle('selected', c === card));
      checkReady();
    });
    classGrid.appendChild(card);
  }
}

function checkReady() {
  beginBtn.disabled = !(selectedClassId && nameInput.value.trim());
}

nameInput.addEventListener('input', checkReady);
renderClassPicker();

let game = null;

beginBtn.addEventListener('click', () => {
  const cls = classes.get(selectedClassId);
  const character = new Character({ name: nameInput.value.trim() || 'Hero', cls, level: 1 });
  const inventory = new Inventory({ gold: 10 });
  const questManager = new QuestManager(questDefs);

  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  game = new Game({
    character, inventory,
    locations, npcs, items, enemies,
    questManager,
    startLocationId: 'village_square',
    onLog: appendLog,
    onStateChange: refreshSidebar,
  });

  // Auto-offer the tutorial "talk" quest so all 5 quest types are reachable from the start.
  game.startQuest('meet_blacksmith');
  refreshSidebar();
  inputEl.focus();
});

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = inputEl.value;
  inputEl.value = '';
  if (game) game.handleCommand(value);
});

function appendLog(line) {
  const div = document.createElement('div');
  div.className = 'log-line';
  div.textContent = line;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function refreshSidebar() {
  if (!game) return;
  const c = game.character;

  document.getElementById('sb-name').textContent = `${c.name}`;
  document.getElementById('sb-class-level').textContent = `Level ${c.level} ${c.cls.name}`;

  const hpPct = Math.max(0, Math.round((c.health / c.maxHealth) * 100));
  document.getElementById('sb-hp-fill').style.width = hpPct + '%';
  document.getElementById('sb-hp-text').textContent = `${c.health}/${c.maxHealth} HP`;

  const resourceRow = document.getElementById('sb-resource-row');
  if (c.maxResource > 0) {
    resourceRow.classList.remove('hidden');
    const rPct = Math.max(0, Math.round((c.resource / c.maxResource) * 100));
    document.getElementById('sb-resource-fill').style.width = rPct + '%';
    document.getElementById('sb-resource-text').textContent = `${c.resource}/${c.maxResource} ${c.cls.resourceName}`;
  } else {
    resourceRow.classList.add('hidden');
  }

  const xpPct = c.xpToNext ? Math.round((c.xp / c.xpToNext) * 100) : 100;
  document.getElementById('sb-xp-fill').style.width = xpPct + '%';
  document.getElementById('sb-xp-text').textContent = c.xpToNext ? `${c.xp}/${c.xpToNext} XP` : 'Max level';

  const abilitiesEl = document.getElementById('sb-abilities');
  abilitiesEl.innerHTML = '';
  for (const a of c.abilities) {
    const li = document.createElement('li');
    li.textContent = `${a.name}${a.type === 'active' ? ` (${a.resourceCost})` : ' (passive)'}`;
    li.title = a.description;
    abilitiesEl.appendChild(li);
  }

  const invEl = document.getElementById('sb-inventory');
  invEl.innerHTML = '';
  const goldLi = document.createElement('li');
  goldLi.className = 'gold-line';
  goldLi.textContent = `Gold: ${game.inventory.gold}`;
  invEl.appendChild(goldLi);
  for (const { item, qty } of game.inventory.list()) {
    const li = document.createElement('li');
    li.textContent = `${item.name}${qty > 1 ? ` ×${qty}` : ''}`;
    li.title = item.description;
    invEl.appendChild(li);
  }

  const questsEl = document.getElementById('sb-quests');
  questsEl.innerHTML = '';
  for (const q of game.quests.active()) {
    const wrap = document.createElement('li');
    const title = document.createElement('div');
    title.className = 'quest-title';
    title.textContent = q.title;
    wrap.appendChild(title);
    for (const obj of q.objectives) {
      const objLine = document.createElement('div');
      objLine.className = 'quest-obj' + (obj.isComplete ? ' done' : '');
      objLine.textContent = obj.describe();
      wrap.appendChild(objLine);
    }
    questsEl.appendChild(wrap);
  }
  if (!game.quests.active().length) {
    const li = document.createElement('li');
    li.className = 'quest-empty';
    li.textContent = 'No active quests.';
    questsEl.appendChild(li);
  }

  document.getElementById('sb-location').textContent = game.location.name;
}
