# Aldergrove — a DnD-adjacent text adventure framework

A tiny, dependency-free JavaScript framework for text-adventure-style games
with DnD-ish RPG mechanics: classes that level from 1–10, branching NPC
dialogue, four quest types, Zork-style locations with a minimap, and a bare
turn-based combat resolver. Pure static files — no build step, no server.
Drop the folder onto GitHub Pages and it works.

A short demo world ("Aldergrove") is included so you can see everything
working together. Replace the contents of `js/data/*.js` with your own story
and the engine underneath doesn't need to change.

## Run it locally

Any static file server works, e.g.:

```bash
cd dnd-game
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` won't work — ES module imports
require a real HTTP server, even a local one.)

## Deploy to GitHub Pages

1. Push this folder's contents to a GitHub repo (root, or a `/docs` folder).
2. Repo Settings → Pages → set the source branch/folder.
3. Your game is live at `https://<you>.github.io/<repo>/`.
4. To embed on your own site, `<iframe>` that URL, or just copy the whole
   folder into your site and link to `index.html`.

## Project layout

```
index.html            setup screen + game screen markup
css/style.css          all styling (one theme, easy to reskin)
js/main.js              wires the engine to the DOM (the only DOM-aware file)
js/engine/               reusable framework, no DOM dependencies
  Character.js            classes, XP, leveling, abilities
  Inventory.js             items, stacking, equip slots
  Quest.js                 quest types, objectives, QuestManager
  Dialogue.js              NPC + branching dialogue trees
  Location.js              rooms, exits, minimap renderer
  Combat.js                minimal turn-based fight resolver
  Game.js                  command parser + ties everything together
js/data/                 the actual game content — edit/replace this
  classes.js               Warrior / Mage / Rogue, 5 abilities each (lv 1-10)
  items.js                 weapons, armor, consumables, quest items
  enemies.js                combat targets
  npcs.js                  dialogue trees for Elder Maren & Borin
  locations.js              the 7-room demo map
  quests.js                 one example quest of each type
```

Because `js/engine/*` never touches the DOM, you can reuse it in a different
front end (a different HTML layout, a terminal-style CLI, etc.) — swap out
`main.js` and keep the rest.

## Systems

### Character classes & leveling (`engine/Character.js`)

- `CharacterClass` defines base health, health-per-level, a resource pool
  (mana/stamina/energy), and a full list of `Ability` objects tagged with
  the level they unlock at.
- `Character.gainXP(amount)` handles the full level-up loop (can level up
  multiple times from one XP grant), capped at level 10 (`MAX_LEVEL`).
- Abilities can be `active` (cast in combat, costs resource, returns
  `{ log, damage }`) or `passive` (fires once via `onLevelUp` — e.g. a flat
  stat bonus).
- To add a class: copy the shape in `data/classes.js`. Nothing else needs
  to change — the sidebar, combat, and level-up log all read from the class
  definition automatically.

### Inventory (`engine/Inventory.js`)

- `Item` has a `type` (weapon/armor/consumable/quest/misc), an optional
  `equipSlot`, and an optional `onUse(character, game)` for consumables.
- `Inventory` stacks items by id, tracks gold, and has one weapon + one
  armor equip slot (extend `equipped` if you want more slots).

### Quests (`engine/Quest.js`)

Five quest types are implemented and demonstrated:

| Type       | Advances when...                                   |
|------------|-----------------------------------------------------|
| `FETCH`    | player picks up N of a specific item                 |
| `KILL`     | player defeats N of a specific enemy                  |
| `EXPLORE`  | player enters a specific location                      |
| `TALK`     | player talks to a specific NPC                          |
| `DELIVERY` | player hands a specific item to a specific NPC (call `quests.onDelivery(npcId, itemId, inventory)` from a dialogue `action`) |

`QuestManager` listens for game events (`onItemObtained`, `onLocationVisited`,
`onNPCTalked`, `onEnemyDefeated`) and advances every matching active
objective automatically — quest logic never needs to live in your map or
dialogue data. `Game.startQuest(id)` also retroactively credits FETCH
objectives for items the player is already carrying, so quest order doesn't
matter.

To add a quest: add an entry to `data/quests.js`, then reference its id from
an NPC's dialogue `action` (`game.startQuest('my_quest')` /
`game.turnInQuest('my_quest')`).

### NPCs & dialogue (`engine/Dialogue.js`)

Each NPC has a map of `DialogueNode`s. A node has text (string or a function
of the live `Game` state, for dynamic lines) and a list of options, each
with an optional `condition(game)` (hide the option unless true) and
`action(game)` (start/turn in a quest, give an item, set a flag...). See
`data/npcs.js` for a full example, including options that only appear once
a quest reaches a particular status.

### Locations (`engine/Location.js`)

Zork-style rooms: short `description` shown every time you arrive, and a
longer `look` text (extra detail/flavour/hidden options) shown only when the
player explicitly types `look`. Rooms connect via an `exits` map
(`{ north: 'other_room_id' }`), and `coords: {x, y}` feed the `map` command's
ASCII minimap. `onFirstVisit` runs once, the first time a player enters —
handy for one-off flavour text or ambushes.

### Combat (`engine/Combat.js`)

Deliberately minimal: `fight <enemy> [with <ability>]` runs a full,
automatic round-by-round exchange and returns the log plus loot/XP on
victory. It's meant as a starting point — swap in your own initiative order,
status effects, or player choice per round without touching anything else
in the engine.

## Commands (in-game)

```
look                 examine your surroundings (long description + exits)
go <direction>       n/s/e/w/up/down/northeast/...
take <item>          pick something up
inventory / i        show what you're carrying
use <item>           use/consume an item
equip <item>         equip a weapon or armor
talk <name>          start a conversation
<number>             pick a dialogue option mid-conversation
fight <name>         fight an enemy (basic attack)
fight <name> with <ability>   fight using a named ability
status                character sheet
quests                quest log
map                   ASCII minimap
rest                  fully heal (only when no enemies are nearby)
```

## Notes / known simplifications

- Combat has no death/respawn flow — falling to 0 HP just blocks further
  fighting until you `rest` somewhere safe. Wire in your own death handling
  if you want stakes.
- There's one weapon slot and one armor slot; extend `Inventory.equipped`
  for more.
- The demo's enemy stats are illustrative, not balanced — tune `enemies.js`
  to taste.
