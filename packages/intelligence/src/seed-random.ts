/** Deterministic FNV-1a hash → stable pseudo-randomness for reproducible demos. */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
export function unit(seed: string): number {
  return hash32(seed) / 0xffffffff;
}
