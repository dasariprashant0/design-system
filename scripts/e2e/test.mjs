// Tiny test API: test(name, async (p) => {...}, {timeout, skip}). Tests live in tests/*.test.mjs and are
// collected by run.mjs. Assertions throw with a message that says what was expected and what the page did.
export const registry = [];
export const test = (name, fn, opts = {}) => { registry.push({name, fn, ...opts}); };

export const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
export const eq = (actual, expected, msg = 'values differ') => {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`);
};
