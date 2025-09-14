# generate_tab_plan_infer_likert.py
#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from copy import deepcopy
from tabplan_writer import build_workbook

def enrich(project: dict) -> dict:
    # keep your current inference logic here (e.g., screener default nets, likert detection)
    return deepcopy(project)

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
