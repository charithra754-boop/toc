// Pumping lemma toy: for language {a^n b^n} show decomposition and pump candidates
export function pumpingDemo(){
  const s = 'aaabbb'
  return {
    string: s,
    explanation: 'For L = { a^n b^n }, choose string s = a^3 b^3. Pumping lemma states s = uvwxy with |vwx|<=p and |vx|>0. For any i, u v^i w x^i y should be in L. Demonstration: choose v="a" and x="b" leads to mismatch when pumped.'
  }
}
