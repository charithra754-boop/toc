# TOC Interactive Demo — Frontend

A **visually polished, client-side Theory of Computation interactive demo** that maps the entire course syllabus (Units I–V) to a single, cohesive project: intent-aware parsing with step-by-step automata, parser, and Turing machine visualizations.

## Project Pitch

This project demonstrates that **Theory of Computation is not abstract**—it powers real systems. By building an intent-aware parser for natural-language commands ("remind me to buy milk at 5 pm"), students encounter:

- **Unit I (Automata)**: A DFA recognizes command intent (REMIND, SET, GREET).
- **Unit II (Regular Languages)**: A tokenizer splits input into tokens via regex patterns.
- **Unit III (Context-Free Languages)**: A recursive-descent parser builds a parse tree and simulates PDA stack operations.
- **Unit IV (Decidability & CNF)**: Toy demonstrations of CNF conversion, pumping lemma, and language intersection.
- **Unit V (Computability)**: A bounded Turing machine visualizer and a Post Correspondence Problem (PCP) solver (undecidability example).

All components are **fully interactive**, **visually animated**, and **runnable in the browser with no external APIs or ML**.

## Quick Start

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge).
- Python 3.x (for a simple local server).

### Run Locally

**Option 1: Serve frontend as the site root (easiest)**

```bash
cd /path/to/frontend
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

**Option 2: Serve from project root**

```bash
cd /path/to/LexicalAnalysisGenerator
python3 -m http.server --directory frontend 8000
# Open http://localhost:8000 in your browser
```

### Troubleshooting

- If you see stale/old content, do a hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac).
- Or open the page in an **incognito/private window** to bypass browser cache.

---

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
    - Shows the intersection of a CFL with a regular language.

### Unit V: Turing Machine & PCP (1 minute)

11. **Click "Run TM (demo)"**:
    - A **bounded Turing machine** visualizer appears with a tape and controls.
    - **Demo**: Simulates unary increment (adds a "1" to the tape).
    - Use "Step", "Run", and "Reset" to control the machine.

12. **Click "Post Correspondence Problem (PCP)"**:
    - Shows a small set of tile pairs (top/bottom strings).
    - Searches for a solution (a sequence of tiles where concatenation of tops equals bottoms).
    - Illustrates the **undecidable problem** (no general algorithm to solve PCP).

---

## Demo Questions & Grading Rubric

### Questions for the Student (Formative)

1. **Unit I & II (Automata & Regular Languages)**
   - "Why does the DFA have four states (q0, q1, q2, q3)? What does each represent?"
     - *Expected*: q0 is start, q1/q2/q3 are accepting states for REMIND/SET/GREET.
   - "How would you add support for a new intent (e.g., 'CANCEL')?"
     - *Expected*: Modify the DFA transitions and add a new state.
   - "What would happen if the input contains no recognized keywords?"
     - *Expected*: The DFA stays in q0, intent is UNKNOWN.

2. **Unit III (Context-Free Languages & Parsing)**
   - "Why is a parser needed if the tokenizer already splits the input?"
     - *Expected*: Tokens must be structured; the parser enforces grammar rules.
   - "What does the PDA stack trace show? When is something pushed vs. popped?"
     - *Expected*: Push when entering a non-terminal, pop when leaving.
   - "Try parsing 'remind me to buy milk.' Is it valid? Why or why not?"
     - *Expected*: May fail if TIME is missing (grammar requires "at <time>").

3. **Unit IV (Decidability & CNF)**
   - "Why is the CNF conversion useful in computability theory?"
     - *Expected*: CNF is a standard form for CYK parsing and pumping lemma proofs.
   - "What does the pumping lemma tell us about {a^n b^n}?"
     - *Expected*: The language is **not regular**.

4. **Unit V (Turing Machines & Undecidability)**
   - "What is the purpose of the TM's tape and head? How does it differ from a PDA?"
     - *Expected*: Tape can move left/right (unlike PDA's LIFO stack); TMs can compute any computable function.
   - "Why is the Post Correspondence Problem unsolvable (undecidable)?"
     - *Expected*: No general algorithm can decide all PCP instances.

### Grading Rubric (Suggested 20 marks breakdown)

| Criterion | Marks | Indicators |
|-----------|-------|-----------:|
| **Unit I Automata** | 3 | DFA correctly recognizes intent; student explains state transitions. |
| **Unit II Tokenization** | 2 | Tokenizer correctly splits input; regex patterns are appropriate. |
| **Unit III Parser & PDA** | 4 | Parse tree is correct; PDA trace animates; student explains stack operations. |
| **Unit IV CNF/Pumping/Intersection** | 3 | Toy demos present; student grasps why pumping lemma matters. |
| **Unit V TM & PCP** | 3 | TM visualizer runs; PCP solver works. Student explains undecidability. |
| **UI/UX & Polish** | 2 | Interface is responsive, animations are smooth. |
| **Code Quality & Documentation** | 2 | Code is modular; README and comments explain the project. |
| **Presentation & Clarity** | 1 | Student clearly maps project to syllabus; demo flows logically. |

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

1. **Strictly on-syllabus**: No ML, no external APIs. Every feature maps to Units I–V.
2. **Visual & Interactive**: Animations, step controls, and real-time feedback.
3. **Client-side only**: No server; runs in any modern browser.
4. **Modular code**: Each component is a separate ES module; easy to extend.
5. **Graceful degradation**: If a feature is unavailable, the demo shows a helpful message.

---

## License

This project is provided as-is for educational purposes.
