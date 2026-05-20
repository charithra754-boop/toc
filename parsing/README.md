# Parsing — Original Qt Project (Legacy)

## Overview

This folder contains the **original lexical analyzer generator** project, built in Qt (C++). It was the historical foundation of this repository but is now **superseded by the web-based interactive demo** in the `frontend/` folder.

### Original Purpose (Historical)

The Qt application implemented:
- **Regular expression input**: Users could enter regex patterns (supporting `|`, `*`, `?`, `+`, parentheses).
- **NFA generation**: Convert regex → Non-deterministic Finite Automaton (state transition table).
- **DFA generation**: Convert NFA → Deterministic Finite Automaton.
- **DFA minimization**: Reduce DFA to minimum states.
- **Code generation**: Output a C++ lexical analyzer program.

### Build Environment

- **Qt 4.3.0**
- **Platform**: Originally Windows (see `release/` folder for compiled binaries and DLLs).
- **Language**: C++ with Qt UI framework.

## Why It Was Replaced

The original Qt project:
- ✅ Demonstrated regex → NFA → DFA pipeline (Unit I–II).
- ❌ Was **not interactive** in a browser (required desktop build).
- ❌ Did **not cover Units III–V** (CFG, PDA, TM, decidability).
- ❌ Was **not portable** (Windows-specific binaries).
- ❌ Had **limited UI polish** for educational demos.

The new `frontend/` web-based demo:
- ✅ Covers **all five ToC units** in one cohesive project.
- ✅ **Fully interactive** and runs in any modern browser.
- ✅ **Portable** (no build required, no platform dependencies).
- ✅ **Visually polished** with animations and step-by-step controls.
- ✅ **Educational** with demo script and Q&A grading rubric.

## Files in This Folder

| File | Purpose |
|------|---------|
| `main.cpp` | Entry point for Qt application. |
| `parsing.h` | Header file for the lexical analyzer class. |
| `parsing.cpp` | Implementation of tokenization and automata logic. |
| `parsing.ui` | Qt UI definition (forms, buttons, layouts). |
| `parsing.pro` | Qt project file (build configuration). |
| `parsing.pro.user` | Qt Creator project settings (IDE-specific). |

## How to Build (If Needed)

If you want to compile and run the original Qt application:

```bash
# Prerequisites: Qt 4.3.0 or later, qmake, and a C++ compiler

cd parsing
qmake parsing.pro
make

# On Windows: mingw32-make
# On Linux/Mac: make

# Run the compiled executable
./parsing  # or Parsing.exe on Windows
```

Note: This is for **historical reference only**. The recommended way to view the project is via `frontend/` in a web browser.

## Relation to the New Project

- **Units I–II (Regex/Automata)**: The original NFA/DFA logic in this folder inspired the DFA intent recognizer in `frontend/automata.js`.
- **Units III–V**: Entirely new implementation in `frontend/`.

If you are interested in understanding the NFA/DFA algorithms, you can review `parsing.cpp`. However, **students are encouraged to run and interact with the web-based demo** (`frontend/`) instead.

## See Also

- `frontend/README.md` — Full interactive demo, walkthrough, and grading rubric.
- `README.md` (root) — Project overview and quick-start guide.
