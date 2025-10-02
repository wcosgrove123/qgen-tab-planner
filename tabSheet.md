# Tab Sheet Planning System

## Overview

The Tab Sheet is the **blueprint for organizing raw survey data** that defines how we want field partners (like Dynata) to structure and deliver results back to us. It specifies the exact tables, nets, and data organization needed for analysis and reporting.

## Key Concepts

### What is a Tab Plan?
A tab plan is a structured document that tells field partners:
- **Which questions to cross-tabulate**
- **How to group response codes** (nets)
- **What summary statistics to calculate**
- **How to format the output tables**

### Why Tab Plans Matter
1. **Data Blueprint**: Define exactly how raw responses should be organized
2. **Analysis Ready**: Ensure data comes back in the format needed for reports
3. **Consistency**: Standardize data delivery across different field partners
4. **Efficiency**: Avoid post-processing and data manipulation

---

## Likert Scale Tab Plan Rules

### Single Statement Likert (Simple)
For questions with **one statement** and a Likert scale:

```
Example: "How satisfied are you with our service?"
Scale: Very Dissatisfied → Very Satisfied (5-point)

Tab Plan Output:
- Base table with individual scale points
- Net: T2B (Top 2 Box) = Satisfied + Very Satisfied
- Net: B2B (Bottom 2 Box) = Very Dissatisfied + Dissatisfied
```

**Result**: One table + standard T2B/B2B nets only.

### Multi-Statement Likert (Complex)
For questions with **multiple statements** using the same Likert scale:

```
Example: "Please rate your agreement with the following statements about Product X:"
Statements:
1. "Product X is high quality"
2. "Product X is worth the price"
3. "Product X meets my needs"
4. "I would recommend Product X"

Scale: Strongly Disagree → Strongly Agree (5-point)
```

**Tab Plan Requirements**:
1. **Individual Statement Tables**: One table per statement showing full scale breakdown
2. **T2B Summary Table**: All statements with Top 2 Box percentages only
3. **B2B Summary Table**: All statements with Bottom 2 Box percentages only
4. **Mean Score Table**: Average scores for all statements (optional)
5. **Significance Testing**: Statement-to-statement comparisons (optional)

**Why Multiple Tables?**
- **Granular Analysis**: Full scale data for each statement
- **Executive Summary**: Quick T2B/B2B comparison across statements
- **Trend Analysis**: Track performance of specific claims over time
- **Statistical Rigor**: Enable proper significance testing

---

## Advanced Table Configurations

### Basic Matrix Questions
Standard grid questions with predefined rows/columns:
```javascript
question.grid = {
    rows: ['Statement 1', 'Statement 2', 'Statement 3'],
    cols: ['Strongly Disagree', 'Disagree', 'Neither', 'Agree', 'Strongly Agree']
}
```
**Output**: Single cross-tab table + standard nets

### Dynamic Matrix Questions
Matrix questions sourced from other questions:
```javascript
question.advancedTable = {
    rowSource: { qid: 'Q1', mode: 'selected' },
    cols: ['Strongly Disagree', 'Disagree', 'Neither', 'Agree', 'Strongly Agree'],
    tableVariation: 'Dynamic Selected Rows'
}
```
**Output**:
- One table per selected item from Q1
- Summary tables for T2B/B2B across all items
- Additional sourcing documentation

### Likert Agreement Scales (Preset)
When using likert_agreement presets in advanced table editor:
```javascript
question.advancedTable = {
    rows: ['Quality statement', 'Value statement', 'Satisfaction statement'],
    cols: ['Strongly Disagree', 'Disagree', 'Neither', 'Agree', 'Strongly Agree'],
    tableVariation: 'Agreement Scale'
}
```
**Expected Output**:
- Individual tables for each statement (3 tables)
- T2B summary table (all statements, agree + strongly agree only)
- B2B summary table (all statements, disagree + strongly disagree only)

---

## Current System Issues

### Problem: Missing T2B/B2B Detection
**Issue**: `getAllQuestionOptions()` returns empty array for advanced table questions created via presets.

**Root Cause**: Disconnect between storage formats:
- UI stores in `question.advancedTable.cols`
- Database stores in `question.advanced_table_config`
- Netting detection looks for `question.grid.cols`

**Symptoms**:
- ✅ Works: List questions with options → T2B/B2B detected
- ❌ Fails: Advanced table preset questions → No T2B/B2B detected
- ❌ Fails: Likert agreement scales built via preset → No nets generated

### Data Mapping Issues
1. **Frontend-Backend Mismatch**: `advancedTable` vs `advanced_table_config`
2. **Inconsistent Option Retrieval**: `getAllQuestionOptions()` doesn't check all data sources
3. **Mode Translation**: UI mode `advanced_table` → DB mode `likert_agreement` loses context

---

## Recommended Data Structure

### Unified Storage Approach
Store all table configuration in a single, consistent format:

```javascript
// Unified table configuration
question.tableConfig = {
    // Table structure
    rows: ['Statement 1', 'Statement 2'],
    cols: ['Strongly Disagree', 'Disagree', 'Neither', 'Agree', 'Strongly Agree'],

    // Source configuration (if dynamic)
    rowSource: { qid: 'Q1', mode: 'selected', exclude: 'opt1,opt2' },
    columnSource: { qid: 'Q2', mode: 'all' },

    // Table type and variation
    tableType: 'matrix',
    variation: 'likert_agreement',

    // Tab plan configuration
    tabPlan: {
        individualTables: true,  // Generate one table per row
        summaryTables: ['t2b', 'b2b', 'mean'],  // Summary table types
        netDefinitions: {
            t2b: { codes: ['4', '5'], label: 'Top 2 Box' },
            b2b: { codes: ['1', '2'], label: 'Bottom 2 Box' }
        }
    }
}
```

### Enhanced Option Detection
Update `getAllQuestionOptions()` to check all possible sources:

```javascript
export function getAllQuestionOptions(q) {
    // 1. Standard options (single/multi)
    if (q.options?.length) return mapOptions(q.options);

    // 2. Grid columns (regular tables)
    if (q.grid?.cols?.length) return mapColumns(q.grid.cols);

    // 3. Advanced table columns (UI format)
    if (q.advancedTable?.cols?.length) return mapColumns(q.advancedTable.cols);

    // 4. Advanced table config (DB format)
    if (q.advanced_table_config?.cols?.length) return mapColumns(q.advanced_table_config.cols);

    // 5. Table config (unified format)
    if (q.tableConfig?.cols?.length) return mapColumns(q.tableConfig.cols);

    // 6. Scale labels (existing likert)
    if (q.scale?.labels?.length) return mapLabels(q.scale.labels);

    return [];
}
```

---

## Implementation Roadmap

### Phase 1: Fix Current Issues ⚡ IMMEDIATE
1. **Update getAllQuestionOptions()** to check `question.advancedTable.cols`
2. **Fix preset storage** to ensure cols are properly saved to database
3. **Test T2B/B2B detection** for likert_agreement preset questions

### Phase 2: Enhanced Tab Planning 📋 SHORT-TERM
1. **Multi-table generation** for complex matrix questions
2. **Statement-level tab plans** with individual + summary tables
3. **Dynamic sourcing documentation** in tab sheets

### Phase 3: Unified Architecture 🏗️ LONG-TERM
1. **Single tableConfig structure** replacing grid/advancedTable split
2. **Automatic tab plan generation** based on question type
3. **Field partner API integration** for direct tab plan delivery

---

## Tab Plan Output Examples

### Example 1: Simple Likert Question
```
Question: How satisfied are you with our service?
Scale: Very Dissatisfied, Dissatisfied, Neither, Satisfied, Very Satisfied

TAB PLAN OUTPUT:
Table 1: Service Satisfaction (Base: All Respondents)
- Individual scale breakdown
- Net: T2B (Satisfied + Very Satisfied)
- Net: B2B (Very Dissatisfied + Dissatisfied)
```

### Example 2: Multi-Statement Agreement Scale
```
Question: Please rate your agreement with the following statements:
S1: "The product is high quality"
S2: "The product is worth the price"
S3: "I would recommend this product"
Scale: Strongly Disagree → Strongly Agree (5-point)

TAB PLAN OUTPUT:
Table 1: Product Quality Agreement (Base: All Respondents)
- S1 scale breakdown + T2B/B2B nets

Table 2: Product Value Agreement (Base: All Respondents)
- S2 scale breakdown + T2B/B2B nets

Table 3: Product Recommendation Agreement (Base: All Respondents)
- S3 scale breakdown + T2B/B2B nets

Table 4: Agreement Summary - Top 2 Box (Base: All Respondents)
- S1: XX% (Agree + Strongly Agree)
- S2: XX% (Agree + Strongly Agree)
- S3: XX% (Agree + Strongly Agree)

Table 5: Agreement Summary - Bottom 2 Box (Base: All Respondents)
- S1: XX% (Disagree + Strongly Disagree)
- S2: XX% (Disagree + Strongly Disagree)
- S3: XX% (Disagree + Strongly Disagree)
```

This multi-table approach allows field partners to deliver data in exactly the format needed for sophisticated market research analysis, executive reporting, and statistical testing.

---

*Last updated: 2025-09-26*
*This documentation should be referenced when implementing any tab plan or netting functionality.*