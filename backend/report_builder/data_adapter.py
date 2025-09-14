
from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

# These imports are optional to keep the scaffold importable even if not installed yet.
try:
    import pyreadstat  # type: ignore
    import pandas as pd  # type: ignore
except Exception:  # pragma: no cover
    pyreadstat = None
    pd = None

@dataclass
class DataSource:
    spss_path: str
    qre_map: Dict[str, Any]  # question metadata from Q-Gen JSON (ids, labels, scales)

class DataAdapter:
    def __init__(self, source: DataSource):
        self.source = source
        self._df = None

    def load(self):
        if self._df is not None:
            return self._df
        if pyreadstat is None:
            raise RuntimeError("pyreadstat is not installed. Please `pip install pyreadstat pandas`.")
        df, meta = pyreadstat.read_sav(self.source.spss_path, apply_value_formats=True)
        self._df = df
        return self._df

    def list_questions(self) -> List[str]:
        # Uses qre_map keys as the canonical question list
        return list(self.source.qre_map.keys())

    def extract_tidy(self,
                     question_ids: List[str],
                     filters: Optional[List[Dict[str, Any]]] = None,
                     group_by: Optional[str] = None) -> "pd.DataFrame":
        """Return a tidy DataFrame ready for charting.

        Output convention (wide → long as needed):
          columns: ['group','label','value','base_n']
          - group: e.g., total or a brand/segment/bin if group_by set
          - label: option/statement label (human readable)
          - value: percent or mean (downstream decides)
          - base_n: base for the group
        """
        if pd is None:
            raise RuntimeError("pandas not installed. Please `pip install pandas`.")
        df = self.load().copy()

        # Apply simple filters: [{var, op, vals}]
        if filters:
            for f in filters:
                var, op, vals = f.get("var"), f.get("op"), f.get("vals")
                if var is None: 
                    continue
                if op == "in":
                    df = df[df[var].isin(vals)]
                elif op == "eq":
                    df = df[df[var] == vals]
                elif op == "neq":
                    df = df[df[var] != vals]

        # Build tidy output by stacking each question
        rows = []
        for qid in question_ids:
            meta = self.source.qre_map.get(qid, {})
            # Heuristic: if question is categorical with options, compute % by option.
            # In MVP we assume SPSS has columns named like qid or qid_* for grids.
            col = qid
            if col not in df.columns:
                # try grid-style columns, e.g., Q5_1, Q5_2...
                grid_cols = [c for c in df.columns if c.startswith(f"{qid}_")]
                if not grid_cols:
                    continue
                # stack each grid column as its own label
                for g in grid_cols:
                    sub = df[g].dropna()
                    base = len(sub)
                    if base == 0:
                        continue
                    pct = (sub.value_counts(normalize=True) * 100).round(1)
                    for label, p in pct.items():
                        rows.append({"group": "Total", "qid": qid, "label": f"{g}: {label}", "value": float(p), "base_n": int(base)})
                continue

            sub = df[col].dropna()
            base = len(sub)
            if base == 0:
                continue
            pct = (sub.value_counts(normalize=True) * 100).round(1)
            for label, p in pct.items():
                rows.append({"group": "Total", "qid": qid, "label": str(label), "value": float(p), "base_n": int(base)})

        return pd.DataFrame(rows)
