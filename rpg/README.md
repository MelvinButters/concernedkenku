# Text CRPG

A graphicless, turn-based text CRPG. Pure HTML/CSS/JS (ES modules), no build step, no dependencies — runs directly in a browser and hosts for free on GitHub Pages.

## Play locally

**You must serve this folder over `http://`, not open `index.html` directly.** The game is built from ES modules (`import`/`export` across files), and browsers block ES module imports under the `file://` protocol as a security measure — if you double-click `index.html`, the page loads but the script silently fails, so you'll just see an empty screen.

Pick any of these:

```bash
# Option A — Python (usually preinstalled on Mac/Linux)
python3 -m http.server 8000

# Option B — Node, no install needed
npx serve

# Option C — VS Code
# Install the "Live Server" extension, right-click index.html, "Open with Live Server"
```

Then open the URL it prints (typically `http://localhost:8000`). You should see "What is your name?" appear — that means it's working.

## Host on GitHub Pages

GitHub Pages serves your repo over `https://`, so it sidesteps the `file://` problem above entirely — once it's deployed there, it just works, no server setup needed on your end.

1. **Create a repo and push this folder's contents to it.** `index.html`, `style.css`, and the `js/` folder should sit at the root of the repo (or inside a `/docs` folder if you'd rather keep them out of the root — either works, you'll just pick the matching option in step 3).
2. **Go to Settings → Pages** in your repo.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch," then pick your branch (usually `main`) and the folder (`/root` or `/docs`, matching step 1). Save.
4. GitHub builds and deploys the site — this usually takes under a minute. Refresh the Pages settings page and it'll show you the live URL, something like:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```
5. Every time you push a change to that branch, GitHub redeploys automatically — no build step, no CI config needed, since it's just static HTML/CSS/JS.

**If it's still blank once live:** open the browser console (F12 → Console) and check for a 404 on `js/main.js` — that usually means the repo/folder structure doesn't match what you picked in step 3 (e.g. files pushed under a subfolder but Pages set to `/root`).

## How to play

Type commands into the box at the bottom (or tap the suggestion chips).

**Exploring:** `look`, `go north` (or `n`/`s`/`e`/`w`), `inventory`, `stats`, `rest` (safe locations only), `use <item>`, `talk <name>`, `give <item> [to <name>]`, `quests`, `shop` / `buy <item>` / `sell <item>` (in the village), `save`, `load`, `help`.

**Conversations:** talking to an npc with something to say opens a numbered menu — type a number (or tap the chip) to pick a response, or type "leave" to end it anytime.

**Combat:** `attack`, `cast <ability name or number>`, `use <item>`, `flee`, `help`.

## Project structure

```
index.html          shell + layout
style.css            terminal styling
js/
  main.js            state machine, DOM rendering, save/load
  engine/
    character.js      Player class: stats, leveling, inventory
    combat.js          turn resolution for player/monster fights
    world.js           location graph, movement, encounter rolls
    parser.js          turns raw input into {verb, args}
    quests.js          npc lookup, conversation-tree logic, turn-in logic
  data/
    classes.js         the 4 playable classes
    abilities.js        every ability, shared by all classes
    monsters.js          every monster — pure data, no subclassing
    locations.js          the map: nodes + exits (Zork-style)
    items.js               potions, equipment, junk, and quest items
    npcs.js                 who's where, what they say, what they offer
    quests.js                requirements, giver/turn-in npc, rewards
```

## Adding content

Everything is data-driven, so most additions don't touch engine code:

- **New monster:** add an entry to `js/data/monsters.js` with `hp`, `atk`, `def`, `xp`, `gold`, an `attacks` list, and optional `loot`. Reference its id from a location's `encounters` array (random fight) or set it as a location's `boss` (fixed fight, can block an exit via `guardsExit`).
- **New class:** add an entry to `js/data/classes.js` with base stats, per-level growth, and an `abilities` list of `{id, level}` pairs — `level` is when that ability unlocks (the ability at level 1 is what the player starts with).
- **New ability:** add an entry to `js/data/abilities.js`. Supported `type`s: `damage`, `multiHit`, `heal`, `buffAtk`, `buffDef`. Give it an id and reference that id from a class's `abilities` list.
- **New location:** add an entry to `js/data/locations.js` with `exits`, and optionally `encounters`, `items`, `safe`, `shop`, or `boss`/`guardsExit`.
- **New item:** add an entry to `js/data/items.js` (`consumable`, `equip`, `junk`, or `quest`). Quest items have no `price` and can't be bought or sold.
- **New NPC:** add an entry to `js/data/npcs.js` with a `location` and `greeting`.
  - Give it `idleLines: [...]` — a small pool of flavor lines that rotate each time you `talk` to it once there's nothing else going on.
  - Give it `quests: [questId]` to have it offer a quest. With no custom `dialogue`, talking to it auto-generates a simple "Accept: <quest name> / Not right now." choice.
  - Give it a full `dialogue` tree for real branching conversations — nodes keyed by id (starting at `'start'`), each with `text` (string or array of lines) and `options` (`{ label, next, startsQuest, linkedQuest, action }`). See `village_elder` for a working example with a lore digression, accept/decline, and a "come back to this later" path. An option's `startsQuest` (or `linkedQuest`) makes it disappear once that quest is started or completed.
- **New quest:** add an entry to `js/data/quests.js`:
  - `giver` — npc id that hands it out (must list the quest id in its own `quests` array)
  - `turnInNpc` — npc id who receives the goods; omit if it's the same as `giver`
  - `requires` — `[{ item, qty }]`, checked against inventory to allow turn-in
  - `startItem` (optional) — an item granted immediately on accept, for "carry this to someone" delivery quests. Leave it out for "go kill/find something" quests — put the required item in a monster's `loot` (see `cave_troll` → `troll_club` for an example) or a location's `items` drop instead.
  - `rewards: { xp, gold, items: [{item, qty}] }`
  - Turning in is via `give <item>` (auto-finds the right npc in the current location) or `give <item> to <npc name>` if more than one npc could want it.

## Notes / known limits

This is a solid starting skeleton, not a finished game — a few things worth knowing if you extend it:
- Save/load uses `localStorage`, keyed per-browser (not per-save-slot).
- Combat is one monster at a time, no party members yet.
- Status effects are limited to flat attack/defense buffs with a turn counter — no DOTs/stuns yet, though `combat.js` is a natural place to add them.
- There's a light client-side "boss gate" pattern (`ruins_gate` blocks east until the golem is defeated) if you want more quest-gating like that.
- Quests are single-stage: active → complete on turn-in. No multi-step quest chains, no "quest failed" state — `engine/quests.js` is the natural place to extend that if you want it.
- Conversations are a simple node graph, no memory beyond the current session's quest state — an npc won't remember it already told you the troll lore, for instance, only whether a quest has been started/completed.
- `talk` with no argument talks to whichever npc is first in a location's data — name the npc explicitly if there's more than one somewhere.
