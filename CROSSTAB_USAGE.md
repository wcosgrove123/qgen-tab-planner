# Cross-Tabulation Generator - Usage Guide

## Overview

The **Cross-Tab Generator** turns your tab banner plans into actual data tables using SPSS response data. It's the bridge between your blueprint (banner plan) and your analytics (cross-tab tables).

## What It Does

```
Tab Banner Plan + SPSS Data → Cross-Tabulation Tables
     (Blueprint)      (Responses)        (Analytics)
```

### Input
1. **Banner Plan**: Your H1/H2 banner structure with equations (e.g., `S7=2`, `Q1>5`)
2. **SPSS Data**: Your `Codes.csv` file with numeric responses

### Output
- **Cross-tab tables** where:
  - Each **row** = a question from your tab plan
  - Each **column** = a banner subgroup (Total + all H2 categories)
  - Each **cell** = calculated statistics (frequencies, percentages, means, T2B/B2B)

---

## How to Use

### Step 1: Create a Banner Plan

Before using the cross-tab generator, you need a banner plan:

1. Navigate to **Pre-Field** → **Banner Management**
2. Create a new banner definition
3. Add **H1 categories** (main groupings like "Brand Worn")
4. Add **H2 columns** with equations:
   - `S7=2` → "ACUVUE OASYS 1-Day Lens Wearers"
   - `S7=10` → "Bausch & Lomb Infuse Lens Wearers"
   - `Q1=1-9 & S7=2` → "1-9 hours/day, ACUVUE wearers"
   - `S1=1 & S7=2` → "Female, ACUVUE wearers"

**Example Banner Plan:**
```
Banner 1 - INFUSE Claims Test
├── Total (TOTAL)
├── H1: Brand Worn
│   ├── Current ACUVUE (S7=2)
│   └── Current B&L Infuse (S7=10)
├── H1: ACUVUE Subgroups
│   ├── 1-9 hours/day (Q1=1-9 & S7=2)
│   ├── 10+ hours/day (Q1>=10 & S7=2)
│   ├── Female (S1=1 & S7=2)
│   └── Male (S1=2 & S7=2)
└── H1: B&L Infuse Subgroups
    ├── 1-9 hours/day (Q1=1-9 & S7=10)
    ├── 10+ hours/day (Q1>=10 & S7=10)
    ├── Female (S1=1 & S7=10)
    └── Male (S1=2 & S7=10)
```

### Step 2: Navigate to Cross-Tab Generator

1. Open your project
2. Click the **hamburger menu** (☰) in the top-left
3. Under **Tools**, select **Cross-Tabs**

### Step 3: Select Banner Plan

Choose the banner plan you created from the dropdown. The system will show:
- ✓ Banner name
- Number of H1 categories
- Number of H2 columns

### Step 4: Upload SPSS Data

1. Click **"Choose File"**
2. Select your SPSS `Codes.csv` file
3. The system will automatically:
   - Parse the CSV
   - Show total respondents
   - Detect question variables (S1, S7, Q1, Q2, etc.)
   - Auto-populate the tab plan

### Step 5: Configure Questions

For each detected question, specify its type:
- **Categorical**: Single/multi-select questions (shows frequency distribution)
- **Numeric**: Numeric questions (shows mean, median, std dev)
- **Likert**: Likert scale questions (shows Top-2-Box, Bottom-2-Box)

### Step 6: Generate Cross-Tabs

1. Click **"🚀 Generate Cross-Tabs"**
2. The system will:
   - Evaluate each banner equation against the SPSS data
   - Filter respondents for each subgroup
   - Calculate statistics for each question × banner column
   - Build complete cross-tab tables

### Step 7: Preview & Export

- **Preview**: See the first 3 tables inline
- **Export**: Click **"💾 Export to CSV"** to download all tables

---

## Equation Syntax

### Basic Comparisons
```javascript
S7=2              // Gender equals 2
Q1>5              // Hours > 5
Q1>=10            // Hours >= 10
Q1<15             // Hours < 15
Q1!=2             // Hours not equal to 2
```

### Ranges
```javascript
Q1=1-9            // Hours between 1 and 9 (inclusive)
S3=18-29          // Age range 18-29
```

### Multiple Values
```javascript
S2=1,2,3          // Response is 1 OR 2 OR 3
S7=2,10           // Brand is 2 OR 10
```

### Compound Conditions
```javascript
S7=2 & Q1>5       // ACUVUE wearers AND hours > 5
S1=1 | S1=2       // Female OR Male
S7=2 & (Q1=1-9 | Q1>15)  // ACUVUE wearers AND (1-9 hours OR 15+ hours)
```

---

## Output Format

### Categorical Questions
```csv
Question: S7 - Which contact lens brand do you wear?

Column           | Total | ACUVUE | B&L Infuse | Female ACUVUE
Equation         | TOTAL | S7=2   | S7=10      | S1=1 & S7=2
Base             | 100   | 50     | 50         | 28
Code 1 %         | 15.0  | 30.0   | 0.0        | 32.1
Code 2 %         | 50.0  | 100.0  | 0.0        | 100.0
Code 10 %        | 35.0  | 0.0    | 100.0      | 0.0
```

### Numeric Questions
```csv
Question: Q1 - Hours per day wearing contacts

Column           | Total | ACUVUE | B&L Infuse
Equation         | TOTAL | S7=2   | S7=10
Base             | 100   | 50     | 50
Mean             | 12.5  | 11.8   | 13.2
Median           | 12.0  | 11.5   | 13.0
Std Dev          | 3.4   | 3.1    | 3.6
```

### Likert Questions
```csv
Question: Q2 - Overall satisfaction

Column           | Total | ACUVUE | B&L Infuse
Equation         | TOTAL | S7=2   | S7=10
Base             | 100   | 50     | 50
Top Box %        | 68.0  | 64.0   | 72.0
Bottom Box %     | 8.0   | 10.0   | 6.0
```

---

## Professional Workflow

### Market Research Use Case

1. **Build Questionnaire** → Pre-Field tab
2. **Define Banner Plan** → Banner Management
3. **Field Survey** → Send to Dynata/field partner
4. **Receive SPSS Data** → Download from field partner
5. **Generate Cross-Tabs** → Cross-Tabs tool
6. **Export to Excel** → Share with team
7. **Build Report** → Use data for PowerPoint charts

### Example: Contact Lens Study

**Research Question**: How do ACUVUE and B&L Infuse wearers differ in satisfaction?

**Banner Plan**:
- Total respondents
- ACUVUE wearers (`S7=2`)
- B&L Infuse wearers (`S7=10`)
- Heavy users (10+ hours, split by brand)
- Gender splits (split by brand)

**Cross-Tab Output**:
```
Table 1: Overall Satisfaction (Q2)
Table 2: Agreement Statements (Q3r1-Q3r7)
Table 3: Top 2 Box Summary
Table 4: Purchase Intent (Q8)
...
```

**Insights**:
- B&L Infuse shows 8% higher Top-2-Box satisfaction
- Heavy users (10+ hours) show higher satisfaction across both brands
- Female ACUVUE wearers have different preferences than males

---

## Technical Details

### Data Processing
1. **Equation Parser**: Tokenizes and evaluates boolean logic
2. **Data Filter**: Applies equations to create subgroup datasets
3. **Statistics Engine**: Calculates frequencies, percentages, means, T2B/B2B
4. **Table Builder**: Generates one table per question × all banner columns

### Performance
- Handles datasets up to 10,000+ respondents
- Processes 50+ questions in seconds
- Supports complex multi-condition equations

### File Requirements
- **SPSS Codes CSV**: Must have column headers (question IDs)
- **Encoding**: UTF-8 with BOM
- **Format**: Numeric codes (1, 2, 3, etc.)

---

## Troubleshooting

### "No banner plans found"
→ Create a banner plan first in Pre-Field → Banner Management

### "Equation evaluation failed"
→ Check equation syntax. Common issues:
- Missing variable in SPSS data
- Invalid operator (use `&` not `AND`)
- Unmatched parentheses in compound conditions

### "Base is 0 for all columns"
→ Check that:
- SPSS variable names match equation variables
- Data has valid numeric codes (not text labels)
- Equations are correctly filtering data

### "Export is empty"
→ Ensure you clicked "Generate Cross-Tabs" before exporting

---

## Future Enhancements

- [ ] Statistical significance testing (chi-square, t-tests)
- [ ] Excel export with formatting and charts
- [ ] Multi-banner comparison view
- [ ] Automatic net generation (T2B/B2B detection)
- [ ] Custom label mapping (codes → text labels)
- [ ] Batch processing multiple SPSS files

---

## See Also

- **Tab Sheet Planning**: `tabSheet.md`
- **Banner Instructions**: `banners.md`
- **Table Instructions**: `tableInstructions.md`

---

*Last updated: 2025-09-30*
*For questions or issues, check the GitHub repo issues page.*