# Release — Compiled Binaries (Legacy)

## Overview

This folder contains **pre-compiled Windows binaries** and runtime dependencies from the original Qt lexical analyzer project. These are **historical artifacts** and are **not part of the current ToC demo**.

## Contents

| Item | Description |
|------|-------------|
| `Parsing.exe` | Compiled executable (Windows) for the original Qt application. |
| `*.dll` | Qt runtime libraries and Windows dependencies (D3Dcompiler, libgcc, libstdc++, libwinpthread, etc.). |
| `iconengines/`, `imageformats/`, `platforms/`, `translations/` | Qt plugin directories (icons, image codec, platform themes, translations). |
| `Code.cpp` | Generated C++ lexical analyzer code (output from running the Qt app). |
| `moc_*.cpp`, `moc_*.o` | Qt Meta-Object Compiler artifacts (intermediate build files). |
| `*.o` | Compiled object files. |
| `regex.txt` | Sample regex input file (saved from the Qt app). |

## Why This Folder Exists

When the original Qt project was built on Windows, the compiler produced:
1. An executable (`Parsing.exe`).
2. Runtime dependencies (DLLs from Qt and MinGW).
3. Intermediate build artifacts (`.o`, `moc_` files).

These were committed to the repository for distribution/convenience, though they are **platform-specific** and now **obsolete**.

## What to Do With This Folder

- **Keep it**: For historical reference, if you need to understand the original build process.
- **Delete it** (recommended): It takes up space and is not needed for the new web-based demo.

To remove it:
```bash
cd /path/to/LexicalAnalysisGenerator
rm -rf release
git add -A
git commit -m "Remove legacy Qt binaries folder"
git push origin main
```

## Current Recommended Approach

Instead of running desktop binaries, use the **new web-based interactive demo**:

```bash
cd frontend
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

This is:
- ✅ Cross-platform (works on Windows, Mac, Linux).
- ✅ No compilation required.
- ✅ Covers all five ToC units.
- ✅ Fully interactive with animations.

## See Also

- `frontend/README.md` — The new, recommended interactive demo.
- `parsing/README.md` — Documentation of the original Qt source code.
- `README.md` (root) — Project overview.
