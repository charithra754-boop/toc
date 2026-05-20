export function tokenize(text){
  if(!text) return []
  const rules = [
    {type:'NUMBER', re:/^\d+(?:am|pm)?/i},
    {type:'TIME', re:/^\d{1,2}:\d{2}(?:am|pm)?/i},
    {type:'KEYWORD', re:/^\b(remind|set|alarm|at|to|buy|me)\b/i},
    {type:'WORD', re:/^[A-Za-z]+(?:'[A-Za-z]+)?/},
    {type:'WS', re:/^\s+/}
  ]
  let s = text.trim()
  const out = []
  while(s.length){
    let matched = false
    for(const r of rules){
      const m = s.match(r.re)
      if(m){
        matched = true
        if(r.type!=='WS') out.push({type:r.type, value:m[0]})
        s = s.slice(m[0].length)
        break
      }
    }
    if(!matched){
      // unknown char - consume 1
      out.push({type:'SYMBOL', value:s[0]})
      s = s.slice(1)
    }
  }
  return out
}
