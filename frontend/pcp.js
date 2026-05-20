// Bounded PCP demo helper
// Given a small set of tile pairs (top, bottom), search for a solution within a max depth
export function solvePCP(pairs, maxDepth=6){
  // pairs: array of {top, bottom}
  const solutions = []
  function dfs(seqTop, seqBottom, path){
    if(seqTop === seqBottom && seqTop.length>0){
      solutions.push(path.slice())
      return true
    }
    if(path.length >= maxDepth) return false
    for(let i=0;i<pairs.length;i++){
      const p = pairs[i]
      const nt = seqTop + p.top
      const nb = seqBottom + p.bottom
      // quick pruning: only continue if one is prefix of the other
      if(nt.startsWith(nb) || nb.startsWith(nt)){
        path.push(i)
        if(dfs(nt, nb, path)) return true
        path.pop()
      }
    }
    return false
  }
  dfs('', '', [])
  return {found: solutions.length>0, solutions}
}

export function demoPCP(){
  // sample classic PCP-like small instance (toy) — not a hard undecidable instance, just illustration
  const pairs = [
    {top:'a', bottom:'ab'},
    {top:'aba', bottom:'a'},
    {top:'b', bottom:'ba'}
  ]
  const res = solvePCP(pairs, 8)
  return {pairs, res}
}
