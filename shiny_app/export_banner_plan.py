"""
Export Banner Plan from Supabase to JSON for Shiny Cross-Tab Generator

Usage:
    python export_banner_plan.py <project_id> <banner_id> output.json

Example:
    python export_banner_plan.py abc123 banner_1 infuse_banner.json
"""

import json
import sys
from pathlib import Path

# You'll need to add Supabase credentials here
SUPABASE_URL = "your_supabase_url"
SUPABASE_KEY = "your_supabase_key"

def export_banner_to_json(project_id, banner_id, output_file):
    """
    Export banner plan from Supabase to JSON format

    Args:
        project_id: Project UUID
        banner_id: Banner definition UUID
        output_file: Output JSON file path
    """
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Query banner definition with all columns
        response = supabase.table('banner_definitions') \
            .select('''
                id,
                name,
                description,
                banner_groups (
                    id,
                    name,
                    display_order,
                    banner_columns (
                        id,
                        name,
                        equation,
                        display_order
                    )
                )
            ''') \
            .eq('id', banner_id) \
            .eq('project_id', project_id) \
            .single() \
            .execute()

        banner_data = response.data

        # Transform to simplified format for crosstab engine
        simplified = {
            'name': banner_data['name'],
            'description': banner_data.get('description', ''),
            'groups': []
        }

        for h1_group in banner_data.get('banner_groups', []):
            group = {
                'name': h1_group['name'],
                'columns': []
            }

            for h2_col in h1_group.get('banner_columns', []):
                group['columns'].append({
                    'id': h2_col['id'],
                    'name': h2_col['name'],
                    'equation': h2_col.get('equation', '')
                })

            simplified['groups'].append(group)

        # Write to JSON file
        with open(output_file, 'w') as f:
            json.dump(simplified, f, indent=2)

        print(f"Banner plan exported to: {output_file}")
        print(f"Banner: {simplified['name']}")
        print(f"Groups: {len(simplified['groups'])}")
        print(f"Columns: {sum(len(g['columns']) for g in simplified['groups'])}")

        return simplified

    except Exception as e:
        print(f"❌ Error exporting banner: {e}")
        import traceback
        traceback.print_exc()
        return None


def create_sample_banner():
    """
    Create a sample banner plan for testing
    """
    sample = {
        'name': 'INFUSE Claims Test Banner',
        'description': 'Brand comparison with demographic splits',
        'groups': [
            {
                'name': 'Brand Worn',
                'columns': [
                    {'id': 'acuvue', 'name': 'Current ACUVUE', 'equation': 'S7=2'},
                    {'id': 'bl_infuse', 'name': 'Current B&L Infuse', 'equation': 'S7=10'}
                ]
            },
            {
                'name': 'ACUVUE Subgroups',
                'columns': [
                    {'id': 'acuvue_1-9h', 'name': '1-9 hours/day, ACUVUE', 'equation': 'Q1=1-9 & S7=2'},
                    {'id': 'acuvue_10h', 'name': '10+ hours/day, ACUVUE', 'equation': 'Q1>=10 & S7=2'},
                    {'id': 'acuvue_female', 'name': 'Female, ACUVUE', 'equation': 'S1=1 & S7=2'},
                    {'id': 'acuvue_male', 'name': 'Male, ACUVUE', 'equation': 'S1=2 & S7=2'}
                ]
            },
            {
                'name': 'B&L Infuse Subgroups',
                'columns': [
                    {'id': 'infuse_1-9h', 'name': '1-9 hours/day, B&L Infuse', 'equation': 'Q1=1-9 & S7=10'},
                    {'id': 'infuse_10h', 'name': '10+ hours/day, B&L Infuse', 'equation': 'Q1>=10 & S7=10'},
                    {'id': 'infuse_female', 'name': 'Female, B&L Infuse', 'equation': 'S1=1 & S7=10'},
                    {'id': 'infuse_male', 'name': 'Male, B&L Infuse', 'equation': 'S1=2 & S7=10'}
                ]
            }
        ]
    }

    # Write sample
    output_file = Path(__file__).parent / "sample_banner_plan.json"
    with open(output_file, 'w') as f:
        json.dump(sample, f, indent=2)

    print(f"Sample banner plan created: {output_file}")
    return sample


if __name__ == "__main__":
    if len(sys.argv) == 1:
        # No arguments - create sample
        print("Creating sample banner plan...")
        create_sample_banner()
    elif len(sys.argv) == 4:
        # Export from Supabase
        project_id = sys.argv[1]
        banner_id = sys.argv[2]
        output_file = sys.argv[3]
        export_banner_to_json(project_id, banner_id, output_file)
    else:
        print("Usage:")
        print("  python export_banner_plan.py                    # Create sample")
        print("  python export_banner_plan.py <project> <banner> <output>  # Export from DB")