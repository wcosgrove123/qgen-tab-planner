"""
Parse banner plan from CSV format (banners_infuse.csv style)
Converts to the format needed by crosstab_engine
"""

import pandas as pd
import re

def parse_banner_csv(csv_file_path):
    """
    Parse banner plan from CSV file

    Expected format:
    Row 1: BANNERS header
    Row 2: H1 category names
    Row 3: Column headers (banner column names)
    Row 4: Banner ID (A, B, C, etc.)
    Rows 5+: Equations like "(A) S7=2", "(B) S7=10"

    Args:
        csv_file_path: Path to banner CSV file

    Returns:
        dict: Banner plan in format needed by crosstab_engine
    """

    df = pd.read_csv(csv_file_path, header=None)

    # Extract column headers (row 2, index 1)
    column_headers = df.iloc[2].tolist()

    # Extract banner IDs (row 3, index 2)
    banner_ids = df.iloc[3].tolist()

    # Build banner columns from equations
    banner_columns = []

    # Total column (always first)
    banner_columns.append({
        'id': 'TOTAL',
        'name': 'Total',
        'equation': 'TOTAL'
    })

    # Parse equation rows (starting from row 7, index 6)
    for idx, row in df.iterrows():
        if idx < 7:  # Skip header rows
            continue

        cell_value = str(row.iloc[0])

        if pd.isna(cell_value) or cell_value.strip() == '' or cell_value == 'nan':
            continue

        # Parse equation format: "(A) S7 =2" or "(C) Q1 = 1-9, Description"
        match = re.match(r'\(([A-Z])\)\s*(.+)', cell_value)
        if match:
            banner_id = match.group(1)
            equation_text = match.group(2).strip()

            # Extract just the equation part (before any comma description)
            if ',' in equation_text:
                equation = equation_text.split(',')[0].strip()
            else:
                equation = equation_text.strip()

            # Clean up equation spaces
            equation = equation.replace(' =', '=').replace('= ', '=')
            equation = equation.replace('Q1 = 1-9', 'Q1=1-9')
            equation = equation.replace('Q1 = 10+', 'Q1>=10')
            equation = equation.replace('S1 = 3', 'S1=1')  # Female is usually 1
            equation = equation.replace('S1 = 4', 'S1=2')  # Male is usually 2

            # Handle compound equations
            if 'Current ACUVUE' in equation_text:
                equation += ' & S7=2'
            elif 'Current B&L Infuse' in equation_text or 'B&L Infuse' in equation_text:
                equation += ' & S7=10'

            # Find matching column header
            try:
                col_idx = banner_ids.index(f'({banner_id})')
                column_name = column_headers[col_idx] if col_idx < len(column_headers) else f'Column {banner_id}'
            except:
                column_name = f'Column {banner_id}'

            banner_columns.append({
                'id': f'col_{banner_id}',
                'name': column_name,
                'equation': equation
            })

    # Build final structure
    banner_plan = {
        'name': 'Imported Banner Plan',
        'description': 'Parsed from CSV',
        'groups': [
            {
                'name': 'All Columns',
                'columns': banner_columns
            }
        ]
    }

    return banner_plan


def parse_tab_sheet_csv(csv_file_path):
    """
    Parse tab sheet from CSV file

    Expected format:
    Headers: Q#, Base Verbiage, Base Definition, Nets, Additional Instructions
    Rows: Question definitions

    Args:
        csv_file_path: Path to tab sheet CSV file

    Returns:
        list: Questions list for crosstab_engine
    """

    # Skip header rows - actual data starts at row 14 (0-indexed)
    df = pd.read_csv(csv_file_path, skiprows=14)

    questions = []

    for _, row in df.iterrows():
        q_id = str(row.get('Q#', '')).strip()

        # Skip empty, section headers, and summary rows
        if not q_id or q_id == 'nan' or q_id in ['Screener', 'Main Survey']:
            continue

        # Skip summary instructions (Q3_TB Summary, Q3_Mean Summary, etc.)
        if 'summary' in q_id.lower() or '_tb' in q_id.lower() or '_t2b' in q_id.lower() or '_b2b' in q_id.lower() or '_bb' in q_id.lower() or '_mean' in q_id.lower():
            continue

        # Determine question type from nets and instructions
        nets = str(row.get('Nets (English & code #s)', '')).lower()
        instructions = str(row.get('Additional Table Instructions', '')).lower()

        if 't2b' in nets or 'b2b' in nets or 't2b' in instructions or 'b2b' in instructions:
            q_type = 'likert'
        elif 'mean' in instructions or 'median' in instructions:
            q_type = 'numeric'
        else:
            q_type = 'categorical'

        questions.append({
            'id': q_id,
            'text': row.get('Base Verbiage', f'Question {q_id}'),
            'type': q_type
        })

    return questions