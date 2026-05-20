# CompVIZ

A comprehensive course project demonstrating all five units of Theory of Computation through a single, cohesive intent-aware parsing system with interactive visualizations.

## Project Overview

This repository contains a Qt-based lexical analyzer generator and an interactive frontend demo that explains core automata, grammar, and computability concepts.

### Key Features

- **Dynamic DFA visualizer** — the automaton graph rebuilds itself based on whatever input you type
- **Recursive-descent parser** with animated parse tree and PDA stack trace
- **Turing machine simulator** with step / run / reset controls
- **Theory tools** — CNF converter, pumping lemma demo, CFL ∩ Regular checker, PCP solver
- Regular expression → NFA → DFA → DFA minimization → C++ lexer program (Qt legacy)
- Supports concatenation, alternation (`|`), Kleene star (`*`), optional (`?`), positive closure (`+`), and grouping

## Quick Demo — Try These Inputs

The parser recognizes three command types. Try these in the input box:

| # | Input | Expected Parse | Intent |
|---|-------|---------------|--------|
| 1 | `remind me to buy milk at 5 pm` | RemindCommand → ACTION("buy milk") + TIME("5 pm") | REMIND |
| 2 | `set alarm at 7` | SetCommand → TIME("7") | SET |
| 3 | `hello` | Greet → WORD("hello") | GREET |
| 4 | `remind me to call mom at 3 pm` | RemindCommand → ACTION("call mom") + TIME("3 pm") | REMIND |

**What happens for each input:**
1. **Tokenize** — breaks the sentence into classified tokens (KEYWORD, WORD, NUMBER)
2. **Run DFA** — a dynamically generated finite automaton processes tokens and recognizes intent
3. **Parse** — a recursive-descent parser builds a parse tree using context-free grammar rules
4. **Animate PDA** — shows the pushdown automaton stack trace (push/pop operations)

### Grammar Rules (CFG)

```
Command       → RemindCommand | SetCommand | Greet
RemindCommand → "remind" ["me"] ["to"] ACTION "at" TIME
SetCommand    → "set" ["alarm"] "at" TIME
Greet         → "hi" | "hello" | "hey"
ACTION        → WORD+
TIME          → NUMBER [am|pm]
```

### What the parser produces

For `remind me to buy milk at 5 pm`:
```
         RemindCommand
         /           \
      ACTION          TIME
      /    \            |
   "buy"  "milk"     "5 pm"
```

The tree shows the CFG derivation. The PDA trace shows the stack operations:
```
⬆ PUSH Remind    @ pos 0
⬆ PUSH ACTION    @ pos 3
⬇ POP  ACTION    @ pos 5
⬆ PUSH TIME      @ pos 5
⬇ POP  TIME      @ pos 7
⬇ POP  Remind    @ pos 7
```

## How to Run

```bash
# From the project root — serves the frontend directly
python3 -m http.server --directory frontend 8000

# Then open http://localhost:8000 in your browser
```

Or:

```bash
cd frontend
python3 -m http.server 8000
# Open http://localhost:8000
```

## Repository Structure

```
├── frontend/              Interactive web demo
│   ├── index.html         Main SPA shell
│   ├── style.css          Premium dark theme
│   ├── app.js             Entry point & UI wiring
│   ├── tokenizer.js       Regex-based tokenizer
│   ├── automata.js        Dynamic DFA builder & SVG renderer
│   ├── parser.js          Recursive-descent parser & tree renderer
│   ├── tm.js              Turing machine visualizer
│   ├── cnf.js             CNF converter (educational)
│   ├── pumping.js         Pumping lemma illustration
│   ├── intersection.js    CFL ∩ Regular language checker
│   ├── pcp.js             PCP solver (bounded)
│   └── README.md          Frontend-specific docs & grading rubric
├── parsing/               Legacy Qt C++ lexer generator source
└── release/               Legacy compiled release assets
```

## Unit Coverage

| Unit | Topic | Component |
|------|-------|-----------|
| I | Finite Automata (DFA / NFA) | `automata.js` — dynamic DFA that rebuilds per input |
| II | Regular Expressions | `tokenizer.js` — regex-based token classification |
| III | Context-Free Grammars & Parse Trees | `parser.js` — recursive-descent parser with PDA trace |
| IV | CNF / Pumping Lemma / Decidability | `cnf.js`, `pumping.js`, `intersection.js` |
| V | Turing Machines & Undecidability | `tm.js` (unary increment TM), `pcp.js` (PCP solver) |

## Design Principles

1. **Strictly on-syllabus** — no ML, no external APIs, every feature maps to Units I–V
2. **Visual & Interactive** — animations, step controls, real-time feedback
3. **Client-side only** — runs in any modern browser, no server needed
4. **Modular** — each concept is a separate ES module

## License

This project is provided as-is for educational purposes.
