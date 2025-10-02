# Table Instructions - Comprehensive Guide

## Overview

This document outlines the complete table system architecture for the questionnaire builder, designed to support enterprise-level market research workflows with unlimited extensibility. All tables are created through the Advanced Table Editor and support complex configurations for sophisticated data collection and analysis.

### Market Research Workflow Integration
```
Questionnaire → Tab Plan → Banner Plan → Dynata → SPSS Data + Filled Plans → Analysis → PowerPoint Reports
```

Tables must be perfectly mapped to enable:
- Accurate SPSS data integration with rich metadata
- Automated T2B/B2B net calculations based on scale type
- Drag-and-drop reporting functionality with preset recognition
- Complex conditional logic support for enterprise surveys
- Unlimited customizable data manipulation for Shiny-based reporting

---

## Complete Table Type Taxonomy

### Database Storage Strategy (3-Column System)
All tables use the simplified 3-column taxonomy:
- `question_type: "table"` (basic type - one of 7 standard types: txt, hidden, qc, list, numeric, open_end, table)
- `question_mode: "simple_table|likert|advanced_table"` (functionality level based on complexity)
- `table_type: "[complex_hybrid_code]"` (detailed classification for enterprise features)
- `table_metadata: {...}` (rich JSONB metadata for SPSS integration and automated processing)

#### Question Mode Priority (Most Complex Wins)
1. **Dynamic sourcing OR multi-matrix** → `question_mode: "advanced_table"` (most complex)
2. **Likert presets (no dynamic features)** → `question_mode: "likert"` (preset-based)
3. **Manual tables** → `question_mode: "simple_table"` (basic)

#### Preset Application Behavior
- **Likert presets**: Preserve existing rows, replace only columns
- **Other presets**: Replace both rows and columns

---

## 1. Basic Manual Tables

### Simple Tables (`simple_table`)
- **Purpose**: Basic custom rows and columns, completely manual entry
- **Configuration**: No presets used, all rows/columns manually added
- **Use Cases**: Custom grids, unique question formats, brand-specific matrices
- **SPSS Mapping**: Direct row/column mapping, no special nets
- **Tab Plan**: Basic cross-tabulation only

### Binary Tables (`simple_binary`)
- **Purpose**: Two-column decision tables
- **Configurations**: Yes/No, Applies/Doesn't Apply, Agree/Don't Agree, etc.
- **Use Cases**: Simple binary classification, screening matrices
- **SPSS Mapping**: Binary variable mapping
- **Tab Plan**: Basic cross-tabulation, no nets required

---

## 2. Likert Scale Tables (Preset-Based)

### Scale Types Available
Current: Agreement, Satisfaction, Frequency, Importance
**Planned Additions**: Likelihood, Application, Time-based Frequency, Quality, Performance, etc.

### ✅ IMPLEMENTED Likert Scale Types (Preset Library Active)

#### Agreement Scales (`likert_agreement_[3|5|7|10]`) ✅ LIVE
- **Purpose**: Agreement/disagreement measurement
- **Scale Examples**: Strongly Disagree → Strongly Agree
- **Implementation**: Full preset library integration with auto-application
- **Tab Plan**: Auto-generates T2B/B2B nets (5pt), T3B/B3B nets (7pt/10pt), no nets (3pt)
- **SPSS**: Ordinal scale with automatic net variable creation
- **Status**: Production ready with automatic summary row generation

#### Satisfaction Scales (`likert_satisfaction_[3|5|7|10]`) ✅ LIVE
- **Purpose**: Satisfaction measurement across touchpoints
- **Scale Examples**: Very Dissatisfied → Very Satisfied
- **Implementation**: Full preset library integration with auto-application
- **Tab Plan**: Auto-generates satisfaction nets based on scale points (T2B/T3B logic)
- **SPSS**: Ordinal scale optimized for satisfaction analysis
- **Status**: Production ready with automatic summary row generation

#### Frequency Scales (`likert_frequency_[3|5|7|10]`) ✅ LIVE
- **Purpose**: Frequency of behaviors, usage, occurrence
- **Scale Examples**: Never → Always, Rarely → Frequently
- **Implementation**: Full preset library integration with auto-application
- **Tab Plan**: Auto-generates frequency nets (T2B/T3B based on scale points)
- **SPSS**: Ordinal scale with frequency-specific variable labels
- **Status**: Production ready

#### Importance Scales (`likert_importance_[3|5|7|10]`) ✅ LIVE
- **Purpose**: Importance ranking and prioritization
- **Scale Examples**: Not Important → Very Important
- **Implementation**: Full preset library integration with auto-application
- **Tab Plan**: Auto-generates importance nets (T2B/T3B based on scale points)
- **SPSS**: Ordinal scale for importance analysis
- **Status**: Production ready

### Planned Likert Additions
- `likert_likelihood_[points]` - Likelihood measurement
- `likert_application_[points]` - Application/usage scales
- `likert_quality_[points]` - Quality assessment scales
- `likert_performance_[points]` - Performance evaluation
- `likert_time_frequency_[points]` - Time-based frequency variations
- Additional custom scale types as survey complexity increases

---

## 3. ✅ IMPLEMENTED Single-Source Dynamic Tables

### Column Sourcing
#### All Options (`dynamic_cols_all`) ✅ MIGRATED
- **Configuration**: Columns populated with ALL options from specified previous question
- **Use Case**: "Rate each brand mentioned in Q1"
- **Source Types**: Single/multi-select list questions
- **SPSS Mapping**: Links to source question variable set
- **Migration Status**: Existing questions automatically classified and enhanced

#### Selected Only (`dynamic_cols_selected`) ✅ MIGRATED
- **Configuration**: Columns populated ONLY with respondent's previous selections
- **Use Case**: "Rate only the brands you selected in Q1"
- **Logic**: Filters source options based on respondent answers
- **SPSS Mapping**: Conditional variable mapping based on response history
- **Migration Status**: Q2, Q3 successfully migrated with proper metadata

### Row Sourcing
#### All Options (`dynamic_rows_all`) ✅ MIGRATED
- **Configuration**: Rows populated with ALL options from specified previous question
- **Use Case**: "For each symptom, rate severity"
- **Source Types**: Single/multi-select list questions
- **Migration Status**: Existing questions automatically classified

#### Selected Only (`dynamic_rows_selected`) ✅ MIGRATED
- **Configuration**: Rows populated ONLY with respondent's previous selections
- **Use Case**: "For symptoms you experienced, rate severity"
- **Logic**: Filters source options based on respondent answers
- **Migration Status**: Q10, Q1a successfully migrated with proper table_type classification

---

## 4. Multi-Matrix Tables (Dual-Source)

### Configuration Matrix
Users can create these either via:
1. **Direct Selection**: "Multi-Select Matrix" preset
2. **Preset Hacking**: Apply column source → apply row source

#### All × All (`multimatrix_all_all`)
- **Rows**: All options from Source Question A
- **Columns**: All options from Source Question B
- **Use Case**: "Rate each brand (Q1) on each attribute (Q2)"

#### All × Selected (`multimatrix_all_selected`)
- **Rows**: All options from Source Question A
- **Columns**: Only selected options from Source Question B
- **Use Case**: "Rate each brand on attributes you consider important"

#### Selected × All (`multimatrix_selected_all`)
- **Rows**: Only selected options from Source Question A
- **Columns**: All options from Source Question B
- **Use Case**: "Rate brands you're familiar with on all attributes"

#### Selected × Selected (`multimatrix_selected_selected`)
- **Rows**: Only selected options from Source Question A
- **Columns**: Only selected options from Source Question B
- **Use Case**: "Rate familiar brands on important attributes"

---

## 5. Hybrid Tables (Source + Preset Combinations)

### Row-Sourced + Column-Preset
#### All Options + Likert (`hybrid_rows_all_likert_[type]_[points]`)
- **Rows**: All options from previous question
- **Columns**: Likert scale preset (Agreement, Satisfaction, etc.)
- **Use Case**: "Rate agreement with each statement from Q1"

#### Selected Options + Likert (`hybrid_rows_selected_likert_[type]_[points]`)
- **Rows**: Only respondent's previous selections
- **Columns**: Likert scale preset
- **Use Case**: "Rate satisfaction with services you've used"

#### Sourced Rows + Manual Columns (`hybrid_rows_[all|selected]_simple`)
- **Rows**: From previous question (all or selected)
- **Columns**: Manually configured custom columns
- **Use Case**: Unique hybrid configurations not covered by presets

### Future: Column-Sourced + Row-Preset
*Planned for Phase 2 when additional preset types are developed*

---

## 6. Future: Conditional Tables (Enterprise Level)

### Conditional Logic Integration
**Table Type**: `conditional_[base_type]`
- Any above table type enhanced with conditional row/column display
- Row/column settings modals with terminate, exclusive, anchor options
- Show/hide conditions based on previous responses
- Dynamic labeling based on response history

### Examples
- `conditional_likert_satisfaction_5` - Satisfaction scale with conditional rows
- `conditional_multimatrix_all_all` - Multi-matrix with conditional display logic
- `conditional_hybrid_rows_all_simple` - Hybrid table with response-based customization

---

## Database Schema Design

### Recommended Structure (3-Column System)
```javascript
{
  id: "Q2",
  question_type: "table",                    // Basic type (always "table" for tables)
  question_mode: "likert",                   // Functionality level
  table_type: "likert_satisfaction_5",       // Complex hybrid code
  table_metadata: {
    base_type: "likert",
    likert_subtype: "satisfaction",
    scale_points: 5,
    auto_nets: ["T2B", "B2B"],
    spss_variable_type: "ordinal",
    source_config: {
      rows: { mode: "manual" },
      columns: { mode: "preset", preset_id: "satisfaction_5pt" }
    }
  },
  advancedTable: {
    rows: ["Statement 1", "Statement 2"],
    cols: ["Very Dissatisfied", "Dissatisfied", "Neither", "Satisfied", "Very Satisfied"]
  }
}

// Example: Dynamic Table with Likert Columns (Advanced Mode)
{
  id: "Q3",
  question_type: "table",                    // Basic type
  question_mode: "advanced_table",           // Dynamic features = advanced
  table_type: "hybrid_rows_selected_likert_agreement_5", // Complex hybrid
  // ... metadata and advancedTable data
}
```

### Benefits for SPSS + Shiny Integration
- **Automatic variable type detection** for SPSS import
- **Preset recognition** for automated chart selection in Shiny
- **Net auto-generation** without manual configuration
- **Rich metadata** for drag-and-drop reporting functionality
- **Source question linking** for complex table relationships
- **Future-proof extensibility** for new table types

---

## 🎯 Current Implementation Status (January 2025)

### ✅ COMPLETED Features (Updated January 2025)
- **3-Column Taxonomy System**: `question_type`, `question_mode`, `table_type` columns fully implemented
- **Database Constraints Removed**: Full flexibility for development and new table types
- **Complete Data Migration**: All existing advanced table questions successfully migrated with proper 3-column classification
- **Preset Library Integration**: All Likert scale presets (Agreement, Satisfaction, Frequency, Importance) with row preservation
- **Smart Mode Detection**: Automatic `question_mode` assignment based on complexity hierarchy
- **Preset Row Preservation**: Likert presets preserve user-entered rows, replace only columns
- **Automatic Net Generation**: T2B/B2B (5pt), T3B/B3B (7pt/10pt), no nets (3pt) logic implemented
- **Tab Plan Enhancement**: Advanced table Likert detection with automatic summary row generation
- **Rich Metadata Storage**: Full SPSS integration metadata with source configuration tracking
- **Load/Save Mapping**: Proper conversion between database fields and UI modes

### ✅ Working Production Features
- **3-Column System**: Seamless taxonomy with proper hierarchy (simple_table → likert → advanced_table)
- **Preset Dropdown**: Professional UI with Quick Options and Rating Scales sections
- **Row Preservation**: Likert presets intelligently preserve user-entered rows
- **Auto-Configure Nets**: Automatic T2B/T3B net generation based on scale points
- **Tab Plan Summary Rows**: TB, T2B/T3B, B2B/B3B, BB, Mean automatic generation
- **Dynamic Table Support**: Full classification and metadata for sourced tables
- **Smart Mode Detection**: Automatic priority-based mode assignment
- **Flexible Data Storage**: No constraints blocking new table type development
- **Backward Compatibility**: Legacy questions seamlessly work with new 3-column system

### 🔄 Next Phase Opportunities
- Additional Likert scale types (Likelihood, Quality, Performance)
- Multi-matrix table preset library expansion
- Conditional logic integration with table types
- Enhanced SPSS export with rich metadata utilization

---

## Development Implementation Notes

### Preset Application Enhancement
When any preset is applied:
1. Set appropriate `table_type` classification
2. Store rich metadata for downstream processing
3. Configure automatic net generation rules
4. Establish SPSS variable mapping information

### Combination Tracking
When "preset hacking" multi-matrix tables:
1. Track both source configurations
2. Generate compound `table_type` identifier
3. Preserve individual preset metadata
4. Enable complex SPSS relationship mapping

### Extensibility Framework
New table types can be added by:
1. Defining new `table_type` identifier
2. Creating preset configuration object
3. Adding SPSS mapping rules
4. Implementing tab plan generation logic
5. Adding Shiny reporting integration

---

*This document serves as the definitive guide for table type classification and will be continuously updated as new survey requirements and table types are identified.*