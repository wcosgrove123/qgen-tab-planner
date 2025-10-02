# Banner Building Process Documentation

## Overview

This document outlines the manual banner building process used by our team to transform questionnaires into structured cross-tabulation analysis plans for market research studies.

## The Banner Building Workflow

### 🔍 **Step 1: Questionnaire Analysis**

The process begins with a **QRE (Questionnaire) file** containing:

**Structure Components:**
- **Screener questions** (S1, S2, S3, etc.) - Demographics, qualifications, quotas
- **Main survey questions** (Q1, Q2, Q3, etc.) - Core research objectives
- **Question types**: Single choice, multi-choice, Likert scales, numeric, open-ended
- **Branching logic** and termination conditions

**Example from INFUSE study:**
```
S1. What is your gender?
S7. Which brand of daily disposable soft contact lenses do you currently wear?
Q1. How many hours per day do you wear your contact lenses on average?
Q3. Please state your level of agreement with the following statements...
```

### 🎯 **Step 2: Demographic Segmentation Identification**

From the questionnaire, the team manually identifies **key demographic breaks** for cross-tabulation analysis.

**INFUSE Example Segments:**
- **Brand worn** (S7): ACUVUE OASYS vs Bausch & Lomb Infuse
- **Usage hours** (Q1): 1-9 hours vs 10+ hours
- **Gender** (S1): Female vs Male

**GLP-1 Example Segments:**
- **Primary reason** (S6): Weight loss vs Diabetes
- **Gender** (S2): Male, Female, Other, Prefer not to respond
- **Age groups** (S1): Gen Z, Millennials, Gen X, Boomers, Silent Generation
- **Usage duration** (S5): <1 year vs 1+ years
- **Side effects** (S7): With vs without side effects

### 📊 **Step 3: Banner Matrix Creation**

The team manually builds a **banner matrix** in Excel with structured columns and logical definitions.

**Column Structure:**
1. **Total** - Base universe (all respondents)
2. **Primary segmentation** - Main business question splits
3. **Secondary segmentations** - Additional demographic breaks

**Example Banner Matrix (INFUSE):**
```
| Total | ACUVUE OASYS | B&L Infuse | 1-9hrs ACUVUE | 10+hrs ACUVUE | Female ACUVUE | Male ACUVUE |
|-------|--------------|------------|---------------|---------------|---------------|-------------|
|   (A) |         (B)  |       (C)  |          (D)  |          (E)  |          (F)  |        (G)  |
```

**Banner Logic Definitions:**
- `(A) Total respondents`
- `(B) S7=2` (ACUVUE OASYS users)
- `(C) S7=10` (Bausch & Lomb Infuse users)
- `(D) Q1=1-9 AND S7=2` (1-9 hours/day ACUVUE users)
- `(E) Q1=10+ AND S7=2` (10+ hours/day ACUVUE users)

### 📋 **Step 4: Tab Sheet Planning**

The team creates a **detailed tab sheet** specifying analysis requirements for each question.

**Tab Sheet Structure:**
```
| Q# | Base Verbiage | Base Definition | Nets | Additional Instructions |
|----|---------------|-----------------|------|------------------------|
| Q1 | Total Respondents | | Net: 1-5, 6-10, 11-15, 16-20, 21-24 | Provide mean, median, std dev |
| Q2 | Total Respondents | | Net: T2B, B2B | Provide mean, median, std dev |
| Q3 | Total Respondents | | Net: T2B, B2B | 1 table per statement, sort by T2B descending |
```

**Analysis Specifications by Question Type:**

**Likert Scale Questions:**
- "1 table per statement, with scale as rows"
- "Sort descending based on top-2 box"
- "Include summary tables for top-2/bottom-2 box"

**Numeric Questions:**
- "Provide mean, median, and standard deviation"
- "Net: 1-5, 6-10, 11-15, 16-20, 21-24"

**Multi-Choice Questions:**
- "One table with statements as rows"
- "Count all checking 'applies'"

**Open-Ended Questions:**
- "No coding needed. Provide verbatim file"

### 🔧 **Step 5: Manual Logic Translation**

The team manually translates **questionnaire conditions** into **SPSS logic codes**.

**Translation Examples:**
- `S7=2` → "Current ACUVUE OASYS 1-Day Lens Wearers"
- `Q1=1-9 AND S7=2` → "1-9 hours/day, Current ACUVUE OASYS 1-Day Lens Wearers"
- `S1=1 AND S7=10` → "Female, Current B&L Infuse Lens Wearers"
- `S1=18-27` → "Gen Z (18-27)"
- `S5<1` → "Less than 1 year usage"

### 📈 **Step 6: Analysis Requirements**

The team specifies **output requirements** and formatting standards.

**Statistical Requirements:**
- **Confidence level**: 90% confidence level
- **Statistical testing**: Banner-by-banner comparison testing
- **Significance indicators**: Visual markers for significant differences

**File Format Requirements:**
- **Excel outputs**: 3 files typical
  1. Frequencies and percentages with stat testing
  2. Percentages only, no stat testing
  3. Percentages (no frequencies) with stat testing
- **Formatting**: "Zero decimals with a % sign"
- **SPSS requirement**: "Need SPSS File"

**Presentation Standards:**
- **Sorting**: "Sort descending based on top-2 box"
- **Summary tables**: Separate T2B/B2B summary tables
- **Means**: Include for all numeric questions

## Key Business Insights

### 🎯 **Strategic Segmentation Approach**

**Business-Driven Segments:**
- Not just demographics - meaningful business segments
- Competitive analysis central (brand comparisons)
- Usage-based segmentation (heavy vs light users)
- Behavioral segmentation (side effects, satisfaction levels)

**Cross-Tabulation Strategy:**
- Primary business question becomes main banner split
- Secondary demographics provide deeper insights
- Complex conditional logic (multiple AND/OR conditions)

### 📊 **Analysis Sophistication**

**Statistical Rigor:**
- Multiple confidence levels
- Statistical significance testing
- Comprehensive summary statistics
- Professional formatting standards

**Question-Type Expertise:**
- Likert scales: T2B/B2B analysis with sorting
- Numeric: Complete descriptive statistics
- Multi-choice: Comprehensive option analysis
- Open-ended: Verbatim preservation

## Current Process Pain Points

### 🔄 **Manual Inefficiencies**

1. **Repetitive Logic Mapping**
   - Same demographic breaks recreated across studies
   - Manual translation of questionnaire logic to SPSS codes
   - Inconsistent naming conventions

2. **Error-Prone Processes**
   - Manual Excel formula creation
   - Copy-paste errors in logic definitions
   - Formatting inconsistencies

3. **Time-Intensive Setup**
   - Each study requires complete banner rebuild
   - Manual review of questionnaire for segment identification
   - Repetitive tab sheet creation

4. **Knowledge Dependency**
   - Process relies on analyst expertise
   - Inconsistent approaches across team members
   - Limited documentation of best practices

## Automation Opportunities

### 🤖 **Potential Improvements**

1. **Questionnaire Parsing**
   - Automatic detection of demographic questions
   - Smart identification of segmentation opportunities
   - Suggested banner structures based on question types

2. **Logic Generation**
   - Automatic SPSS code generation from questionnaire logic
   - Standardized naming conventions
   - Validation of logic conditions

3. **Template Systems**
   - Reusable banner templates for common study types
   - Industry-standard demographic breakouts
   - Question-type-specific analysis templates

4. **Quality Assurance**
   - Automated validation of banner logic
   - Consistency checking across banners and tab sheets
   - Standard formatting application

---

*This documentation serves as the foundation for understanding our current manual banner building process and identifying opportunities for automation and standardization.*