// Quests are pure data. To add a quest:
//   - give it an id, a giver (npc id who hands it out), and turnInNpc (npc id who receives
//     the goods — omit if it's the same npc as the giver)
//   - requires: [{ item, qty }] — what has to be in your inventory to complete it
//   - startItem (optional): an item id granted immediately on accept — use this for "carry
//     this letter" delivery quests. Leave it out for "go kill/find something" quests, where
//     the required item comes from monster loot or a location's item drop instead.
//   - rewards: { xp, gold, items: [{item, qty}] }
export const QUESTS = {
  sealed_letter: {
    id: 'sealed_letter',
    name: 'A Letter for Millbrook',
    giver: 'old_hunter',
    turnInNpc: 'merchant',
    startItem: 'sealed_letter',
    acceptText: 'He presses a wax-sealed envelope into your hand. "Straight to the merchant, mind. Don\'t go reading it."',
    requires: [{ item: 'sealed_letter', qty: 1 }],
    turnInText: 'The merchant breaks the seal, scans the letter, and nods slowly. "Good. Good. Took you long enough."',
    rewards: { xp: 20, gold: 15, items: [{ item: 'health_potion', qty: 1 }] }
  },
  troll_slayer: {
    id: 'troll_slayer',
    name: 'Proof of the Troll',
    giver: 'village_elder',
    acceptText: '"The cave north of the forest, through the depths. Bring back something of its that I\'ll believe."',
    requires: [{ item: 'troll_club', qty: 1 }],
    turnInText: 'The elder turns the crude club over in her hands, then sets it down with a satisfied grunt. "That thing won\'t be dragging off any more dogs."',
    rewards: { xp: 40, gold: 30, items: [{ item: 'silver_amulet', qty: 1 }] }
  }
};
