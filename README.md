# Theory of Computation — Interactive Demo Project

A comprehensive course project demonstrating all five units of Theory of Computation through a single, cohesive intent-aware parsing system with interactive visualizations.

## Project Overview

This repository contains a Qt-based lexical analyzer generator and an interactive frontend demo that explains core automata, grammar, and computability concepts.

Key features:
- Regular expression → NFA → DFA → DFA minimization → C++ lexer program
- Supports concatenation, alternation (`|`), Kleene star (`*`), optional (`?`), positive closure (`+`), and grouping
- Save and load regex files
- Generate and inspect NFA/DFA transition tables
- View generated lexical analyzer code
- Designed for Qt 4.3.0

## Repository Structure

- `frontend/` — Interactive web demo and visualization tools
- `parsing/` — Legacy Qt C++ source files for the lexer generator
- `release/` — Legacy release assets and compiled files
- `README.assets/` — Historical screenshot assets (removed)

This repository has been cleaned of translation and non-English artifacts.
