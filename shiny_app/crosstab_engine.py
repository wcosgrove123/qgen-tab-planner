"""
Cross-Tabulation Engine for Banner Plans
Executes banner equations against SPSS data to generate cross-tab tables

Created: 2025-09-30
"""

import pandas as pd
import numpy as np
import re
from typing import Dict, List, Any, Optional


def translate_spss_equation(equation: str, available_columns: List[str]) -> str:
    """
    Translate simplified equations to SPSS checkbox format

    Example: S7=2 → S7r2=1 (if S7 doesn't exist but S7r2 does)

    Args:
        equation: Original equation
        available_columns: List of actual column names in data

    Returns:
        Translated equation
    """
    # Match pattern like "S7=2" or "S7!=10"
    match = re.match(r'^([A-Za-z0-9_]+)(=|!=)(\d+)$', equation.strip())
    if not match:
        return equation

    var_name, operator, value = match.groups()

    # If column doesn't exist, try "r" format
    if var_name not in available_columns:
        # Check if S7r2 exists (checkbox format)
        checkbox_col = f"{var_name}r{value}"
        if checkbox_col in available_columns:
            # Translate: S7=2 becomes S7r2=1
            if operator == '=':
                return f"{checkbox_col}=1"
            elif operator == '!=':
                return f"{checkbox_col}!=1"

    return equation


def evaluate_equation(equation: str, row: pd.Series) -> bool:
    """
    Evaluate banner equation against a data row

    Supports:
    - Basic comparisons: =, !=, >, <, >=, <=
    - Ranges: Q1=1-9
    - Multiple values: S7=1,2,3
    - Compound logic: S7=2 & Q1>5, S1=1 | S1=2, S7=2 AND Q1>5
    - BETWEEN syntax: Q1 BETWEEN 1 AND 9
    - Auto-translates to SPSS checkbox format (S7=2 → S7r2=1)

    Args:
        equation: Banner equation (e.g., "S7=2", "Q1>5 & S1=1", "Q1 BETWEEN 1 AND 9")
        row: Pandas Series representing one respondent

    Returns:
        bool: True if row matches equation
    """
    if not equation or equation == 'TOTAL':
        return True

    # Get available columns
    available_columns = row.index.tolist()

    # Normalize equation format: convert "AND" to "&", "OR" to "|"
    # Handle BETWEEN syntax first (before splitting on AND)
    between_pattern = r'([A-Za-z0-9_]+)\s+BETWEEN\s+(\d+)\s+AND\s+(\d+)'
    between_match = re.search(between_pattern, equation, re.IGNORECASE)
    if between_match:
        var_name, min_val, max_val = between_match.groups()
        # Convert to range syntax: Q1 BETWEEN 1 AND 9 → Q1>=1 & Q1<=9
        replacement = f'{var_name}>={min_val} & {var_name}<={max_val}'
        equation = re.sub(between_pattern, replacement, equation, flags=re.IGNORECASE)

    # Now convert word operators to symbols
    equation = re.sub(r'\s+AND\s+', ' & ', equation, flags=re.IGNORECASE)
    equation = re.sub(r'\s+OR\s+', ' | ', equation, flags=re.IGNORECASE)

    # Handle compound logic with OR (|) first (lower precedence)
    if '|' in equation:
        parts = equation.split('|')
        # Translate each sub-equation before evaluating
        translated_parts = [translate_spss_equation(part.strip(), available_columns) for part in parts]
        return any(evaluate_equation(part, row) for part in translated_parts)

    # Handle compound logic with AND (&) (higher precedence)
    if '&' in equation:
        parts = equation.split('&')
        # Translate each sub-equation before evaluating
        translated_parts = [translate_spss_equation(part.strip(), available_columns) for part in parts]
        return all(evaluate_equation(part, row) for part in translated_parts)

    # Translate single equation to SPSS format if needed
    equation = translate_spss_equation(equation, available_columns)

    # Parse single equation: VARIABLE OPERATOR VALUE
    patterns = [
        (r'^([A-Za-z0-9_]+)\s*>=\s*(.+)$', '>='),
        (r'^([A-Za-z0-9_]+)\s*<=\s*(.+)$', '<='),
        (r'^([A-Za-z0-9_]+)\s*!=\s*(.+)$', '!='),
        (r'^([A-Za-z0-9_]+)\s*>\s*(.+)$', '>'),
        (r'^([A-Za-z0-9_]+)\s*<\s*(.+)$', '<'),
        (r'^([A-Za-z0-9_]+)\s*=\s*(.+)$', '='),
    ]

    for pattern, operator in patterns:
        match = re.match(pattern, equation)
        if match:
            variable, value_str = match.groups()

            # Get cell value
            if variable not in row.index:
                return False

            cell_value = row[variable]

            # Handle missing/null values
            if pd.isna(cell_value):
                return False

            # Handle ranges (e.g., "1-9")
            if '-' in value_str and not value_str.startswith('-'):
                try:
                    min_val, max_val = map(float, value_str.split('-'))
                    return min_val <= float(cell_value) <= max_val
                except:
                    pass

            # Handle multiple values (e.g., "1,2,3")
            if ',' in value_str:
                values = [v.strip() for v in value_str.split(',')]
                if operator == '=':
                    return str(cell_value) in values or float(cell_value) in [float(v) for v in values if v.replace('.','').replace('-','').isdigit()]
                elif operator == '!=':
                    return str(cell_value) not in values

            # Numeric comparison
            try:
                num_cell = float(cell_value)
                num_value = float(value_str)

                if operator == '=':
                    return num_cell == num_value
                elif operator == '!=':
                    return num_cell != num_value
                elif operator == '>':
                    return num_cell > num_value
                elif operator == '<':
                    return num_cell < num_value
                elif operator == '>=':
                    return num_cell >= num_value
                elif operator == '<=':
                    return num_cell <= num_value
            except:
                # Fall back to string comparison
                if operator == '=':
                    return str(cell_value) == str(value_str)
                elif operator == '!=':
                    return str(cell_value) != str(value_str)

    return False


def filter_data_by_equation(df: pd.DataFrame, equation: str) -> pd.DataFrame:
    """
    Filter dataframe based on banner equation

    Args:
        df: Full dataset
        equation: Banner equation

    Returns:
        Filtered dataframe
    """
    if not equation or equation == 'TOTAL':
        return df

    mask = df.apply(lambda row: evaluate_equation(equation, row), axis=1)
    return df[mask]


def calculate_categorical_stats(df: pd.DataFrame, question: str, banner_columns: List[Dict]) -> Dict:
    """
    Calculate frequency distribution for categorical question

    Args:
        df: Full dataset
        question: Question variable name
        banner_columns: List of banner column definitions with equations

    Returns:
        Dictionary with stats for each banner column
    """
    results = {}

    for col in banner_columns:
        filtered = filter_data_by_equation(df, col['equation'])
        base = len(filtered)

        if base == 0:
            results[col['id']] = {
                'name': col['name'],
                'equation': col['equation'],
                'base': 0,
                'frequencies': {},
                'percentages': {}
            }
            continue

        # Calculate frequency distribution
        if question in filtered.columns:
            freq = filtered[question].value_counts().to_dict()
            pct = (filtered[question].value_counts(normalize=True) * 100).round(1).to_dict()
        else:
            freq = {}
            pct = {}

        results[col['id']] = {
            'name': col['name'],
            'equation': col['equation'],
            'base': base,
            'frequencies': freq,
            'percentages': pct
        }

    return results


def calculate_numeric_stats(df: pd.DataFrame, question: str, banner_columns: List[Dict]) -> Dict:
    """
    Calculate mean, median, std dev for numeric question

    Args:
        df: Full dataset
        question: Question variable name
        banner_columns: List of banner column definitions

    Returns:
        Dictionary with stats for each banner column
    """
    results = {}

    for col in banner_columns:
        filtered = filter_data_by_equation(df, col['equation'])

        if len(filtered) == 0 or question not in filtered.columns:
            results[col['id']] = {
                'name': col['name'],
                'equation': col['equation'],
                'base': 0,
                'mean': None,
                'median': None,
                'std': None
            }
            continue

        values = pd.to_numeric(filtered[question], errors='coerce').dropna()
        base = len(values)

        if base == 0:
            results[col['id']] = {
                'name': col['name'],
                'equation': col['equation'],
                'base': 0,
                'mean': None,
                'median': None,
                'std': None
            }
            continue

        results[col['id']] = {
            'name': col['name'],
            'equation': col['equation'],
            'base': base,
            'mean': round(values.mean(), 2),
            'median': round(values.median(), 2),
            'std': round(values.std(), 2)
        }

    return results


def calculate_likert_stats(df: pd.DataFrame, question: str, banner_columns: List[Dict],
                          top_codes: List = [1, 2], bottom_codes: List = [4, 5]) -> Dict:
    """
    Calculate Top-2-Box and Bottom-2-Box for Likert scales

    Args:
        df: Full dataset
        question: Question variable name
        banner_columns: List of banner column definitions
        top_codes: Codes for top box (e.g., [1, 2] for Strongly Agree + Agree)
        bottom_codes: Codes for bottom box

    Returns:
        Dictionary with T2B/B2B for each banner column
    """
    results = {}

    for col in banner_columns:
        filtered = filter_data_by_equation(df, col['equation'])
        base = len(filtered)

        if base == 0 or question not in filtered.columns:
            results[col['id']] = {
                'name': col['name'],
                'equation': col['equation'],
                'base': 0,
                'top_box': None,
                'bottom_box': None
            }
            continue

        values = pd.to_numeric(filtered[question], errors='coerce').dropna()

        top_count = values.isin(top_codes).sum()
        bottom_count = values.isin(bottom_codes).sum()

        results[col['id']] = {
            'name': col['name'],
            'equation': col['equation'],
            'base': base,
            'top_box': round((top_count / base) * 100, 1) if base > 0 else 0,
            'bottom_box': round((bottom_count / base) * 100, 1) if base > 0 else 0
        }

    return results


def generate_crosstab_report(df: pd.DataFrame, questions: List[Dict], banner_plan: Dict) -> Dict:
    """
    Generate complete cross-tabulation report

    Args:
        df: SPSS data
        questions: List of question definitions with type info
        banner_plan: Banner plan with H1/H2 structure

    Returns:
        Complete cross-tab report
    """
    # Build banner columns list (Total + all H2s)
    banner_columns = [
        {'id': 'TOTAL', 'name': 'Total', 'equation': 'TOTAL'}
    ]

    for h1_group in banner_plan.get('groups', []):
        for h2_col in h1_group.get('columns', []):
            banner_columns.append({
                'id': h2_col['id'],
                'name': h2_col['name'],
                'equation': h2_col.get('equation', ''),
                'parent': h1_group['name']
            })

    # Generate tables for each question
    tables = []

    for q in questions:
        question_id = q['id']
        question_type = q.get('type', 'categorical')

        if question_type == 'numeric':
            stats = calculate_numeric_stats(df, question_id, banner_columns)
        elif question_type == 'likert':
            top_codes = q.get('top_codes', [1, 2])
            bottom_codes = q.get('bottom_codes', [4, 5])
            stats = calculate_likert_stats(df, question_id, banner_columns, top_codes, bottom_codes)
        else:
            stats = calculate_categorical_stats(df, question_id, banner_columns)

        tables.append({
            'question_id': question_id,
            'question_text': q.get('text', question_id),
            'question_type': question_type,
            'data': stats
        })

    return {
        'metadata': {
            'banner_name': banner_plan.get('name', 'Unnamed Banner'),
            'total_base': len(df),
            'num_questions': len(questions),
            'num_columns': len(banner_columns)
        },
        'tables': tables
    }


def export_to_csv(report: Dict) -> str:
    """
    Export cross-tab report to CSV string

    Args:
        report: Generated cross-tab report

    Returns:
        CSV string
    """
    lines = []

    # Header
    lines.append(f"Cross-Tabulation Report")
    lines.append(f"Banner: {report['metadata']['banner_name']}")
    lines.append(f"Total Base: {report['metadata']['total_base']}")
    lines.append("")

    # Each table
    for table in report['tables']:
        lines.append(f"{table['question_id']}: {table['question_text']}")
        lines.append(f"Type: {table['question_type']}")
        lines.append("")

        # Get column IDs
        col_ids = list(table['data'].keys())

        # Header rows
        lines.append("Column," + ",".join([table['data'][cid]['name'] for cid in col_ids]))
        lines.append("Equation," + ",".join([table['data'][cid]['equation'] for cid in col_ids]))
        lines.append("Base," + ",".join([str(table['data'][cid]['base']) for cid in col_ids]))

        # Data rows based on type
        if table['question_type'] == 'numeric':
            lines.append("Mean," + ",".join([str(table['data'][cid].get('mean', '-')) for cid in col_ids]))
            lines.append("Median," + ",".join([str(table['data'][cid].get('median', '-')) for cid in col_ids]))
            lines.append("Std Dev," + ",".join([str(table['data'][cid].get('std', '-')) for cid in col_ids]))
        elif table['question_type'] == 'likert':
            lines.append("Top Box %," + ",".join([str(table['data'][cid].get('top_box', '-')) for cid in col_ids]))
            lines.append("Bottom Box %," + ",".join([str(table['data'][cid].get('bottom_box', '-')) for cid in col_ids]))
        else:
            # Categorical - show all codes
            all_codes = set()
            for cid in col_ids:
                all_codes.update(table['data'][cid].get('percentages', {}).keys())

            for code in sorted(all_codes):
                values = [str(table['data'][cid].get('percentages', {}).get(code, '0.0')) for cid in col_ids]
                lines.append(f"Code {code} %," + ",".join(values))

        lines.append("")

    return "\n".join(lines)


def export_to_dataframe(report: Dict, question_id: str) -> Optional[pd.DataFrame]:
    """
    Export single table as pandas DataFrame for display

    Args:
        report: Generated cross-tab report
        question_id: Question to export

    Returns:
        DataFrame or None
    """
    table = next((t for t in report['tables'] if t['question_id'] == question_id), None)
    if not table:
        return None

    col_ids = list(table['data'].keys())

    # Build DataFrame
    data = {
        'Metric': ['Column', 'Equation', 'Base']
    }

    for cid in col_ids:
        data[cid] = [
            table['data'][cid]['name'],
            table['data'][cid]['equation'],
            table['data'][cid]['base']
        ]

    # Add type-specific rows
    if table['question_type'] == 'numeric':
        data['Metric'].extend(['Mean', 'Median', 'Std Dev'])
        for cid in col_ids:
            data[cid].extend([
                table['data'][cid].get('mean', '-'),
                table['data'][cid].get('median', '-'),
                table['data'][cid].get('std', '-')
            ])
    elif table['question_type'] == 'likert':
        data['Metric'].extend(['Top Box %', 'Bottom Box %'])
        for cid in col_ids:
            data[cid].extend([
                table['data'][cid].get('top_box', '-'),
                table['data'][cid].get('bottom_box', '-')
            ])
    else:
        # Categorical
        all_codes = set()
        for cid in col_ids:
            all_codes.update(table['data'][cid].get('percentages', {}).keys())

        for code in sorted(all_codes):
            data['Metric'].append(f'Code {code} %')
            for cid in col_ids:
                data[cid].append(table['data'][cid].get('percentages', {}).get(code, 0.0))

    return pd.DataFrame(data)