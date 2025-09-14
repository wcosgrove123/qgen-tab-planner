#!/usr/bin/env python3
# tabplan_writer.py — shared Excel writer for Tab/Banner plans

import re
import math
from typing import Any, Dict, List
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image as XLImage
from PIL import Image as PILImage  # Pillow
from openpyxl.drawing.spreadsheet_drawing import AnchorMarker, OneCellAnchor, XDRPositiveSize2D
from typing import Optional

# ==============================
# Brand THEMES and style factory
# ==============================
def _hx(s: str) -> str:
    """Normalize hex strings for openpyxl (no leading #, uppercase)."""
    return (s or "").replace("#", "").upper()

THEMES: Dict[str, Dict[str, str]] = {
    "cue": {
        "font_name":   "Calibri",
        "font_color":  "#000000",
        "header_fill": "#212161",  # Row 9: navy
        "section_fill":"#A7B5DB",  # Screener/Main Survey: periwinkle
        "row_alt_fill":"#F7F9FD",
        "border_color":"#8197D0",
        "primary":     "#FFE47A",  # Yellow top band
        "accent":      "#F2B800",  # Gold text
        "navy":        "#212161",  # Navy text
    },
    "neutral": {
        "font_name":   "Calibri",
        "font_color":  "#000000",
        "header_fill": "#E7E7E7",
        "section_fill":"#F5F5F5",
        "row_alt_fill":"#FAFAFA",
        "border_color":"#999999",
        "primary":     "#F5F5F5",
        "accent":      "#666666",
        "navy":        "#222222",
    },
}

def make_styles(theme_name: str) -> Dict[str, Any]:
    t = THEMES.get((theme_name or "").lower(), THEMES["cue"])

    thin = Side(style="thin", color=_hx(t["border_color"]))
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    fnt_normal = Font(name=t["font_name"], size=11, color=_hx(t["font_color"]))
    fnt_bold   = Font(name=t["font_name"], size=11, bold=True, color=_hx(t["font_color"]))
    fnt_gold   = Font(name=t["font_name"], size=11, bold=True, color=_hx(t["accent"])) # gold
    fnt_navy   = Font(name=t["font_name"], size=11, color=_hx(t["navy"]))              # navy text
    fnt_white  = Font(name=t["font_name"], size=11, bold=True, color="FFFFFF")         # white text

    fill_topband = PatternFill("solid", fgColor=_hx(t["primary"]))     # yellow
    fill_head    = PatternFill("solid", fgColor=_hx(t["header_fill"])) # navy
    fill_section = PatternFill("solid", fgColor=_hx(t["section_fill"]))# periwinkle
    fill_altrow  = PatternFill("solid", fgColor=_hx(t["row_alt_fill"]))

    return {
        "BORDER": border,
        "FNT_NORMAL": fnt_normal,
        "FNT_BOLD": fnt_bold,
        "FNT_GOLD": fnt_gold,
        "FNT_NAVY": fnt_navy,
        "FNT_WHITE": fnt_white,
        "FILL_TOPBAND": fill_topband,
        "FILL_HEAD": fill_head,
        "FILL_SECTION": fill_section,
        "FILL_ALTROW": fill_altrow,
    }

# ===================
# Column configuration
# ===================
COLS = [
    "Q#",
    "Special Question Verbiage",
    "Base Verbiage",
    "Base Definition",
    "Nets (English & code #s)",
    "Additional Table Instructions",
]
COL_WIDTHS = [12, 48, 24, 28, 42, 55]

DEFAULT_BASE_VERB = "Total (qualified respondents)"
ZEBRA = True  # set False to disable alternate-row fill

# =========
# Helpers
# =========
def is_screener(qid: str) -> bool:
    return str(qid or "").strip().upper().startswith("S")

def q_sort_key(qid: str):
    qid = str(qid or "")
    group = 0 if is_screener(qid) else 1
    m = re.match(r"^[SQ](\d+)", qid.upper())
    num = int(m.group(1)) if m else 10_000
    return (group, num, qid)

def _ws_set_header(ws, styles):
    for col_idx, (title, width) in enumerate(zip(COLS, COL_WIDTHS), start=1):
        cell = ws.cell(row=9, column=col_idx, value=title)
        cell.font = styles["FNT_GOLD"]      # gold text
        cell.fill = styles["FILL_HEAD"]     # navy background
        cell.border = styles["BORDER"]
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        ws.column_dimensions[get_column_letter(col_idx)].width = width
    ws.freeze_panes = "A10"
    ws.row_dimensions[9].height = 18

def _ws_add_section(ws, row: int, title: str, styles: Dict[str, Any]) -> int:
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=len(COLS))
    cell = ws.cell(row=row, column=1, value=title)
    cell.font = styles["FNT_WHITE"]       # white text
    cell.fill = styles["FILL_SECTION"]    # periwinkle
    cell.border = styles["BORDER"]
    cell.alignment = Alignment(vertical="center")
    return row + 1

def _write_row(ws, row: int, values: List[Any], styles: Dict[str, Any]) -> int:
    # Only A..F have borders/fills; outside appears gridless
    for j, v in enumerate(values, start=1):
        c = ws.cell(row=row, column=j, value=v if v is not None else "")
        c.font = styles["FNT_NORMAL"]
        c.border = styles["BORDER"]
        if ZEBRA and row > 10 and (row % 2 == 0):
            c.fill = styles["FILL_ALTROW"]
        c.alignment = Alignment(wrap_text=True, vertical="top")
    return row + 1

def _likert_summary_instructions() -> Dict[str, str]:
    return {
        "TB":   "Show table for each statement with TB ratings data shown.",
        "T2B":  "Show table for each statement with T2B ratings data shown.",
        "B2B":  "Show table for each statement with B2B ratings data shown.",
        "BB":   "Show table for each statement with BB ratings data shown.",
        "Mean": "Show table for each statement with mean data shown.",
    }

# ---- pixel helpers for precise logo placement (no extra columns) ----
def _col_width_to_pixels(width: float | None) -> int:
    if width is None:
        return 64
    return int(math.floor(width * 7 + 5))

def _row_height_to_pixels(height_pts: float | None) -> int:
    if height_pts is None:
        height_pts = 15
    return int(round(height_pts * 96.0 / 72.0))

def _band_box_pixels(ws, col_start_letter: str, col_end_letter: str, row_start: int, row_end: int) -> tuple[int,int]:
    letters = [chr(c) for c in range(ord(col_start_letter), ord(col_end_letter) + 1)]
    w = sum(_col_width_to_pixels(ws.column_dimensions[L].width) for L in letters)
    h = sum(_row_height_to_pixels(ws.row_dimensions[r].height) for r in range(row_start, row_end + 1))
    return w, h

def _find_logo_path() -> Path | None:
    """
    Resolve /tab-banner-plan/ui/icons/logo.png relative to this file:
      .../tab-banner-plan/backend/file/tabplan_writer.py
      ↑ parent -> backend
      ↑ parent -> tab-banner-plan
    """
    try:
        here = Path(__file__).resolve()
    except Exception:
        return None
    # go up two levels to reach project root
    project_root = here.parents[1]  # .../tab-banner-plan
    candidate = project_root / "ui" / "icons" / "logo.png"
    return candidate if candidate.exists() else None


def _place_logo(ws, styles, desired_scale: float = 0.70):
    """
    Place the Cue logo in the top band (rows 1–8), right-aligned inside E..F,
    vertically centered, and explicitly scaled smaller via `desired_scale`.
    """
    logo_path = _find_logo_path()
    if not logo_path:
        return

    # Ensure the band is tall enough to center within
    for r in range(1, 9):
        ws.row_dimensions[r].height = 24  # keep your current look

    # Box for the logo: columns E..F, rows 1..8 (must run AFTER header/col widths are set)
    box_w_px, box_h_px = _band_box_pixels(ws, "E", "F", 1, 8)

    # Read natural image size
    with PILImage.open(logo_path) as im:
        w0, h0 = im.size

    # Base "fit" to the band height (minus light margins)
    margin_h, margin_v = 10, 6
    fit_h = max(24, box_h_px - 2 * margin_v)
    scale_fit = fit_h / h0 if h0 else 1.0

    # Now apply your explicit downscale (e.g., 0.70 = ~30% smaller)
    scale = scale_fit * float(desired_scale)

    # Compute target size
    target_w = int(w0 * scale)
    target_h = int(h0 * scale)

    # Safety: if still wider than the available width, shrink to width
    max_w = max(40, box_w_px - 2 * margin_h)
    if target_w > max_w:
        scale = max_w / w0
        target_w = int(w0 * scale)
        target_h = int(h0 * scale)

    # Compute offsets for right-align + vertical center in the E..F box
    xoff_px = max(0, box_w_px - target_w - margin_h)
    yoff_px = max(0, (box_h_px - target_h) // 2)

    # Build a precise one-cell anchor at E1 with pixel offsets
    emu = 9525  # px->EMU
    start = AnchorMarker(col=4, row=0, colOff=int(xoff_px * emu), rowOff=int(yoff_px * emu))
    ext = XDRPositiveSize2D(cx=int(target_w * emu), cy=int(target_h * emu))
    anchor = OneCellAnchor(_from=start, ext=ext)

    # Create the image: set BOTH width/height AND the anchor ext (openpyxl will respect either)
    img = XLImage(str(logo_path))
    img.width = target_w
    img.height = target_h
    img.anchor = anchor

    # Optional: remove any prior images (if you ever call _place_logo twice)
    # ws._images = []  # uncomment only if you know this sheet has no other images

    ws.add_image(img)



# ===============
# Main entry point
# ===============
def build_workbook(project_data: Dict[str, Any]) -> Workbook:
    proj = project_data.get("project", {}) or {}
    theme_name = (proj.get("theme") or "cue").lower()
    styles = make_styles(theme_name)

    questions = project_data.get("questions", []) or []
    questions.sort(key=lambda q: q_sort_key(q.get("id", "")))

    wb = Workbook()
    ws = wb.active
    ws.title = "Tab Plan"

    # Gridless outside A:F; we only draw borders in A..F
    ws.sheet_view.showGridLines = False

    # -----------------------------
    # Top band A1:F8 (yellow + navy text)
    # -----------------------------
    for r in range(1, 9):
        for c in range(1, 7):  # A..F only
            cc = ws.cell(row=r, column=c)
            cc.fill = styles["FILL_TOPBAND"]
            cc.font = styles["FNT_NAVY"]

    # Top notes (rows 1–7) in column A
    notes = [
        proj.get("name") or "",
        "",
        "Provide a banner by banner tables",
        "Provide means and medians and stats for all numeric questions",
        "Excel - 2 files: No freqs, just percentages. Zero decimals with a % sign. 1 file to include stat testing. 1 file to NOT include stat testing.",
        "Need SPSS File",
        "",
    ]
    for r, line in enumerate(notes, start=1):
        ws.cell(row=r, column=1, value=line).font = styles["FNT_NAVY"]

    # -----------------------------
    # Column header row (row 9) — navy + gold
    # -----------------------------
    _ws_set_header(ws, styles)

    # -----------------------------
    # Logo placement in E1:F8
    # -----------------------------
    _place_logo(ws, styles)

    row = 10  # start immediately after header
    current_section = None
    instr_map = _likert_summary_instructions()

    for q in questions:
        qid = (q.get("id") or "").strip()
        qtype = (q.get("type") or "").strip().lower()
        special = q.get("special_verbiage") or ""
        base = q.get("base") or {}
        base_verb = base.get("verbiage") or DEFAULT_BASE_VERB
        base_def  = base.get("definition") or ""
        scale = q.get("scale") or {}
        labels = [l for l in (scale.get("labels") or []) if str(l).strip()]
        statements = [s for s in (q.get("statements") or []) if str(s).strip()]

        looks_likert = qtype.startswith("likert") or (statements and labels)

        tp = (q.get("exports", {}) or {}).get("tab_plan", {}) or {}
        nets_text = (tp.get("nets_text") or "").strip()
        addl_instr = (tp.get("additional_instructions") or "").strip()

        # Section rows (e.g., "Screener", "Main Survey")
        sec = "Screener" if is_screener(qid) else "Main Survey"
        if current_section != sec:
            row = _ws_add_section(ws, row, sec, styles)
            current_section = sec

        # Likert handling (per your rules)
        if looks_likert:
            if len(statements) <= 2:
                nets_text = nets_text or "Net: T2B, B2B"
            else:
                nets_text = nets_text or "Net: T2B, B2B"
                addl_instr = addl_instr or "Provide mean, show 1 table for each statement"

        # Main row (A..F only)
        row = _write_row(ws, row, [
            qid or "",
            special or "",
            base_verb,
            base_def,
            nets_text,
            addl_instr,
        ], styles)

        # Summary rows for 3+ statement Likerts
        if looks_likert and len(statements) >= 3:
            qprefix = (qid or "").replace(".", "_")
            for key in ("TB", "T2B", "B2B", "BB", "Mean"):
                label = f"{qprefix}_{key} Summary"
                row = _write_row(ws, row, [
                    label, "", base_verb, "", "", instr_map[key]
                ], styles)

    # 2) Banner Plan
    build_banner_sheet(wb, project_data, styles)

    return wb


# ======================
# Banner sheet utilities
# ======================
def _letters(n: int) -> str:
    """Return (A), (B), (C)... for 1-based index n."""
    # Excel headers in screenshot show (A) ... (J)
    # We'll support more than 26 by AA, AB if ever needed.
    alpha = []
    x = n
    while x:
        x, r = divmod(x-1, 26)
        alpha.append(chr(65 + r))
    return f"({''.join(reversed(alpha))})"

def _bnr_write_cell(ws, r, c, v, *, font=None, fill=None, align="center", wrap=True, border=None):
    cell = ws.cell(row=r, column=c, value=v)
    if font:  cell.font  = font
    if fill:  cell.fill  = fill
    if border: cell.border = border
    cell.alignment = Alignment(horizontal=align, vertical="center", wrap_text=wrap)
    return cell

def _banner_dimensions_from_project(project: dict) -> list[dict]:
    """
    Expected structure (from your frontend default + editors):
      project["globals"]["banners"] = [
        { id, label, mode, dimensions: [
            { dim_id, label, source:{qid}, groups:[
                { group_id, ref:{qid,opt_id}, label_alias|null, include:bool, order:int }
            ]}
        ]}
      ]
    We’ll use the FIRST banner entry for this MVP.
    """
    g = (project or {}).get("globals", {}) or {}
    banners = (g.get("banners") or [])
    if not banners: return []
    dims = banners[0].get("dimensions") or []
    # keep only included groups and stable order
    out = []
    for d in dims:
        groups = [g for g in (d.get("groups") or []) if g.get("include", True)]
        groups.sort(key=lambda x: int(x.get("order") or 0))
        if groups:
            out.append({
                "label": (d.get("label") or "").strip() or (d.get("source") or {}).get("qid") or d.get("dim_id"),
                "groups": groups
            })
    return out

def build_banner_sheet(wb: Workbook, project: dict, styles: dict) -> None:
    """
    Create a 'Banner Plan' sheet with two-tier headers matching your screenshot:
      Row1: 'BANNERS'
      Row2: '90% CONFIDENCE LEVEL'  (customize as needed later)
      Row4: Banner title (e.g., 'Banner 1 - ...')
      Row5-6: H1/H2 headers (dimension labels spanning their groups; then group labels)
      Row6 also shows (A) (B) ... codes beneath each group column.
      Column A contains row labels/notes list area (left rail).
      Column B is 'Total'.
    """
    ws = wb.create_sheet("Banner Plan")

    # Column widths (A very wide for notes; B moderate; others reasonable defaults)
    widths = {
        1: 46,   # A (left labels)
        2: 12,   # B (Total)
        # data columns set after we know how many we have
    }
    for col, w in widths.items():
        ws.column_dimensions[get_column_letter(col)].width = w

    # Top band (A1:F8 look) using your existing brand tokens
    # We’ll color A1..F8 even if we later expand; it matches the look of the Tab Plan.
    for r in range(1, 9):
        ws.row_dimensions[r].height = 24
        for c in range(1, 7):
            cc = ws.cell(row=r, column=c)
            cc.fill = styles["FILL_TOPBAND"]
            cc.font = styles["FNT_NAVY"]

    # Title + meta
    _bnr_write_cell(ws, 1, 1, "BANNERS", font=styles["FNT_BOLD"], align="left")
    _bnr_write_cell(ws, 2, 1, "90% CONFIDENCE LEVEL", font=styles["FNT_NORMAL"], align="left")

    # Optional banner title (Row 4)
    banner_name = (project.get("project", {}) or {}).get("banner_title") or "Banner 1 - Core"
    _bnr_write_cell(ws, 4, 1, banner_name, font=styles["FNT_BOLD"], align="left")

    # Compose columns: A=left rail, B=Total, C.. = groups across all dimensions
    dims = _banner_dimensions_from_project(project)
    # Count data columns
    data_cols = sum(len(d["groups"]) for d in dims)
    total_cols = 2 + data_cols   # A + B + data
    for col_idx in range(3, total_cols + 1):
        ws.column_dimensions[get_column_letter(col_idx)].width = 22

    # Header rows
    H1, H2 = 5, 6
    # Column A label rail
    _bnr_write_cell(ws, H1, 1, "", font=styles["FNT_BOLD"], border=styles["BORDER"])
    _bnr_write_cell(ws, H2, 1, "", font=styles["FNT_BOLD"], border=styles["BORDER"])
    # Column B 'Total'
    _bnr_write_cell(ws, H1, 2, "Total", font=styles["FNT_BOLD"], border=styles["BORDER"])
    _bnr_write_cell(ws, H2, 2, "", border=styles["BORDER"])

    # Draw dimension spans & group labels
    col = 3  # start at C
    code_counter = 1
    for d in dims:
        span = len(d["groups"])
        if span <= 0:
            continue
        # Merge H1 over this dimension block
        ws.merge_cells(start_row=H1, start_column=col, end_row=H1, end_column=col + span - 1)
        _bnr_write_cell(ws, H1, col, d["label"], font=styles["FNT_BOLD"], border=styles["BORDER"])

        # H2 per-group labels + (A)(B) codes beneath
        for j in range(span):
            grp = d["groups"][j]
            label = (grp.get("label_alias") or grp.get("ref", {}).get("opt_id") or grp.get("group_id"))
            # Top label (row 6 shows both label and code as in your image)
            _bnr_write_cell(ws, H2, col + j, label, border=styles["BORDER"])
            # Add the (A), (B) code on the next line by newline; align center
            ws.cell(row=H2, column=col + j).value = f"{label}\n{_letters(code_counter)}"
            ws.row_dimensions[H2].height = 34
            code_counter += 1

        col += span

    # Thicker rule under H1 like your screenshot (we emulate with a bottom border on H1 row)
    for c in range(2, total_cols + 1):
        top_cell = ws.cell(row=H1, column=c)
        # replace bottom side to be thick
        top_cell.border = Border(
            left=styles["BORDER"].left,
            right=styles["BORDER"].right,
            top=styles["BORDER"].top,
            bottom=Side(style="medium", color=styles["BORDER"].left.color.rgb),
        )

    # Left rail example lines (A5+), copied from your pattern (you can write real content later)
    note_rows = [
        "A/B, C/D, E/F, G/H, I/J",
        "(A) S7 =2",
        "(B) S7 = 10",
        "(C) Q1 = 1-9, Current ACUVUE OASYS 1-Day Lens Wearers (S7=2)",
        "(D) Q1 = 10+, Current ACUVUE OASYS 1-Day Lens Wearers (S7=2)",
        "(E) S1 = 3, Female, Current ACUVUE OASYS 1-Day Lens Wearers (S7=2)",
        "(F) S1 = 4, Male, Current ACUVUE OASYS 1-Day Lens Wearers (S7=2)",
        "(G) Q1 = 1-9, Current B&L Infuse Lens Wearers (S7=10)",
        "(H) Q1 = 10+, Current B&L Infuse Lens Wearers (S7=10)",
        "(I) S1 = 3, Female, Current B&L Infuse Lens Wearers (S7=10)",
        "(J) S1 = 4, Male, Current B&L Infuse Lens Wearers (S7=10)",
    ]
    r = 5 + 1  # start below the H1 row
    r = 7      # row 7 is blank in your image, start writing at 8
    for txt in note_rows:
        _bnr_write_cell(ws, r, 1, txt, align="left", wrap=True, border=styles["BORDER"])
        # Draw borders across visible columns so the grid aligns with Tab Plan’s look
        for c in range(2, total_cols + 1):
            _bnr_write_cell(ws, r, c, "", border=styles["BORDER"])
        r += 1

    # Freeze panes just below headers (so A/B notes scroll)
    ws.freeze_panes = "C7"  # first data col in view, under header rows