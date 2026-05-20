/**
 * Standalone CLI regex engine extracted from parsing.cpp
 * Usage: echo "a.b|c*" | ./regex_engine
 * Output: JSON with NFA, DFA, minimized DFA tables and generated code
 */
#include <iostream>
#include <map>
#include <vector>
#include <stack>
#include <queue>
#include <set>
#include <algorithm>
#include <string>
#include <sstream>

using namespace std;

int stateCounter = 0;
int DFANodeCounter = 0;
int SimplifyDFACounter = 0;

map<char, int> priorityMap;
set<char> operatorChar;
set<char> operatorCharTmp;

struct DFANode {
    int id;
    vector<pair<char, DFANode*>> transitions;
    set<int> nfaNodes;
    bool isAccepting;
    bool isStarting;
    int SDFANum;
    DFANode() : isAccepting(false), isStarting(false), SDFANum(0) {
        id = DFANodeCounter++;
    }
};

struct SimplifyDFANode {
    int id;
    vector<pair<char, SimplifyDFANode*>> transitions;
    set<DFANode*> dfaNodes;
    bool isAccepting;
    bool isStarting;
    SimplifyDFANode(int counter, bool isAc = false)
        : id(counter), isAccepting(isAc), isStarting(false) {}
};

struct State {
    int id;
    vector<pair<char, State*>> transitions;
    bool isAccepting;
    bool isStarting;
    State() : isAccepting(false), isStarting(false) {}
};

struct NFA { State* start; State* end; };

vector<DFANode*> dfaNodes;
vector<State*> G[1000];
int outDegree[1000];
int inDegree[1000];
map<int, State*> NFAMap;
map<int, SimplifyDFANode*> SDFAMap;
queue<SimplifyDFANode*> SDFAQue;

string nfaTable[200][200];
string dfaTable[200][200];
string sdfaTable[200][200];

bool isWordChar(char c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9'); }

State* createState(int id, bool isAccepting = false) {
    State* s = new State;
    s->id = id;
    s->isAccepting = isAccepting;
    NFAMap[id] = s;
    return s;
}

NFA concatenate(NFA a, NFA b) {
    a.end->transitions.push_back({'#', b.start});
    a.end->isAccepting = false;
    b.start->isStarting = false;
    G[a.end->id].push_back(b.start);
    return {a.start, b.end};
}

NFA unionNFA(NFA a, NFA b) {
    State* s = createState(stateCounter++); s->isStarting = true;
    s->transitions.push_back({'#', a.start});
    s->transitions.push_back({'#', b.start});
    G[s->id].push_back(a.start); G[s->id].push_back(b.start);
    State* e = createState(stateCounter++, true);
    a.end->transitions.push_back({'#', e}); b.end->transitions.push_back({'#', e});
    G[a.end->id].push_back(e); G[b.end->id].push_back(e);
    a.end->isAccepting = false; b.end->isAccepting = false;
    a.start->isStarting = false; b.start->isStarting = false;
    return {s, e};
}

NFA closure(NFA n) {
    State* s = createState(stateCounter++); s->isStarting = true;
    State* e = createState(stateCounter++, true);
    s->transitions.push_back({'#', n.start}); G[s->id].push_back(n.start);
    n.end->transitions.push_back({'#', e}); G[n.end->id].push_back(e);
    n.end->transitions.push_back({'#', n.start}); G[n.end->id].push_back(n.start);
    s->transitions.push_back({'#', e}); G[s->id].push_back(e);
    n.end->isAccepting = false; n.start->isStarting = false;
    return {s, e};
}

NFA closurePositive(NFA n) {
    State* s = createState(stateCounter++); s->isStarting = true;
    State* e = createState(stateCounter++, true);
    s->transitions.push_back({'#', n.start}); G[s->id].push_back(n.start);
    n.end->transitions.push_back({'#', e}); G[n.end->id].push_back(e);
    n.end->transitions.push_back({'#', n.start}); G[n.end->id].push_back(n.start);
    n.end->isAccepting = false; n.start->isStarting = false;
    return {s, e};
}

NFA selectNFA(NFA n) {
    State* s = createState(stateCounter++); s->isStarting = true;
    State* e = createState(stateCounter++, true);
    s->transitions.push_back({'#', n.start}); G[s->id].push_back(n.start);
    n.end->transitions.push_back({'#', e}); G[n.end->id].push_back(e);
    s->transitions.push_back({'#', e}); G[s->id].push_back(e);
    n.end->isAccepting = false; n.start->isStarting = false;
    return {s, e};
}

string intToString(int n) {
    if (n == 0) return "0";
    string r; while (n > 0) { r = char('0' + n % 10) + r; n /= 10; } return r;
}

NFA regexToNFA(string regex) {
    stack<NFA> ns; stack<char> os;
    for (char c : regex) {
        if (c == '(') { os.push(c); }
        else if (c == ')') {
            while (!os.empty() && os.top() != '(') {
                char op = os.top(); os.pop();
                if (op == '|') { NFA b = ns.top(); ns.pop(); NFA a = ns.top(); ns.pop(); ns.push(unionNFA(a, b)); }
                else if (op == '.') { NFA b = ns.top(); ns.pop(); NFA a = ns.top(); ns.pop(); ns.push(concatenate(a, b)); }
            }
            if (!os.empty()) os.pop();
        }
        else if (c == '*') { NFA a = ns.top(); ns.pop(); ns.push(closure(a)); }
        else if (c == '+') { NFA a = ns.top(); ns.pop(); ns.push(closurePositive(a)); }
        else if (c == '?') { NFA a = ns.top(); ns.pop(); ns.push(selectNFA(a)); }
        else if ((c == '|' || c == '.') && !os.empty() && priorityMap[c] <= priorityMap[os.top()]) {
            while (!os.empty() && priorityMap[c] <= priorityMap[os.top()] && os.top() != '(') {
                char op = os.top(); os.pop();
                if (op == '|') { NFA b = ns.top(); ns.pop(); NFA a = ns.top(); ns.pop(); ns.push(unionNFA(a, b)); }
                else if (op == '.') { NFA b = ns.top(); ns.pop(); NFA a = ns.top(); ns.pop(); ns.push(concatenate(a, b)); }
            }
            os.push(c);
        }
        else if (c == '|' || c == '.') { os.push(c); }
        else {
            State* s1 = createState(stateCounter++); s1->isStarting = true;
            State* s2 = createState(stateCounter++, true);
            s1->transitions.push_back({c, s2});
            operatorChar.insert(c);
            G[s1->id].push_back(s2);
            outDegree[s1->id]--; inDegree[s2->id]--;
            ns.push({s1, s2});
        }
    }
    while (!os.empty()) {
        char op = os.top(); os.pop();
        if (op == '|') { NFA b = ns.top(); ns.pop(); NFA a = ns.top(); ns.pop(); ns.push(unionNFA(a, b)); }
        else if (op == '.') { NFA b = ns.top(); ns.pop(); NFA a = ns.top(); ns.pop(); ns.push(concatenate(a, b)); }
    }
    return ns.top();
}

void calculateDegree() {
    for (int i = 0; i < stateCounter; i++) {
        outDegree[i] += G[i].size();
        for (size_t j = 0; j < G[i].size(); j++) inDegree[G[i][j]->id]++;
    }
}

void dfs(int node) {
    dfaNodes[dfaNodes.size() - 1]->nfaNodes.insert(node);
    if (NFAMap[node]->isAccepting) dfaNodes[dfaNodes.size() - 1]->isAccepting = true;
    if (NFAMap[node]->isStarting) dfaNodes[dfaNodes.size() - 1]->isStarting = true;
    if (outDegree[node] <= 0) return;
    for (size_t i = 0; i < G[node].size(); i++) dfs(G[node][i]->id);
}

void dfsFindDFA(State* node, set<int>* nfaSet) {
    nfaSet->insert(node->id);
    if (outDegree[node->id] <= 0) return;
    for (size_t i = 0; i < G[node->id].size(); i++) dfsFindDFA(G[node->id][i], nfaSet);
}

vector<pair<char, DFANode*>> findNextDFANode(State* node) {
    vector<pair<char, DFANode*>> dfas;
    if (node->transitions.empty()) return dfas;
    for (auto& edge : node->transitions) {
        set<int> nfaSet; dfsFindDFA(edge.second, &nfaSet);
        for (auto dfa : dfaNodes) if (dfa->nfaNodes == nfaSet) dfas.push_back({edge.first, dfa});
    }
    return dfas;
}

void UnionDFA(DFANode* a, DFANode* b) {
    if (b->isAccepting) a->isAccepting = true;
    if (b->isStarting) a->isStarting = true;
    for (auto n : b->nfaNodes) a->nfaNodes.insert(n);
    dfaNodes.erase(remove(dfaNodes.begin(), dfaNodes.end(), b), dfaNodes.end());
}

void NFAtoDFA() {
    for (int i = 0; i < stateCounter; i++) {
        if (inDegree[i] <= 0) {
            DFANode* n = new DFANode(); dfaNodes.push_back(n); dfs(i);
        }
    }
    vector<pair<DFANode*, DFANode*>> unionPair;
    for (size_t i = 0; i < dfaNodes.size(); i++) {
        DFANode* dn = dfaNodes[i]; map<char, DFANode*> opMap;
        for (auto nfa : dn->nfaNodes) {
            if (outDegree[nfa] > 0) continue;
            auto next = findNextDFANode(NFAMap[nfa]);
            if (next.empty() || NFAMap[nfa]->transitions.empty()) continue;
            for (auto& p : next) {
                if (opMap.count(p.first)) unionPair.push_back({opMap[p.first], p.second});
                opMap[p.first] = p.second;
            }
        }
    }
    for (auto& p : unionPair) UnionDFA(p.first, p.second);
    DFANodeCounter = dfaNodes.size();
    for (size_t i = 0; i < dfaNodes.size(); i++) dfaNodes[i]->id = i;

    for (int i = 0; i < DFANodeCounter; i++) {
        DFANode* dn = dfaNodes[i]; map<char, set<int>> nextNFAs;
        for (auto op : operatorChar) nextNFAs[op] = {};
        for (auto nfa : dn->nfaNodes) {
            if (outDegree[nfa] > 0 || NFAMap[nfa]->transitions.empty()) continue;
            char op = NFAMap[nfa]->transitions[0].first;
            dfsFindDFA(NFAMap[nfa]->transitions[0].second, &nextNFAs[op]);
        }
        for (auto op : operatorChar) {
            if (nextNFAs[op].empty()) continue;
            for (auto dfa : dfaNodes)
                if (dfa->nfaNodes == nextNFAs[op]) dn->transitions.push_back({op, dfa});
        }
    }
}

vector<SimplifyDFANode*> SplitDFANode(SimplifyDFANode* node, char op) {
    map<int, set<DFANode*>> splitMap;
    for (auto dn : node->dfaNodes) {
        int next = -1;
        for (auto& t : dn->transitions) if (t.first == op) next = t.second->id;
        splitMap[next].insert(dn);
    }
    vector<SimplifyDFANode*> ans; int i = 0;
    for (auto& p : splitMap) {
        SimplifyDFANode* n;
        if (i == 0) n = new SimplifyDFANode(node->id);
        else n = new SimplifyDFANode(SimplifyDFACounter == 0 && node->id == 0 ? 1 : SimplifyDFACounter++);
        for (auto dn : p.second) { if (dn->isAccepting) n->isAccepting = true; if (dn->isStarting) n->isStarting = true; }
        n->dfaNodes = p.second; ans.push_back(n); i++;
    }
    return ans;
}

void SimplifyDFA() {
    set<DFANode*> notAC, AC; SimplifyDFACounter = 0;
    for (auto d : dfaNodes) (d->isAccepting ? AC : notAC).insert(d);
    SimplifyDFANode *ns = nullptr, *ne = nullptr;
    if (!notAC.empty()) { ns = new SimplifyDFANode(SimplifyDFACounter++); ns->dfaNodes = notAC; }
    if (!AC.empty()) { ne = new SimplifyDFANode(SimplifyDFACounter++, true); ne->dfaNodes = AC; }
    if (ns) SDFAQue.push(ns); if (ne) SDFAQue.push(ne);
    for (auto op : operatorChar) {
        int sz = SDFAQue.size();
        for (int i = 0; i < sz; i++) {
            auto dn = SDFAQue.front(); SDFAQue.pop();
            for (auto s : SplitDFANode(dn, op)) SDFAQue.push(s);
        }
    }
    while (!SDFAQue.empty()) {
        auto s = SDFAQue.front(); SDFAQue.pop();
        SDFAMap[s->id] = s;
        for (auto d : s->dfaNodes) d->SDFANum = s->id;
    }
}

void BuildSimplifyDFA() {
    for (auto& p : SDFAMap) {
        for (auto dn : p.second->dfaNodes) {
            for (auto& t : dn->transitions) {
                char op = t.first; int next = t.second->SDFANum;
                bool exists = false;
                for (auto& e : p.second->transitions)
                    if (e.first == op && e.second->id == next) exists = true;
                if (!exists) p.second->transitions.push_back({op, SDFAMap[next]});
            }
        }
    }
}

void BuildNFATable() {
    operatorCharTmp = operatorChar; operatorCharTmp.insert('#');
    for (auto& p : NFAMap) {
        int num = p.first; State* s = p.second;
        nfaTable[num][1] = intToString(num);
        if (s->isStarting) nfaTable[num][0] = "-";
        if (s->isAccepting) nfaTable[num][0] = "+";
        int col = 2;
        for (auto op : operatorCharTmp) {
            for (auto& t : s->transitions)
                if (t.first == op) { nfaTable[num][col] += intToString(t.second->id) + ","; }
            col++;
        }
    }
}

void BuildDFATable() {
    string getAllNfa = "";
    for (size_t i = 0; i < dfaNodes.size(); i++) {
        DFANode* d = dfaNodes[i];
        string nfas = "{ ";
        for (auto n : d->nfaNodes) nfas += intToString(n) + ",";
        if (!nfas.empty() && nfas.back() == ',') nfas.back() = '}'; else nfas += "}";
        dfaTable[i][1] = nfas;
        if (d->isAccepting) dfaTable[i][0] = "+";
        if (d->isStarting) dfaTable[i][0] += "-";
        int col = 2;
        for (auto op : operatorChar) {
            for (auto& t : d->transitions) {
                if (t.first == op) {
                    string ns2 = "{ ";
                    for (auto n : t.second->nfaNodes) ns2 += intToString(n) + ",";
                    if (!ns2.empty() && ns2.back() == ',') ns2.back() = '}'; else ns2 += "}";
                    dfaTable[i][col] = ns2;
                }
            }
            col++;
        }
    }
}

void BuildSDFATable() {
    for (auto& p : SDFAMap) {
        int num = p.first; auto* s = p.second;
        sdfaTable[num][1] = intToString(num);
        if (s->isAccepting) sdfaTable[num][0] = "+";
        if (s->isStarting) sdfaTable[num][0] += "-";
        int col = 2;
        for (auto op : operatorChar) {
            for (auto& t : s->transitions)
                if (t.first == op) sdfaTable[num][col] += intToString(t.second->id);
            col++;
        }
    }
}

// Escape a string for JSON
string jsonEscape(const string& s) {
    string r;
    for (char c : s) {
        if (c == '"') r += "\\\"";
        else if (c == '\\') r += "\\\\";
        else if (c == '\n') r += "\\n";
        else r += c;
    }
    return r;
}

void outputJSON() {
    BuildNFATable();
    BuildDFATable();
    BuildSDFATable();

    cout << "{" << endl;

    // NFA states
    cout << "  \"nfa\": {" << endl;
    cout << "    \"stateCount\": " << stateCounter << "," << endl;
    cout << "    \"symbols\": [";
    { int i = 0; for (auto c : operatorCharTmp) { if (i++) cout << ","; cout << "\"" << c << "\""; } }
    cout << "]," << endl;
    cout << "    \"states\": [" << endl;
    for (int i = 0; i < stateCounter; i++) {
        cout << "      {\"id\":" << i;
        cout << ",\"start\":" << (NFAMap[i]->isStarting ? "true" : "false");
        cout << ",\"accept\":" << (NFAMap[i]->isAccepting ? "true" : "false");
        cout << ",\"transitions\":[";
        int tc = 0;
        for (auto& t : NFAMap[i]->transitions) {
            if (tc++) cout << ",";
            cout << "{\"symbol\":\"" << (t.first == '#' ? "ε" : string(1, t.first)) << "\",\"to\":" << t.second->id << "}";
        }
        cout << "]}";
        if (i < stateCounter - 1) cout << ",";
        cout << endl;
    }
    cout << "    ]" << endl;
    cout << "  }," << endl;

    // DFA states
    cout << "  \"dfa\": {" << endl;
    cout << "    \"stateCount\": " << DFANodeCounter << "," << endl;
    cout << "    \"symbols\": [";
    { int i = 0; for (auto c : operatorChar) { if (i++) cout << ","; cout << "\"" << c << "\""; } }
    cout << "]," << endl;
    cout << "    \"states\": [" << endl;
    for (int i = 0; i < DFANodeCounter; i++) {
        DFANode* d = dfaNodes[i];
        cout << "      {\"id\":" << i;
        cout << ",\"start\":" << (d->isStarting ? "true" : "false");
        cout << ",\"accept\":" << (d->isAccepting ? "true" : "false");
        cout << ",\"nfaStates\":["; { int j = 0; for (auto n : d->nfaNodes) { if (j++) cout << ","; cout << n; } }
        cout << "],\"transitions\":[";
        int tc = 0;
        for (auto& t : d->transitions) { if (tc++) cout << ","; cout << "{\"symbol\":\"" << t.first << "\",\"to\":" << t.second->id << "}"; }
        cout << "]}";
        if (i < DFANodeCounter - 1) cout << ",";
        cout << endl;
    }
    cout << "    ]" << endl;
    cout << "  }," << endl;

    // Minimized DFA
    cout << "  \"minimizedDfa\": {" << endl;
    cout << "    \"stateCount\": " << SimplifyDFACounter << "," << endl;
    cout << "    \"symbols\": [";
    { int i = 0; for (auto c : operatorChar) { if (i++) cout << ","; cout << "\"" << c << "\""; } }
    cout << "]," << endl;
    cout << "    \"states\": [" << endl;
    for (int i = 0; i < SimplifyDFACounter; i++) {
        auto* s = SDFAMap[i];
        cout << "      {\"id\":" << i;
        cout << ",\"start\":" << (s->isStarting ? "true" : "false");
        cout << ",\"accept\":" << (s->isAccepting ? "true" : "false");
        cout << ",\"transitions\":[";
        int tc = 0;
        for (auto& t : s->transitions) { if (tc++) cout << ","; cout << "{\"symbol\":\"" << t.first << "\",\"to\":" << t.second->id << "}"; }
        cout << "]}";
        if (i < SimplifyDFACounter - 1) cout << ",";
        cout << endl;
    }
    cout << "    ]" << endl;
    cout << "  }" << endl;

    cout << "}" << endl;
}

int main() {
    priorityMap['?'] = 3; priorityMap['*'] = 3; priorityMap['+'] = 3;
    priorityMap['.'] = 2; priorityMap['|'] = 1;

    string regex;
    getline(cin, regex);
    if (regex.empty()) { cerr << "No input" << endl; return 1; }

    // Replace newlines with alternation
    for (size_t i = 0; i < regex.size(); i++)
        if (regex[i] == '\n' && i != regex.size() - 1) regex[i] = '|';

    // Insert explicit concatenation operator
    for (size_t i = 0; i < regex.size() - 1; i++) {
        char c = regex[i], n = regex[i + 1];
        if ((isWordChar(c) && isWordChar(n)) ||
            (isWordChar(c) && n == '(') ||
            (c == ')' && isWordChar(n)) ||
            (c == '*' && n != ')' && n != '|' && n != '?') ||
            (c == '?' && n != ')') ||
            (c == '+' && n != ')' && n != '|' && n != '?') ||
            (c == ')' && n == '(')) {
            regex = regex.substr(0, i + 1) + "." + regex.substr(i + 1);
        }
    }

    NFA nfa = regexToNFA(regex);
    calculateDegree();
    NFAtoDFA();
    SimplifyDFA();
    BuildSimplifyDFA();
    outputJSON();
    return 0;
}
