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
        // consume any trailing time modifier (am/pm)
        if(peek() && /^(am|pm)$/i.test(peek())) {
          const mod = consume()
          stackTrace.push({op:'pop', symbol:'TIME', at:pos})
          stackTrace.push({op:'pop', symbol:'Remind', at:pos})
          return {type:'RemindCommand', slots:{action:action.join(' '), time: time + ' ' + mod}}
        }
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
        // consume trailing time modifier
        if(peek() && /^(am|pm)$/i.test(peek())) {
          const mod = consume()
          stackTrace.push({op:'pop', symbol:'TIME', at:pos})
          stackTrace.push({op:'pop', symbol:'Set', at:pos})
          return {type:'SetCommand', slots:{time: time + ' ' + mod}}
        }
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

  function parseGeneric(){
    const startPos = pos
    stackTrace.push({op:'push', symbol:'Statement', at:pos})
    
    if (pos < tokens.length) {
      stackTrace.push({op:'push', symbol:'VERB', at:pos})
      const verb = consume()
      stackTrace.push({op:'pop', symbol:'VERB', at:pos})
      
      const prepositions = new Set(['at', 'in', 'to', 'for', 'on', 'with', 'by', 'from', 'about', 'as', 'into', 'like', 'through', 'after', 'before']);
      
      // Collect object words
      const objWords = []
      stackTrace.push({op:'push', symbol:'OBJECT', at:pos})
      while (pos < tokens.length && !prepositions.has(peek())) {
        objWords.push(consume())
      }
      stackTrace.push({op:'pop', symbol:'OBJECT', at:pos})
      
      let prep = null
      let detail = []
      if (pos < tokens.length && prepositions.has(peek())) {
        stackTrace.push({op:'push', symbol:'PREP_PHRASE', at:pos})
        prep = consume()
        while (pos < tokens.length) {
          detail.push(consume())
        }
        stackTrace.push({op:'pop', symbol:'PREP_PHRASE', at:pos})
      }
      
      stackTrace.push({op:'pop', symbol:'Statement', at:pos})
      
      const slots = {}
      if (verb) slots.verb = verb
      if (objWords.length > 0) slots.object = objWords.join(' ')
      if (prep) slots.modifier = prep + (detail.length > 0 ? ' ' + detail.join(' ') : '')
      
      return {type:'GenericCommand', slots}
    }
    
    pos = startPos
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
  // fallback: try all including generic
  if(!res){ pos = 0; res = parseRemind() || parseSet() || parseGreet() || parseGeneric() }

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
    drawTree(svg, {label:'⚠ Parse Failed', children:[{label:`"${text}"`}], role:'error'})
    return {ok:false, candidates:r.candidates, variants:r.variants}
  }
  // build rich tree from AST
  const root = {label: r.ast.type, children:[], role:'root'}
  const slots = r.ast.slots || {}
  for(const k of Object.keys(slots)){
    const slotNode = {label: k.toUpperCase(), role:'nonterminal', children:[]}
    // Split slot value into individual words for leaf nodes
    const words = String(slots[k]).split(/\s+/).filter(Boolean)
    words.forEach(w => {
      slotNode.children.push({label: w, role:'terminal'})
    })
    root.children.push(slotNode)
  }
  drawTree(svg, root)

  // Add grammar rule annotation below the tree
  addGrammarAnnotation(svg, r.ast)

  return {ok:true, trace:r.trace, tokens:r.tokens, candidates:r.candidates, variants:r.variants}
}

// Colour palette for tree nodes by role
const TREE_COLOURS = {
  root:        { fill: '#e0f2fe', stroke: '#4f6ef7', text: '#0369a1' },
  nonterminal: { fill: '#ede9fe', stroke: '#7c5cfc', text: '#5b21b6' },
  terminal:    { fill: '#d1fae5', stroke: '#22c55e', text: '#065f46' },
  error:       { fill: '#fee2e2', stroke: '#ef4444', text: '#991b1b' }
}

export function drawTree(svg, node, x, y, level){
  const ns = 'http://www.w3.org/2000/svg'

  // First pass: compute layout (width of each subtree)
  function computeWidth(n) {
    if (!n.children || n.children.length === 0) return 120
    let total = 0
    n.children.forEach(c => { total += computeWidth(c) })
    return Math.max(120, total)
  }

  // If called at top-level, do layout pass first
  if (x === undefined) {
    const totalWidth = computeWidth(node)
    const startX = totalWidth / 2
    // Update viewBox to fit
    const estimatedHeight = countDepth(node) * 90 + 120
    svg.setAttribute('viewBox', `0 0 ${Math.max(totalWidth + 40, 400)} ${estimatedHeight}`)
    drawTreeNode(svg, ns, node, startX, 30, 0, totalWidth)
    return
  }
}

function countDepth(node) {
  if (!node.children || node.children.length === 0) return 1
  return 1 + Math.max(...node.children.map(countDepth))
}

function drawTreeNode(svg, ns, node, x, y, level, availWidth) {
  const gapY = 80
  const colors = TREE_COLOURS[node.role] || TREE_COLOURS.nonterminal
  const isLeaf = !node.children || node.children.length === 0

  const g = document.createElementNS(ns, 'g')
  g.style.opacity = '0'
  g.style.animation = `nodeAppear 0.4s ease ${level * 0.12}s forwards`

  // Node shape: rounded rect for non-terminals, pill for terminals
  const labelText = String(node.label || '')
  const textWidth = Math.max(60, labelText.length * 8 + 24)
  const boxHeight = isLeaf ? 28 : 32
  const rx = isLeaf ? 14 : 8

  const rect = document.createElementNS(ns, 'rect')
  rect.setAttribute('x', x - textWidth / 2)
  rect.setAttribute('y', y)
  rect.setAttribute('width', textWidth)
  rect.setAttribute('height', boxHeight)
  rect.setAttribute('rx', rx)
  rect.setAttribute('fill', colors.fill)
  rect.setAttribute('stroke', colors.stroke)
  rect.setAttribute('stroke-width', level === 0 ? '2' : '1.5')
  g.appendChild(rect)

  // Label
  const text = document.createElementNS(ns, 'text')
  text.setAttribute('x', x)
  text.setAttribute('y', y + boxHeight / 2)
  text.setAttribute('fill', colors.text)
  text.setAttribute('font-size', isLeaf ? '11' : '13')
  text.setAttribute('font-weight', isLeaf ? '400' : '600')
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('dominant-baseline', 'central')
  text.setAttribute('font-family', isLeaf ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif")
  text.textContent = labelText.length > 18 ? labelText.slice(0, 16) + '…' : labelText
  g.appendChild(text)

  svg.appendChild(g)

  // Draw children
  if (node.children && node.children.length > 0) {
    const childY = y + boxHeight + gapY
    // Compute widths for each child
    const childWidths = node.children.map(c => computeSubtreeWidth(c))
    const totalChildWidth = childWidths.reduce((a, b) => a + b, 0)
    const scaledWidths = childWidths.map(w => (w / totalChildWidth) * availWidth)

    let startX = x - availWidth / 2
    node.children.forEach((child, i) => {
      const childCenterX = startX + scaledWidths[i] / 2
      startX += scaledWidths[i]

      // Connection line
      const line = document.createElementNS(ns, 'path')
      const midY = y + boxHeight + gapY * 0.4
      const d = `M ${x} ${y + boxHeight} C ${x} ${midY} ${childCenterX} ${midY} ${childCenterX} ${childY}`
      line.setAttribute('d', d)
      line.setAttribute('stroke', 'rgba(0,217,255,0.15)')
      line.setAttribute('stroke-width', '1.5')
      line.setAttribute('fill', 'none')
      line.style.opacity = '0'
      line.style.animation = `nodeAppear 0.35s ease ${(level + 1) * 0.12}s forwards`
      svg.appendChild(line)

      drawTreeNode(svg, ns, child, childCenterX, childY, level + 1, scaledWidths[i])
    })
  }
}

function computeSubtreeWidth(node) {
  if (!node.children || node.children.length === 0) return 120
  let total = 0
  node.children.forEach(c => { total += computeSubtreeWidth(c) })
  return Math.max(120, total)
}

// Add grammar derivation annotation below the tree
function addGrammarAnnotation(svg, ast) {
  const ns = 'http://www.w3.org/2000/svg'
  const vb = svg.getAttribute('viewBox').split(' ').map(Number)
  const annotY = vb[3] - 20

  const rules = []
  if (ast.type === 'RemindCommand') {
    rules.push('Command → RemindCommand')
    rules.push(`RemindCommand → "remind" "me" "to" ACTION "at" TIME`)
    rules.push(`ACTION → ${ast.slots.action}`)
    rules.push(`TIME → ${ast.slots.time}`)
  } else if (ast.type === 'SetCommand') {
    rules.push('Command → SetCommand')
    rules.push(`SetCommand → "set" "alarm" "at" TIME`)
    rules.push(`TIME → ${ast.slots.time}`)
  } else if (ast.type === 'Greet') {
    rules.push('Command → Greet')
    rules.push(`Greet → "${ast.slots.word}"`)
  } else if (ast.type === 'GenericCommand') {
    rules.push('Command → GenericCommand')
    rules.push('GenericCommand → VERB [OBJECT] [MODIFIER]')
  }

  const ruleText = document.createElementNS(ns, 'text')
  ruleText.setAttribute('x', vb[2] / 2)
  ruleText.setAttribute('y', annotY)
  ruleText.setAttribute('fill', '#475569')
  ruleText.setAttribute('font-size', '10')
  ruleText.setAttribute('text-anchor', 'middle')
  ruleText.setAttribute('font-family', "'JetBrains Mono', ui-monospace, monospace")
  ruleText.textContent = rules.join('  →  ')
  svg.appendChild(ruleText)
}
