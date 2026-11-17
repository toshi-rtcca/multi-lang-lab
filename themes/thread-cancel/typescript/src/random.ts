// Seeded random duration. JS has no seedable PRNG (Math.random() cannot be seeded),
// so a small hand-written one is used: mulberry32 (32-bit state, good enough for tests).

export const MIN_DURATION_MS = 1000;
export const MAX_DURATION_MS = 5000;

// Returns a generator of floats in [0, 1), deterministic for a given seed.
function mulberry32(seed: number): () => number {
  let state = seed >>> 0; // force an unsigned 32-bit integer
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // divide by 2^32
  };
}

/** Returns a duration in ms within 1000..=5000 (both ends inclusive), deterministic per seed. */
export function pickDuration(seed: number): number {
  const next = mulberry32(seed);
  // next() is in [0, 1), so floor(next() * 4001) is in 0..=4000: +1 makes the top inclusive.
  return MIN_DURATION_MS + Math.floor(next() * (MAX_DURATION_MS - MIN_DURATION_MS + 1));
}
