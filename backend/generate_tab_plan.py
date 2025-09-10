#!/usr/bin/env python3
"""
Q-Gen Tab Plan Generator (v2)

Adds:
- --emit-debug to print planned rows before writing Excel
- Grid support: grid_single / grid_multi -> one row per statement with label suffix [statement]
- Numeric: carries "show bands + mean" instruction if provided; can optionally list bands in notes
- Basic screener defaults for S1/S2/S4/S5/S6/S7 when exports.tab_plan missing
- Banners: writes a second sheet "Banners" with the resolved global defaults (id, label, definition, order)

Usage:
  python generate_tab_plan.py --project sample_project.json --out tab_plan.xlsx [--emit-debug]
"""
import json, argparse, pandas as pd

EXPORT_COLUMNS = [
    "Q# / Special Question Verbiage",
    "Base Verbiage",
    "Base Definition",
    "Nets (English & code #s)",
    "Additional Table Instructions",
]

SCREENER_DEFAULTS = {
    "S1": {"nets_text": "", "additional_instructions": "Column % only (no nets)."},
    "S2": {"nets_text": "", "additional_instructions": "Column % only (no nets)."},
    "S4": {"nets_text": "", "additional_instructions": "Column % only (no nets)."},
    "S5": {"nets_text": "", "additional_instructions": "Column % only (no nets)."},
    "S6": {"nets_text": "", "additional_instructions": "Column % only (no nets)."},
    "S7": {"nets_text": "", "additional_instructions": "Column % only (no nets)."},
}

def add_row(rows, qid, special, base_verbiage, base_def, nets, notes):
    rows.append({
        EXPORT_COLUMNS[0]: f"{qid} {f'({special})' if special else ''}".strip(),
        EXPORT_COLUMNS[1]: base_verbiage or "Total (qualified respondents)",
        EXPORT_COLUMNS[2]: base_def or "",
        EXPORT_COLUMNS[3]: nets or "",
        EXPORT_COLUMNS[4]: notes or "",
    })

def row_for_question(rows, q, default_base_verb, default_base_def):
    qid = q["id"]
    special = q.get("special_verbiage","").strip()
    base = q.get("base", {}) or {}
    base_verb = base.get("verbiage", default_base_verb)
    base_def  = base.get("definition", default_base_def)

    # Resolve tab plan hints
    tp = (q.get("exports", {}) or {}).get("tab_plan", {}) or {}
    # Apply screener defaults if missing
    if not tp and qid in SCREENER_DEFAULTS:
        tp = SCREENER_DEFAULTS[qid]
    nets_text = tp.get("nets_text", "")
    addl      = tp.get("additional_instructions","")

    qtype = q["type"]

    # Likert
    if qtype in ("likert_single", "likert_dual"):
        add_row(rows, qid, special, base_verb, base_def, nets_text or "Net: T2B, B2B",
                addl or "Single/Dual-statement Likert: nets column only.")
        return

    if qtype == "likert_multi":
        add_row(rows, qid, special, base_verb, base_def, nets_text or "Net: T2B, B2B",
                addl or "Net T2B and B2B by statement. Show TB/T2B/B2B/BB/Mean summaries.")
        for dr in (q.get("derived_rows") or []):
            add_row(rows, dr["id"], dr.get("label",""), base_verb, base_def, "", dr.get("rule",""))
        return

    # Grids
    if qtype in ("grid_single","grid_multi"):
        statements = q.get("statements") or []
        if statements:
            for s in statements:
                add_row(rows, qid, f"{special} [{s}]" if special else f"[{s}]",
                        base_verb, base_def, nets_text, addl or "Grid statement row.")
        else:
            add_row(rows, qid, special, base_verb, base_def, nets_text, addl or "Grid (no statements provided).")
        return

    # Numeric: carry instruction and optionally list bands
    if qtype == "numeric":
        num = q.get("numeric") or {}
        bands = num.get("bands") or []
        band_desc = "; ".join([f"{b.get('label','')}={b.get('min','?')}-{b.get('max','?')}" for b in bands]) if bands else ""
        notes = addl or "Show numeric bands" + (f": {band_desc}" if band_desc else "") 
        if num.get("report_mean", True):
            notes += " and mean."
        add_row(rows, qid, special, base_verb, base_def, nets_text, notes)
        return

    # Single / Multi / Open — generic
    add_row(rows, qid, special, base_verb, base_def, nets_text, addl)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--emit-debug", action="store_true")
    args = ap.parse_args()

    with open(args.project, "r", encoding="utf-8") as f:
        data = json.load(f)

    globals_cfg = data.get("globals", {}) or {}
    default_base_verb = globals_cfg.get("default_base_verbiage", "Total (qualified respondents)")
    default_base_def  = globals_cfg.get("default_base_definition", "")

    rows = []
    for q in data["questions"]:
        row_for_question(rows, q, default_base_verb, default_base_def)

    if args.emit_debug:
        for r in rows:
            print(" -", r[EXPORT_COLUMNS[0]], "|", r[EXPORT_COLUMNS[3]], "|", r[EXPORT_COLUMNS[4]])

    # Write Excel with Tab Plan + Banners sheet
    df = pd.DataFrame(rows, columns=EXPORT_COLUMNS)

    banners = globals_cfg.get("default_banners") or []
    bdf = pd.DataFrame([
        {"ID": b.get("id",""), "Label": b.get("label",""), "Definition": b.get("definition",""), "Order": b.get("order","")}
        for b in banners
    ]) if banners else pd.DataFrame(columns=["ID","Label","Definition","Order"])

    with pd.ExcelWriter(args.out, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Tab Plan")
        ws = writer.sheets["Tab Plan"]
        for i, col in enumerate(EXPORT_COLUMNS):
            width = max(18, min(60, int(df[col].astype(str).map(len).max()) + 2)) if len(df) else 22
            ws.set_column(i, i, width)
        # Banners sheet
        bdf.to_excel(writer, index=False, sheet_name="Banners")
        ws2 = writer.sheets["Banners"]
        for i, col in enumerate(bdf.columns if not bdf.empty else ["ID","Label","Definition","Order"]):
            ws2.set_column(i, i, 28)

    print(f"✅ Wrote {args.out} with {len(rows)} rows and {len(banners)} banners.")

if __name__ == "__main__":
    main()
