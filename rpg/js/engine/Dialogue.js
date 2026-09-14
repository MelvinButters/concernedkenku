// Dialogue.js — branching conversation trees for NPCs.
// A DialogueNode has text plus a list of options. Each option can have a
// `condition(state)` guard (hide the option unless true) and an `action(state)`
// side-effect (start a quest, give an item, set a flag, turn in a quest...).
// `state` is the live GameState object passed in from Game.js.

export class DialogueNode {
  constructor({ id, text, options = [] }) {
    this.id = id;
    this.text = text; // string OR (state) => string, for dynamic lines
    this.options = options; // { label, next, condition?, action? }[]
  }

  getText(state) {
    return typeof this.text === 'function' ? this.text(state) : this.text;
  }

  visibleOptions(state) {
    return this.options.filter(o => !o.condition || o.condition(state));
  }
}

export class NPC {
  constructor({ id, name, description, locationId, nodes, startNode = 'start' }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.locationId = locationId;
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.startNode = startNode;
  }

  node(id) {
    return this.nodes.get(id);
  }
}
