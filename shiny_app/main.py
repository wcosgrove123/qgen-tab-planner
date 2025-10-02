"""
SPSS Data Visualization Dashboard - Shiny for Python
Professional market research chart generation with drag-and-drop interface
"""

import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import numpy as np
from pathlib import Path
import io
import base64

from shiny import App, ui, render, reactive, req
from shiny.types import FileInfo
import shinyswatch

# Custom CSS for professional styling
css = """
.main-header {
    background: linear-gradient(135deg, #212161 0%, #3F6AB7 50%, #2c5aa0 100%);
    color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    text-align: center;
}

.upload-section {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #cbd5e1;
    margin-bottom: 20px;
}

.question-palette {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    height: 600px;
    overflow-y: auto;
}

.question-item {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.question-item:hover {
    background: #e2e8f0;
    border-color: #94a3b8;
    transform: translateY(-1px);
}

.question-id {
    font-weight: 700;
    color: #212161;
    font-size: 14px;
}

.question-text {
    color: #475569;
    font-size: 13px;
    margin-top: 4px;
}

.question-type {
    background: #212161;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    display: inline-block;
    margin-top: 6px;
}

.chart-canvas {
    background: white;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    min-height: 400px;
    padding: 20px;
}

.banner-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
}

.status-indicator {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    margin-bottom: 10px;
}

.status-success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.status-info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
}
"""

# Define UI
app_ui = ui.page_fluid(
    ui.tags.style(css),

    # Header
    ui.div(
        ui.h1("📊 SPSS Data Visualization Dashboard", class_="mb-0"),
        ui.p("Professional market research chart generation with drag-and-drop interface",
             class_="mb-0 mt-2"),
        class_="main-header"
    ),

    # File Upload Section
    ui.div(
        ui.h4("📁 Upload SPSS Data Files"),
        ui.row(
            ui.column(6,
                ui.input_file("labels_file", "Labels CSV File",
                             accept=[".csv"], multiple=False),
                ui.div(id="labels_status")
            ),
            ui.column(6,
                ui.input_file("codes_file", "Codes CSV File",
                             accept=[".csv"], multiple=False),
                ui.div(id="codes_status")
            )
        ),
        class_="upload-section"
    ),

    # Main Dashboard
    ui.row(
        # Left Sidebar - Questions
        ui.column(3,
            ui.h5("🎯 Questions"),
            ui.input_selectize("question_filter", "Filter by Section:",
                              choices=["All", "Screener", "Main"],
                              selected="All", multiple=False),
            ui.div(
                ui.output_ui("question_palette"),
                class_="question-palette"
            )
        ),

        # Center - Chart Canvas
        ui.column(6,
            ui.h5("📈 Chart Canvas"),
            ui.input_selectize("selected_question", "Select Question:",
                              choices={}, multiple=False),
            ui.output_ui("chart_display"),
            class_="chart-canvas"
        ),

        # Right Sidebar - Cross-tabulation & Export
        ui.column(3,
            ui.h5("🔗 Cross-tabulation"),
            ui.input_switch("enable_crosstab", "Enable Cross-tab", False),
            ui.div(
                ui.output_ui("banner_controls"),
                class_="banner-section"
            ),
            ui.br(),
            ui.h5("📤 Export Options"),
            ui.input_radio_buttons("export_format", "Format:",
                                  choices=["PNG", "PDF", "HTML"],
                                  selected="PNG"),
            ui.input_action_button("export_chart", "Export Chart",
                                  class_="btn-primary w-100")
        )
    )
)

def server(input, output, session):
    # Reactive values to store data
    labels_data = reactive.Value()
    codes_data = reactive.Value()
    questions_list = reactive.Value([])

    @reactive.Effect
    @reactive.event(input.labels_file)
    def process_labels_file():
        file_info = input.labels_file()
        if file_info is not None:
            try:
                # Read the uploaded CSV file
                df = pd.read_csv(file_info[0]["datapath"])
                labels_data.set(df)

                # Process questions from headers
                questions = extract_questions_from_headers(df.columns.tolist())
                questions_list.set(questions)

                # Update UI status
                ui.insert_ui(
                    selector="#labels_status",
                    where="beforeEnd",
                    ui=ui.div(f"✅ Loaded {len(df)} responses", class_="status-success")
                )

                # Update question selector
                question_choices = {q['id']: f"{q['id']} - {q['text']}" for q in questions}
                ui.update_selectize("selected_question", choices=question_choices)

            except Exception as e:
                ui.insert_ui(
                    selector="#labels_status",
                    where="beforeEnd",
                    ui=ui.div(f"❌ Error: {str(e)}", class_="status-error")
                )

    @reactive.Effect
    @reactive.event(input.codes_file)
    def process_codes_file():
        file_info = input.codes_file()
        if file_info is not None:
            try:
                df = pd.read_csv(file_info[0]["datapath"])
                codes_data.set(df)

                ui.insert_ui(
                    selector="#codes_status",
                    where="beforeEnd",
                    ui=ui.div(f"✅ Loaded {len(df)} code definitions", class_="status-success")
                )
            except Exception as e:
                ui.insert_ui(
                    selector="#codes_status",
                    where="beforeEnd",
                    ui=ui.div(f"❌ Error: {str(e)}", class_="status-error")
                )

    @output
    @render.ui
    def question_palette():
        questions = questions_list.get()
        filter_section = input.question_filter()

        if not questions:
            return ui.p("Upload labels file to see questions", class_="text-muted")

        # Filter questions
        if filter_section != "All":
            questions = [q for q in questions if q.get('section', '').lower() == filter_section.lower()]

        # Generate question items
        question_items = []
        for q in questions:
            type_icon = get_question_type_icon(q['type'])
            question_items.append(
                ui.div(
                    ui.div(f"{type_icon} {q['id']}", class_="question-id"),
                    ui.div(q['text'], class_="question-text"),
                    ui.div(q['type'].replace('_', ' ').title(), class_="question-type"),
                    class_="question-item",
                    onclick=f"Shiny.setInputValue('selected_question', '{q['id']}')"
                )
            )

        return ui.div(*question_items)

    @output
    @render.ui
    def chart_display():
        if not input.selected_question():
            return ui.div(
                ui.h4("👆 Select a question to generate chart"),
                ui.p("Choose from the question palette on the left"),
                class_="text-center text-muted p-4"
            )

        req(labels_data.get() is not None)

        question_id = input.selected_question()
        df = labels_data.get()
        questions = questions_list.get()

        # Find the question details
        question = next((q for q in questions if q['id'] == question_id), None)
        if not question:
            return ui.div("Question not found", class_="text-danger")

        # Generate chart based on question type
        try:
            if question['type'] == 'likert_table':
                fig = create_multi_likert_chart(df, question_id, question)
            elif question['type'] == 'likert':
                fig = create_single_likert_chart(df, question_id, question)
            elif question['type'] == 'numeric':
                fig = create_numeric_chart(df, question_id, question)
            else:
                fig = create_categorical_chart(df, question_id, question)

            # Convert Plotly figure to HTML
            chart_html = fig.to_html(include_plotlyjs='cdn', div_id="chart-container")
            return ui.HTML(chart_html)

        except Exception as e:
            return ui.div(f"Error generating chart: {str(e)}", class_="text-danger")

    @output
    @render.ui
    def banner_controls():
        if not input.enable_crosstab():
            return ui.p("Enable cross-tabulation to see banner options", class_="text-muted")

        questions = questions_list.get()
        demographic_questions = [q for q in questions if q.get('section') == 'screener']

        if not demographic_questions:
            return ui.p("No demographic questions found", class_="text-muted")

        choices = {q['id']: f"{q['id']} - {q['text']}" for q in demographic_questions}

        return ui.div(
            ui.input_selectize("banner_question", "Banner Variable:",
                              choices=choices, multiple=False),
            ui.input_checkbox_group("banner_options", "Show:",
                                   choices=["Total", "Gender", "Age Groups"],
                                   selected=["Total"])
        )

def extract_questions_from_headers(headers):
    """Extract question information from CSV headers"""
    questions = []
    question_map = {
        'S0': {'text': 'Consent to participate', 'type': 'single', 'section': 'screener'},
        'S1': {'text': 'Gender', 'type': 'single', 'section': 'screener'},
        'S2': {'text': 'Health conditions', 'type': 'multi', 'section': 'screener'},
        'S3': {'text': 'Age', 'type': 'numeric', 'section': 'screener'},
        'S7': {'text': 'Brand currently worn', 'type': 'single', 'section': 'screener'},
        'Q1': {'text': 'Hours per day wearing contact lenses', 'type': 'numeric', 'section': 'main'},
        'Q2': {'text': 'Overall satisfaction', 'type': 'likert', 'section': 'main'},
        'Q3': {'text': 'Agreement with product statements', 'type': 'likert_table', 'section': 'main'},
        'Q4': {'text': 'Likelihood to recommend', 'type': 'likert', 'section': 'main'},
        'Q5': {'text': 'Open feedback', 'type': 'open', 'section': 'main'},
        'Q6': {'text': 'Product attribute ratings', 'type': 'likert_table', 'section': 'main'},
        'Q7': {'text': 'Usage situations that apply', 'type': 'multi', 'section': 'main'},
        'Q8': {'text': 'Purchase intent', 'type': 'likert', 'section': 'main'},
        'Q9': {'text': 'Value perception', 'type': 'likert', 'section': 'main'}
    }

    # Extract main questions
    for header in headers:
        base_q = header.split('r')[0] if 'r' in header else header
        if base_q in question_map:
            if not any(q['id'] == base_q for q in questions):
                question_info = question_map[base_q].copy()
                question_info['id'] = base_q
                questions.append(question_info)

    return sorted(questions, key=lambda x: x['id'])

def get_question_type_icon(question_type):
    """Get emoji icon for question type"""
    icons = {
        'single': '📊',
        'multi': '☑️',
        'likert': '📈',
        'likert_table': '📋',
        'numeric': '🔢',
        'open': '💬'
    }
    return icons.get(question_type, '❓')

def create_multi_likert_chart(df, question_id, question):
    """Create professional multi-Likert chart using Plotly"""

    # Find sub-questions (Q3r1, Q3r2, etc.)
    sub_questions = [col for col in df.columns if col.startswith(f"{question_id}r")]

    if not sub_questions:
        return go.Figure().add_annotation(text="No sub-questions found", showarrow=False)

    # Statement mapping
    statement_map = {
        'Q3r1': 'Provides long-lasting comfort',
        'Q3r2': 'Feels natural in my eyes',
        'Q3r3': 'Keeps my eyes moist throughout the day',
        'Q3r4': 'Allows my eyes to breathe',
        'Q3r5': 'Provides clear, crisp vision',
        'Q3r6': 'Delivers exceptional all-day comfort',
        'Q3r7': 'Provides exceptional vision and clarity'
    }

    # Likert scale order and colors
    scale_order = ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree']
    colors = ['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#b45309']

    # Process data for each statement
    statements_data = []
    for sub_q in sub_questions:
        if sub_q in df.columns:
            statement_text = statement_map.get(sub_q, sub_q)

            # Count responses
            responses = df[sub_q].value_counts()
            total = len(df[sub_q].dropna())

            # Calculate T2B and B2B
            t2b = ((responses.get('Strongly agree', 0) + responses.get('Agree', 0)) / total * 100) if total > 0 else 0
            b2b = ((responses.get('Strongly disagree', 0) + responses.get('Disagree', 0)) / total * 100) if total > 0 else 0

            statements_data.append({
                'statement': statement_text,
                'responses': responses,
                'total': total,
                't2b': round(t2b),
                'b2b': round(b2b)
            })

    # Sort by T2B descending
    statements_data.sort(key=lambda x: x['t2b'], reverse=True)

    # Create horizontal stacked bar chart
    fig = go.Figure()

    statement_names = [item['statement'] for item in statements_data]

    # Add bars for each scale point
    for i, scale in enumerate(scale_order):
        values = []
        for item in statements_data:
            responses = item['responses']
            total = item['total']
            pct = (responses.get(scale, 0) / total * 100) if total > 0 else 0
            values.append(pct)

        fig.add_trace(go.Bar(
            name=scale,
            y=statement_names,
            x=values,
            orientation='h',
            marker_color=colors[i],
            text=[f"{v:.0f}%" if v > 8 else "" for v in values],
            textposition="inside",
            textfont=dict(color="#1f2937", size=11)
        ))

    # Update layout for professional appearance
    fig.update_layout(
        title=dict(
            text=f"<b>{question['text']}</b><br><sub>Claims</sub>",
            x=0.5,
            font=dict(size=20, color="#F2B800")
        ),
        barmode='stack',
        height=len(statement_names) * 60 + 200,
        margin=dict(l=300, r=150, t=100, b=100),
        font=dict(family="Arial, sans-serif", size=12),
        plot_bgcolor='white',
        paper_bgcolor='white',
        showlegend=True,
        legend=dict(
            orientation="h",
            yanchor="top",
            y=-0.1,
            xanchor="center",
            x=0.5
        )
    )

    # Add T2B and B2B annotations
    for i, item in enumerate(statements_data):
        # T2B annotation
        fig.add_annotation(
            x=105, y=i,
            text=f"<b>{item['t2b']}%</b>",
            showarrow=False,
            font=dict(color="white", size=12, weight="bold"),
            bgcolor="#2c5aa0",
            bordercolor="white",
            borderwidth=1
        )

        # B2B annotation
        fig.add_annotation(
            x=110, y=i,
            text=f"<b>{item['b2b']}%</b>",
            showarrow=False,
            font=dict(color="white", size=12, weight="bold"),
            bgcolor="#F2B800",
            bordercolor="white",
            borderwidth=1
        )

    # Add headers
    fig.add_annotation(x=105, y=len(statement_names), text="<b>T2B</b>",
                      showarrow=False, font=dict(color="white", weight="bold"),
                      bgcolor="#2c5aa0")
    fig.add_annotation(x=110, y=len(statement_names), text="<b>B2B</b>",
                      showarrow=False, font=dict(color="white", weight="bold"),
                      bgcolor="#F2B800")

    fig.update_xaxes(range=[0, 115], showgrid=False, zeroline=False)
    fig.update_yaxes(showgrid=False, zeroline=False)

    return fig

def create_single_likert_chart(df, question_id, question):
    """Create single Likert question chart"""
    if question_id not in df.columns:
        return go.Figure().add_annotation(text="Question data not found", showarrow=False)

    responses = df[question_id].value_counts()

    fig = go.Figure(data=[
        go.Bar(x=responses.index, y=responses.values,
               marker_color='#3F6AB7')
    ])

    fig.update_layout(
        title=f"<b>{question['text']}</b>",
        xaxis_title="Response",
        yaxis_title="Count",
        font=dict(family="Arial, sans-serif")
    )

    return fig

def create_numeric_chart(df, question_id, question):
    """Create numeric question chart"""
    if question_id not in df.columns:
        return go.Figure().add_annotation(text="Question data not found", showarrow=False)

    data = pd.to_numeric(df[question_id], errors='coerce').dropna()

    fig = go.Figure(data=[
        go.Histogram(x=data, nbinsx=20, marker_color='#212161')
    ])

    fig.update_layout(
        title=f"<b>{question['text']}</b>",
        xaxis_title=question['text'],
        yaxis_title="Frequency",
        font=dict(family="Arial, sans-serif")
    )

    return fig

def create_categorical_chart(df, question_id, question):
    """Create categorical question chart"""
    if question_id not in df.columns:
        return go.Figure().add_annotation(text="Question data not found", showarrow=False)

    responses = df[question_id].value_counts()

    fig = go.Figure(data=[
        go.Bar(x=responses.index, y=responses.values,
               marker_color='#F2B800')
    ])

    fig.update_layout(
        title=f"<b>{question['text']}</b>",
        xaxis_title="Response",
        yaxis_title="Count",
        font=dict(family="Arial, sans-serif")
    )

    return fig

# Create the app
app = App(app_ui, server)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7394)