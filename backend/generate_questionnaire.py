#!/usr/bin/env python3
"""
Q-Gen Questionnaire Generator (.docx) — Matrix-aware

- Grids & Likerts:
    * likert_*  => statements as rows, scale.labels as columns
    * grid_*    => statements as rows, options as columns
- Non-grid     => options listed (codes optional)
- Badges       => [Hidden], [Red herring/QC] if noted or id-suffixed
- Base/Routing => shown compactly under the header

Usage:
  pip install python-docx
  python generate_questionnaire.py --project project.json --out questionnaire.docx
  # optional:
  #   --hide-codes  (don’t show numeric codes for options)
"""

import argparse, json, re
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

# ---------- helpers ----------

def is_screener(qid: str) -> bool:
    return str(qid or "").strip().upper().startswith("S")

def q_sort_key(qid: str):
    qid = str(qid or "")
    group = 0 if is_screener(qid) else 1
    m = re.match(r"^[SQ](\d+)", qid.upper())
    num = int(m.group(1)) if m else 10_000
    return (group, num, qid)

def add_para(doc: Document, text: str, *, bold=False, italic=False, size=11, after=6, align=None):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    for r in p.runs:
        r.font.size = Pt(size)
    p.paragraph_format.space_after = Pt(after)
    if align is not None:
        p.alignment = align
    return p

def add_matrix(doc: Document, headers, rows, *, col_widths=None):
    tbl = doc.add_table(rows=len(rows)+1, cols=len(headers))
    tbl.style = "Table Grid"
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

    # header row
    for j, h in enumerate(headers):
        tbl.cell(0, j).text = str(h)

    # body
    for i, row in enumerate(rows, start=1):
        for j, val in enumerate(row):
            tbl.cell(i, j).text = str(val)

    # widths (best effort)
    if col_widths:
        for j, w in enumerate(col_widths):
            try:
                for i in range(len(rows)+1):
                    tbl.cell(i, j).width = Inches(w)
            except Exception:
                pass

    add_para(doc, "", after=8)
    return tbl

def badges_for(q):
    qid = (q.get("id") or "").upper()
    notes = (q.get("notes") or "").lower()
    tags = []
    if "_H" in qid or "hidden" in notes:
        tags.append("Hidden")
    if "_R" in qid or "red herring" in notes or "qc" in notes:
        tags.append("Red herring/QC")
    return tags

def render_options_list(doc: Document, options, show_codes=True):
    if not options:
        return
    for opt in options:
        code = opt.get("code", "")
        label = opt.get("label", "")
        flags = []
        if opt.get("exclusive"): flags.append("exclusive")
        if opt.get("terminate"): flags.append("terminate")
        suffix = f"  [{', '.join(flags)}]" if flags else ""
        if show_codes and code not in ("", None):
            add_para(doc, f"{code}. {label}{suffix}")
        else:
            add_para(doc, f"• {label}{suffix}")

# ---------- main ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--hide-codes", action="store_true")
    args = ap.parse_args()

    with open(args.project, "r", encoding="utf-8") as f:
        data = json.load(f)

    proj = data.get("project", {})
    questions = data.get("questions", [])
    questions.sort(key=lambda q: q_sort_key(q.get("id","")))

    doc = Document()

    # Title
    title = proj.get("name") or "Survey Questionnaire"
    client = proj.get("client") or ""
    add_para(doc, title, bold=True, size=16, after=4, align=WD_ALIGN_PARAGRAPH.LEFT)
    if client:
        add_para(doc, f"Client: {client}", italic=True, size=10, after=12)

    current_section = None
    for q in questions:
        qid = q.get("id","")
        qtext = (q.get("text") or "").strip()
        qtype = (q.get("type") or "").strip()
        special = q.get("special_verbiage") or ""
        routing = q.get("routing") or ""
        base = q.get("base") or {}
        base_verb = base.get("verbiage") or ""
        base_def = base.get("definition") or ""
        options = q.get("options") or []
        scale = q.get("scale") or {}
        labels = [l for l in (scale.get("labels") or []) if str(l).strip()]
        statements = [s for s in (q.get("statements") or []) if str(s).strip()]

        # section header
        section = "Screener" if is_screener(qid) else "Main Survey"
        if current_section != section:
            add_para(doc, section, bold=True, size=14, after=6)
            current_section = section

        # question header
        header = f"{qid}. {qtext}" if qtext else f"{qid}"
        add_para(doc, header, bold=True, size=12, after=2)

        # badges
        tags = badges_for(q)
        if tags:
            add_para(doc, "[" + " | ".join(tags) + "]", italic=True, size=9, after=2)

        # verbiage / routing / base
        if special:
            add_para(doc, f"[Verbiage] {special}", italic=True, size=10, after=0)
        if routing:
            add_para(doc, f"[Routing] {routing}", italic=True, size=10, after=0)
        if base_verb or base_def:
            base_line = f"[Base] {base_verb}" + (f" | Def: {base_def}" if base_def else "")
            add_para(doc, base_line, italic=True, size=10, after=4)

        # ---- render by type ----
        if qtype.startswith("likert"):
            # Matrix: statements x scale.labels
            if statements and labels:
                headers = ["Statement"] + labels
                rows = [[s] + [""] * len(labels) for s in statements]
                add_matrix(doc, headers, rows, col_widths=[2.8] + [1.1]*len(labels))
            else:
                # Fallback: show scale when no statements
                if labels:
                    add_para(doc, "Response Scale: " + " | ".join(labels), italic=True, size=10, after=4)
                render_options_list(doc, options, show_codes=not args.hide_codes)

        elif qtype.startswith("grid_"):
            # Matrix: statements x options
            if statements and options:
                opt_headers = [
                    (f"{o.get('code')}. {o.get('label')}" if not args.hide_codes and o.get('code') not in (None,"")
                     else f"{o.get('label','')}")
                    for o in options
                ]
                headers = ["Statement"] + opt_headers
                rows = [[s] + [""] * len(opt_headers) for s in statements]
                add_matrix(doc, headers, rows, col_widths=[2.8] + [1.2]*len(opt_headers))
            else:
                render_options_list(doc, options, show_codes=not args.hide_codes)

        elif qtype in ("single", "multi", "open", "numeric"):
            render_options_list(doc, options, show_codes=not args.hide_codes)
            if qtype == "numeric":
                units = (q.get("numeric") or {}).get("units")
                if units:
                    add_para(doc, f"(Numeric units: {units})", italic=True, size=10, after=4)

        else:
            render_options_list(doc, options, show_codes=not args.hide_codes)

        add_para(doc, "", after=10)  # spacing after each question

    doc.save(args.out)
    # Windows consoles can choke on emojis; print ASCII only
    print(f"Wrote {args.out}")

if __name__ == "__main__":
    main()
