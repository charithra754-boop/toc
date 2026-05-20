// Very small DFA demo: looks for keywords to decide intent
export function runDFA(text){
  const t = text.toLowerCase()
  const words = t.split(/\s+/).filter(Boolean)
  const trace = []
  // step 0: start
  trace.push({step: 'start', state: 'q0', tokenIndex: -1})
  for(let i=0;i<words.length;i++){
    const w = words[i]
    if(/\bremind\b/.test(w) || /remind/.test(w)) trace.push({step:w, state:'q1', tokenIndex:i})
    else if(/\bset\b/.test(w) || /alarm/.test(w)) trace.push({step:w, state:'q2', tokenIndex:i})
    else if(/\bhello\b|\bhi\b|\bhey\b/.test(w)) trace.push({step:w, state:'q3', tokenIndex:i})
    else trace.push({step:w, state:'q0', tokenIndex:i})
  }
  const last = [...trace].reverse().find(t=>t.state!=='q0')
  const intent = last ? (last.state==='q1'?'REMIND': last.state==='q2'?'SET':'GREET') : 'UNKNOWN'
  return {intent, trace}
}

export function drawAutomaton(svg, highlightId){
  // simple static drawing: three nodes and transitions
  svg.innerHTML = ''
  const ns = 'http://www.w3.org/2000/svg'
  const nodes = [
    {id:'q0', x:80, y:140, label:'start'},
    {id:'q1', x:320, y:60, label:'REMIND'},
    {id:'q2', x:320, y:220, label:'SET'},
    {id:'q3', x:560, y:140, label:'GREET'}
  ]
  // edges
  const edges = [
    {from:'q0', to:'q1', label:'remind'},
    {from:'q0', to:'q2', label:'set/alarm'},
    {from:'q0', to:'q3', label:'hi/hello'}
  ]

  // draw edges
  edges.forEach(e=>{
    const f = nodes.find(n=>n.id===e.from)
    const t = nodes.find(n=>n.id===e.to)
    const line = document.createElementNS(ns,'path')
    const d = `M ${f.x} ${f.y} C ${f.x+80} ${f.y} ${t.x-80} ${t.y} ${t.x} ${t.y}`
    line.setAttribute('d',d)
    line.setAttribute('stroke','rgba(200,220,255,0.6)')
    line.setAttribute('fill','none')
    line.setAttribute('stroke-width','2')
    svg.appendChild(line)
    const text = document.createElementNS(ns,'text')
    text.setAttribute('x', (f.x+t.x)/2 )
    text.setAttribute('y', (f.y+t.y)/2 -10)
    text.setAttribute('fill','#9fb8d9')
    text.setAttribute('font-size','12')
    text.textContent = e.label
    svg.appendChild(text)
  })

  // draw nodes
  nodes.forEach(n=>{
    const g = document.createElementNS(ns,'g')
    const circle = document.createElementNS(ns,'circle')
    circle.setAttribute('cx', n.x)
    circle.setAttribute('cy', n.y)
    circle.setAttribute('r', 36)
    // highlight selected node
    if(highlightId && highlightId===n.id){
      circle.setAttribute('fill','#6ee7b7')
      circle.setAttribute('stroke','#16a34a')
    } else {
      circle.setAttribute('fill','rgba(255,255,255,0.03)')
      circle.setAttribute('stroke','rgba(255,255,255,0.06)')
    }
    circle.setAttribute('stroke-width','2')
    g.appendChild(circle)
    const label = document.createElementNS(ns,'text')
    label.setAttribute('x', n.x)
    label.setAttribute('y', n.y+4)
    label.setAttribute('fill','#e6eef6')
    label.setAttribute('text-anchor','middle')
    label.setAttribute('font-size','12')
    label.textContent = n.label
    g.appendChild(label)
    svg.appendChild(g)
  })
}
// Lightweight tokenizer and DFA example for demo
export function tokenize(text){
  const patterns = [
    ['NUMBER', /\b\d+(?:[:.]?\d+)?\b/],
    ['TIME', /\b\d+\s*(?:am|pm)\b/i],
    ['KEYWORD', /\b(remind|set|alarm|at|to|buy|me)\b/i],
    ['WORD', /\b[a-zA-Z]+\b/],
    ['SPACE', /\s+/],
  ];
  const tokens = [];
  let i = 0;
  while(i < text.length){
    let matched = false;
    for(const [type, re] of patterns){
      re.lastIndex = 0;
      const slice = text.slice(i);
      const m = slice.match(re);
      if(m && m.index === 0){
        if(type !== 'SPACE') tokens.push({type, value:m[0]});
        i += m[0].length; matched = true; break;
      }
    }
    if(!matched){ tokens.push({type:'CHAR', value:text[i]}); i++; }
  }
  return tokens;
}

// Very small DFA for intent recognition: recognizes if command contains remind/set
const dfa = {
  states: ['start','remind','set','other','accept_remind','accept_set'],
  start: 'start',
  accept: ['accept_remind','accept_set']
};

export function recognizeIntent(text){
  const words = text.toLowerCase().split(/\s+/);
  const trace = [];
  let state = 'start'; trace.push(state);
  if(words.includes('remind') || words.includes('remindme') || words.includes('remind,')){
    state = 'accept_remind';
  } else if(words.includes('set') || words.includes('alarm')){
    state = 'accept_set';
  } else {
    state = 'other';
  }
  trace.push(state);
  const intent = state === 'accept_remind' ? 'REMIND' : (state === 'accept_set' ? 'SET' : 'UNKNOWN');
  return { intent, confidence: state==='other'?0.45:0.98, trace };
}

// render a tiny DFA visualization into container; trace is array of state ids to highlight
export function renderDFA(container, trace=[]){
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height','100%');
  svg.setAttribute('viewBox','0 0 600 400');

  const positions = {
    start: [120,200], remind:[300,120], set:[300,280], other:[480,200], accept_remind:[300,80], accept_set:[300,320]
  };

  // draw edges (simple)
  const edges = [ ['start','remind'], ['start','set'], ['start','other'], ['remind','accept_remind'], ['set','accept_set'] ];
  edges.forEach(([a,b])=>{
    const [x1,y1]=positions[a]; const [x2,y2]=positions[b];
    const line = document.createElementNS(svgNS,'line');
    line.setAttribute('x1',x1); line.setAttribute('y1',y1); line.setAttribute('x2',x2); line.setAttribute('y2',y2);
    line.setAttribute('stroke','rgba(255,255,255,0.06)'); line.setAttribute('stroke-width','2'); svg.appendChild(line);
  });

  Object.entries(positions).forEach(([id,[x,y]])=>{
    const g = document.createElementNS(svgNS,'g');
    g.setAttribute('transform',`translate(${x-40},${y-20})`);
    const rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width','80'); rect.setAttribute('height','40'); rect.setAttribute('rx','10');
    rect.setAttribute('fill','#071428'); rect.setAttribute('stroke','rgba(255,255,255,0.06)'); rect.setAttribute('class','node');
    if(trace.includes(id)) rect.setAttribute('stroke','#7c5cff');
    const text = document.createElementNS(svgNS,'text');
    text.setAttribute('x','40'); text.setAttribute('y','25'); text.setAttribute('text-anchor','middle'); text.setAttribute('fill','#cfe9ff');
    text.setAttribute('font-size','12'); text.textContent = id;
    g.appendChild(rect); g.appendChild(text); svg.appendChild(g);
  });

  container.appendChild(svg);
}
