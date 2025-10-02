# SPSS Reporting Dashboard - Shiny for Python

Professional market research visualization and cross-tabulation tool with interactive data manipulation.

## Features

### 🎨 Modern, Professional UI
- Matches Cue Insights design system
- Clean, emoji-free interface
- Three-panel layout (Questions | Chart Canvas | Cross-tabulation)
- Responsive design with smooth transitions

### 📊 Interactive Charts
- **Auto-detection** of question types (Likert, numeric, single, multi-select)
- **Complete scale display** - Shows all Likert scale points (including 0 responses)
- **Multiple chart types**: Bar, Horizontal Bar, Stacked Bar, Pie
- **Customizable**: Titles, colors, labels
- **Export**: PNG, CSV, Excel

### 🎯 Cross-Tabulation
- Load banner plans from Supabase
- Filter data by banner equations (e.g., S7=2, Q1>5)
- Real-time data filtering
- Export cross-tabs to Excel

### 🔧 Data Manipulation
- Upload SPSS CSV files (Labels and Codes)
- Filter questions by section (All, Screener, Main)
- Interactive question selection
- Live data statistics

## Installation

### 1. Install Python Dependencies

```bash
cd shiny_app
pip install -r requirements.txt
```

### 2. Configure Supabase (Optional)

If using banner plans from Supabase, ensure your `.env` file exists with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## Running the App

### Option 1: Double-click the Batch File (Windows)

```
START_REPORTING_APP.bat
```

### Option 2: Command Line

```bash
cd shiny_app
python -m shiny run app.py --host 0.0.0.0 --port 8000 --reload
```

Then open your browser to: **http://localhost:8000**

## Usage Guide

### Step 1: Upload SPSS Data

1. Click **"Labels CSV"** and upload your SPSS labels file
2. (Optional) Upload **"Codes CSV"** for numeric data
3. Wait for "Loaded: X responses, Y columns" confirmation

### Step 2: Select a Question

1. Use filter buttons to show All, Screener, or Main questions
2. Click any question card to generate a chart
3. Chart appears instantly in the center panel

### Step 3: Customize Chart

**Chart Type:**
- Auto-detect (recommended)
- Bar Chart
- Horizontal Bar
- Stacked Bar
- Pie Chart

**Options:**
- ✓ Show Values
- ✓ Show Percentages
- ✓ Show Legend
- Custom chart title

### Step 4: Apply Cross-Tabulation (Optional)

1. Enter your **Project ID** (UUID from project URL)
2. Click **"Load from Supabase"**
3. Select a banner column to filter data
4. Chart updates to show filtered results

### Step 5: Export

**Export Chart (PNG)** - High-resolution image (1200x800)
**Export Data (CSV)** - Raw data in CSV format
**Export Excel** - Professional formatted Excel report
**Export Cross-Tab** - Full cross-tabulation report

## Chart Types & Auto-Detection

### Likert Scales
**Auto-detected patterns:**
- Agreement: "Strongly agree" → "Strongly disagree"
- Satisfaction: "Extremely satisfied" → "Extremely dissatisfied"
- Likelihood: "Definitely would" → "Definitely would not"
- Intensity: "Extremely" → "Not at all"

**Features:**
- ✅ Shows ALL scale points (even if 0 responses)
- ✅ Color-coded (Green=positive, Yellow=neutral, Red=negative)
- ✅ Proper ordering from positive to negative
- ✅ Stacked bar visualization option

### Numeric Questions
- Mean, Median, Count statistics
- Histogram visualization
- Range display

### Single-Choice Questions
- Bar chart with percentages
- Pie chart option
- Response count display

### Multi-Select Questions
- Horizontal bar chart
- Base = total respondents
- Shows "% selected" for each option

## Banner Plan Format

Banner plans loaded from Supabase should follow this structure:

```json
{
  "banner_groups": [
    {
      "name": "Brand worn",
      "banner_columns": [
        {
          "name": "Current ACUVUE OASYS 1-Day",
          "logic_equation": "S7=2"
        },
        {
          "name": "10+ hours/day, ACUVUE users",
          "logic_equation": "S7=2 AND Q1>=10"
        }
      ]
    }
  ]
}
```

### Supported Equation Operators

- `=` - Equals (e.g., `S7=2`)
- `!=` - Not equals
- `>` - Greater than (e.g., `Q1>5`)
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `AND` - Logical AND
- `OR` - Logical OR

### Example Equations

```
S7=2                           # Single condition
Q1>5                           # Numeric comparison
S7=2 AND Q1>=10               # Multiple conditions
S1=3 OR S1=4                  # OR logic
```

## File Structure

```
shiny_app/
├── app.py                     # Main Shiny app (NEW!)
├── main_with_crosstabs.py     # Legacy app
├── crosstab_engine.py         # Cross-tabulation logic
├── banner_csv_parser.py       # Banner CSV parsing
├── supabase_connector.py      # Supabase integration
├── excel_formatter.py         # Excel export
├── requirements.txt           # Python dependencies
├── START_REPORTING_APP.bat    # Windows launcher
└── SHINY_APP_GUIDE.md         # This file
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'shiny'"

```bash
pip install -r requirements.txt
```

### Charts not showing Likert scale points

✅ **Fixed!** The new app shows ALL scale points, even if 0 responses.

### Banner plan not loading

1. Check Project ID is correct UUID
2. Verify Supabase credentials in `.env`
3. Check console for error messages

### Image export fails

```bash
pip install kaleido
```

## Performance Tips

1. **Large datasets**: Filter questions before charting
2. **Slow loading**: Use codes CSV only if needed
3. **Memory usage**: Close unused browser tabs
4. **Refresh**: Use `--reload` flag during development

## Development

### Auto-reload on file changes

```bash
python -m shiny run app.py --reload
```

### Debug mode

```python
# In app.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Custom styling

Modify the `css` variable in `app.py` to match your brand colors:

```python
css = """
:root {
  --cue-primary: #YOUR_COLOR;
  --cue-gold: #YOUR_COLOR;
}
"""
```

## Integration with Web App

The Shiny app can run alongside your web application:

- **Web App**: http://localhost:3000 (questionnaire builder, banner builder)
- **Shiny App**: http://localhost:8000 (reporting & cross-tabs)

Both apps share the same Supabase database and can access the same banner plans.

## Next Steps

### Planned Features

- [ ] PowerPoint export with branded templates
- [ ] Statistical significance testing
- [ ] Advanced filtering (multiple banners)
- [ ] Data validation rules
- [ ] Automated report scheduling
- [ ] Custom color themes
- [ ] Table/grid question support
- [ ] Open-ended text analysis

### Contributing

To add new features, modify `app.py` and test with:

```bash
python -m shiny run app.py --reload
```

---

**Questions or Issues?**

Check the main project README or create an issue on GitHub.
