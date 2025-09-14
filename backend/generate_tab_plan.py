# generate_tab_plan.py
#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from tabplan_writer import build_workbook

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    data = json.loads(Path(args.project).read_text(encoding="utf-8"))
    wb = build_workbook(data)
    wb.save(args.out)
    print(f"Wrote {args.out}")

if __name__ == "__main__":
    main()
