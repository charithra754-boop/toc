import { tokenize } from './tokenizer.js'
import { drawAutomaton, runDFA } from './automata.js'
import { parseAndDraw } from './parser.js'
import { runDemoTM } from './tm.js'
import { toCNF } from './cnf.js'
import { pumpingDemo } from './pumping.js'
import { intersectDemo } from './intersection.js'
import { demoPCP } from './pcp.js'

// Elements
const inputEl = document.getElementById('inputText')
const btnTokenize = document.getElementById('btnTokenize')
const btnDFA = document.getElementById('btnDFA')
const btnStepBack = document.getElementById('btnStepBack')
const btnStepForward = document.getElementById('btnStepForward')
const btnPDA = document.getElementById('btnPDA')
const btnParse = document.getElementById('btnParse')
const btnTM = document.getElementById('btnTM')

const tokensDiv = document.getElementById('tokens')
const automatonSvg = document.getElementById('automatonSvg')
const traceText = document.getElementById('traceText')
const tmArea = document.getElementById('tmArea')
const exampleButtons = Array.from(document.querySelectorAll('.example'))

let currentTrace = []
let currentIndex = 0

function renderTokens(text){
  const t = tokenize(text)
  tokensDiv.innerHTML = ''
  t.forEach(tok=>{
    const span = document.createElement('span'); span.className='token'; span.textContent = tok.type+": "+tok.value
    tokensDiv.appendChild(span)
  })
}

function highlightToken(idx){
  const spans = Array.from(tokensDiv.querySelectorAll('.token'))
  spans.forEach(s=>s.style.outline='')
  if(idx>=0 && idx < spans.length) spans[idx].style.outline='2px solid rgba(110,231,183,0.25)'
}

function setTrace(trace){
  currentTrace = trace || []
  currentIndex = 0
  if(currentTrace.length>0){
    traceText.textContent = currentTrace[0].step
    drawAutomaton(automatonSvg, currentTrace[0].state)
    highlightToken(currentTrace[0].tokenIndex)
  } else {
    traceText.textContent = '—'
    drawAutomaton(automatonSvg)
  }
}

btnTokenize.addEventListener('click', ()=>{
  renderTokens(inputEl.value)
  const res = runDFA(inputEl.value)
  setTrace(res.trace)
})

exampleButtons.forEach(b=> b.addEventListener('click', ()=>{
  const v = b.getAttribute('data-ex')
  inputEl.value = v
  renderTokens(v)
  parseAndDraw(v, document.getElementById('parseSvg'))
  const res = runDFA(v)
  setTrace(res.trace)
}))

async function animateDFA(text){
  const res = runDFA(text)
  setTrace(res.trace)
  for(let i=0;i<currentTrace.length;i++){
    currentIndex = i
    const step = currentTrace[i]
    traceText.textContent = step.step
    drawAutomaton(automatonSvg, step.state)
    highlightToken(step.tokenIndex)
    await new Promise(r=>setTimeout(r, 500))
  }
  // show intent briefly
  const note = document.createElement('div')
  note.style.position='fixed'; note.style.right='18px'; note.style.bottom='18px'
  note.style.background='#0b1220'; note.style.color='#9fb8d9'; note.style.padding='8px 12px'; note.style.borderRadius='8px'
  note.textContent = 'Intent: '+res.intent
  document.body.appendChild(note)
  setTimeout(()=>note.remove(),1200)
}

btnDFA.addEventListener('click', ()=>{ animateDFA(inputEl.value) })

btnStepForward.addEventListener('click', ()=>{
  if(!currentTrace || currentTrace.length===0) return
  if(currentIndex < currentTrace.length-1) currentIndex++
  const step = currentTrace[currentIndex]
  traceText.textContent = step.step
  drawAutomaton(automatonSvg, step.state)
  highlightToken(step.tokenIndex)
})

btnStepBack.addEventListener('click', ()=>{
  if(!currentTrace || currentTrace.length===0) return
  if(currentIndex>0) currentIndex--
  const step = currentTrace[currentIndex]
  traceText.textContent = step.step
  drawAutomaton(automatonSvg, step.state)
  highlightToken(step.tokenIndex)
})

btnParse.addEventListener('click', ()=>{
  parseAndDraw(inputEl.value, document.getElementById('parseSvg'))
})

btnPDA.addEventListener('click', ()=>{
  const res = parseAndDraw(inputEl.value, document.getElementById('parseSvg'))
  if(!res.ok){ alert('Parse failed — cannot animate PDA.'); return }
  const stackPanel = tmArea
  stackPanel.innerHTML = ''
  const trace = res.trace
  if(!trace || trace.length===0){ stackPanel.textContent='No PDA steps (simple parse)'; return }
  let si = 0
  function renderStep(i){
    stackPanel.innerHTML = ''
    const pre = document.createElement('div')
    pre.style.fontFamily='monospace'; pre.style.color='var(--muted)'
    pre.textContent = trace.slice(0,i+1).map(t=>`${t.op} ${t.symbol} @${t.at}`).join('\n')
    stackPanel.appendChild(pre)
  }
  renderStep(0)
  const ival = setInterval(()=>{
    si++
    if(si>=trace.length){ clearInterval(ival); return }
    renderStep(si)
  }, 600)
})

btnTM.addEventListener('click', ()=>{ runDemoTM(tmArea) })

// initial render
renderTokens(inputEl.value)
// initial render
drawAutomaton(automatonSvg)

// Theory tools wiring
const btnCNF = document.getElementById('btnCNF')
const btnPumping = document.getElementById('btnPumping')
const btnIntersect = document.getElementById('btnIntersect')
const cnfPanel = document.getElementById('cnfPanel')
const pumpingPanel = document.getElementById('pumpingPanel')
const intersectPanel = document.getElementById('intersectPanel')
const pcpPanel = document.getElementById('pcpPanel')

btnCNF.addEventListener('click', ()=>{
  const sample = 'S -> A B\nA -> a\nB -> b'
  cnfPanel.textContent = toCNF(sample)
})

btnPumping.addEventListener('click', ()=>{
  const res = pumpingDemo()
  pumpingPanel.innerHTML = `<strong>String:</strong> ${res.string}<br><p>${res.explanation}</p>`
})

btnIntersect.addEventListener('click', ()=>{
  const input = inputEl.value
  const regex = '^remind\\s+me'
  const r = intersectDemo(input, regex)
  intersectPanel.textContent = `inCFL: ${r.inCFL}, inRegex: ${r.inRegex}`
})

btnPCP.addEventListener('click', ()=>{
  const d = demoPCP()
  pcpPanel.innerHTML = `<div><strong>Pairs:</strong> ${d.pairs.map(p=>`[${p.top}|${p.bottom}]`).join(', ')}</div><div><strong>Found:</strong> ${d.res.found}</div><div style="margin-top:8px">${d.res.solutions.length? `Solution indices: ${d.res.solutions[0].join(', ')}` : 'No solution within bound'}</div>`
})
drawAutomaton(automatonSvg)
