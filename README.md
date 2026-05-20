# Theory of Computation — Interactive Demo Project### 编译原理实验: XLEX-词法自动生成器



A comprehensive course project demonstrating all five units of **Theory of Computation** through a single, cohesive intent-aware parsing system with interactive visualizations.作者：华南师范大学 关竣佑



## Project Overview欢迎  star 



This project remixes concepts from **Units I–V** of the ToC syllabus into a practical, real-world application: an **intent-aware natural-language command parser** with step-by-step visualizations of:编译环境 Qt 4.3.0        需要放在英文路径下

**实现将正则表达式-->NFA--->DFA-->DFA最小化-->词法分析程序**

- **Tokenization** (regex, regular languages)

- **Intent recognition** (finite automata, DFA)1. 正则表达式 **支持单个字符**，运算符号有： 连接、选择（|）、闭包（*）、括号（）、可选（?  ）、正闭包（+ ）

- **Command parsing** (context-free grammars, push-down automata)

- **Language properties** (CNF, pumping lemma, language intersections)2. 用户输入一行（一个）或多行（多个）正则表达式（可保存、打开正则表达式文件）

- **Computability** (Turing machines, undecidable problems like PCP)

3. 用户可以查看转换得到的NFA（用状态转换表呈现）

### Key Features

4. 用户可以查看转换得到的DFA（用状态转换表呈现）

✅ **Fully Interactive**: Click buttons to tokenize, run DFA, animate PDA, run TM steps.  

✅ **Visual**: SVG animations for automata, parse trees, and machine tape.  5. 用户可以查看转换得到的词法分析程序（该分析程序用C++语言描述）

✅ **Educational**: Designed for classroom demos and student understanding.  

✅ **Client-side**: No server, no external APIs. Runs in any modern browser.  输入正则表达式可换行，换行默认在两行间加  选择（|）

✅ **On-syllabus**: Strictly adheres to the ToC curriculum. No ML, no shortcuts.  

可保存正则表达式 （默认保存为 regex.txt 在 release 目录下）

## Repository Structure

可选择任意正则表达式文件 （TXT格式) 载入为正则表达式输入 

```

LexicalAnalysisGenerator/界面示意

├── frontend/                    # ⭐ Main interactive demo (focus here!)

│   ├── index.html              # SPA shell with UI layout![image-20231024162948790](README.assets/image-20231024162948790.png)

│   ├── app.js                  # Event handlers & orchestration

│   ├── tokenizer.js            # Regex-based tokenization![image-20231024163007823](README.assets/image-20231024163007823.png)

│   ├── automata.js             # DFA simulator & visualization

│   ├── parser.js               # Recursive-descent parser & parse tree![image-20231024163051995](README.assets/image-20231024163051995.png)

│   ├── tm.js                   # Tiny Turing machine demo

│   ├── pcp.js                  # PCP bounded solver![image-20231024163125175](README.assets/image-20231024163125175.png)

│   ├── cnf.js, pumping.js, intersection.js  # Theory tools
│   ├── style.css               # Dark-mode visual theme
│   └── README.md               # Full demo walkthrough & Q&A guide
│
├── parsing/                     # Original Qt project (legacy)
│   └── [Qt C++ source files]   # Historical reference; not used in main project
│
├── release/                     # Compiled Qt binaries (legacy)
│   └── [Windows DLLs, exe]     # Historical artifacts; not used in main project
│
├── README.assets/               # Images & documentation assets
│   └── [PNG screenshots]        # Historical screenshots from Qt UI
│
└── README.md                    # This file
```

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge).
- Python 3.x (for serving files locally).

### Run the Demo

```bash
# Navigate to frontend folder
cd frontend

# Start a local HTTP server
python3 -m http.server 8000

# Open your browser to http://localhost:8000
```

Then:
1. Click "Example: Remind" to populate the input.
2. Click "Tokenize" to see tokens.
3. Click "Run DFA" to see intent recognition.
4. Click "Parse" to see the parse tree.
5. Click theory tool buttons (CNF, Pumping Lemma, CFL ∩ Regular, PCP, TM).

See `frontend/README.md` for a full **demo script**, **walkthrough**, and **grading rubric**.

## Project Scope & Mapping

| **Unit** | **TOC Concept** | **In This Project** |
|----------|-----------------|-------------------|
| **I** | Finite Automata & DFA | Intent-recognizing DFA with 4 states and animated transitions. |
| **II** | Regular Languages & Regex | Tokenizer using regex patterns (NUMBER, KEYWORD, WORD, TIME). |
| **III** | Context-Free Grammars & PDA | Recursive-descent parser + PDA stack trace animation. |
| **IV** | CNF & Pumping Lemma | Toy CNF converter, pumping-lemma illustration, language intersection demo. |
| **V** | Turing Machines & Undecidability | Bounded TM visualizer (unary increment), PCP bounded solver. |

## How to Extend

- **Add more grammar rules**: Edit the grammar in `parser.js` to support arithmetic, Boolean logic, or other languages.
- **Add more automata states**: Extend the DFA in `automata.js` for additional intents or keywords.
- **Build a real backend**: Add a server to parse user commands and execute actions (e.g., set reminders in a calendar app).
- **Add NFA↔DFA converter**: Visualize the subset construction algorithm.
- **Automated tests**: Add unit tests for tokenizer, parser, and TM modules.

## Demo Video / Screenshots

See `frontend/README.md` for the full walkthrough. Key demo steps:

1. **Tokenize** input (Unit II: regex).
2. **Run DFA** to recognize intent (Unit I: automata).
3. **Parse** to build tree (Unit III: CFG/PDA).
4. **View theory tools** (Unit IV: CNF/pumping/intersection).
5. **Run TM & PCP** (Unit V: computability).

**Total demo time: ~5–7 minutes**, perfect for grading presentations.

## Grading & Assessment

See `frontend/README.md` for a **20-mark grading rubric**:

- Unit I (Automata): 3 marks
- Unit II (Tokenization): 2 marks
- Unit III (Parser/PDA): 4 marks
- Unit IV (CNF/Pumping/Intersection): 3 marks
- Unit V (TM/PCP): 3 marks
- UI/UX & Polish: 2 marks
- Code Quality & Docs: 2 marks
- Presentation & Clarity: 1 mark

## Authors & License

**Course**: Theory of Computation  
**Built with**: HTML5, CSS3, Vanilla JavaScript (ES modules)  
**License**: Educational use

---

## Historical Note

This repository was originally a **Qt-based lexical analyzer generator** (Chinese academic project). It has been repurposed into a **Theory of Computation teaching demo** covering all five units of the syllabus. The `parsing/` and `release/` folders are preserved as historical reference; the primary focus is now the `frontend/` interactive demo.
