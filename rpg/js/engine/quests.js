import { NPCS } from '../data/npcs.js';
import { QUESTS } from '../data/quests.js';
import { ITEMS } from '../data/items.js';

export function npcsAtLocation(locationId) {
  return Object.values(NPCS).filter(n => n.location === locationId);
}

export function findNpc(nameOrId, locationId) {
  const norm = nameOrId.trim().toLowerCase();
  return npcsAtLocation(locationId).find(n =>
    n.id === norm || n.name.toLowerCase() === norm || n.name.toLowerCase().includes(norm)
  ) || null;
}

function turnInTarget(quest) { return quest.turnInNpc || quest.giver; }

function hasRequiredItems(player, quest) {
  return quest.requires.every(r => (player.inventory[r.item] || 0) >= r.qty);
}
export { hasRequiredItems as questRequirementsMet };

// Quests this npc can hand out that the player hasn't started or finished yet.
export function questsOfferedBy(npc, player) {
  return (npc.quests || [])
    .map(id => QUESTS[id])
    .filter(q => !player.quests[q.id]);
}

// Active quests that turn in to this npc (whether or not the player has the goods yet).
export function questsAwaitingTurnIn(npc, player) {
  return Object.values(QUESTS).filter(q => turnInTarget(q) === npc.id && player.quests[q.id] === 'active');
}

// A small pool of rotating flavor lines, for when there's no quest business to conduct.
export function nextIdleLine(npc, player) {
  const pool = (npc.idleLines && npc.idleLines.length) ? npc.idleLines : [npc.greeting];
  const count = player.npcTalkCount[npc.id] || 0;
  player.npcTalkCount[npc.id] = count + 1;
  return pool[count % pool.length];
}

// An option is hidden once its linked quest has been started or completed —
// no point being asked to accept/decline something already resolved.
function optionAvailable(option, player) {
  const qid = option.startsQuest || option.linkedQuest;
  return !qid || !player.questState(qid);
}

function resolveNode(rawNode, player) {
  const options = (rawNode.options || []).filter(o => optionAvailable(o, player));
  if (!options.length) options.push({ label: 'Leave.', action: 'end' });
  return { text: Array.isArray(rawNode.text) ? rawNode.text : [rawNode.text], options };
}

// Auto-generated accept/decline node for npcs that offer a quest but define no custom dialogue.
function buildAutoStartNode(npc, player) {
  const [quest] = questsOfferedBy(npc, player);
  if (!quest) return null;
  return resolveNode({
    text: [`"${npc.greeting}"`],
    options: [
      { label: `Accept: ${quest.name}`, startsQuest: quest.id },
      { label: 'Not right now.', action: 'end' }
    ]
  }, player);
}

// Returns a resolved { text, options } node, or null if there's no branching content —
// callers should fall back to a plain idle/greeting line in that case.
export function getNode(npc, nodeId, player) {
  if (npc.dialogue && npc.dialogue[nodeId]) {
    return resolveNode(npc.dialogue[nodeId], player);
  }
  if (nodeId === 'start') {
    const auto = buildAutoStartNode(npc, player);
    if (auto) return auto;
  }
  return null;
}

// Applies the side effects of picking an option. Returns { log, ended, nextNodeId }.
export function resolveOption(option, player) {
  const log = [];
  let ended = false;

  if (option.startsQuest) {
    const quest = QUESTS[option.startsQuest];
    player.startQuest(quest.id);
    log.push(quest.acceptText);
    if (quest.startItem) {
      player.addItem(quest.startItem);
      log.push(`Received: ${ITEMS[quest.startItem].name}.`);
    }
  }
  if (option.action === 'decline' || option.action === 'end') ended = true;
  if (!option.next) ended = true; // no follow-up node means the conversation ends here

  return { log, ended, nextNodeId: option.next || null };
}


// Find an npc at this location who is waiting on itemId for one of the player's active quests.
export function findNpcForItem(player, itemId, locationId) {
  return npcsAtLocation(locationId).find(npc =>
    Object.values(QUESTS).some(q =>
      turnInTarget(q) === npc.id && player.quests[q.id] === 'active' && q.requires.some(r => r.item === itemId)
    )
  ) || null;
}

// Attempt to hand itemId to npc. Returns:
//   null                     — this npc has no use for that item at all
//   { missing: true, quest } — they want it, but you don't have enough
//   { log, levelUps, quest } — success; quest is now complete
export function tryGiveItem(player, itemId, npc) {
  const quest = Object.values(QUESTS).find(q =>
    turnInTarget(q) === npc.id && player.quests[q.id] === 'active' && q.requires.some(r => r.item === itemId)
  );
  if (!quest) return null;
  if (!hasRequiredItems(player, quest)) return { missing: true, quest };

  quest.requires.forEach(r => player.removeItem(r.item, r.qty));
  player.completeQuest(quest.id);

  const log = [quest.turnInText, `Quest complete: ${quest.name}!`];
  let levelUps = [];
  const rewards = quest.rewards || {};
  if (rewards.gold) { player.gold += rewards.gold; log.push(`+${rewards.gold} gold.`); }
  if (rewards.xp) { levelUps = player.gainXp(rewards.xp); log.push(`+${rewards.xp} XP.`); }
  (rewards.items || []).forEach(it => {
    player.addItem(it.item, it.qty || 1);
    log.push(`Received: ${ITEMS[it.item].name}${it.qty > 1 ? ' x' + it.qty : ''}.`);
  });

  return { log, levelUps, quest };
}
