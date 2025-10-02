# Shiny Cross-Tab Generator - Quick Start Guide

## 🚀 How to Run

### Option 1: Double-click the batch file
```
START_CROSSTAB_APP.bat
```

### Option 2: Command line
```bash
cd shiny_app
python main_with_crosstabs.py
```

The app will open at: **http://localhost:8080**

---

## 📋 Step-by-Step Usage

### Step 1: Upload SPSS Data
- Click "**SPSS Codes CSV File**"
- Select your `Codes.csv` file (e.g., `apps/web/examples/SPSS/Codes.csv`)
- You'll see: "✅ Loaded X respondents with Y variables"

### Step 2: Load Banner Plan

#### Option A: Use Sample Banner
- Upload: `shiny_app/sample_banner_plan.json`
- This has pre-configured ACUVUE vs B&L Infuse comparisons

#### Option B: Export Your Own Banner
```bash
cd shiny_app
python export_banner_plan.py <project_id> <banner_id> my_banner.json
```

### Step 3: Configure Question Types
The app auto-detects questions (S1, S7, Q1, Q2, etc.)

For each question, select:
- **categorical**: Single/multi-select (shows frequencies)
- **numeric**: Numeric questions (shows mean, median, std dev)
- **likert**: Agreement scales (shows Top-2-Box, Bottom-2-Box)

### Step 4: Generate Cross-Tabs
- Click "**🚀 Generate Cross-Tabs**"
- Preview appears showing first 3 tables
- Click "**💾 Download CSV**" to export all results

---

## 📊 Sample Banner Plan Structure

The INFUSE sample banner includes:

### Total Column
- **TOTAL** → All respondents

### H1: Brand Worn
- **Current ACUVUE** → `S7=2`
- **Current B&L Infuse** → `S7=10`

### H1: ACUVUE Subgroups
- **1-9 hours/day** → `Q1=1-9 & S7=2`
- **10+ hours/day** → `Q1>=10 & S7=2`
- **Female** → `S1=1 & S7=2`
- **Male** → `S1=2 & S7=2`

### H1: B&L Infuse Subgroups
- **1-9 hours/day** → `Q1=1-9 & S7=10`
- **10+ hours/day** → `Q1>=10 & S7=10`
- **Female** → `S1=1 & S7=10`
- **Male** → `S1=2 & S7=10`

---

## 🔧 Equation Syntax

### Supported Operators
```python
S7=2             # Equals
Q1!=5            # Not equals
Q1>10            # Greater than
Q1>=10           # Greater than or equal
Q1<5             # Less than
Q1<=5            # Less than or equal
Q1=1-9           # Range (1 to 9 inclusive)
S7=1,2,3         # Multiple values (OR logic)
S7=2 & Q1>5      # AND logic
S1=1 | S1=2      # OR logic
```

### Complex Examples
```python
# Heavy ACUVUE female users
S7=2 & Q1>=10 & S1=1

# Light users of either brand
(S7=2 | S7=10) & Q1=1-9

# Satisfied ACUVUE users
S7=2 & Q2=1,2
```

---

## 📁 File Locations

### Input Files
- **SPSS Data**: `apps/web/examples/SPSS/Codes.csv`
- **Sample Banner**: `shiny_app/sample_banner_plan.json`

### Output Files
- **Cross-tabs CSV**: Downloads to your browser's default location
- Named: `crosstabs.csv`

---

## 💡 Pro Tips

### 1. Test with Sample Data
Use the included INFUSE example:
- **Data**: `apps/web/examples/SPSS/Codes.csv`
- **Banner**: `shiny_app/sample_banner_plan.json`

### 2. Export from Supabase
If you have banners in Supabase, export them:
```bash
python export_banner_plan.py your_project_id your_banner_id output.json
```

### 3. Question Type Selection
- **S-questions** (screeners) → Usually categorical
- **Q-questions** (main) → Check questionnaire:
  - Single/multi-select → categorical
  - Hours, age, count → numeric
  - Agreement scales → likert

### 4. Verify Results
- Check **Base** row to ensure filtering worked correctly
- Total base should equal your SPSS file respondent count
- Subgroup bases should be smaller than Total

---

## 🐛 Troubleshooting

### "Port already in use"
Another app is using port 8080. Edit `main_with_crosstabs.py`:
```python
app.run(host="0.0.0.0", port=8081)  # Change to 8081
```

### "No questions detected"
SPSS CSV must have column headers (S1, S7, Q1, etc.)

### "All bases are 0"
Check equations:
- Variable names must match SPSS columns exactly
- Use numeric codes, not text labels
- Test simple equation first: `S7=2`

### "Module not found: crosstab_engine"
Make sure you're in the `shiny_app` directory

---

## 🎯 What You Get

### CSV Export Format
```csv
Cross-Tabulation Report
Banner: INFUSE Claims Test Banner
Total Base: 100

S7: Which brand do you wear?
Type: categorical

Column,Total,Current ACUVUE,Current B&L Infuse
Equation,TOTAL,S7=2,S7=10
Base,100,50,50
Code 2 %,50.0,100.0,0.0
Code 10 %,50.0,0.0,100.0

Q1: Hours per day wearing contacts
Type: numeric

Column,Total,Current ACUVUE,Current B&L Infuse
Equation,TOTAL,S7=2,S7=10
Base,100,50,50
Mean,12.5,11.8,13.2
Median,12.0,11.5,13.0
Std Dev,3.4,3.1,3.6
```

---

## 📚 Next Steps

1. **Run the sample** to see how it works
2. **Export your own banner plans** from Supabase
3. **Upload your project's SPSS data**
4. **Generate professional cross-tabs** for reporting!

---

*Last updated: 2025-09-30*