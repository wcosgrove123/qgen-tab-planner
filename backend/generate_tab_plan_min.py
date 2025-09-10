#!/usr/bin/env python3
"""
Minimal Tab Plan generator prototype.

- Reads a Q-Gen project JSON.
- Emits a single Excel 'Tab Plan' sheet with standardized columns.
- Encodes Wil's Likert rules:
  * likert_single / likert_dual: one base row, Nets="Net: T2B, B2B", no derived rows
  * likert_multi (>2 statements): base row with Nets on first row only, plus summary rows:
      Qx_TB Summary, Qx_T2B Summary, Qx_B2B Summary, Qx_BB Summary, Qx_Mean Summary
- Screener examples show 'Column % only' and no nets when specified in exports.tab_plan.

Usage:
  python generate_tab_plan_min.py --project sample_project.json --out demo_tab_plan.xlsx
"""
import json, argparse, pandas as pd

EXPORT_COLUMNS = [
    "Q# / Special Question Verbiage",
    "Base Verbiage",
    "Base Definition",
    "Nets (English & code #s)",
    "Additional Table Instructions",
]

def add_row(rows, qid, special, base_verbiage, base_def, nets, notes):
    rows.append({
        EXPORT_COLUMNS[0]: f"{qid} {f'({special})' if special else ''}".strip(),
        EXPORT_COLUMNS[1]: base_verbiage or "Total (qualified respondents)",
        EXPORT_COLUMNS[2]: base_def or "",
        EXPORT_COLUMNS[3]: nets or "",
        EXPORT_COLUMNS[4]: notes or "",
    })

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    with open(args.project, "r", encoding="utf-8") as f:
        data = json.load(f)

    globals_cfg = data.get("globals", {})
    default_base_verb = globals_cfg.get("default_base_verbiage", "Total (qualified respondents)")
    default_base_def  = globals_cfg.get("default_base_definition", "")

    rows = []

    for q in data["questions"]:
        qid = q["id"]
        special = q.get("special_verbiage","").strip()
        base = q.get("base", {}) or {}
        base_verb = base.get("verbiage", default_base_verb)
        base_def  = base.get("definition", default_base_def)

        tp = (q.get("exports", {}) or {}).get("tab_plan", {}) or {}
        nets_text = tp.get("nets_text", "")
        addl = tp.get("additional_instructions","")

        qtype = q["type"]

        # Likert logic
        if qtype in ("likert_single", "likert_dual"):
            # Single base row with nets text; no derived rows
            add_row(rows, qid, q.get("special_verbiage",""), base_verb, base_def, nets_text or "Net: T2B, B2B", addl or "Single/Dual-statement Likert: nets column only.")
            continue

        if qtype == "likert_multi":
            # Base row + summary rows; nets only on first base row
            add_row(rows, qid, q.get("special_verbiage",""), base_verb, base_def, nets_text or "Net: T2B, B2B",
                    addl or "Net T2B and B2B by statement. Show TB/T2B/B2B/BB/Mean summaries.")
            # Derived rows (summaries)
            for dr in (q.get("derived_rows") or []):
                add_row(rows, dr["id"], dr.get("label",""), base_verb, base_def, "", dr.get("rule",""))
            continue

        # Numeric, single, multi, open, grids — generic handling
        if qtype in ("single","multi","open","numeric","grid_single","grid_multi"):
            add_row(rows, qid, q.get("special_verbiage",""), base_verb, base_def, nets_text, addl)
            continue

        # Fallback
        add_row(rows, qid, q.get("special_verbiage",""), base_verb, base_def, nets_text, addl)

    # DataFrame to Excel
    df = pd.DataFrame(rows, columns=EXPORT_COLUMNS)
    with pd.ExcelWriter(args.out, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Tab Plan")
        ws = writer.sheets["Tab Plan"]
        for i, col in enumerate(EXPORT_COLUMNS):
            width = max(18, min(60, int(df[col].astype(str).map(len).max()) + 2))
            ws.set_column(i, i, width)

    print(f"✅ Wrote {args.out} with {len(rows)} rows.")

if __name__ == "__main__":
    main()
