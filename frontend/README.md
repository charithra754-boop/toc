TOC Interactive Demo (frontend)

This folder contains a static single-page application that demonstrates core Theory of Computation concepts for the course project:
- Tokenizer (regex)
- Finite automata (DFA demo)
- Parse tree (simple CFG demo)
- Tiny Turing machine visual

How to run:

1. From the project root run a static server, for example:

   python -m http.server 8000

2. Open http://localhost:8000/frontend/index.html in your browser.

Notes:
- Everything is client-side and intentionally minimal to stay strictly inside the course syllabus.
- The implementation is scaffold-level: tokenizer and automaton demos are functional; parser and TM are small educational demos for presentation.
Intent-aware Parser — frontend scaffold

This folder contains a static single-page app prototype demonstrating tokenizer, DFA intent recognition and a simple CFG parser with visualizations.

Files:
- index.html — main app shell
- style.css — styles
- app.js — entry + UI logic
- automata.js — tokenizer and small DFA simulator & renderer
- parser.js — tiny parser and parse-tree renderer

How to run:
Open `frontend/index.html` in a modern browser (double-click or use a local static server). For a quick local server:

Python 3.x:

```bash
python3 -m http.server --directory frontend 8000
```

Then open http://localhost:8000 in your browser.

Notes:
- This is a visual scaffold for demonstration and for mapping Units I-III. Unit IV and V are placeholders for CNF/pumping lemma and TM demos which can be added as optional extras.
- I can extend this scaffold with more features, animations, and polish if you'd like.
