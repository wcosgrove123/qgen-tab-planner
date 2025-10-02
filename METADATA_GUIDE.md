# SPSS Metadata System Guide

## Overview

The SPSS Metadata System provides a **single source of truth** for mapping SPSS column names to human-readable labels, eliminating the need for database lookups during reporting.

## The Problem It Solves

**Before**:
- SPSS files had technical column names (S7r1, S7r2, S7r10)
- Reporting tool had to query database to find matching option labels
- If database changed after SPSS export, labels wouldn't match
- Database query failures caused silent errors

**After**:
- Metadata file travels with SPSS export
- Contains frozen snapshot of all column-to-label mappings
- Self-contained: no database needed for reporting
- Guaranteed accuracy: labels match export time

## File Structure

```json
{
  "version": "1.0",
  "generatedAt": "2025-09-30T10:30:00.000Z",
  "projectId": "ad0c9cf5-d464-40b9-9c03-8348ce7a1eac",
  "questions": {
    "S7": {
      "id": "uuid-here",
      "text": "Brand currently worn",
      "mode": "multi",
      "type": "multi",
      "options": [
        { "code": "1", "label": "Day Acuvue Moist", "orderIndex": 0 },
        { "code": "2", "label": "Acuvue Oasys 1-Day", "orderIndex": 1 },
        { "code": "10", "label": "Bausch & Lomb Infuse", "orderIndex": 9 }
      ]
    }
  },
  "columnMappings": {
    "S7r1": {
      "questionId": "S7",
      "questionText": "Brand currently worn",
      "optionCode": "1",
      "optionLabel": "Day Acuvue Moist",
      "questionMode": "multi"
    },
    "S7r2": {
      "questionId": "S7",
      "questionText": "Brand currently worn",
      "optionCode": "2",
      "optionLabel": "Acuvue Oasys 1-Day",
      "questionMode": "multi"
    },
    "S7r10": {
      "questionId": "S7",
      "questionText": "Brand currently worn",
      "optionCode": "10",
      "optionLabel": "Bausch & Lomb Infuse",
      "questionMode": "multi"
    }
  }
}
```

## Usage

### Generating Metadata (When Exporting SPSS)

```javascript
import { generateSpssMetadata, downloadMetadataFile } from '@/lib/spssMetadata.js';
import supabase from '@/lib/supa.js';

// Load questions from database
const { data: questions } = await supabase
  .from('questions')
  .select('*')
  .eq('project_id', projectId);

// Generate metadata
const metadata = await generateSpssMetadata({
  projectId,
  questions,
  supabase
});

// Download as JSON file
downloadMetadataFile(metadata, 'project_spss_metadata.json');
```

### Uploading Metadata (When Importing SPSS)

1. In the Reporting tab, upload your SPSS files (Labels CSV + Codes CSV)
2. Upload the `spss_metadata.json` file (optional but recommended)
3. Click "Process Data"

The system will:
- Validate metadata matches SPSS columns
- Use metadata for ALL label lookups
- Fall back to database only if metadata is missing

### Label Lookup Priority

```javascript
function getOptionLabel(columnName) {
  // 1. FIRST: Try metadata (guaranteed accurate)
  if (metadata.columnMappings[columnName]) {
    return metadata.columnMappings[columnName].optionLabel;
  }

  // 2. FALLBACK: Try database (legacy support)
  if (databaseOptions[questionId]) {
    return databaseOptions[questionId].find(opt => opt.code === optionCode);
  }

  // 3. LAST RESORT: Return technical name
  return columnName;
}
```

## Benefits

### ✅ Data Integrity
- Labels frozen at export time
- No sync issues between database and SPSS
- Self-contained data packages

### ✅ Reliability
- No database query failures
- Works offline
- Consistent across environments

### ✅ Performance
- No database lookups during visualization
- Instant label retrieval from memory
- Faster chart rendering

### ✅ Traceability
- `generatedAt` timestamp shows export time
- Version tracking for schema changes
- Audit trail for data lineage

## Validation

The system validates that:
- All SPSS columns in metadata exist in CSV
- All multi-select/grid columns in CSV exist in metadata
- Metadata structure is valid JSON
- Required fields are present

Warnings (non-fatal):
- Columns in SPSS but not in metadata
- Columns in metadata but not in SPSS

Errors (fatal):
- Invalid JSON format
- Missing required fields
- Schema version mismatch

## Best Practices

1. **Always generate metadata when exporting SPSS**
   - Ensures labels match data at export time
   - No guessing which database state was used

2. **Store metadata with SPSS files**
   - Same folder as Labels.csv and Codes.csv
   - Clear naming: `{project_name}_metadata.json`

3. **Include metadata in data packages**
   - When sharing SPSS files with colleagues
   - When archiving project data

4. **Don't manually edit metadata**
   - Regenerate from database if changes needed
   - Manual edits risk breaking validation

## Migration Path

For existing projects without metadata:

1. **Continue using database fallback** (current behavior)
2. **Generate metadata going forward** (new exports)
3. **Gradually migrate** (regenerate old exports with metadata)

No breaking changes - system works with or without metadata.

---

**Last updated**: 2025-09-30
**Version**: 1.0
