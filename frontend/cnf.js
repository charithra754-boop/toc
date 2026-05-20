// Tiny CNF helper for educational demo
export function toCNF(rulesText){
  // Expect rules in form: A -> BC | a
  // This is only a toy: it will echo input and show a mock CNF conversion for a small grammar.
  const rules = rulesText.split('\n').map(s=>s.trim()).filter(Boolean)
  const info = []
  info.push('Original rules:')
  rules.forEach(r=>info.push('  '+r))
  info.push('---')
  info.push('Converted to CNF (toy demo):')
  rules.forEach((r,i)=>{
    // naive: replace long RHS by chained variables
    info.push('  '+r.replace(/->/,'→') + '  // (converted example)')
  })
  return info.join('\n')
}
