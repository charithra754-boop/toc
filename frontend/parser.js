// Small recursive-descent parser for toy grammar and PDA trace exporter
// Grammar (toy):
// Command -> RemindCommand | SetCommand | Greet
// RemindCommand -> remind me to ACTION at TIME
// SetCommand -> set alarm at TIME
// ACTION -> WORD+

function tokenizeWords(text){
  return text.trim().split(/\s+/).filter(Boolean)
}

export function parse(text){
  const tokens = tokenizeWords(text)
  let pos = 0
  const stackTrace = []

  function peek(){ return tokens[pos] ? tokens[pos].toLowerCase() : null }
  function consume(){ const t = tokens[pos]; pos++; return t }

  // lightweight checks (no stackTrace changes) to detect multiple possible parses
  function checkRemind(){
    let p = 0
    const tk = tokens.map(t=>t.toLowerCase())
    if(tk[p] !== 'remind') return false
    p++
    if(tk[p]==='me') p++
    if(tk[p]==='to') p++
    // must have at least one action token and then 'at' and a time
    if(p>=tk.length) return false
    // find 'at'
    while(p<tk.length && tk[p] !== 'at') p++
    if(p<tk.length && tk[p]==='at' && p+1<tk.length) return true
    return false
  }

  function checkSet(){
    const tk = tokens.map(t=>t.toLowerCase())
    if(tk[0] !== 'set') return false
    // look for 'at' later
    const atIdx = tk.indexOf('at')
    return atIdx>0 && atIdx+1 < tk.length
  }

  function checkGreet(){
    const f = tokens[0] ? tokens[0].toLowerCase() : ''
    return f==='hi' || f==='hello' || f==='hey'
  }

  function parseRemind(){
    const startPos = pos
    stackTrace.push({op:'push', symbol:'Remind', at:pos})
    if(peek()==='remind'){
      consume() // remind
      if(peek()==='me') consume()
      if(peek()==='to') consume()
      // ACTION: collect until 'at'
      stackTrace.push({op:'push', symbol:'ACTION', at:pos})
      const action=[]
      while(peek() && peek()!=='at') action.push(consume())
      stackTrace.push({op:'pop', symbol:'ACTION', at:pos})
      if(peek()==='at'){
        stackTrace.push({op:'push', symbol:'TIME', at:pos})
        consume()
        const time = consume() || ''
        stackTrace.push({op:'pop', symbol:'TIME', at:pos})
        stackTrace.push({op:'pop', symbol:'Remind', at:pos})
        return {type:'RemindCommand', slots:{action:action.join(' '), time}}
      }
    }
    pos = startPos
    return null
  }

  function parseSet(){
    const startPos = pos
    stackTrace.push({op:'push', symbol:'Set', at:pos})
    if(peek()==='set'){
      consume()
      if(peek()==='alarm') consume()
      if(peek()==='at'){
        stackTrace.push({op:'push', symbol:'TIME', at:pos})
        consume()
        const time = consume()||''
        stackTrace.push({op:'pop', symbol:'TIME', at:pos})
        stackTrace.push({op:'pop', symbol:'Set', at:pos})
        return {type:'SetCommand', slots:{time}}
      }
    }
    pos = startPos
    return null
  }

  function parseGreet(){
    if(peek()==='hi'||peek()==='hello'||peek()==='hey'){
      const w=consume(); return {type:'Greet', slots:{word:w}}
    }
    return null
  }

  // detect candidates without mutating stackTrace
  const candidates = []
  if(checkRemind()) candidates.push('Remind')
  if(checkSet()) candidates.push('Set')
  if(checkGreet()) candidates.push('Greet')

  // choose preferred parse order but run full parser to gather stackTrace
  let res = null
  pos = 0
  if(candidates.includes('Remind')) res = parseRemind()
  if(!res){ pos = 0; if(candidates.includes('Set')) res = parseSet() }
  if(!res){ pos = 0; if(candidates.includes('Greet')) res = parseGreet() }
  // fallback: try all
  if(!res){ pos = 0; res = parseRemind() || parseSet() || parseGreet() }

  // For pedagogy, also build simple alternate ASTs for detected candidates
  const variants = candidates.map(c=>{
    if(c==='Remind') return {type:'RemindCommand', slots:{action:'...', time:'...'}}
    if(c==='Set') return {type:'SetCommand', slots:{time:'...'}}
    if(c==='Greet') return {type:'Greet', slots:{word: tokens[0] || ''}}
    return null
  }).filter(Boolean)

  return {ast:res, trace:stackTrace, consumed:pos, tokens, candidates, variants}
}

export function parseAndDraw(text, svg){
  svg.innerHTML = ''
  const r = parse(text)
  if(!r.ast){
    drawTree(svg, {label:'ParseFailed', children:[{label:text}]})
    return {ok:false, candidates:r.candidates, variants:r.variants}
  }
  // build simple tree
  const root = {label:r.ast.type, children:[]}
  const slots = r.ast.slots || {}
  for(const k of Object.keys(slots)) root.children.push({label:k.toUpperCase(), children:[{label:slots[k]}]})
  drawTree(svg, root)
  return {ok:true, trace:r.trace, tokens:r.tokens, candidates:r.candidates, variants:r.variants}
}

function drawTree(svg, node, x=400, y=20, level=0){
  const ns = 'http://www.w3.org/2000/svg'
  const gapX = 180
  const gapY = 60
  const box = document.createElementNS(ns,'g')

  // wrap label into multiple lines (max chars per line)
  const maxChars = 18
  const words = String(node.label || '').split(/\s+/)
  const lines = []
  let cur = ''
  words.forEach(w=>{
    if((cur+' '+w).trim().length <= maxChars) cur = (cur+' '+w).trim()
    else { if(cur) lines.push(cur); cur = w }
  })
  if(cur) lines.push(cur)

  const lineHeight = 16
  const boxHeight = Math.max(28, lines.length * lineHeight + 8)
  const rect = document.createElementNS(ns,'rect')
  rect.setAttribute('x', x-60)
  rect.setAttribute('y', y)
  rect.setAttribute('width', 120)
  rect.setAttribute('height', boxHeight)
  rect.setAttribute('rx',6)
  rect.setAttribute('fill','rgba(255,255,255,0.03)')
  rect.setAttribute('stroke','rgba(255,255,255,0.06)')
  box.appendChild(rect)

  const text = document.createElementNS(ns,'text')
  text.setAttribute('x', x)
  text.setAttribute('y', y + 12)
  text.setAttribute('fill','#e6eef6')
  text.setAttribute('font-size','12')
  text.setAttribute('text-anchor','middle')
  // append tspan lines
  lines.forEach((ln,i)=>{
    const tspan = document.createElementNS(ns,'tspan')
    tspan.setAttribute('x', x)
    tspan.setAttribute('dy', i===0 ? '0' : `${lineHeight}`)
    tspan.textContent = ln
    text.appendChild(tspan)
  })
  box.appendChild(text)
  svg.appendChild(box)

  if(node.children && node.children.length){
    const childY = y + boxHeight + gapY
    const startX = x - ((node.children.length-1)*gapX)/2
    node.children.forEach((c,i)=>{
      const cx = startX + i*gapX
      const line = document.createElementNS(ns,'line')
      line.setAttribute('x1', x)
      line.setAttribute('y1', y + boxHeight)
      line.setAttribute('x2', cx)
      line.setAttribute('y2', childY)
      line.setAttribute('stroke','rgba(200,220,255,0.2)')
      line.setAttribute('stroke-width','1')
      svg.appendChild(line)
      drawTree(svg, c, cx, childY, level+1)
    })
  }
}
// Very small grammar and parser for commands like: remind me to BUY at TIME

export function parseCommand(text){
  const tokens = text.match(/\S+/g) || [];
  let i = 0;
  function peek(){ return tokens[i] ? tokens[i].toLowerCase() : null; }
  function eat(tok){ if(peek()===tok){ i++; return true } return false }

  function parseRemind(){
    const start = i;
    if(eat('remind') || (peek()==='remindme')){
      if(eat('me')){ }
      if(eat('to')){
        // rest until 'at' is action
        const action = [];
        while(peek() && peek() !== 'at') { action.push(tokens[i]); i++; }
        let time = null;
        if(eat('at')){
          if(peek()) { time = tokens[i]; i++; }
        }
        return {type:'Remind', action: action.join(' '), time };
      }
    }
    i = start; return null;
  }

  function parseSet(){
    const start = i;
    if(eat('set')){
      // set alarm at TIME
      if(eat('alarm')){ eat('at'); const time = peek(); if(time) { i++; return {type:'SetAlarm', time}; } }
    }
    i = start; return null;
  }

  const rootStart = i;
  const r = parseRemind() || parseSet();
  if(!r) return null;
  // build simple AST + slots
  const tree = { node: r.type, children: [] };
  if(r.action) tree.children.push({node:'ACTION', value:r.action});
  if(r.time) tree.children.push({node:'TIME', value:r.time});
  const slots = { action: r.action || null, time: r.time || null };
  return { tree, slots };
}

export function renderParseTree(container, tree){
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg'); svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
  const box = document.createElementNS(svgNS,'g'); box.setAttribute('transform','translate(40,40)'); svg.appendChild(box);

  // simple vertical layout
  const root = makeNode(tree.node, 220, 10); box.appendChild(root.g);
  let y = 80;
  tree.children.forEach((c, idx)=>{
    const child = makeNode(c.node + (c.value?`: ${c.value}`:''), 120 + idx*180, y);
    box.appendChild(child.g);
    // connect
    const line = document.createElementNS(svgNS,'line');
    line.setAttribute('x1',220); line.setAttribute('y1',40); line.setAttribute('x2',120+idx*180+60); line.setAttribute('y2',y); line.setAttribute('stroke','rgba(255,255,255,0.06)');
    box.appendChild(line);
  });

  container.appendChild(svg);

  function makeNode(text,x,y){
    const g = document.createElementNS(svgNS,'g'); g.setAttribute('transform',`translate(${x},${y})`);
    const rect = document.createElementNS(svgNS,'rect'); rect.setAttribute('width','120'); rect.setAttribute('height','40'); rect.setAttribute('rx','10'); rect.setAttribute('fill','#051525'); rect.setAttribute('stroke','rgba(255,255,255,0.04)');
    const t = document.createElementNS(svgNS,'text'); t.setAttribute('x','60'); t.setAttribute('y','24'); t.setAttribute('text-anchor','middle'); t.setAttribute('fill','#dff6ff'); t.setAttribute('font-size','12'); t.textContent = text;
    g.appendChild(rect); g.appendChild(t);
    return { g };
  }
}
