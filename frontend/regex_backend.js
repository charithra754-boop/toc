/**
 * regex_backend.js
 * Calls the Python/C++ backend (POST /api/regex) and renders
 * the NFA, DFA, and minimised-DFA returned as JSON.
 */
import { computeForceLayout, computeEdgePaths } from './layout.js'

const BACKEND = 'http://localhost:8001/api/regex'

// ─── Colour palette ──────────────────────────────────────────
const PALETTE = {
  start:  { fill: '#e0f2fe', stroke: '#4f6ef7', text: '#0369a1' },
  accept: { fill: '#d1fae5', stroke: '#22c55e', text: '#065f46' },
  both:   { fill: '#fce7f3', stroke: '#ec4899', text: '#9d174d' },
  normal: { fill: '#f1f5f9', stroke: '#cbd5e1', text: '#1e293b' },
  active: { fill: '#bbf7d0', stroke: '#16a34a', text: '#16a34a' }
}

// ─── SVG drawing ─────────────────────────────────────────────
function drawAutomatonSVG(svg, states, title) {
  svg.innerHTML = ''
  const ns = 'http://www.w3.org/2000/svg'

  if (!states || states.length === 0) {
    const t = document.createElementNS(ns, 'text')
    t.setAttribute('x', 10); t.setAttribute('y', 30)
    t.setAttribute('fill', '#5e6f8a'); t.setAttribute('font-size', '13')
    t.textContent = 'No states'; svg.appendChild(t); return
  }

  // Build edges list for layout
  const edges = []
  states.forEach(st => {
    (st.transitions || []).forEach(t => {
      edges.push({ source: st.id, target: t.to, symbol: t.symbol })
    })
  })

  // Apply force layout
  const layout = computeForceLayout(states, edges, { iterations: 400 })
  svg.setAttribute('viewBox', layout.viewBox)
  svg.style.width = layout.width + 'px'
  svg.style.height = layout.height + 'px'
  svg.parentElement.style.overflow = 'auto' // ensure scrollable

  const pos = {}
  states.forEach(s => pos[s.id] = s)

  // Arrowhead marker
  const defs = document.createElementNS(ns, 'defs')
  const marker = document.createElementNS(ns, 'marker')
  marker.setAttribute('id', `arr-${svg.id}`)
  marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '6')
  marker.setAttribute('refX', '8');       marker.setAttribute('refY', '3')
  marker.setAttribute('orient', 'auto')
  const poly = document.createElementNS(ns, 'polygon')
  poly.setAttribute('fill', '#4f6ef7')
  marker.appendChild(poly); defs.appendChild(marker); svg.appendChild(defs)

  const R = 24

  // Draw edges
  const routedEdges = computeEdgePaths(states, edges, R)
  
  routedEdges.forEach((e, i) => {
    const path = document.createElementNS(ns, 'path')
    path.setAttribute('d', e.pathD)
    path.setAttribute('stroke', '#94a3b8')
    path.setAttribute('stroke-width', '1.5')
    path.setAttribute('fill', 'none')
    path.setAttribute('marker-end', `url(#arr-${svg.id})`)
    path.style.animation = `nodeAppear 0.5s ease ${i * 0.02}s both`
    svg.appendChild(path)

    // Edge label
    const label = document.createElementNS(ns, 'text')
    label.setAttribute('x', e.labelX); label.setAttribute('y', e.labelY)
    label.setAttribute('fill', '#475569')
    label.setAttribute('font-size', '11')
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-family', "'JetBrains Mono', monospace")
    label.textContent = e.symbol === '#' ? 'ε' : e.symbol
    label.style.animation = `nodeAppear 0.5s ease ${i * 0.02}s both`
    svg.appendChild(label)
  })

  // Draw nodes
  for (const st of states) {
    const p = pos[st.id]; if (!p) continue
    const g = document.createElementNS(ns, 'g')
    g.style.animation = `nodeAppear 0.4s ease ${st.id * 0.05}s both`

    const colors = st.start && st.accept ? PALETTE.both
                 : st.accept ? PALETTE.accept
                 : st.start  ? PALETTE.start
                              : PALETTE.normal

    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y); circle.setAttribute('r', R)
    circle.setAttribute('fill', colors.fill); circle.setAttribute('stroke', colors.stroke)
    circle.setAttribute('stroke-width', '2')
    g.appendChild(circle)

    // Double ring for accept
    if (st.accept) {
      const inner = document.createElementNS(ns, 'circle')
      inner.setAttribute('cx', p.x); inner.setAttribute('cy', p.y); inner.setAttribute('r', R - 5)
      inner.setAttribute('fill', 'none'); inner.setAttribute('stroke', colors.stroke)
      inner.setAttribute('stroke-width', '1.5'); inner.setAttribute('stroke-dasharray', '3 2')
      g.appendChild(inner)
    }

    // Start arrow
    if (st.start) {
      const arr = document.createElementNS(ns, 'path')
      arr.setAttribute('d', `M ${p.x - R - 22} ${p.y} L ${p.x - R} ${p.y}`)
      arr.setAttribute('stroke', colors.stroke); arr.setAttribute('stroke-width', '2')
      arr.setAttribute('marker-end', `url(#arr-${svg.id})`)
      g.appendChild(arr)
    }

    const label = document.createElementNS(ns, 'text')
    label.setAttribute('x', p.x); label.setAttribute('y', p.y)
    label.setAttribute('fill', colors.text); label.setAttribute('font-size', '11')
    label.setAttribute('font-weight', '700'); label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'central')
    label.setAttribute('font-family', "'Inter', sans-serif")
    label.textContent = `q${st.id}`
    g.appendChild(label)

    svg.appendChild(g)
  }
}

// ─── Transition table renderer ────────────────────────────────
function drawTable(container, automaton, kind) {
  container.innerHTML = ''
  if (!automaton || !automaton.states || automaton.states.length === 0) {
    container.textContent = `No ${kind} data`; return
  }

  const syms = automaton.symbols || []
  const table = document.createElement('table')
  table.className = 'tt'

  // Header
  const thead = table.createTHead()
  const hr = thead.insertRow()
  ;['', 'State', ...syms].forEach(h => {
    const th = document.createElement('th'); th.textContent = h; hr.appendChild(th)
  })

  const tbody = table.createTBody()
  for (const st of automaton.states) {
    const tr = tbody.insertRow()
    // Flag
    const flag = tr.insertCell()
    flag.textContent = (st.start && st.accept) ? '±' : st.start ? '→' : st.accept ? '★' : ''
    flag.style.color = st.accept ? '#6ee7b7' : '#00d9ff'
    flag.style.fontWeight = '700'; flag.style.fontSize = '1rem'
    // State id
    const sid = tr.insertCell()
    sid.textContent = kind === 'nfa' ? st.id : `q${st.id}`
    sid.style.fontFamily = "'JetBrains Mono', monospace"
    sid.style.color = '#c8d8f0'
    // Transitions per symbol
    for (const sym of syms) {
      const cell = tr.insertCell()
      const tos = (st.transitions || []).filter(t => t.symbol === sym || (sym === 'ε' && t.symbol === '#')).map(t => `q${t.to}`)
      cell.textContent = tos.length ? tos.join(', ') : '—'
      cell.style.color = tos.length ? '#a78bfa' : '#5e6f8a'
      cell.style.fontFamily = "'JetBrains Mono', monospace"
    }
  }
  container.appendChild(table)
}

// ─── Main public function ─────────────────────────────────────
export async function runRegexEngine(regex, resultContainer) {
  resultContainer.innerHTML = '<div class="engine-loading">⚙ Running C++ engine…</div>'

  let data
  try {
    const resp = await fetch(BACKEND, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regex })
    })
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: resp.statusText }))
      resultContainer.innerHTML = `<div class="engine-error">❌ ${err.error}</div>`
      return null
    }
    data = await resp.json()
  } catch (e) {
    resultContainer.innerHTML = `<div class="engine-error">❌ Backend unreachable — is server.py running on :8001?<br><code>python3 backend/server.py</code></div>`
    return null
  }

  // Build the result UI
  resultContainer.innerHTML = ''

  // Stats bar
  const stats = document.createElement('div')
  stats.className = 'engine-stats'
  stats.innerHTML = `
    <span>NFA states: <strong>${data.nfa?.stateCount ?? '—'}</strong></span>
    <span>DFA states: <strong>${data.dfa?.stateCount ?? '—'}</strong></span>
    <span>Min-DFA states: <strong>${data.minimizedDfa?.stateCount ?? '—'}</strong></span>
  `
  resultContainer.appendChild(stats)

  // Tab switcher
  const tabs = [
    { id: 'nfa',  label: '🔵 NFA',         data: data.nfa },
    { id: 'dfa',  label: '🟢 DFA',         data: data.dfa },
    { id: 'mdfa', label: '⭐ Minimised DFA', data: data.minimizedDfa }
  ]

  const tabBar = document.createElement('div'); tabBar.className = 'engine-tabs'
  const panels = {}

  tabs.forEach((tab, i) => {
    const btn = document.createElement('button')
    btn.textContent = tab.label; btn.className = 'engine-tab' + (i === 0 ? ' active' : '')
    btn.dataset.tab = tab.id
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.engine-tab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      Object.values(panels).forEach(p => p.style.display = 'none')
      panels[tab.id].style.display = ''
    })
    tabBar.appendChild(btn)
  })
  resultContainer.appendChild(tabBar)

  tabs.forEach((tab, i) => {
    const panel = document.createElement('div')
    panel.className = 'engine-panel'
    panel.style.display = i === 0 ? '' : 'none'
    panels[tab.id] = panel

    // SVG diagram
    const svgWrap = document.createElement('div'); svgWrap.className = 'engine-svg-wrap'
    svgWrap.style.overflow = 'auto' // crucial for scrolling large graphs
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = `svg-${tab.id}`; svg.setAttribute('viewBox', '0 0 600 200')
    svgWrap.appendChild(svg); panel.appendChild(svgWrap)

    // Table
    const tableWrap = document.createElement('div'); tableWrap.className = 'engine-table-wrap'
    panel.appendChild(tableWrap)

    drawAutomatonSVG(svg, tab.data?.states || [], tab.label)
    drawTable(tableWrap, tab.data, tab.id)

    resultContainer.appendChild(panel)
  })

  return data
}
