#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
from copy import deepcopy
from tabplan_writer import build_workbook
from generate_tab_plan_infer_likert import enrich

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    # Load the project data from the JSON file
    project_data = json.loads(Path(args.project).read_text(encoding="utf-8"))

    # Enrich the project data with inferred Likert scale information
    enriched_project_data = enrich(project_data)

    # Build the workbook using the enriched data
    wb = build_workbook(enriched_project_data)
    wb.save(args.out)
    print(f"Wrote {args.out}")

if __name__ == "__main__":
    main()