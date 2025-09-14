
# Central brand styling for charts and PPT
from dataclasses import dataclass

@dataclass
class Theme:
    name: str
    fonts: dict
    colors: dict

CUE = Theme(
    name="cue",
    fonts={
        "title": {"name": "Calibri", "size": 28},
        "subtitle": {"name": "Calibri", "size": 18},
        "body": {"name": "Calibri", "size": 12},
        "footnote": {"name": "Calibri", "size": 10},
    },
    colors={
        "accent": "#212161",
        "accent_weak": "#3b3b7d",
        "cta": "#F2B800",
        "fg": "#0F172A",
        "muted": "#637189",
        "line": "#D9E0EF",
        "bg": "#FFFFFF",
    }
)

THEMES = {"cue": CUE}
