# TOC Interactive Demo — FrontendTOC Interactive Demo (frontend)



A **visually polished, client-side Theory of Computation interactive demo** that maps the entire course syllabus (Units I–V) to a single, cohesive project: intent-aware parsing with step-by-step automata, parser, and Turing machine visualizations.This folder contains a static single-page application that demonstrates core Theory of Computation concepts for the course project:

- Tokenizer (regex)

## Project Pitch- Finite automata (DFA demo)

- Parse tree (simple CFG demo)

This project demonstrates that **Theory of Computation is not abstract**—it powers real systems. By building an intent-aware parser for natural-language commands ("remind me to buy milk at 5 pm"), students encounter:- Tiny Turing machine visual



- **Unit I (Automata)**: A DFA recognizes command intent (REMIND, SET, GREET).How to run:

- **Unit II (Regular Languages)**: A tokenizer splits input into tokens via regex patterns.

- **Unit III (Context-Free Languages)**: A recursive-descent parser builds a parse tree and simulates PDA stack operations.1. From the project root run a static server, for example:

- **Unit IV (Decidability & CNF)**: Toy demonstrations of CNF conversion, pumping lemma, and language intersection.

- **Unit V (Computability)**: A bounded Turing machine visualizer and a Post Correspondence Problem (PCP) solver (undecidability example).   python -m http.server 8000



All components are **fully interactive**, **visually animated**, and **runnable in the browser with no external APIs or ML**.2. Open http://localhost:8000/frontend/index.html in your browser.



## Quick StartNotes:

- Everything is client-side and intentionally minimal to stay strictly inside the course syllabus.

### Prerequisites- The implementation is scaffold-level: tokenizer and automaton demos are functional; parser and TM are small educational demos for presentation.

- A web browser (Chrome, Firefox, Safari, Edge).Intent-aware Parser — frontend scaffold

- Python 3.x (for a simple local server).

This folder contains a static single-page app prototype demonstrating tokenizer, DFA intent recognition and a simple CFG parser with visualizations.

### Run Locally

Files:

**Option 1: Serve frontend as the site root (easiest)**- index.html — main app shell

```bash- style.css — styles

cd /path/to/frontend- app.js — entry + UI logic

python3 -m http.server 8000- automata.js — tokenizer and small DFA simulator & renderer

# Open http://localhost:8000 in your browser- parser.js — tiny parser and parse-tree renderer

```

How to run:

**Option 2: Serve from project root**Open `frontend/index.html` in a modern browser (double-click or use a local static server). For a quick local server:

```bash

cd /path/to/LexicalAnalysisGeneratorPython 3.x:

python3 -m http.server 8000

# Open http://localhost:8000/frontend/index.html in your browser```bash

```python3 -m http.server --directory frontend 8000

```

### Troubleshooting

- If you see stale/old content, do a hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac).Then open http://localhost:8000 in your browser.

- Or open the page in an **incognito/private window** to bypass browser cache.

Notes:

---- This is a visual scaffold for demonstration and for mapping Units I-III. Unit IV and V are placeholders for CNF/pumping lemma and TM demos which can be added as optional extras.

- I can extend this scaffold with more features, animations, and polish if you'd like.

## Demo Script & Walkthrough

### Opening & Setup (30 seconds)
1. Load the page. You'll see:
   - **Left panel**: Input textarea with example buttons and a checklist of TOC units.
   - **Right panel**: Visualizations for automaton, parse tree, and Turing machine.

2. **Start with example input**: Click the "Example: Remind" button to populate the input field.

### Unit I & II: Tokenizer & DFA (1–2 minutes)

3. **Click "Tokenize"**:
   - The input is split into tokens (NUMBER, KEYWORD, WORD, etc.) shown in the **Tokens** panel.
   - Highlight steps through each token.

4. **Click "Run DFA"**:
   - The automaton animates, stepping through each token and transitioning between states (q0 → REMIND/SET/GREET).
   - A notification shows the recognized **intent** (e.g., "Intent: REMIND").
   - Demonstrates how a finite automaton recognizes patterns in input.

5. **Manually step**: Use "◀ Step" and "Step ▶" to manually replay the DFA trace.

### Unit III: CFG & Parser (1–2 minutes)

6. **Click "Parse"**:
   - The parser builds a **parse tree** from the input using a simple recursive-descent parser.
   - The tree shows the grammar structure: RemindCommand → ACTION + TIME, etc.
   - If multiple parses are possible, **candidate buttons** appear below the tree (e.g., "1. RemindCommand", "2. SetCommand").
   - Click a candidate to re-render the tree for that interpretation.

7. **Click "Animate PDA"**:
   - The **PDA stack trace** appears, showing push/pop operations as the parser processes tokens.
   - Simulates how a pushdown automaton would parse a context-free language.

### Unit IV: CNF, Pumping Lemma & Intersection (1 minute)

8. **Click "CNF Converter"**:
   - Shows a toy conversion of grammar rules to Chomsky Normal Form (for education).

9. **Click "Pumping Lemma Demo"**:
   - Displays an example string from L = {a^n b^n} and explains how pumping breaks the property.

10. **Click "CFL ∩ Regular"**:
    - Tests whether the input matches both a context-free language AND a regular expression.
    - Shows the intersection of a CFL with a regular language (undecidable in general, but solvable for specific cases).

### Unit V: Turing Machine & PCP (1 minute)

11. **Click "Run TM (demo)"**:
    - A **bounded Turing machine** visualizer appears with a tape and controls.
    - **Demo**: Simulates unary increment (adds a "1" to the tape).
    - Use "Step", "Run", and "Reset" to control the machine.
    - Shows that TMs can compute beyond context-free languages.

12. **Click "Post Correspondence Problem (PCP)"**:
    - Shows a small set of tile pairs (top/bottom strings).
    - Searches for a solution (a sequence of tiles where concatenation of tops equals bottoms).
    - If found, displays the solution indices; if not, shows "No solution within bound."
    - Illustrates the **undecidable problem** (no general algorithm to solve PCP).

---

## Demo Questions & Grading Rubric

Use these questions and observations to guide student demos and assess understanding:

### Questions for the Student (Formative)

1. **Unit I & II (Automata & Regular Languages)**
   - "Why does the DFA have four states (q0, q1, q2, q3)? What does each represent?"
     - *Expected*: q0 is start, q1/q2/q3 are accepting states for REMIND/SET/GREET.
   - "How would you add support for a new intent (e.g., 'CANCEL')? Would you modify the tokenizer or DFA?"
     - *Expected*: Modify the DFA transitions and add a new state.
   - "What would happen if the input contains no recognized keywords?"
     - *Expected*: The DFA stays in q0, intent is UNKNOWN.

2. **Unit III (Context-Free Languages & Parsing)**
   - "Why is a parser needed if the tokenizer already splits the input?"
     - *Expected*: Tokens must be structured; the parser enforces grammar rules (e.g., "reminder must have ACTION and TIME").
   - "What does the PDA stack trace show? When is something pushed vs. popped?"
     - *Expected*: Push when entering a non-terminal, pop when leaving. Reflects the grammar structure.
   - "Try parsing 'remind me to buy milk.' Is it valid? Why or why not?"
     - *Expected*: May fail if TIME is missing (grammar requires "at <time>").

3. **Unit IV (Decidability & CNF)**
   - "Why is the CNF conversion useful in computability theory?"
     - *Expected*: CNF is a standard form; the Pumping Lemma uses CNF to prove non-membership.
   - "What does the pumping lemma tell us about the language {a^n b^n}?"
     - *Expected*: The language is **not regular** (if pumped, we break the balance of a's and b's).
   - "Can you think of a string in {a^n b^n} that the Pumping Lemma would reject if we pumped it?"
     - *Expected*: "a^3 b^3" → pump the "a" part → "a^4 b^3" ∉ language.

4. **Unit V (Turing Machines & Undecidability)**
   - "What is the purpose of the Turing machine's tape and head? How does it differ from a PDA?"
     - *Expected*: The tape can move left/right (unlike PDA stack, which is LIFO); TMs can compute any computable function.
   - "The demo TM increments a unary number. Could a TM decrement? Multiply?"
     - *Expected*: Yes, TMs are Turing-complete; they can compute any computable function.
   - "Why is the Post Correspondence Problem unsolvable (undecidable)?"
     - *Expected*: There is no general algorithm that can decide whether a solution exists for **all** PCP instances. (Undecidable ≠ unsolvable; small instances may have solutions.)

5. **Ambiguity & Parse Variants**
   - "When you see multiple parse candidates, what does that mean?"
     - *Expected*: The grammar is ambiguous for that input; multiple valid parses exist.
   - "How would you disambiguate the grammar to allow only one parse?"
     - *Expected*: Add precedence rules, operator precedence, or rewrite the grammar to be unambiguous.

### Grading Rubric (Suggested 20 marks breakdown)

| Criterion | Marks | Indicators |
|-----------|-------|-----------|
| **Unit I Automata** | 3 | DFA correctly recognizes intent; states and transitions are logically sound. Student explains state transitions. |
| **Unit II Tokenization** | 2 | Tokenizer correctly splits input; regex patterns are appropriate. |
| **Unit III Parser & PDA** | 4 | Recursive-descent parser produces correct parse tree; PDA trace animates correctly; student explains stack operations. |
| **Unit IV CNF/Pumping/Intersection** | 3 | Toy demos are present; student grasps why pumping lemma matters (proves non-regularity). |
| **Unit V TM & PCP** | 3 | TM visualizer runs and animates; PCP solver works on bounded instances. Student explains undecidability. |
| **UI/UX & Polish** | 2 | Interface is responsive, animations are smooth, error handling is graceful. |
| **Code Quality & Documentation** | 2 | Code is modular, functions have clear purposes; README and comments explain the project. |
| **Presentation & Clarity** | 1 | Student clearly articulates how the project maps to the syllabus; demo flows logically. |

---

## File Structure

```
frontend/
├── index.html           # Main SPA shell (UI layout, controls, panels)
├── style.css            # Visual theme (dark mode, animations, responsive)
├── app.js               # Entry point and orchestrator (UI wiring, event handlers)
├── tokenizer.js         # Regex-based tokenizer (tokens: NUMBER, KEYWORD, WORD, etc.)
├── automata.js          # DFA simulator and SVG visualization
├── parser.js            # Recursive-descent parser, parse-tree renderer, PDA trace
├── tm.js                # Tiny Turing machine visualizer (step/run/reset controls)
├── pcp.js               # Bounded PCP solver (search for tile sequences)
├── cnf.js               # Toy CNF converter (educational demo)
├── pumping.js           # Pumping lemma illustration
├── intersection.js      # CFL ∩ Regular language checker
└── README.md            # This file
```

---

## Design Principles

1. **Strictly on-syllabus**: No ML, no external APIs, no over-engineering. Every feature maps to Units I–V.
2. **Visual & Interactive**: Animations, step controls, and real-time feedback help students *see* theory in action.
3. **Client-side only**: No server; runs in any modern browser. Portable and easy to demo.
4. **Modular code**: Each component (tokenizer, automata, parser, TM, etc.) is a separate module; easy to extend or reuse.
5. **Graceful degradation**: If a feature is unavailable, the demo shows a helpful message rather than crashing.

---

## Extending the Project (Optional Enhancements)

- **NFA → DFA conversion**: Add a visual converter.
- **More grammar examples**: Support different languages (arithmetic, Boolean logic, etc.).
- **Automated tests**: Unit tests for parser variants, edge cases.
- **Accessibility**: ARIA labels, keyboard navigation for blind/low-vision users.
- **Mobile UI**: Responsive design improvements for tablets and phones.

---

## Authors & Attribution

This project is a course submission for the **Theory of Computation** course.  
Built with vanilla HTML, CSS, and JavaScript (ES modules).

---

## License

This project is provided as-is for educational purposes.
