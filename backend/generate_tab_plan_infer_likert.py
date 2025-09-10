#!/usr/bin/env python3
"""
Q-Gen Tab Plan Generator (Likert-inferencing)

Reads a Q-Gen project JSON (from your UI), infers Likert type from
`scale.points` and number of `statements`, applies your rules, and writes an XLSX.

Rules implemented:
- Screeners (IDs starting with S) default to "Column % only (no nets)" when no nets specified.
- If scale.points is set:
  * 0–1 statements  -> single-statement Likert -> Nets: "Net: T2B, B2B", no extra rows
  * 2 statements     -> dual-statement Likert   -> Nets: "Net: T2B, B2B", no extra rows
  * 3+ statements    -> multi-statement Likert  -> Nets: "Net: T2B, B2B" on the first/base row,
                           PLUS summary rows: TB, T2B, B2B, BB, Mean (by statement)
- Uses globals.default_base_verbiage when a question does not override base.verbiage.
- Adds a "Banners" sheet if globals.default_banners are present.
- --emit-debug prints each row that will be written.

Usage:
  python generate_tab_plan_infer_likert.py --project project.json --out tab_plan.xlsx --emit-debug
"""

import json
import argparse
import re
import pandas as pd

EXPORT_COLUMNS = [
    "Q# / Special Question Verbiage",
    "Base Verbiage",
    "Base Definition",
    "Nets (English & code #s)",
    "Additional Table Instructions",
]

SUMMARY_ROWS = [
    ("TB",   "TB Summary",   "Show table for each statement with TB ratings data shown."),
    ("T2B",  "T2B Summary",  "Show table for each statement with T2B ratings data shown."),
    ("B2B",  "B2B Summary",  "Show table for each statement with B2B ratings data shown."),
    ("BB",   "BB Summary",   "Show table for each statement with BB ratings data shown."),
    ("Mean", "Mean Summary", "Show table for each statement with mean data shown."),
]


def is_screener(qid: str) -> bool:
    return str(qid).strip().upper().startswith("S")


def default_base(globals_cfg: dict) -> str:
    return (globals_cfg or {}).get("default_base_verbiage") or "Total (qualified respondents)"


def sort_key_for_row_id(row_id: str):
    """
    Ensure screeners first, then numerically by question number,
    then keep summary rows after their base question in a stable order.
    """
    row_id = str(row_id or "")
    group = 0 if row_id.upper().startswith(("S",)) else 1
    m = re.match(r"^[SQ](\d+)", row_id.upper())
    num = int(m.group(1)) if m else 999999

    # tie-break so summaries come after the base row
    suffix_order = 0
    if "_TB Summary" in row_id:   suffix_order = 1
    if "_T2B Summary" in row_id:  suffix_order = 2
    if "_B2B Summary" in row_id:  suffix_order = 3
    if "_BB Summary" in row_id:   suffix_order = 4
    if "_Mean Summary" in row_id: suffix_order = 5

    return (group, num, suffix_order, row_id)


def build_rows(project: dict):
    globals_cfg = project.get("globals", {}) or {}
    questions = project.get("questions", []) or []

    rows = []

    for q in questions:
        qid = q.get("id") or ""
        special = q.get("special_verbiage") or ""
        qtext = q.get("text") or ""
        base = q.get("base") or {}
        base_verb = base.get("verbiage") or default_base(globals_cfg)
        base_def = base.get("definition") or ""

        tp = (q.get("exports", {}) or {}).get("tab_plan", {}) or {}
        nets_text = (tp.get("nets_text") or "").strip()
        addl = (tp.get("additional_instructions") or "").strip()

        scale_pts = (q.get("scale") or {}).get("points")
        stmts = [s for s in (q.get("statements") or []) if str(s).strip()]
        n_statements = len(stmts)
        has_likert = bool(scale_pts)
        is_multi = has_likert and n_statements >= 3
        is_dual = has_likert and n_statements == 2
        is_single = has_likert and n_statements <= 1

        # Screener default when not a Likert: Column % only (no nets).
        if is_screener(qid) and not has_likert and not nets_text:
            addl = addl or "Column % only (no nets)."

        # Likert nets per your policy
        if has_likert:
            if is_single or is_dual:
                nets_text = nets_text or "Net: T2B, B2B"
            elif is_multi:
                nets_text = nets_text or "Net: T2B, B2B"
                special_instr = "Net T2B and B2B by statement."
                addl = (special_instr if not addl else f"{special_instr} {addl}").strip()

        # Compose the display for column A
        # For multi we include a hint of the question text/special in parentheses to disambiguate
        display = qid
        if is_multi and (special or qtext):
            display = f"{qid} ({special or qtext})"

        rows.append({
            "Q# / Special Question Verbiage": display,
            "Base Verbiage": base_verb,
            "Base Definition": base_def,
            "Nets (English & code #s)": nets_text,
            "Additional Table Instructions": addl,
        })

        # Multi-statement Likert: add summary rows (by statement)
        if is_multi:
            for _, label, note in SUMMARY_ROWS:
                rows.append({
                    "Q# / Special Question Verbiage": f"{qid}_{label}",
                    "Base Verbiage": base_verb,
                    "Base Definition": "",
                    "Nets (English & code #s)": "",
                    "Additional Table Instructions": note,
                })

    # Sort for neatness
    rows.sort(key=lambda r: sort_key_for_row_id(r.get("Q# / Special Question Verbiage", "")))

    # Keep export columns
    final = [{k: r.get(k, "") for k in EXPORT_COLUMNS} for r in rows]
    return final


def write_xlsx(rows, out_path, project: dict):
    df = pd.DataFrame(rows, columns=EXPORT_COLUMNS)
    with pd.ExcelWriter(out_path, engine="xlsxwriter") as writer:
        # Main sheet
        df.to_excel(writer, index=False, sheet_name="Tab Plan")
        ws = writer.sheets["Tab Plan"]
        # stretch some columns based on content
        for i, col in enumerate(EXPORT_COLUMNS):
            width = max(18, min(60, int(df[col].astype(str).map(len).max() if len(df) else 22) + 2))
            ws.set_column(i, i, width)

        # Optional Banners sheet from globals.default_banners
        banners = (project.get("globals") or {}).get("default_banners") or []
        if banners:
            bdf = pd.DataFrame([
                {
                    "ID": b.get("id", ""),
                    "Label": b.get("label", ""),
                    "Definition": b.get("definition", ""),
                    "Order": b.get("order", "")
                }
                for b in banners
            ])
            bdf.to_excel(writer, index=False, sheet_name="Banners")
            ws2 = writer.sheets["Banners"]
            for i, col in enumerate(bdf.columns):
                ws2.set_column(i, i, 28)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True, help="Path to project JSON exported by the UI")
    ap.add_argument("--out", required=True, help="Output Excel path")
    ap.add_argument("--emit-debug", action="store_true")
    args = ap.parse_args()

    with open(args.project, "r", encoding="utf-8") as f:
        project = json.load(f)

    rows = build_rows(project)

    if args.emit_debug:
        for r in rows:
            print(
                f" - {r['Q# / Special Question Verbiage']} "
                f"| {r['Nets (English & code #s)']} "
                f"| {r['Additional Table Instructions']}"
            )

    write_xlsx(rows, args.out, project)
    print(f"Wrote {args.out} with {len(rows)} rows.")


if __name__ == "__main__":
    main()
