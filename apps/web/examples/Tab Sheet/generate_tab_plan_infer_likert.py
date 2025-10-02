# generate_tab_plan_infer_likert.py
#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from copy import deepcopy
from tabplan_writer import build_workbook

def enrich(project: dict) -> dict:
    """
    Analyzes questions to infer metadata for tab plan generation,
    especially for Likert scale questions.
    """
    project_data = deepcopy(project)
    questions = project_data.get("questions", [])

    for q in questions:
        q_type = q.get("type", "").lower()
        statements = q.get("statements", [])
        labels = (q.get("scale", {}) or {}).get("labels", [])
        
        # Infer if a question looks like a Likert scale question
        is_likert = q_type.startswith("likert") or (statements and labels)
        
        if is_likert:
            # Add default nets if they are not already present
            tp = q.setdefault("exports", {}).setdefault("tab_plan", {})
            if "nets_text" not in tp or not tp["nets_text"]:
                tp["nets_text"] = "Net: T2B, B2B"
            
            # Add default instructions for multi-statement Likert questions
            if len(statements) > 2 and ("additional_instructions" not in tp or not tp["additional_instructions"]):
                tp["additional_instructions"] = "Provide mean, show 1 table for each statement"

    return project_data

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    project = json.loads(Path(args.project).read_text(encoding="utf-8"))
    project = enrich(project)

    wb = build_workbook(project)
    wb.save(args.out)
    print(f"Wrote {args.out}")

if __name__ == "__main__":
    main()
