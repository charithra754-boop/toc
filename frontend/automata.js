// Dynamic DFA — builds states and transitions from the actual input tokens.
// The automaton structure changes for every unique input.

import { tokenize } from './tokenizer.js'
import { computeForceLayout, computeEdgePaths } from './layout.js'

// ─── DFA engine ──────────────────────────────────────────────
// Build a DFA on the fly from the token stream.  Every token
// creates a transition; keywords drive intent-bearing states,
// numbers/words drive data-capture states.

const STATE_COLOURS = {
  start:   { fill: '#e0f2fe', stroke: '#4f6ef7' },
  keyword: { fill: '#d1fae5', stroke: '#22c55e' },
  data:    { fill: '#ede9fe', stroke: '#7c5cfc' },
  accept:  { fill: '#fce7f3', stroke: '#ec4899' },
  active:  { fill: '#bbf7d0', stroke: '#16a34a' }
}

// Classify a token type → state role
function tokenRole(tok) {
  if (/^KEYWORD$/i.test(tok.type)) return 'keyword'
  if (/^NUMBER|TIME$/i.test(tok.type)) return 'data'
  return 'data'
}

export function runDFA(text) {
  const tokens = tokenize(text)
  const nodes = [{ id: 'q0', label: 'start', role: 'start' }]
  const edges = []
  const trace = [{ step: 'start', state: 'q0', tokenIndex: -1 }]

  // Intent detection keywords
  const intentKeywords = {
    remind: 'REMIND', set: 'SET', alarm: 'SET',
    hello: 'GREET', hi: 'GREET', hey: 'GREET'
  }
  let detectedIntent = 'UNKNOWN'

  tokens.forEach((tok, i) => {
    const stateId = `q${i + 1}`
    const val = tok.value.toLowerCase()
    const role = tokenRole(tok)

    // If this is an intent-bearing keyword, mark it
    if (intentKeywords[val]) {
      detectedIntent = intentKeywords[val]
      nodes.push({ id: stateId, label: detectedIntent, role: 'keyword' })
    } else if (/^NUMBER|TIME$/i.test(tok.type)) {
      nodes.push({ id: stateId, label: tok.value, role: 'data' })
    } else {
      nodes.push({ id: stateId, label: tok.value, role: 'data' })
    }

    const prevId = `q${i}`
    edges.push({ from: prevId, to: stateId, label: `${tok.type}: ${tok.value}` })
    trace.push({ step: `${tok.type}: ${tok.value}`, state: stateId, tokenIndex: i })
  })

  // Mark the last node as the accept state
  if (nodes.length > 1) {
    const last = nodes[nodes.length - 1]
    last.role = 'accept'
    last.label = detectedIntent !== 'UNKNOWN' ? `✓ ${detectedIntent}` : `✓ ${last.label}`
  }

  return { intent: detectedIntent, trace, nodes, edges }
}

// ─── SVG renderer ─────────────────────────────────────────────
// Lays out nodes in a flowing left-to-right arc (with wrapping)
// so the shape directly reflects the token chain.

export function drawAutomaton(svg, highlightId, dfaResult) {
  const ns = 'http://www.w3.org/2000/svg'

  // If no DFA result, draw a placeholder
  if (!dfaResult || !dfaResult.nodes || dfaResult.nodes.length <= 1) {
    svg.innerHTML = ''
    svg.removeAttribute('data-rendered')
    const fallbackNodes = [
      { id: 'q0', x: 100, y: 140, label: 'start', role: 'start' },
      { id: 'q1', x: 320, y: 70,  label: 'REMIND', role: 'keyword' },
      { id: 'q2', x: 320, y: 210, label: 'SET', role: 'keyword' },
      { id: 'q3', x: 540, y: 140, label: 'GREET', role: 'keyword' }
    ]
    const fallbackEdges = [
      { from: 'q0', to: 'q1', label: 'remind' },
      { from: 'q0', to: 'q2', label: 'set / alarm' },
      { from: 'q0', to: 'q3', label: 'hi / hello / hey' }
    ]
    const routed = computeEdgePaths(fallbackNodes, fallbackEdges, 34)
    drawEdges(svg, ns, routed)
    drawNodes(svg, ns, fallbackNodes, highlightId)
    return
  }

  const nodes = dfaResult.nodes
  const edges = dfaResult.edges

  if (svg.getAttribute('data-rendered') === 'true') {
    nodes.forEach(n => {
      const circle = svg.querySelector(`#circle-${n.id}`)
      if (!circle) return
      const isHighlighted = highlightId && highlightId === n.id
      const colors = isHighlighted ? STATE_COLOURS.active : (STATE_COLOURS[n.role] || STATE_COLOURS.data)
      circle.setAttribute('fill', colors.fill)
      circle.setAttribute('stroke', colors.stroke)
      circle.setAttribute('stroke-width', isHighlighted ? '3' : '1.5')
    })
    return
  }

  svg.innerHTML = ''
  svg.setAttribute('data-rendered', 'true')

  const layout = computeForceLayout(nodes, edges, { iterations: 300, attraction: 0.5, repulsion: 1.5, k: 180 })
  svg.setAttribute('viewBox', layout.viewBox)
  svg.style.width = layout.width + 'px'
  svg.style.height = layout.height + 'px'
  if (svg.parentElement) svg.parentElement.style.overflow = 'auto'

  const routedEdges = computeEdgePaths(nodes, edges, 34)
  drawEdges(svg, ns, routedEdges)
  drawNodes(svg, ns, nodes, highlightId)
}

function drawEdges(svg, ns, routedEdges) {
  // Arrowhead marker definition
  if (!svg.querySelector('#arrowhead')) {
    const defs = document.createElementNS(ns, 'defs')
    const marker = document.createElementNS(ns, 'marker')
    marker.setAttribute('id', 'arrowhead')
    marker.setAttribute('markerWidth', '8')
    marker.setAttribute('markerHeight', '6')
    marker.setAttribute('refX', '8')
    marker.setAttribute('refY', '3')
    marker.setAttribute('orient', 'auto')
    const poly = document.createElementNS(ns, 'polygon')
    poly.setAttribute('points', '0 0, 8 3, 0 6')
    poly.setAttribute('fill', '#4f6ef7')
    marker.appendChild(poly)
    defs.appendChild(marker)
    svg.insertBefore(defs, svg.firstChild)
  }

  routedEdges.forEach((e, i) => {
    const path = document.createElementNS(ns, 'path')
    path.setAttribute('d', e.pathD)
    path.setAttribute('stroke', '#94a3b8')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-width', '1.5')
    path.setAttribute('marker-end', 'url(#arrowhead)')
    path.style.animation = `nodeAppear 0.5s ease ${i * 0.05}s both`
    svg.appendChild(path)

    // Edge label
    const text = document.createElementNS(ns, 'text')
    text.setAttribute('x', e.labelX)
    text.setAttribute('y', e.labelY)
    text.setAttribute('fill', '#475569')
    text.setAttribute('font-size', '10')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('font-family', "'JetBrains Mono', ui-monospace, monospace")
    // Truncate long labels
    const lbl = e.label.length > 16 ? e.label.slice(0, 14) + '…' : e.label
    text.textContent = lbl
    text.style.animation = `nodeAppear 0.5s ease ${i * 0.05}s both`
    svg.appendChild(text)
  })
}

function drawNodes(svg, ns, nodes, highlightId) {
  nodes.forEach(n => {
    const g = document.createElementNS(ns, 'g')
    g.style.cursor = 'default'

    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('id', `circle-${n.id}`)
    circle.setAttribute('cx', n.x)
    circle.setAttribute('cy', n.y)
    circle.setAttribute('r', 34)

    const colors = highlightId && highlightId === n.id
      ? STATE_COLOURS.active
      : STATE_COLOURS[n.role] || STATE_COLOURS.data

    circle.setAttribute('fill', colors.fill)
    circle.setAttribute('stroke', colors.stroke)
    circle.setAttribute('stroke-width', highlightId === n.id ? '3' : '1.5')
    g.appendChild(circle)

    // Double circle for accept states
    if (n.role === 'accept') {
      const inner = document.createElementNS(ns, 'circle')
      inner.setAttribute('cx', n.x)
      inner.setAttribute('cy', n.y)
      inner.setAttribute('r', 28)
      inner.setAttribute('fill', 'none')
      inner.setAttribute('stroke', colors.stroke)
      inner.setAttribute('stroke-width', '1')
      inner.setAttribute('stroke-dasharray', '3 2')
      g.appendChild(inner)
    }

    // Label (multi-line if needed)
    const label = document.createElementNS(ns, 'text')
    label.setAttribute('x', n.x)
    label.setAttribute('y', n.y)
    label.setAttribute('fill', '#1e293b')
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'central')
    label.setAttribute('font-size', '12')
    label.setAttribute('font-family', "'DM Sans', sans-serif")
    label.setAttribute('font-weight', '600')

    // Truncate long labels
    const displayLabel = n.label.length > 10 ? n.label.slice(0, 9) + '…' : n.label
    label.textContent = displayLabel
    g.appendChild(label)

    // Small state ID below
    const idLabel = document.createElementNS(ns, 'text')
    idLabel.setAttribute('x', n.x)
    idLabel.setAttribute('y', n.y + 46)
    idLabel.setAttribute('fill', '#94a3b8')
    idLabel.setAttribute('text-anchor', 'middle')
    idLabel.setAttribute('font-size', '9')
    idLabel.setAttribute('font-family', "'JetBrains Mono', monospace")
    idLabel.textContent = n.id
    g.appendChild(idLabel)

    svg.appendChild(g)
  })
}
