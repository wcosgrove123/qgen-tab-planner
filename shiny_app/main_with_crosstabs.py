"""
SPSS Data Visualization + Cross-Tabulation Dashboard
Professional market research tool with banner plan execution
"""

import pandas as pd
import plotly.graph_objects as go
import json
from pathlib import Path

from shiny import App, ui, render, reactive
from shiny.types import FileInfo
import shinyswatch

# Import cross-tab engine
from crosstab_engine import (
    generate_crosstab_report,
    export_to_csv,
    export_to_dataframe
)
from banner_csv_parser import parse_banner_csv, parse_tab_sheet_csv
from supabase_connector import (
    get_banner_plans_for_project,
    get_questions_for_project,
    check_api_health
)
from excel_formatter import create_professional_excel

# Custom CSS
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

.status-success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
    padding: 10px;
    border-radius: 6px;
    margin: 10px 0;
}

.status-info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
    padding: 10px;
    border-radius: 6px;
    margin: 10px 0;
}

.banner-preview {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 15px;
    margin: 10px 0;
}

.h1-category {
    font-weight: 700;
    color: #212161;
    margin-top: 10px;
    padding: 8px;
    background: #e0e7ff;
    border-radius: 4px;
}

.h2-column {
    padding: 6px 12px;
    margin: 4px 0;
    background: white;
    border-left: 3px solid #3F6AB7;
    font-size: 13px;
}

.equation-code {
    font-family: monospace;
    background: #1e293b;
    color: #10b981;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
}
"""

# UI Definition
app_ui = ui.page_navbar(
    ui.nav_panel(
        "📊 Visualizations",
        ui.div(
            ui.h1("📊 SPSS Data Visualization", class_="mb-0"),
            ui.p("Create charts from your SPSS data", class_="mb-0 mt-2"),
            class_="main-header"
        ),
        ui.div(
            ui.h4("📁 Upload SPSS Files"),
            ui.input_file("viz_labels_file", "Labels CSV", accept=[".csv"]),
            ui.output_ui("viz_status"),
            class_="upload-section"
        ),
        ui.output_ui("viz_content")
    ),

    ui.nav_panel(
        "📋 Cross-Tabs",
        ui.div(
            ui.h1("📋 Cross-Tabulation Generator", class_="mb-0"),
            ui.p("Execute banner plans against SPSS data", class_="mb-0 mt-2"),
            class_="main-header"
        ),

        # Step 1: Upload SPSS Data
        ui.div(
            ui.h4("1️⃣ Upload SPSS Data"),
            ui.row(
                ui.column(6,
                    ui.input_file("codes_file", "Codes.csv (numeric data)", accept=[".csv"])
                ),
                ui.column(6,
                    ui.input_file("labels_file", "Labels.csv (text labels)", accept=[".csv"])
                )
            ),
            ui.output_ui("codes_status"),
            class_="upload-section"
        ),

        # Step 2: Load Banner Plan from Supabase
        ui.div(
            ui.h4("2️⃣ Load Banner Plan"),
            ui.row(
                ui.column(8,
                    ui.input_text("project_id", "Project ID (from URL)",
                                 placeholder="Enter UUID from project URL")
                ),
                ui.column(4,
                    ui.input_action_button("fetch_banner", "🔄 Fetch from Database",
                                         class_="btn-primary w-100")
                )
            ),
            ui.output_ui("api_status"),
            ui.output_ui("banner_preview"),
            ui.HTML("<hr style='margin: 15px 0;'>"),
            ui.HTML("<p style='margin: 10px 0; color: #64748b;'>📁 Or upload CSV file:</p>"),
            ui.input_file("banner_file", "Banner Plan CSV File", accept=[".csv"]),
            class_="upload-section"
        ),

        # Step 2b: Optional Tab Sheet
        ui.div(
            ui.h4("2️⃣b (Optional) Load Tab Sheet"),
            ui.input_file("tab_sheet_file", "Tab Sheet CSV File (auto-configures questions)", accept=[".csv"]),
            ui.output_ui("tab_sheet_status"),
            class_="upload-section"
        ),

        # Step 3: Configure Questions
        ui.div(
            ui.h4("3️⃣ Configure Questions"),
            ui.output_ui("question_config"),
            class_="upload-section"
        ),

        # Step 4: Generate & Export
        ui.div(
            ui.h4("4️⃣ Generate Cross-Tabs"),
            ui.row(
                ui.column(4,
                    ui.input_action_button("generate_crosstabs", "🚀 Generate Cross-Tabs",
                                         class_="btn-primary w-100", style="padding: 15px; font-size: 16px;")
                ),
                ui.column(4,
                    ui.download_button("download_excel", "📊 Download Excel",
                                     class_="btn-success w-100", style="padding: 15px; font-size: 16px;")
                ),
                ui.column(4,
                    ui.download_button("download_csv", "💾 Download CSV",
                                     class_="btn-secondary w-100", style="padding: 15px; font-size: 16px;")
                )
            ),
            class_="upload-section"
        ),

        # Results Preview
        ui.div(
            ui.h4("📊 Results Preview"),
            ui.output_ui("crosstab_results"),
            class_="upload-section"
        )
    ),

    title="SPSS Analytics Dashboard",
    id="main_nav"
)

def server(input, output, session):
    # Reactive values
    codes_data = reactive.Value(None)
    labels_data = reactive.Value(None)
    banner_plan = reactive.Value(None)
    question_types = reactive.Value({})
    crosstab_report = reactive.Value(None)
    api_connected = reactive.Value(None)

    # ========== CROSS-TABS TAB ==========

    # Check API health on startup
    @reactive.Effect
    def check_api():
        is_healthy = check_api_health()
        api_connected.set(is_healthy)

    @output
    @render.ui
    def api_status():
        is_connected = api_connected.get()
        if is_connected is None:
            return None

        if is_connected:
            return ui.div(
                "✅ Connected to API server",
                class_="status-success"
            )
        else:
            return ui.div(
                "⚠️ API server not running. Start with start-app.bat or upload CSV instead.",
                class_="status-info"
            )

    @reactive.Effect
    @reactive.event(input.fetch_banner)
    def fetch_banner_from_db():
        project_id = input.project_id()
        if not project_id or project_id.strip() == "":
            return

        try:
            # Fetch banner plans
            print(f"DEBUG: Fetching banner plans for project: {project_id.strip()}")
            banner_data = get_banner_plans_for_project(project_id.strip())
            print(f"DEBUG: Banner data received: {len(banner_data) if banner_data else 0} banner plans")

            if banner_data and len(banner_data) > 0:
                # Use first banner plan
                banner_plan.set(banner_data[0])
                print(f"SUCCESS: Banner plan set: {banner_data[0].get('name')}")

                # Fetch questions and auto-configure types
                print(f"DEBUG: Fetching questions for project: {project_id.strip()}")
                questions_data = get_questions_for_project(project_id.strip())
                print(f"DEBUG: Questions data received: {questions_data}")
                print(f"DEBUG: Questions data type: {type(questions_data)}")
                print(f"DEBUG: Questions data length: {len(questions_data) if questions_data else 0}")

                if questions_data and len(questions_data) > 0:
                    types = {}
                    for q in questions_data:
                        types[q['id']] = q['type']
                    question_types.set(types)
                    print(f"SUCCESS: Loaded {len(types)} question types from Supabase")
                else:
                    print(f"WARNING: No questions data received from API")

                print(f"SUCCESS: Loaded banner plan: {banner_data[0].get('name')}")
            else:
                print(f"WARNING: No banner plans found for project {project_id}")
        except Exception as e:
            print(f"ERROR: Error fetching banner plan: {e}")
            import traceback
            traceback.print_exc()

    @reactive.Effect
    @reactive.event(input.codes_file)
    def load_codes_file():
        file_info = input.codes_file()
        if file_info is not None:
            try:
                df = pd.read_csv(file_info[0]["datapath"])
                codes_data.set(df)

                # Only initialize question types if not already loaded from Supabase/tab sheet
                existing_types = question_types.get()
                if not existing_types or len(existing_types) == 0:
                    # Auto-detect questions
                    columns = df.columns.tolist()
                    question_cols = [col for col in columns if col.startswith('S') or col.startswith('Q')]

                    # Initialize question types
                    types = {}
                    for q in question_cols:
                        types[q] = 'categorical'  # Default
                    question_types.set(types)
                    print(f"INFO: Auto-detected {len(types)} questions from SPSS columns")
                else:
                    print(f"INFO: Preserving {len(existing_types)} questions from Supabase/tab sheet")

            except Exception as e:
                print(f"Error loading codes file: {e}")

    @reactive.Effect
    @reactive.event(input.labels_file)
    def load_labels_file():
        file_info = input.labels_file()
        if file_info is not None:
            try:
                df = pd.read_csv(file_info[0]["datapath"])
                labels_data.set(df)
            except Exception as e:
                print(f"Error loading labels file: {e}")

    @output
    @render.ui
    def codes_status():
        codes_df = codes_data.get()
        labels_df = labels_data.get()

        status_items = []

        if codes_df is not None:
            status_items.append(
                ui.div(
                    f"✅ Codes: {len(codes_df)} respondents × {len(codes_df.columns)} variables",
                    class_="status-success"
                )
            )

        if labels_df is not None:
            status_items.append(
                ui.div(
                    f"✅ Labels: {len(labels_df)} respondents × {len(labels_df.columns)} variables",
                    class_="status-success",
                    style="margin-top: 10px;"
                )
            )

        if status_items:
            return ui.div(*status_items)

        return None

    @reactive.Effect
    @reactive.event(input.banner_file)
    def load_banner_plan():
        file_info = input.banner_file()
        if file_info is not None:
            try:
                plan = parse_banner_csv(file_info[0]["datapath"])
                banner_plan.set(plan)
            except Exception as e:
                print(f"Error loading banner plan: {e}")
                import traceback
                traceback.print_exc()

    @reactive.Effect
    @reactive.event(input.tab_sheet_file)
    def load_tab_sheet():
        file_info = input.tab_sheet_file()
        df = codes_data.get()

        if file_info is not None and df is not None:
            try:
                questions = parse_tab_sheet_csv(file_info[0]["datapath"])

                # REPLACE question types with ONLY tab sheet questions
                # This filters out metadata columns like QualityScore_TOTAL
                types = {}
                for q in questions:
                    if q['id'] in df.columns:
                        types[q['id']] = q['type']
                    else:
                        print(f"WARNING: Tab sheet question '{q['id']}' not found in SPSS data")

                if len(types) > 0:
                    question_types.set(types)  # Completely replace, don't merge
                    print(f"SUCCESS: Loaded {len(types)} questions from tab sheet")
                else:
                    print("ERROR: No matching questions found between tab sheet and SPSS data")
            except Exception as e:
                print(f"Error loading tab sheet: {e}")
                import traceback
                traceback.print_exc()

    @output
    @render.ui
    def tab_sheet_status():
        types = question_types.get()
        if types and len(types) > 0:
            return ui.div(
                f"✅ Loaded {len(types)} questions from tab sheet with auto-detected types",
                class_="status-success"
            )
        return None

    @output
    @render.ui
    def banner_preview():
        plan = banner_plan.get()
        if plan is None:
            return ui.p("Upload a banner plan JSON file", class_="text-muted")

        preview_html = [
            ui.div(
                f"✅ Banner Plan: {plan.get('name', 'Unnamed')}",
                class_="status-success"
            )
        ]

        # Show H1 categories and H2 columns
        for h1_group in plan.get('groups', []):
            preview_html.append(
                ui.div(
                    ui.div(f"📁 {h1_group['name']}", class_="h1-category"),
                    *[
                        ui.div(
                            f"{h2['name']} ",
                            ui.span(h2.get('equation', ''), class_="equation-code"),
                            class_="h2-column"
                        )
                        for h2 in h1_group.get('columns', [])
                    ],
                    class_="banner-preview"
                )
            )

        return ui.div(*preview_html)

    @output
    @render.ui
    def question_config():
        df = codes_data.get()
        types = question_types.get()

        if df is None or not types:
            return ui.p("Upload SPSS data first", class_="text-muted")

        question_cols = list(types.keys())

        config_items = []
        for q in question_cols[:20]:  # Show first 20
            config_items.append(
                ui.div(
                    ui.row(
                        ui.column(3, ui.strong(q)),
                        ui.column(9,
                            ui.input_radio_buttons(
                                f"qtype_{q}",
                                None,
                                choices=["categorical", "numeric", "likert"],
                                selected=types[q],
                                inline=True
                            )
                        )
                    ),
                    style="margin-bottom: 10px; padding: 10px; background: #f8fafc; border-radius: 4px;"
                )
            )

        return ui.div(*config_items)

    @reactive.Effect
    @reactive.event(input.generate_crosstabs)
    def generate_report():
        df = codes_data.get()
        plan = banner_plan.get()
        types = question_types.get()

        if df is None or plan is None:
            return

        try:
            # Build questions list with current types
            questions = []
            for q_id, q_type in types.items():
                # Update type from UI if available
                try:
                    ui_input = input[f"qtype_{q_id}"]
                    if ui_input is not None:
                        q_type = ui_input()
                except:
                    # UI input doesn't exist yet, use default type
                    pass

                questions.append({
                    'id': q_id,
                    'text': f"Question {q_id}",
                    'type': q_type
                })

            # Generate report
            print(f"Generating cross-tabs for {len(questions)} questions...")
            report = generate_crosstab_report(df, questions, plan)
            crosstab_report.set(report)
            print(f"SUCCESS: Generated {len(report['tables'])} tables")

        except Exception as e:
            print(f"Error generating cross-tabs: {e}")
            import traceback
            traceback.print_exc()

    @output
    @render.ui
    def crosstab_results():
        report = crosstab_report.get()
        if report is None:
            return ui.div(
                ui.p("Click 'Generate Cross-Tabs' to see results", class_="text-center text-muted")
            )

        # Show first 3 tables as preview
        preview_tables = []
        for table in report['tables'][:3]:
            df = export_to_dataframe(report, table['question_id'])
            if df is not None:
                preview_tables.append(
                    ui.div(
                        ui.h5(f"{table['question_id']}: {table['question_text']}"),
                        ui.HTML(df.to_html(index=False, classes="table table-striped")),
                        style="margin-bottom: 30px;"
                    )
                )

        total_tables = len(report['tables'])
        if total_tables > 3:
            preview_tables.append(
                ui.p(f"... and {total_tables - 3} more tables. Download CSV to see all results.",
                    class_="text-center text-muted")
            )

        return ui.div(*preview_tables)

    @session.download(filename="crosstabs.csv")
    def download_csv():
        report = crosstab_report.get()
        if report is not None:
            csv_str = export_to_csv(report)
            return csv_str
        return ""

    @session.download(filename="crosstabs.xlsx")
    def download_excel():
        report = crosstab_report.get()
        plan = banner_plan.get()

        if report is not None and plan is not None:
            import tempfile
            import os

            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='wb', suffix='.xlsx', delete=False) as tmp:
                tmp_path = tmp.name

            # Generate Excel file
            try:
                # Use banner plan name or default
                project_name = plan.get('name', 'Market Research Study')
                create_professional_excel(report, plan, tmp_path, study_name=project_name)

                # Read file and return bytes
                with open(tmp_path, 'rb') as f:
                    excel_bytes = f.read()

                # Clean up temp file
                os.unlink(tmp_path)

                return excel_bytes
            except Exception as e:
                print(f"Error generating Excel: {e}")
                import traceback
                traceback.print_exc()

                # Clean up temp file if it exists
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

                return b""

        return b""

    # ========== VISUALIZATION TAB ==========

    @output
    @render.ui
    def viz_status():
        return ui.p("Visualization features coming soon...", class_="text-muted")

    @output
    @render.ui
    def viz_content():
        return ui.div(
            ui.p("Upload SPSS data to create charts", class_="text-center text-muted p-5")
        )

# Create app
app = App(app_ui, server)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888)