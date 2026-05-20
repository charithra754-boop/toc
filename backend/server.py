#!/usr/bin/env python3
"""
Minimal backend server for the TOC demo.
Compiles & runs the C++ regex engine, or uses the Python fallback.

Run:  python3 backend/server.py
"""
import http.server, json, subprocess, os, sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENG_CPP_BIN = os.path.join(BASE_DIR, "regex_engine")
ENG_CPP_SRC = os.path.join(BASE_DIR, "regex_engine.cpp")
ENG_PY_SRC = os.path.join(BASE_DIR, "regex_engine.py")

has_cpp = False

def ensure_compiled():
    """Compile the C++ binary if it doesn't exist or is stale."""
    if not os.path.exists(ENG_CPP_BIN) or os.path.getmtime(ENG_CPP_SRC) > os.path.getmtime(ENG_CPP_BIN):
        try:
            result = subprocess.run(
                ["g++", "-std=c++17", "-O2", "-o", ENG_CPP_BIN, ENG_CPP_SRC],
                capture_output=True, text=True
            )
            if result.returncode != 0:
                return False, result.stderr
        except Exception as e:
            return False, f"g++ not installed or error: {e}"
    return True, ""

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} - {fmt % args}")

    def send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/regex":
            self.send_response(404); self.end_headers(); return

        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        regex = body.get("regex", "").strip()

        if not regex:
            self._json(400, {"error": "Empty regex"})
            return

        cmd = [ENG_CPP_BIN] if has_cpp else [sys.executable, ENG_PY_SRC]

        try:
            proc = subprocess.run(
                cmd, input=regex, capture_output=True, text=True, timeout=5
            )
            if proc.returncode != 0:
                self._json(400, {"error": proc.stderr or "Engine error"})
                return
            result = json.loads(proc.stdout)
            self._json(200, result)
        except subprocess.TimeoutExpired:
            self._json(408, {"error": "Engine timed out"})
        except json.JSONDecodeError as e:
            self._json(500, {"error": f"Bad JSON from engine: {e}"})

    def _json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.send_cors()
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    PORT = 8001
    has_cpp, err = ensure_compiled()
    if not has_cpp:
        print(f"[WARN] Could not compile C++ engine: {err}", file=sys.stderr)
        print(f"[WARN] Falling back to Python regex_engine.py", file=sys.stderr)
    else:
        print(f"[OK] C++ engine compiled → {ENG_CPP_BIN}")
        
    print(f"[OK] Backend listening on http://localhost:{PORT}")
    with http.server.HTTPServer(("", PORT), Handler) as srv:
        srv.serve_forever()
