const VERB_ALIASES = {
  go: 'go', move: 'go', walk: 'go',
  north: 'go north', south: 'go south', east: 'go east', west: 'go west',
  n: 'go north', s: 'go south', e: 'go east', w: 'go west',
  look: 'look', l: 'look',
  inventory: 'inventory', inv: 'inventory', i: 'inventory',
  stats: 'stats', character: 'stats', sheet: 'stats',
  attack: 'attack', a: 'attack', hit: 'attack',
  cast: 'cast', ability: 'cast', use: 'use',
  flee: 'flee', run: 'flee',
  rest: 'rest', sleep: 'rest',
  take: 'take', get: 'take', pickup: 'take',
  shop: 'shop', buy: 'buy', sell: 'sell',
  help: 'help', '?': 'help',
  save: 'save', load: 'load'
};

// Returns { verb, args: [] } — 'verb' is normalized (may itself contain a direction e.g. "go north")
export function parseCommand(raw) {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return { verb: '', args: [] };
  const parts = trimmed.split(/\s+/);
  const first = parts[0];

  const normalized = VERB_ALIASES[first];
  if (!normalized) return { verb: first, args: parts.slice(1) };

  if (normalized.startsWith('go ')) {
    return { verb: 'go', args: [normalized.split(' ')[1]] };
  }
  if (normalized === 'go') {
    return { verb: 'go', args: parts.slice(1) };
  }
  return { verb: normalized, args: parts.slice(1) };
}
