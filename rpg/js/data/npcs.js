// NPCs are pure data, keyed by location. An NPC can:
//  - offer a quest (npc.quests: [questId]) — surfaced as an accept/decline choice in conversation
//  - receive turn-ins for any quest whose turnInNpc/giver matches this npc's id
//  - have idleLines: a small pool of flavor lines that rotate on repeat "talk"s once there's
//    no quest business left to conduct
//  - have a full custom dialogue tree (npc.dialogue), for actual branching conversations —
//    see village_elder below. Nodes are keyed by id, starting at 'start'. Each node has:
//      text: string or array of strings (printed in order)
//      options: [{ label, next, startsQuest, linkedQuest, action }]
//        - next: id of the node to jump to when chosen
//        - startsQuest: quest id to start; grants its startItem and prints its acceptText
//        - linkedQuest: hide this option once that quest has been started/completed
//          (implied automatically for options that use startsQuest)
//        - action: 'end' or 'decline' — ends the conversation
//  If an npc has no dialogue tree but does have a quest to offer, one gets built for it
//  automatically (a simple accept/decline). Nothing else needs to change to add an NPC.
export const NPCS = {
  old_hunter: {
    id: 'old_hunter', name: 'Old Hunter', location: 'crossroads',
    greeting: "Heading into the forest? Do me a favor — this letter needs to reach the merchant in Millbrook. My knees aren't what they used to be.",
    quests: ['sealed_letter'],
    idleLines: [
      "Watch yourself in the forest. Something's been rustling in there.",
      "Merchant get that letter yet, I wonder.",
      "Good hunting to you."
    ]
  },
  merchant: {
    id: 'merchant', name: 'Traveling Merchant', location: 'village',
    greeting: "Welcome, welcome. Buying, selling, or just here to chat?",
    idleLines: [
      "Prices are fair, I promise. Mostly.",
      "You look like you could use a potion or two.",
      "Business is slow. Present company excepted."
    ]
  },
  village_elder: {
    id: 'village_elder', name: 'Village Elder', location: 'village',
    greeting: "There's a troll denned up in the cave north of the forest. It's killed three of our hunting dogs.",
    quests: ['troll_slayer'],
    dialogue: {
      start: {
        text: [
          'A tired-looking woman looks up from the well.',
          '"There\'s a troll denned up in the cave north of the forest. It\'s killed three of our hunting dogs already."'
        ],
        options: [
          { label: 'Tell me more about the troll.', next: 'lore_troll' },
          { label: "I'll deal with it.", startsQuest: 'troll_slayer' },
          { label: 'Not my problem.', linkedQuest: 'troll_slayer', action: 'decline' },
          { label: 'Just passing through.', action: 'end' }
        ]
      },
      lore_troll: {
        text: '"Big brute, dens up past the cave mouth, in the depths below. Not much for tactics, but it hits like a falling tree. Bring back something of its I\'ll believe."',
        options: [
          { label: "I'll deal with it.", startsQuest: 'troll_slayer' },
          { label: 'Back.', next: 'start' },
          { label: 'Leave.', action: 'end' }
        ]
      }
    }
  }
};
