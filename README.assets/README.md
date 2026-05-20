# README Assets — Historical Screenshots

## Overview

This folder contains **PNG screenshots** from the original Qt lexical analyzer application. These images are **historical references** and illustrate the UI of the deprecated desktop tool.

## Images

| File | Description |
|------|-------------|
| `image-20231024162948790.png` | Screenshot of the Qt app's main window with regex input. |
| `image-20231024163007823.png` | Screenshot showing NFA visualization (state transition table). |
| `image-20231024163051995.png` | Screenshot showing DFA visualization (state transition table). |
| `image-20231024163125175.png` | Screenshot showing generated C++ code output. |

## Why These Exist

These images were used in the original repository's README to document the Qt application's interface. They are preserved for **historical context** but are **no longer actively used** in the project documentation.

## Current Approach

The new web-based demo (`frontend/`) uses:
- **SVG-based visualizations** (interactive, scalable, rendered in the browser).
- **Real-time animations** (DFA states highlight, PDA stack animates, TM tape advances).
- **Online documentation** (see `frontend/README.md`).

This is far more engaging and educational than static screenshots.

## If You Want to Update Documentation

To add new screenshots or diagrams:
1. Take a screenshot of the new `frontend/` demo.
2. Save it as a PNG in this folder.
3. Update `frontend/README.md` or `README.md` to reference it.
4. Commit and push.

## See Also

- `frontend/README.md` — Full interactive demo documentation.
- `parsing/README.md` — Original Qt project documentation.
- `README.md` (root) — Project overview.
