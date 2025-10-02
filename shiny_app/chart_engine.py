"""
Advanced Chart Engine for SPSS Data Visualization
Plotly-based professional chart generation with market research styling
"""

import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import numpy as np
from typing import Dict, List, Optional, Tuple

class SPSSChartEngine:
    """Professional chart generation engine for SPSS market research data"""

    # Professional color palettes
    CUE_BRAND_COLORS = {
        'primary': '#212161',
        'secondary': '#F2B800',
        'blue_light': '#3F6AB7',
        'blue_dark': '#2c5aa0',
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444'
    }

    LIKERT_COLORS = {
        'strongly_agree': '#fef3c7',
        'agree': '#fcd34d',
        'neither': '#f59e0b',
        'disagree': '#d97706',
        'strongly_disagree': '#b45309'
    }

    STATEMENT_MAPPING = {
        'Q3r1': 'Provides long-lasting comfort',
        'Q3r2': 'Feels natural in my eyes',
        'Q3r3': 'Keeps my eyes moist throughout the day',
        'Q3r4': 'Allows my eyes to breathe',
        'Q3r5': 'Provides clear, crisp vision',
        'Q3r6': 'Delivers exceptional all-day comfort',
        'Q3r7': 'Provides exceptional vision and clarity',
        'Q6r1': 'Comfort throughout the day',
        'Q6r2': 'Clear vision',
        'Q6r3': 'Easy to insert and remove',
        'Q6r4': 'Good value for money',
        'Q6r5': 'Suitable for long wear',
        'Q6r6': 'Natural feeling',
        'Q6r7': 'Reliable performance'
    }

    def __init__(self, df: pd.DataFrame, codes_df: Optional[pd.DataFrame] = None):
        self.df = df
        self.codes_df = codes_df

    def create_professional_likert_table(self, question_id: str, question_text: str = None,
                                       sort_by_t2b: bool = True, banner_var: str = None) -> go.Figure:
        """
        Create professional multi-statement Likert chart exactly matching reference design
        """
        # Find sub-questions
        sub_questions = [col for col in self.df.columns if col.startswith(f"{question_id}r")]

        if not sub_questions:
            return self._create_error_figure("No sub-questions found for this question")

        # Likert scale configuration
        scale_order = ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree']
        scale_colors = [self.LIKERT_COLORS[key] for key in ['strongly_agree', 'agree', 'neither', 'disagree', 'strongly_disagree']]

        # Process each statement
        statements_data = []
        for sub_q in sorted(sub_questions):
            statement_text = self.STATEMENT_MAPPING.get(sub_q, sub_q)

            # Calculate percentages and metrics
            responses = self.df[sub_q].value_counts()
            total = len(self.df[sub_q].dropna())

            if total == 0:
                continue

            # Calculate T2B and B2B
            t2b = round(((responses.get('Strongly agree', 0) + responses.get('Agree', 0)) / total) * 100)
            b2b = round(((responses.get('Strongly disagree', 0) + responses.get('Disagree', 0)) / total) * 100)

            # Calculate percentages for each scale point
            scale_percentages = []
            for scale in scale_order:
                pct = round((responses.get(scale, 0) / total) * 100)
                scale_percentages.append(pct)

            statements_data.append({
                'statement': statement_text,
                'percentages': scale_percentages,
                't2b': t2b,
                'b2b': b2b,
                'total': total
            })

        # Sort by T2B if requested
        if sort_by_t2b:
            statements_data.sort(key=lambda x: x['t2b'], reverse=True)

        return self._build_likert_table_figure(statements_data, question_text or question_id, scale_order, scale_colors)

    def _build_likert_table_figure(self, statements_data: List[Dict], title: str,
                                 scale_order: List[str], scale_colors: List[str]) -> go.Figure:
        """Build the professional Likert table figure"""

        statement_names = [item['statement'] for item in statements_data]
        n_statements = len(statement_names)

        # Create subplot with secondary y-axis for T2B/B2B
        fig = make_subplots(
            rows=1, cols=1,
            specs=[[{"secondary_y": False}]]
        )

        # Add stacked bars for each scale point
        for i, (scale, color) in enumerate(zip(scale_order, scale_colors)):
            values = [item['percentages'][i] for item in statements_data]

            # Show percentage labels only if segment > 8%
            text_values = [f"{v}%" if v > 8 else "" for v in values]

            fig.add_trace(go.Bar(
                name=scale,
                y=statement_names,
                x=values,
                orientation='h',
                marker=dict(
                    color=color,
                    line=dict(color='rgba(255,255,255,0.6)', width=1)
                ),
                text=text_values,
                textposition="inside",
                textfont=dict(
                    color="#1f2937",
                    size=11,
                    family="Arial, sans-serif"
                ),
                hovertemplate=f"<b>{scale}</b><br>%{{x}}%<extra></extra>"
            ))

        # Update layout for professional appearance
        fig.update_layout(
            title=dict(
                text=f"<b style='color: #F2B800; font-size: 24px;'>{title}</b><br><span style='color: #333; font-size: 16px;'>Claims</span>",
                x=0.5,
                xanchor='center'
            ),
            barmode='stack',
            height=max(400, n_statements * 50 + 200),
            width=1200,
            margin=dict(l=300, r=200, t=120, b=120),
            font=dict(family="Arial, sans-serif", size=13),
            plot_bgcolor='white',
            paper_bgcolor='white',
            showlegend=True,
            legend=dict(
                orientation="h",
                yanchor="top",
                y=-0.15,
                xanchor="center",
                x=0.5,
                font=dict(size=12)
            )
        )

        # Add T2B and B2B annotations on the right
        x_t2b = 108
        x_b2b = 115

        # Headers
        fig.add_annotation(
            x=x_t2b, y=n_statements - 0.5,
            text="<b>T2B</b>",
            showarrow=False,
            font=dict(color="white", size=13, family="Arial"),
            bgcolor=self.CUE_BRAND_COLORS['blue_dark'],
            bordercolor="white",
            borderwidth=1,
            width=35,
            height=25
        )

        fig.add_annotation(
            x=x_b2b, y=n_statements - 0.5,
            text="<b>B2B</b>",
            showarrow=False,
            font=dict(color="white", size=13, family="Arial"),
            bgcolor=self.CUE_BRAND_COLORS['secondary'],
            bordercolor="white",
            borderwidth=1,
            width=35,
            height=25
        )

        # Add T2B and B2B values
        for i, item in enumerate(statements_data):
            y_pos = n_statements - i - 1

            # T2B value
            fig.add_annotation(
                x=x_t2b, y=y_pos,
                text=f"<b>{item['t2b']}%</b>",
                showarrow=False,
                font=dict(color="#333", size=12, family="Arial"),
                bgcolor="#E5E7EB",
                bordercolor="#D1D5DB",
                borderwidth=1,
                width=35,
                height=25
            )

            # B2B value
            fig.add_annotation(
                x=x_b2b, y=y_pos,
                text=f"<b>{item['b2b']}%</b>",
                showarrow=False,
                font=dict(color="white", size=12, family="Arial"),
                bgcolor=self.CUE_BRAND_COLORS['secondary'],
                bordercolor="white",
                borderwidth=1,
                width=35,
                height=25
            )

        # Configure axes
        fig.update_xaxes(
            range=[0, 120],
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            title=""
        )

        fig.update_yaxes(
            showgrid=False,
            zeroline=False,
            autorange="reversed",  # Top to bottom ordering
            title=""
        )

        return fig

    def create_cross_tabulated_chart(self, question_id: str, banner_var: str,
                                   question_text: str = None) -> go.Figure:
        """Create cross-tabulated chart with banner analysis"""

        if banner_var not in self.df.columns:
            return self._create_error_figure(f"Banner variable '{banner_var}' not found")

        # Get unique banner categories
        banner_categories = self.df[banner_var].unique()
        banner_categories = [cat for cat in banner_categories if pd.notna(cat)]

        if len(banner_categories) == 0:
            return self._create_error_figure("No valid banner categories found")

        # For multi-statement questions
        sub_questions = [col for col in self.df.columns if col.startswith(f"{question_id}r")]

        if sub_questions:
            return self._create_crosstab_likert_table(sub_questions, banner_var, banner_categories, question_text)
        else:
            return self._create_crosstab_single_question(question_id, banner_var, banner_categories, question_text)

    def _create_crosstab_likert_table(self, sub_questions: List[str], banner_var: str,
                                    banner_categories: List[str], question_text: str) -> go.Figure:
        """Create cross-tabulated Likert table"""

        # Create subplots for each banner category
        fig = make_subplots(
            rows=1, cols=len(banner_categories) + 1,
            subplot_titles=["Total"] + [str(cat) for cat in banner_categories],
            shared_yaxis=True,
            horizontal_spacing=0.02
        )

        scale_order = ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree']
        scale_colors = [self.LIKERT_COLORS[key] for key in ['strongly_agree', 'agree', 'neither', 'disagree', 'strongly_disagree']]

        # Process data for total and each banner category
        all_data = []

        # Total data (first column)
        total_data = self._process_likert_statements(sub_questions, None, None)
        all_data.append(total_data)

        # Data for each banner category
        for category in banner_categories:
            filtered_df = self.df[self.df[banner_var] == category]
            category_data = self._process_likert_statements(sub_questions, filtered_df, category)
            all_data.append(category_data)

        # Add traces for each column
        for col_idx, (data, col_title) in enumerate(zip(all_data, ["Total"] + list(banner_categories))):
            statement_names = [item['statement'] for item in data]

            for scale_idx, (scale, color) in enumerate(zip(scale_order, scale_colors)):
                values = [item['percentages'][scale_idx] for item in data]

                showlegend = col_idx == 0  # Only show legend for first subplot

                fig.add_trace(go.Bar(
                    name=scale,
                    y=statement_names,
                    x=values,
                    orientation='h',
                    marker_color=color,
                    text=[f"{v}%" if v > 5 else "" for v in values],
                    textposition="inside",
                    showlegend=showlegend,
                    legendgroup=scale
                ), row=1, col=col_idx + 1)

        fig.update_layout(
            title=f"<b>{question_text or 'Cross-tabulated Analysis'}</b>",
            barmode='stack',
            height=600,
            font=dict(family="Arial, sans-serif"),
            showlegend=True,
            legend=dict(orientation="h", y=-0.1, x=0.5, xanchor="center")
        )

        return fig

    def _process_likert_statements(self, sub_questions: List[str], filtered_df: pd.DataFrame = None,
                                 category_name: str = None) -> List[Dict]:
        """Process Likert statements for a specific data subset"""

        df_to_use = filtered_df if filtered_df is not None else self.df
        scale_order = ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree']

        statements_data = []

        for sub_q in sorted(sub_questions):
            if sub_q not in df_to_use.columns:
                continue

            statement_text = self.STATEMENT_MAPPING.get(sub_q, sub_q)

            responses = df_to_use[sub_q].value_counts()
            total = len(df_to_use[sub_q].dropna())

            if total == 0:
                continue

            # Calculate percentages for each scale point
            scale_percentages = []
            for scale in scale_order:
                pct = round((responses.get(scale, 0) / total) * 100)
                scale_percentages.append(pct)

            # Calculate T2B and B2B
            t2b = round(((responses.get('Strongly agree', 0) + responses.get('Agree', 0)) / total) * 100)
            b2b = round(((responses.get('Strongly disagree', 0) + responses.get('Disagree', 0)) / total) * 100)

            statements_data.append({
                'statement': statement_text,
                'percentages': scale_percentages,
                't2b': t2b,
                'b2b': b2b,
                'total': total,
                'category': category_name
            })

        # Sort by T2B descending
        statements_data.sort(key=lambda x: x['t2b'], reverse=True)
        return statements_data

    def create_numeric_distribution(self, question_id: str, question_text: str = None,
                                  banner_var: str = None) -> go.Figure:
        """Create professional numeric distribution chart"""

        if question_id not in self.df.columns:
            return self._create_error_figure(f"Question '{question_id}' not found")

        data = pd.to_numeric(self.df[question_id], errors='coerce').dropna()

        if len(data) == 0:
            return self._create_error_figure("No valid numeric data found")

        if banner_var and banner_var in self.df.columns:
            return self._create_grouped_histogram(data, question_id, banner_var, question_text)
        else:
            return self._create_single_histogram(data, question_id, question_text)

    def _create_single_histogram(self, data: pd.Series, question_id: str, question_text: str) -> go.Figure:
        """Create single histogram with statistics"""

        fig = go.Figure()

        # Add histogram
        fig.add_trace(go.Histogram(
            x=data,
            nbinsx=20,
            marker_color=self.CUE_BRAND_COLORS['primary'],
            opacity=0.8,
            name="Distribution"
        ))

        # Add mean line
        mean_val = data.mean()
        fig.add_vline(
            x=mean_val,
            line_dash="dash",
            line_color=self.CUE_BRAND_COLORS['secondary'],
            line_width=3,
            annotation_text=f"Mean: {mean_val:.1f}"
        )

        # Add median line
        median_val = data.median()
        fig.add_vline(
            x=median_val,
            line_dash="dot",
            line_color=self.CUE_BRAND_COLORS['danger'],
            line_width=2,
            annotation_text=f"Median: {median_val:.1f}"
        )

        # Statistics annotation
        stats_text = f"""
        <b>Statistics:</b><br>
        Mean: {mean_val:.2f}<br>
        Median: {median_val:.2f}<br>
        Std Dev: {data.std():.2f}<br>
        N: {len(data)}
        """

        fig.add_annotation(
            x=0.98, y=0.98,
            xref="paper", yref="paper",
            text=stats_text,
            showarrow=False,
            align="left",
            bgcolor="rgba(255,255,255,0.8)",
            bordercolor="#ccc",
            borderwidth=1
        )

        fig.update_layout(
            title=f"<b>{question_text or question_id}</b>",
            xaxis_title=question_text or question_id,
            yaxis_title="Frequency",
            font=dict(family="Arial, sans-serif"),
            plot_bgcolor='white'
        )

        return fig

    def _create_error_figure(self, message: str) -> go.Figure:
        """Create error message figure"""
        fig = go.Figure()
        fig.add_annotation(
            x=0.5, y=0.5,
            xref="paper", yref="paper",
            text=f"<b>Error:</b> {message}",
            showarrow=False,
            font=dict(size=16, color="red")
        )
        fig.update_layout(
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            plot_bgcolor='white'
        )
        return fig

    def export_chart(self, fig: go.Figure, filename: str, format: str = "png",
                    width: int = 1200, height: int = 800) -> str:
        """Export chart to various formats"""

        if format.lower() == "png":
            img_bytes = fig.to_image(format="png", width=width, height=height)
            with open(f"{filename}.png", "wb") as f:
                f.write(img_bytes)
            return f"{filename}.png"

        elif format.lower() == "pdf":
            fig.write_image(f"{filename}.pdf", width=width, height=height)
            return f"{filename}.pdf"

        elif format.lower() == "html":
            fig.write_html(f"{filename}.html")
            return f"{filename}.html"

        else:
            raise ValueError(f"Unsupported format: {format}")