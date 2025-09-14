
from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict
import os, uuid

# Minimal matplotlib render; keep imports local so the module can be imported without matplotlib installed
@dataclass
class ChartRender:
    path: str
    width_px: int
    height_px: int

class ChartEngine:
    def __init__(self, theme):
        self.theme = theme

    def render(self, chart_template: Dict[str, Any], tidy_df, out_dir: str = "/tmp") -> ChartRender:
        """Render a simple bar chart from tidy_df, honoring a subset of template settings.
        Returns a PNG path. MVP only; expand later.
        """
        try:
            import matplotlib.pyplot as plt  # type: ignore
        except Exception as e:
            raise RuntimeError("matplotlib not installed. Please `pip install matplotlib`.") from e

        os.makedirs(out_dir, exist_ok=True)
        img_path = os.path.join(out_dir, f"chart_{uuid.uuid4().hex}.png")

        # Very simple: plot top N labels by value for group == 'Total'
        df = tidy_df[tidy_df['group'] == 'Total'].sort_values("value", ascending=False).head(10)
        labels = df["label"].astype(str).tolist()
        values = df["value"].astype(float).tolist()

        fig, ax = plt.subplots(figsize=(10, 6), dpi=150)
        ax.barh(labels, values)
        ax.invert_yaxis()
        ax.set_xlabel("%")
        ax.set_title(chart_template.get("name", "Chart"))
        fig.tight_layout()
        fig.savefig(img_path)
        plt.close(fig)

        return ChartRender(path=img_path, width_px=1500, height_px=900)
