#!/usr/bin/env python3
# app.py — serves the UI and returns generated files (in-memory) with clear errors
# Frozen/Dev friendly, with external-asset override + no-cache

import io, json, os, sys, tempfile, subprocess, traceback, runpy, webbrowser
from pathlib import Path
from threading import Timer
from flask import Flask, request, send_file, send_from_directory, make_response, jsonify

# ---------- paths & helpers (PyInstaller friendly) ----------
def resource_path(*parts: str) -> Path:
    """Absolute path to a bundled resource (works in dev and in PyInstaller)."""
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).parent))
    return base.joinpath(*parts)

def pick_app_dir() -> Path:
    """
    Prefer an external assets directory if available, so the EXE can be
    updated by simply dropping a new index.html next to it.
    Priority:
      1) QGEN_ASSETS (env var) if it has index.html
      2) CWD if it has index.html
      3) Bundled directory inside the EXE (_MEIPASS)
    """
    env = os.getenv("QGEN_ASSETS")
    if env and (Path(env) / "index.html").exists():
        return Path(env)
    if (Path.cwd() / "ui" / "index.html").exists():
        return Path.cwd() / "ui"
    return resource_path()

APP_DIR = pick_app_dir()

app = Flask(
    __name__,
    static_folder=str(APP_DIR),   # serve files directly from chosen folder
    static_url_path=""
)

def _err(status: int, msg: str):
    print("\n=== ERROR ===\n", msg, "\n=============\n", file=sys.stderr)
    resp = make_response(msg, status)
    resp.headers["Content-Type"] = "text/plain; charset=utf-8"
    return resp

def _find_script(*candidates: str) -> Path | None:
    for name in candidates:
        p = APP_DIR / name
        if p.exists():
            return p
    return None

def _run_script(script_path: Path, project_json: Path, out_path: Path, extra_args=None):
    """
    Dev mode  -> run as subprocess with current Python.
    Frozen EXE -> run the script in-process so sys.executable isn't an EXE loop.
    """
    extra_args = list(extra_args or [])

    if getattr(sys, "frozen", False):
        old_argv = sys.argv
        try:
            sys.argv = [str(script_path), "--project", str(project_json), "--out", str(out_path)] + extra_args
            runpy.run_path(str(script_path), run_name="__main__")
        finally:
            sys.argv = old_argv
        return None

    cmd = [sys.executable, str(script_path), "--project", str(project_json), "--out", str(out_path)] + extra_args
    print("Running:", " ".join(cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    print("\n--- STDOUT ---\n", proc.stdout, "\n--- STDERR ---\n", proc.stderr, sep="")
    if proc.returncode != 0:
        details = f"Command: {' '.join(cmd)}\n\nSTDOUT:\n{proc.stdout}\n\nSTDERR:\n{proc.stderr}"
        raise RuntimeError(details)
    return proc

def _send_file_bytes(path: Path, download_name: str, mimetype: str):
    data = path.read_bytes()
    return send_file(io.BytesIO(data), as_attachment=True, download_name=download_name, mimetype=mimetype)

# ---------- no-cache for static ----------
@app.after_request
def add_no_cache(resp):
    # Kill all caching so updated index.html/JS is used immediately
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp

# ---------- routes ----------
@app.get("/")
def home():
    return send_from_directory(str(APP_DIR), "index.html")

# SPA fallback so refresh on hash/paths still loads UI
@app.get("/<path:unused>")
def spa(unused):
    index = APP_DIR / "index.html"
    if index.exists():
        return send_from_directory(str(APP_DIR), "index.html")
    return _err(404, "index.html not found")

@app.get("/health")
def health():
    return "ok", 200

@app.get("/_version")
def version():
    # surface basic info for quick sanity checks
    idx = APP_DIR / "index.html"
    return jsonify({
        "frozen": bool(getattr(sys, "frozen", False)),
        "app_dir": str(APP_DIR),
        "index_exists": idx.exists(),
        "index_mtime": idx.stat().st_mtime if idx.exists() else None,
        # optional build id if your index.js/inline script sets it as a literal
        # (we can’t parse it reliably here, but the UI can show window.QGEN_BUILD_ID)
    })

@app.get("/debug/where")
def debug_where():
    # helps confirm exactly which files are being served
    return jsonify({
        "frozen": bool(getattr(sys, "frozen", False)),
        "python": sys.executable,
        "app_dir": str(APP_DIR),
        "exists": {
            "index.html": (APP_DIR / "index.html").exists(),
            "generate_questionnaire.py": (APP_DIR / "generate_questionnaire.py").exists(),
            "generate_tab_plan_infer_likert.py": (APP_DIR / "generate_tab_plan_infer_likert.py").exists(),
            "generate_tab_plan.py": (APP_DIR / "generate_tab_plan.py").exists(),
            "generate_tab_plan_min.py": (APP_DIR / "generate_tab_plan_min.py").exists(),
        }
    })

@app.post("/generate/tab-plan")
def gen_tab_plan():
    try:
        payload = request.get_json(force=True, silent=False)
        if not payload:
            return _err(400, "No JSON payload")
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            pj = td / "project.json"
            out = td / "tab_plan.xlsx"
            pj.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

            script = _find_script(
                "generate_tab_plan_infer_likert.py",
                "generate_tab_plan.py",
                "generate_tab_plan_min.py"
            )
            if not script:
                return _err(500, "Generator not found in app folder.")

            _run_script(script, pj, out)
            return _send_file_bytes(
                out,
                download_name="tab_plan.xlsx",
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
    except Exception as e:
        return _err(500, f"Failed to build tab plan:\n\n{e}\n\n{traceback.format_exc()}")

@app.post("/generate/questionnaire")
def gen_questionnaire():
    try:
        payload = request.get_json(force=True, silent=False)
        if not payload:
            return _err(400, "No JSON payload")
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            pj = td / "project.json"
            out = td / "questionnaire.docx"
            pj.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

            script = _find_script("generate_questionnaire.py")
            if not script:
                return _err(500, "Generator not found in app folder.")

            _run_script(script, pj, out)
            return _send_file_bytes(
                out,
                download_name="questionnaire.docx",
                mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
    except Exception as e:
        return _err(500, f"Failed to build questionnaire:\n\n{e}\n\n{traceback.format_exc()}")

# ---------- main ----------
if __name__ == "__main__":
    PORT = int(os.getenv("PORT", "5000"))
    # Auto-open browser (nice for --windowed builds)
    Timer(0.8, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}")).start()
    # threaded=True is helpful for a local tool; debug=False for cleaner PyInstaller behavior
    app.run(host="127.0.0.1", port=PORT, threaded=True, debug=False)
