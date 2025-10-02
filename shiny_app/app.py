"""
Professional SPSS Data Reporting & Analysis Dashboard
Market Research Tool - Cue Insights Design System
"""

import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import json
from pathlib import Path
from typing import Optional, Dict, List, Tuple

from shiny import App, ui, render, reactive
from shiny.types import FileInfo
import shinyswatch

# Import existing modules
from crosstab_engine import generate_crosstab_report, export_to_dataframe
from banner_csv_parser import parse_banner_csv
from supabase_connector import get_banner_plans_for_project, get_questions_for_project
from excel_formatter import create_professional_excel

# ==================== PROFESSIONAL CSS ====================
# Matching web app design system

css = """
:root {
  --cue-primary: #212161;
  --cue-gold: #F2B800;
  --cue-secondary: #3A4A7A;
  --cue-light-gold: #FFF4D1;
  --surface-0: #ffffff;
  --surface-1: #f8f9fa;
  --surface-2: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border: #dee2e6;
  --font-family: 'Aptos', system-ui, -apple-system, sans-serif;
}

body {
  font-family: var(--font-family);
  background: var(--surface-1);
}

.app-header {
  background: linear-gradient(135deg, #FFE47A 0%, #F2B800 100%);
  border-bottom: 2px solid var(--cue-primary);
  padding: 20px 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--cue-primary);
  margin: 0 0 4px 0;
}

.app-header p {
  font-size: 14px;
  color: var(--cue-secondary);
  margin: 0;
  font-weight: 500;
}

.main-container {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 0;
  height: calc(100vh - 100px);
  background: var(--surface-1);
}

.sidebar-panel {
  background: var(--surface-0);
  border-right: 1px solid var(--border);
  padding: 16px;
  overflow-y: auto;
}

.sidebar-panel h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--cue-primary);
  margin: 0 0 16px 0;
}

.center-panel {
  background: var(--surface-0);
  padding: 24px;
  overflow-y: auto;
}

.right-panel {
  background: var(--surface-0);
  border-left: 1px solid var(--border);
  padding: 16px;
  overflow-y: auto;
}

.upload-section {
  background: var(--surface-1);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid var(--cue-gold);
}

.upload-section h5 {
  font-size: 14px;
  font-weight: 600;
  color: var(--cue-primary);
  margin: 0 0 12px 0;
}

.question-item {
  background: var(--surface-0);
  border: 1px solid #f1f3f4;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-item:hover {
  border-color: var(--cue-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transform: translateX(4px);
}

.question-id {
  font-size: 13px;
  font-weight: 700;
  color: var(--cue-primary);
  background: var(--cue-light-gold);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.question-text {
  font-size: 13px;
  color: var(--text-primary);
  margin: 6px 0;
}

.question-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--text-secondary);
  display: inline-block;
  margin-top: 4px;
}

.banner-item {
  background: var(--surface-0);
  border: 1px solid #f1f3f4;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.banner-item:hover {
  border-color: var(--cue-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.banner-item.selected {
  background: var(--cue-light-gold);
  border: 2px solid var(--cue-gold);
}

.banner-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.banner-equation {
  font-size: 11px;
  font-family: 'Consolas', monospace;
  color: var(--text-secondary);
  background: var(--surface-1);
  padding: 2px 6px;
  border-radius: 3px;
}

.status-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 13px;
}

.status-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 13px;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 13px;
}

.btn-primary {
  background: var(--cue-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--cue-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-secondary {
  background: linear-gradient(135deg, #FFE47A 0%, #F2B800 100%);
  color: var(--cue-primary);
  border: 2px solid var(--cue-primary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.export-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.chart-controls {
  background: var(--surface-1);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.chart-controls h5 {
  font-size: 14px;
  font-weight: 600;
  color: var(--cue-primary);
  margin: 0 0 12px 0;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--font-family);
  margin-bottom: 8px;
}

.form-control:focus {
  outline: none;
  border-color: var(--cue-primary);
  box-shadow: 0 0 0 3px rgba(33, 33, 97, 0.1);
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--cue-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border);
}

.stat-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface-1);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--cue-gold);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--cue-primary);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.sidebar-panel::-webkit-scrollbar,
.center-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 8px;
}

.sidebar-panel::-webkit-scrollbar-track,
.center-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: var(--surface-1);
}

.sidebar-panel::-webkit-scrollbar-thumb,
.center-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: var(--surface-2);
  border-radius: 4px;
}

.sidebar-panel::-webkit-scrollbar-thumb:hover,
.center-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover {
  background: var(--cue-secondary);
}
"""

# ==================== UI DEFINITION ====================

app_ui = ui.page_fluid(
    ui.tags.style(css),

    # Header
    ui.div(
        ui.h1("SPSS Data Reporting"),
        ui.p("Professional market research visualization and cross-tabulation"),
        class_="app-header"
    ),

    # Main Container
    ui.div(
        # Left Sidebar: Questions
        ui.div(
            ui.h4("Questions"),

            # Upload Section
            ui.div(
                ui.h5("Data Import"),
                ui.input_file("labels_file", "Labels CSV", accept=[".csv"], width="100%"),
                ui.input_file("codes_file", "Codes CSV (optional)", accept=[".csv"], width="100%"),
                ui.output_ui("upload_status"),
                class_="upload-section"
            ),

            # Question Filter Buttons
            ui.div(
                ui.input_radio_buttons(
                    "question_filter",
                    None,
                    {"all": "All", "screener": "Screener", "main": "Main"},
                    selected="all",
                    inline=True
                ),
                style="margin-bottom: 16px;"
            ),

            # Question List
            ui.output_ui("question_list"),

            class_="sidebar-panel"
        ),

        # Center Panel: Chart Canvas
        ui.div(
            ui.div(
                # Chart Controls
                ui.div(
                    ui.h5("Chart Customization"),
                    ui.input_select(
                        "chart_type",
                        "Chart Type",
                        {
                            "auto": "Auto-detect",
                            "bar": "Bar Chart",
                            "stacked_bar": "Stacked Bar",
                            "horizontal_bar": "Horizontal Bar",
                            "pie": "Pie Chart"
                        },
                        selected="auto"
                    ),
                    ui.input_text("chart_title", "Chart Title", placeholder="Auto-generated"),
                    ui.input_checkbox("show_values", "Show Values", value=True),
                    ui.input_checkbox("show_percentages", "Show Percentages", value=True),
                    ui.input_checkbox("show_legend", "Show Legend", value=True),
                    class_="chart-controls"
                ),

                # Export Buttons
                ui.div(
                    ui.download_button("download_chart", "Export Chart (PNG)", class_="btn-secondary"),
                    ui.download_button("download_data", "Export Data (CSV)", class_="btn-secondary"),
                    ui.download_button("download_excel", "Export Excel", class_="btn-secondary"),
                    class_="export-buttons"
                ),
            ),

            # Chart Display
            ui.output_ui("data_summary"),
            ui.output_ui("chart_display"),

            class_="center-panel"
        ),

        # Right Sidebar: Cross-tabulation
        ui.div(
            ui.h4("Cross-tabulation"),

            # Supabase Connection
            ui.div(
                ui.h5("Load Banner Plan"),
                ui.input_text(
                    "project_id",
                    "Project ID",
                    placeholder="UUID from project URL"
                ),
                ui.input_action_button("load_banners", "Load from Supabase", class_="btn-primary", width="100%"),
                ui.output_ui("banner_status"),
                class_="upload-section"
            ),

            # Banner List
            ui.output_ui("banner_list"),

            # Crosstab Export
            ui.div(
                ui.download_button("download_crosstab", "Export Cross-Tab", class_="btn-primary", width="100%"),
                style="margin-top: 16px;"
            ),

            class_="right-panel"
        ),

        class_="main-container"
    )
)

# ==================== SERVER LOGIC ====================

def server(input, output, session):

    # Reactive values
    data_state = reactive.Value({
        "labels_df": None,
        "codes_df": None,
        "questions": [],
        "banners": [],
        "selected_question": None,
        "selected_banner": None,
        "filtered_data": None
    })

    # ==================== DATA LOADING ====================

    @reactive.Effect
    @reactive.event(input.labels_file)
    def load_labels():
        file_info: list[FileInfo] = input.labels_file()
        if not file_info:
            print("No file info received")
            return

        try:
            print(f"Loading labels file: {file_info[0]['name']}")
            df = pd.read_csv(file_info[0]["datapath"])
            print(f"Loaded {len(df)} rows, {len(df.columns)} columns")

            # Extract questions from headers
            questions = []
            for col in df.columns:
                if col.startswith(('S', 'Q')):
                    # Determine question type and section
                    q_type = detect_question_type(df[col])
                    section = "screener" if col.startswith('S') else "main"

                    questions.append({
                        "id": col,
                        "text": generate_question_text(col),
                        "type": q_type,
                        "section": section
                    })

            print(f"Found {len(questions)} questions")

            current_state = data_state.get()
            current_state["labels_df"] = df
            current_state["questions"] = questions
            current_state["filtered_data"] = df
            data_state.set(current_state)

            print("Data state updated successfully")

        except Exception as e:
            print(f"Error loading labels: {e}")
            import traceback
            traceback.print_exc()

    @reactive.Effect
    @reactive.event(input.codes_file)
    def load_codes():
        file_info: list[FileInfo] = input.codes_file()
        if not file_info:
            return

        try:
            df = pd.read_csv(file_info[0]["datapath"])
            current_state = data_state.get()
            current_state["codes_df"] = df
            data_state.set(current_state)
        except Exception as e:
            print(f"Error loading codes: {e}")

    # ==================== BANNER LOADING ====================

    @reactive.Effect
    @reactive.event(input.load_banners)
    def load_banner_plan():
        project_id = input.project_id()
        if not project_id:
            return

        try:
            # Load from Supabase
            banner_plans = get_banner_plans_for_project(project_id)

            if banner_plans and len(banner_plans) > 0:
                banner_plan = banner_plans[0]

                # Parse banner groups and columns
                banners = [{"name": "Total", "equation": "", "group": ""}]

                if "banner_groups" in banner_plan:
                    for group in banner_plan["banner_groups"]:
                        group_name = group.get("name", "")
                        if "banner_columns" in group:
                            for col in group["banner_columns"]:
                                banners.append({
                                    "name": col.get("name", ""),
                                    "equation": col.get("logic_equation", ""),
                                    "group": group_name
                                })

                current_state = data_state.get()
                current_state["banners"] = banners
                data_state.set(current_state)

        except Exception as e:
            print(f"Error loading banners: {e}")

    # ==================== UI OUTPUTS ====================

    @output
    @render.ui
    def upload_status():
        state = data_state.get()
        if state["labels_df"] is not None:
            rows = len(state["labels_df"])
            cols = len(state["labels_df"].columns)
            return ui.div(
                ui.p(f"Loaded: {rows} responses, {cols} columns"),
                class_="status-success"
            )
        return ui.div(
            ui.p("No data loaded"),
            class_="status-info"
        )

    @output
    @render.ui
    def question_list():
        state = data_state.get()
        questions = state["questions"]
        filter_val = input.question_filter()

        if not questions:
            return ui.p("Upload data to see questions", style="color: var(--text-secondary);")

        # Filter questions
        if filter_val != "all":
            questions = [q for q in questions if q["section"] == filter_val]

        # Generate question items
        items = []
        for q in questions:
            item_html = ui.div(
                ui.div(
                    ui.span(q["id"], class_="question-id"),
                    ui.span(q["type"], class_="question-type", style="float: right;")
                ),
                ui.div(q["text"], class_="question-text"),
                class_="question-item",
                id=f"q-{q['id']}",
                onclick=f"Shiny.setInputValue('selected_question', '{q['id']}', {{priority: 'event'}})"
            )
            items.append(item_html)

        return ui.div(*items)

    @output
    @render.ui
    def banner_status():
        state = data_state.get()
        if state["banners"]:
            return ui.div(
                ui.p(f"Loaded {len(state['banners'])} banner columns"),
                class_="status-success"
            )
        return None

    @output
    @render.ui
    def banner_list():
        state = data_state.get()
        banners = state["banners"]

        if not banners:
            return ui.p("Load banner plan to filter data", style="color: var(--text-secondary);")

        items = []
        for banner in banners:
            equation_display = banner["equation"] if banner["equation"] else "All respondents"

            item_html = ui.div(
                ui.div(banner["name"], class_="banner-label"),
                ui.div(equation_display, class_="banner-equation"),
                class_="banner-item",
                id=f"b-{banner['name']}",
                onclick=f"Shiny.setInputValue('selected_banner', '{banner['equation']}', {{priority: 'event'}})"
            )
            items.append(item_html)

        return ui.div(*items)

    @output
    @render.ui
    def data_summary():
        state = data_state.get()
        df = state["filtered_data"]

        if df is None:
            return None

        total_responses = len(df)
        total_questions = len([col for col in df.columns if col.startswith(('S', 'Q'))])

        selected_q = input.selected_question()
        if not selected_q or selected_q not in df.columns:
            return None

        # Calculate statistics for selected question
        valid_responses = df[selected_q].notna().sum()

        return ui.div(
            ui.div(
                ui.div(
                    ui.div(str(total_responses), class_="stat-value"),
                    ui.div("Total Responses", class_="stat-label"),
                    class_="stat-card"
                ),
                ui.div(
                    ui.div(str(valid_responses), class_="stat-value"),
                    ui.div("Valid Responses", class_="stat-label"),
                    class_="stat-card"
                ),
                ui.div(
                    ui.div(str(total_questions), class_="stat-value"),
                    ui.div("Questions", class_="stat-label"),
                    class_="stat-card"
                ),
                class_="stat-summary"
            )
        )

    @output
    @render.ui
    def chart_display():
        state = data_state.get()
        df = state["filtered_data"]
        selected_q = input.selected_question()

        if df is None or not selected_q or selected_q not in df.columns:
            return ui.div(
                ui.h3("Select a Question"),
                ui.p("Click a question from the left panel to create a chart"),
                style="text-align: center; padding: 60px; color: var(--text-secondary);"
            )

        # Generate chart
        fig = create_chart(
            df,
            selected_q,
            input.chart_type(),
            input.chart_title() if input.chart_title() else f"Chart for {selected_q}",
            input.show_values(),
            input.show_percentages(),
            input.show_legend()
        )

        return ui.HTML(fig.to_html(include_plotlyjs="cdn", config={"displayModeBar": True}))

    # ==================== DOWNLOADS ====================

    @session.download(filename="chart.png")
    def download_chart():
        state = data_state.get()
        df = state["filtered_data"]
        selected_q = input.selected_question()

        if df is None or not selected_q:
            return None

        fig = create_chart(
            df, selected_q, input.chart_type(),
            input.chart_title() if input.chart_title() else f"Chart for {selected_q}",
            input.show_values(), input.show_percentages(), input.show_legend()
        )

        return fig.to_image(format="png", width=1200, height=800)

    @session.download(filename="data.csv")
    def download_data():
        state = data_state.get()
        df = state["filtered_data"]

        if df is None:
            return None

        return df.to_csv(index=False)

    @session.download(filename="report.xlsx")
    def download_excel():
        state = data_state.get()
        df = state["filtered_data"]

        if df is None:
            return None

        # Use existing Excel formatter
        output_path = Path("temp_report.xlsx")
        create_professional_excel(df, output_path)

        with open(output_path, "rb") as f:
            content = f.read()

        output_path.unlink()  # Clean up temp file
        return content


# ==================== HELPER FUNCTIONS ====================

def detect_question_type(series: pd.Series) -> str:
    """Detect question type from data patterns"""

    # Sample non-null values
    sample = series.dropna().head(20)

    if len(sample) == 0:
        return "unknown"

    # Check for Likert patterns
    likert_keywords = ['agree', 'disagree', 'satisfied', 'likely', 'would', 'extremely']
    if any(keyword in str(val).lower() for val in sample for keyword in likert_keywords):
        return "likert"

    # Check for numeric
    try:
        sample.astype(float)
        return "numeric"
    except:
        pass

    # Check unique values
    unique_count = series.nunique()

    if unique_count <= 10:
        return "single"
    elif unique_count <= 30:
        return "multi"
    else:
        return "open"

def generate_question_text(qid: str) -> str:
    """Generate descriptive text for question ID"""
    question_map = {
        'S0': 'Consent to participate',
        'S1': 'Gender',
        'S2': 'Health conditions',
        'S3': 'Age',
        'S4': 'Contact lens experience',
        'S7': 'Brand currently worn',
        'Q1': 'Hours per day wearing contact lenses',
        'Q2': 'Overall satisfaction',
        'Q3': 'Agreement with product statements',
        'Q4': 'Likelihood to recommend',
    }
    return question_map.get(qid, f"Question {qid}")

def create_chart(
    df: pd.DataFrame,
    question_id: str,
    chart_type: str,
    title: str,
    show_values: bool,
    show_percentages: bool,
    show_legend: bool
) -> go.Figure:
    """Create interactive Plotly chart with all Likert scale points"""

    # Standard Likert scales
    standard_scales = {
        'agreement': ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree'],
        'satisfaction': ['Extremely satisfied', 'Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied', 'Extremely dissatisfied'],
        'likelihood': ['Definitely would', 'Probably would', 'Might or might not', 'Probably would not', 'Definitely would not'],
    }

    # Count responses
    value_counts = df[question_id].value_counts()

    # Detect if Likert scale
    is_likert = False
    ordered_labels = []

    for scale_type, labels in standard_scales.items():
        if any(label in value_counts.index for label in labels):
            is_likert = True
            ordered_labels = labels
            break

    # Initialize all scale points (including 0 counts) for Likert
    if is_likert:
        counts = {label: value_counts.get(label, 0) for label in ordered_labels}
    else:
        counts = dict(value_counts)

    labels = list(counts.keys())
    values = list(counts.values())
    total = sum(values)
    percentages = [(v/total*100) if total > 0 else 0 for v in values]

    # Color mapping for Likert
    color_map = {
        'Strongly agree': '#66BB6A', 'Agree': '#66BB6A',
        'Neither agree nor disagree': '#FDD835', 'Neutral': '#FDD835',
        'Disagree': '#EF5350', 'Strongly disagree': '#EF5350',
        'Extremely satisfied': '#66BB6A', 'Very satisfied': '#66BB6A', 'Satisfied': '#66BB6A',
        'Dissatisfied': '#EF5350', 'Very dissatisfied': '#EF5350', 'Extremely dissatisfied': '#EF5350',
    }

    colors = [color_map.get(label, '#212161') for label in labels]

    # Create text labels
    text_labels = []
    for v, p in zip(values, percentages):
        parts = []
        if show_values and v > 0:
            parts.append(str(v))
        if show_percentages and v > 0:
            parts.append(f"({p:.1f}%)")
        text_labels.append(" ".join(parts))

    # Create chart based on type
    if chart_type == "pie":
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            marker=dict(colors=colors),
            textinfo='label+percent' if show_percentages else 'label',
            showlegend=show_legend
        )])

    elif chart_type == "horizontal_bar":
        fig = go.Figure(data=[go.Bar(
            x=values,
            y=labels,
            orientation='h',
            marker=dict(color=colors),
            text=text_labels,
            textposition='auto',
            showlegend=False
        )])
        fig.update_xaxis(title="Count")

    elif chart_type == "stacked_bar":
        # Stacked bar for Likert
        fig = go.Figure(data=[go.Bar(
            name=label,
            x=['Responses'],
            y=[value],
            marker=dict(color=color),
            text=text if value > 0 else "",
            textposition='inside'
        ) for label, value, color, text in zip(labels, values, colors, text_labels)])

        fig.update_layout(barmode='stack', showlegend=show_legend)

    else:  # Default bar chart
        fig = go.Figure(data=[go.Bar(
            x=labels,
            y=values,
            marker=dict(color=colors),
            text=text_labels,
            textposition='outside',
            showlegend=False
        )])
        fig.update_yaxis(title="Count")

    # Update layout with professional styling
    fig.update_layout(
        title=dict(
            text=title,
            font=dict(size=18, color='#212161', family='Aptos, sans-serif'),
            x=0.5,
            xanchor='center'
        ),
        plot_bgcolor='#ffffff',
        paper_bgcolor='#ffffff',
        font=dict(family='Aptos, sans-serif', size=13, color='#212529'),
        margin=dict(t=60, b=80, l=80, r=40),
        height=500
    )

    return fig


# ==================== CREATE APP ====================

app = App(app_ui, server)
