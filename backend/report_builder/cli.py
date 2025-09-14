
"""Tiny CLI to test the pipeline end-to-end with one slide.
Usage example:
    python -m report_builder.cli --spss path/to/data.sav --qid Q5 --out deck.pptx
"""
import argparse, os, json, tempfile
from .data_adapter import DataAdapter, DataSource
from .chart_engine import ChartEngine
from .pptx_writer import build_deck
from .themes import THEMES

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spss", required=True)
    ap.add_argument("--qid", action="append", required=True, help="Question ID(s)")
    ap.add_argument("--out", default="deck.pptx")
    args = ap.parse_args()

    # Minimal qre_map that simply uses human values from SPSS (no relabeling in MVP)
    qre_map = {q: {} for q in args.qid}

    adapter = DataAdapter(DataSource(spss_path=args.spss, qre_map=qre_map))
    tidy = adapter.extract_tidy(args.qid)

    chart_template = {"name": "Clustered_Bar"}
    eng = ChartEngine(THEMES["cue"])
    img = eng.render(chart_template, tidy)

    slide = {
        "title": f"Demo: {', '.join(args.qid)}",
        "subtitle": "Total respondents",
        "notes": "MVP auto-generated slide",
        "chart": {"image_path": img.path}
    }
    build_deck([slide], args.out, THEMES["cue"])
    print(f"Wrote {os.path.abspath(args.out)}")

if __name__ == "__main__":
    main()
