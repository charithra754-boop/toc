#!/usr/bin/env python3
"""
Python fallback for regex_engine.cpp.
Implements the exact same regex -> NFA -> DFA -> minimized DFA logic.
"""
import sys, json

stateCounter = 0
DFANodeCounter = 0
SimplifyDFACounter = 0

priorityMap = {'|': 1, '.': 2, '?': 3, '*': 3, '+': 3}
operatorChar = set()
operatorCharTmp = set()

class State:
    def __init__(self, id, isAccepting=False):
        self.id = id
        self.transitions = []
        self.isAccepting = isAccepting
        self.isStarting = False

class NFA:
    def __init__(self, start, end):
        self.start = start
        self.end = end

class DFANode:
    def __init__(self):
        global DFANodeCounter
        self.id = DFANodeCounter
        DFANodeCounter += 1
        self.transitions = []
        self.nfaNodes = set()
        self.isAccepting = False
        self.isStarting = False
        self.SDFANum = 0

class SimplifyDFANode:
    def __init__(self, id, isAc=False):
        self.id = id
        self.transitions = []
        self.dfaNodes = set()
        self.isAccepting = isAc
        self.isStarting = False

dfaNodes = []
G = {}
outDegree = {}
inDegree = {}
NFAMap = {}
SDFAMap = {}
SDFAQue = []

def createState(id, isAccepting=False):
    s = State(id, isAccepting)
    NFAMap[id] = s
    if id not in G: G[id] = []
    outDegree[id] = 0
    inDegree[id] = 0
    return s

def concatenate(a, b):
    a.end.transitions.append(('#', b.start))
    a.end.isAccepting = False
    b.start.isStarting = False
    G[a.end.id].append(b.start)
    return NFA(a.start, b.end)

def unionNFA(a, b):
    global stateCounter
    s = createState(stateCounter); stateCounter+=1; s.isStarting = True
    s.transitions.extend([('#', a.start), ('#', b.start)])
    G[s.id].extend([a.start, b.start])
    e = createState(stateCounter, True); stateCounter+=1
    a.end.transitions.append(('#', e)); b.end.transitions.append(('#', e))
    G[a.end.id].append(e); G[b.end.id].append(e)
    a.end.isAccepting = False; b.end.isAccepting = False
    a.start.isStarting = False; b.start.isStarting = False
    return NFA(s, e)

def closure(n):
    global stateCounter
    s = createState(stateCounter); stateCounter+=1; s.isStarting = True
    e = createState(stateCounter, True); stateCounter+=1
    s.transitions.append(('#', n.start)); G[s.id].append(n.start)
    n.end.transitions.append(('#', e)); G[n.end.id].append(e)
    n.end.transitions.append(('#', n.start)); G[n.end.id].append(n.start)
    s.transitions.append(('#', e)); G[s.id].append(e)
    n.end.isAccepting = False; n.start.isStarting = False
    return NFA(s, e)

def closurePositive(n):
    global stateCounter
    s = createState(stateCounter); stateCounter+=1; s.isStarting = True
    e = createState(stateCounter, True); stateCounter+=1
    s.transitions.append(('#', n.start)); G[s.id].append(n.start)
    n.end.transitions.append(('#', e)); G[n.end.id].append(e)
    n.end.transitions.append(('#', n.start)); G[n.end.id].append(n.start)
    n.end.isAccepting = False; n.start.isStarting = False
    return NFA(s, e)

def selectNFA(n):
    global stateCounter
    s = createState(stateCounter); stateCounter+=1; s.isStarting = True
    e = createState(stateCounter, True); stateCounter+=1
    s.transitions.append(('#', n.start)); G[s.id].append(n.start)
    n.end.transitions.append(('#', e)); G[n.end.id].append(e)
    s.transitions.append(('#', e)); G[s.id].append(e)
    n.end.isAccepting = False; n.start.isStarting = False
    return NFA(s, e)

def isWordChar(c):
    return ('a'<=c<='z') or ('A'<=c<='Z') or ('0'<=c<='9')

def regexToNFA(regex):
    global stateCounter, operatorChar
    ns = []
    os = []
    
    def process_op():
        op = os.pop()
        if op == '|':
            b = ns.pop(); a = ns.pop()
            ns.append(unionNFA(a, b))
        elif op == '.':
            b = ns.pop(); a = ns.pop()
            ns.append(concatenate(a, b))

    for c in regex:
        if c == '(':
            os.append(c)
        elif c == ')':
            while os and os[-1] != '(':
                process_op()
            if os: os.pop()
        elif c == '*':
            ns.append(closure(ns.pop()))
        elif c == '+':
            ns.append(closurePositive(ns.pop()))
        elif c == '?':
            ns.append(selectNFA(ns.pop()))
        elif c in ('|', '.'):
            while os and os[-1] != '(' and priorityMap.get(c, 0) <= priorityMap.get(os[-1], 0):
                process_op()
            os.append(c)
        else:
            s1 = createState(stateCounter); stateCounter+=1; s1.isStarting = True
            s2 = createState(stateCounter, True); stateCounter+=1
            s1.transitions.append((c, s2))
            operatorChar.add(c)
            G[s1.id].append(s2)
            outDegree[s1.id] -= 1
            inDegree[s2.id] -= 1
            ns.append(NFA(s1, s2))
            
    while os:
        process_op()
    return ns[-1]

def calculateDegree():
    for i in range(stateCounter):
        outDegree[i] += len(G.get(i, []))
        for g_node in G.get(i, []):
            inDegree[g_node.id] += 1

def dfs(node):
    dfaNodes[-1].nfaNodes.add(node)
    if NFAMap[node].isAccepting: dfaNodes[-1].isAccepting = True
    if NFAMap[node].isStarting: dfaNodes[-1].isStarting = True
    if outDegree[node] <= 0: return
    for g_node in G.get(node, []):
        dfs(g_node.id)

def dfsFindDFA(node, nfaSet):
    nfaSet.add(node.id)
    if outDegree[node.id] <= 0: return
    for g_node in G.get(node.id, []):
        dfsFindDFA(g_node, nfaSet)

def findNextDFANode(node):
    dfas = []
    if not node.transitions: return dfas
    for sym, target in node.transitions:
        nfaSet = set()
        dfsFindDFA(target, nfaSet)
        for d in dfaNodes:
            if d.nfaNodes == nfaSet:
                dfas.append((sym, d))
    return dfas

def NFAtoDFA():
    global DFANodeCounter
    for i in range(stateCounter):
        if inDegree[i] <= 0:
            dfaNodes.append(DFANode())
            dfs(i)
            
    unionPair = []
    for dn in dfaNodes:
        opMap = {}
        for nfa in dn.nfaNodes:
            if outDegree[nfa] > 0: continue
            next_nodes = findNextDFANode(NFAMap[nfa])
            if not next_nodes or not NFAMap[nfa].transitions: continue
            for sym, dfa in next_nodes:
                if sym in opMap:
                    unionPair.append((opMap[sym], dfa))
                opMap[sym] = dfa
                
    for a, b in unionPair:
        if b in dfaNodes:
            if b.isAccepting: a.isAccepting = True
            if b.isStarting: a.isStarting = True
            a.nfaNodes.update(b.nfaNodes)
            dfaNodes.remove(b)
            
    DFANodeCounter = len(dfaNodes)
    for i, d in enumerate(dfaNodes):
        d.id = i
        
    for dn in dfaNodes:
        nextNFAs = {op: set() for op in operatorChar}
        for nfa in dn.nfaNodes:
            if outDegree[nfa] > 0 or not NFAMap[nfa].transitions: continue
            sym = NFAMap[nfa].transitions[0][0]
            dfsFindDFA(NFAMap[nfa].transitions[0][1], nextNFAs[sym])
        for op in operatorChar:
            if not nextNFAs[op]: continue
            for d in dfaNodes:
                if d.nfaNodes == nextNFAs[op]:
                    dn.transitions.append((op, d))

def SplitDFANode(node, op):
    global SimplifyDFACounter
    splitMap = {}
    for dn in node.dfaNodes:
        nxt = -1
        for sym, t in dn.transitions:
            if sym == op: nxt = t.id
        if nxt not in splitMap: splitMap[nxt] = set()
        splitMap[nxt].add(dn)
        
    ans = []
    for i, (nxt, dfaSet) in enumerate(splitMap.items()):
        if i == 0:
            n = SimplifyDFANode(node.id)
        else:
            if SimplifyDFACounter == 0 and node.id == 0:
                n = SimplifyDFANode(1)
            else:
                n = SimplifyDFANode(SimplifyDFACounter)
                SimplifyDFACounter += 1
        for dn in dfaSet:
            if dn.isAccepting: n.isAccepting = True
            if dn.isStarting: n.isStarting = True
        n.dfaNodes = dfaSet
        ans.append(n)
    return ans

def SimplifyDFA():
    global SimplifyDFACounter
    notAC = set()
    AC = set()
    SimplifyDFACounter = 0
    for d in dfaNodes:
        if d.isAccepting: AC.add(d)
        else: notAC.add(d)
        
    if notAC:
        ns = SimplifyDFANode(SimplifyDFACounter); SimplifyDFACounter += 1
        ns.dfaNodes = notAC
        SDFAQue.append(ns)
    if AC:
        ne = SimplifyDFANode(SimplifyDFACounter, True); SimplifyDFACounter += 1
        ne.dfaNodes = AC
        SDFAQue.append(ne)
        
    for op in operatorChar:
        sz = len(SDFAQue)
        for _ in range(sz):
            dn = SDFAQue.pop(0)
            for s in SplitDFANode(dn, op):
                SDFAQue.append(s)
                
    while SDFAQue:
        s = SDFAQue.pop(0)
        SDFAMap[s.id] = s
        for d in s.dfaNodes:
            d.SDFANum = s.id

def BuildSimplifyDFA():
    for sid, s in SDFAMap.items():
        for dn in s.dfaNodes:
            for sym, tgt in dn.transitions:
                nxt = tgt.SDFANum
                exists = any(e_sym == sym and e_tgt.id == nxt for e_sym, e_tgt in s.transitions)
                if not exists:
                    s.transitions.append((sym, SDFAMap[nxt]))

def outputJSON():
    global operatorCharTmp
    operatorCharTmp = set(operatorChar) | {'#'}
    
    out = {}
    
    # NFA states
    out['nfa'] = {
        'stateCount': stateCounter,
        'symbols': list(operatorCharTmp),
        'states': []
    }
    for i in range(stateCounter):
        st = NFAMap[i]
        out['nfa']['states'].append({
            'id': i,
            'start': st.isStarting,
            'accept': st.isAccepting,
            'transitions': [{'symbol': 'ε' if sym == '#' else sym, 'to': tgt.id} for sym, tgt in st.transitions]
        })
        
    # DFA states
    out['dfa'] = {
        'stateCount': DFANodeCounter,
        'symbols': list(operatorChar),
        'states': []
    }
    for i in range(DFANodeCounter):
        d = dfaNodes[i]
        out['dfa']['states'].append({
            'id': i,
            'start': d.isStarting,
            'accept': d.isAccepting,
            'nfaStates': list(d.nfaNodes),
            'transitions': [{'symbol': sym, 'to': tgt.id} for sym, tgt in d.transitions]
        })
        
    # Minimized DFA states
    out['minimizedDfa'] = {
        'stateCount': SimplifyDFACounter,
        'symbols': list(operatorChar),
        'states': []
    }
    for i in range(SimplifyDFACounter):
        s = SDFAMap.get(i)
        if s:
            out['minimizedDfa']['states'].append({
                'id': i,
                'start': s.isStarting,
                'accept': s.isAccepting,
                'transitions': [{'symbol': sym, 'to': tgt.id} for sym, tgt in s.transitions]
            })
            
    print(json.dumps(out, indent=2))

def main():
    regex = sys.stdin.read().strip()
    if not regex:
        sys.exit(1)
        
    regex_chars = list(regex)
    for i in range(len(regex_chars)):
        if regex_chars[i] == '\n':
            regex_chars[i] = '|'
    regex = "".join(regex_chars)
    
    # Insert explicit concatenation
    new_regex = ""
    for i in range(len(regex) - 1):
        c, n = regex[i], regex[i+1]
        new_regex += c
        if (isWordChar(c) and isWordChar(n)) or \
           (isWordChar(c) and n == '(') or \
           (c == ')' and isWordChar(n)) or \
           (c == '*' and n not in (')', '|', '?')) or \
           (c == '?' and n != ')') or \
           (c == '+' and n not in (')', '|', '?')) or \
           (c == ')' and n == '('):
            new_regex += "."
    new_regex += regex[-1] if regex else ""
    regex = new_regex

    nfa = regexToNFA(regex)
    calculateDegree()
    NFAtoDFA()
    SimplifyDFA()
    BuildSimplifyDFA()
    outputJSON()

if __name__ == '__main__':
    main()
