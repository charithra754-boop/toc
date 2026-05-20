import { tokenize } from './tokenizer.js'
import { drawAutomaton, runDFA } from './automata.js'
import { parseAndDraw, drawTree } from './parser.js'
import { runRegexEngine } from './regex_backend.js'

// ─── Tab switching ────────────────────────────────────────────
const tabs = document.querySelectorAll('.tab')
const pages = document.querySelectorAll('.tab-page')

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'))
    pages.forEach(p => p.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById(btn.dataset.tab).classList.add('active')
  })
})

// ─── Fullscreen toggles ──────────────────────────────────────
function setupFullscreen(btnId, cardSelector) {
  const btn = document.getElementById(btnId)
  if (!btn) return
  const card = btn.closest('.viz-card')
  if (!card) return
  btn.addEventListener('click', () => {
    card.classList.toggle('fullscreen')
    btn.textContent = card.classList.contains('fullscreen') ? '✕' : '⛶'
  })
  // ESC to exit
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && card.classList.contains('fullscreen')) {
      card.classList.remove('fullscreen')
      btn.textContent = '⛶'
    }
  })
}
setupFullscreen('fullscreenDFA')
setupFullscreen('fullscreenParse')
setupFullscreen('fullscreenRegex')

// ─── Elements ─────────────────────────────────────────────────
const inputEl       = document.getElementById('inputText')
const parserInputEl  = document.getElementById('parserInput')
const btnTokenize    = document.getElementById('btnTokenize')
const btnParse       = document.getElementById('btnParse')
const btnPDA         = document.getElementById('btnPDA')
const tokensDiv      = document.getElementById('tokens')
const automatonSvg   = document.getElementById('automatonSvg')
const traceText      = document.getElementById('traceText')

let currentDFA = null

// ─── Tokenize & DFA ──────────────────────────────────────────
function renderTokens(text) {
  const t = tokenize(text)
  tokensDiv.innerHTML = ''
  t.forEach((tok, i) => {
    const span = document.createElement('span')
    span.className = 'token'
    if (tok.type === 'KEYWORD') span.classList.add('kw')
    if (tok.type === 'NUMBER')  span.classList.add('num')
    span.textContent = `${tok.type}: ${tok.value}`
    span.style.animationDelay = `${i * 0.05}s`
    tokensDiv.appendChild(span)
  })
}

function highlightToken(idx) {
  const spans = Array.from(tokensDiv.querySelectorAll('.token'))
  spans.forEach(s => s.style.outline = '')
  if (idx >= 0 && idx < spans.length)
    spans[idx].style.outline = '2px solid rgba(79,110,247,0.35)'
}

async function animateDFA(text) {
  const res = runDFA(text)
  currentDFA = res
  const trace = res.trace || []

  for (let i = 0; i < trace.length; i++) {
    const step = trace[i]
    traceText.textContent = step.step
    drawAutomaton(automatonSvg, step.state, currentDFA)
    highlightToken(step.tokenIndex)
    await new Promise(r => setTimeout(r, 420))
  }

  // Toast with intent
  const note = document.createElement('div')
  note.className = 'toast'
  note.textContent = '✓ Intent: ' + res.intent
  document.body.appendChild(note)
  setTimeout(() => note.remove(), 2200)
}

btnTokenize.addEventListener('click', () => {
  renderTokens(inputEl.value)
  animateDFA(inputEl.value)
})

// Example chips
document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.ex
    inputEl.value = v
    parserInputEl.value = v
    renderTokens(v)
    animateDFA(v)
  })
})

// ─── Parser ───────────────────────────────────────────────────
btnParse.addEventListener('click', () => {
  parseAndDraw(parserInputEl.value, document.getElementById('parseSvg'))
})

// ─── PDA animation ────────────────────────────────────────────
btnPDA.addEventListener('click', () => {
  const res = parseAndDraw(parserInputEl.value, document.getElementById('parseSvg'))
  const stackPanel = document.getElementById('pdaArea')
  if (!res || !res.ok) {
    stackPanel.innerHTML = '<span style="color:var(--red)">Parse failed — cannot animate PDA.</span>'
    return
  }
  const trace = res.trace
  if (!trace || trace.length === 0) {
    stackPanel.textContent = 'No PDA steps (simple parse)'
    return
  }

  let si = 0
  function renderStep(i) {
    stackPanel.innerHTML = ''

    const header = document.createElement('div')
    header.style.cssText = 'color:var(--accent);font-weight:600;margin-bottom:8px;font-size:.82rem'
    header.textContent = `PDA Stack — Step ${i + 1} / ${trace.length}`
    stackPanel.appendChild(header)

    // Stack chips
    const stackViz = document.createElement('div')
    stackViz.style.cssText = 'display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px'
    const stack = []
    for (let j = 0; j <= i; j++) {
      if (trace[j].op === 'push') stack.push(trace[j].symbol)
      else if (trace[j].op === 'pop') stack.pop()
    }
    if (stack.length === 0) {
      const empty = document.createElement('span')
      empty.style.cssText = 'color:var(--text-3);font-style:italic;font-size:.8rem'
      empty.textContent = '(empty stack)'
      stackViz.appendChild(empty)
    } else {
      stack.forEach(sym => {
        const chip = document.createElement('span')
        chip.style.cssText = `
          padding:3px 8px;border-radius:6px;font-family:var(--mono);font-size:.78rem;
          background:rgba(124,92,252,0.1);border:1px solid rgba(124,92,252,0.25);color:#7c5cfc
        `
        chip.textContent = sym
        stackViz.appendChild(chip)
      })
    }
    stackPanel.appendChild(stackViz)

    // Operation log
    const pre = document.createElement('div')
    pre.style.cssText = 'font-family:var(--mono);color:var(--text-2);font-size:.75rem;line-height:1.8'
    pre.innerHTML = trace.slice(0, i + 1).map((t, idx) => {
      const icon = t.op === 'push' ? '↑' : '↓'
      const color = t.op === 'push' ? 'var(--green)' : 'var(--red)'
      const hl = idx === i ? 'font-weight:600' : 'opacity:0.5'
      return `<div style="${hl}"><span style="color:${color}">${icon} ${t.op.toUpperCase()}</span> ${t.symbol} <span style="color:var(--text-3)">@ pos ${t.at}</span></div>`
    }).join('')
    stackPanel.appendChild(pre)
  }

  renderStep(0)
  const ival = setInterval(() => {
    si++
    if (si >= trace.length) { clearInterval(ival); return }
    renderStep(si)
  }, 500)
})

// ─── Regex Engine ─────────────────────────────────────────────
const btnCompileRegex = document.getElementById('btnCompileRegex')
const regexInput      = document.getElementById('regexInput')
const regexOutput     = document.getElementById('regexOutput')

if (btnCompileRegex && regexInput && regexOutput) {
  btnCompileRegex.addEventListener('click', () => {
    runRegexEngine(regexInput.value, regexOutput)
  })
}

// ─── Initial render ───────────────────────────────────────────
renderTokens(inputEl.value)
const initialDFA = runDFA(inputEl.value)
currentDFA = initialDFA
drawAutomaton(automatonSvg, null, currentDFA)
parseAndDraw(parserInputEl.value, document.getElementById('parseSvg'))
