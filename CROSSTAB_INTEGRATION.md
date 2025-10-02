# Cross-Tab Supabase Integration

## Overview

The cross-tabulation feature now automatically fetches banner plans directly from your Supabase database. No more manual CSV uploads for banner plans!

## Architecture

```
Web UI (Vite) → API Server (Express) → Supabase Database
     ↓                                        ↓
     └─────────→ Shiny App ←─────────────────┘
```

### Servers Running

1. **Web App**: `http://localhost:5173` (Vite dev server)
2. **API Server**: `http://localhost:5174` (Express server)
3. **Shiny Cross-Tabs**: `http://localhost:8888` (Python Shiny app)

## How to Use

### 1. Start All Servers

```bash
start-app.bat
```

This launches:
- API server (background)
- Shiny app (background)
- Web app (foreground)

### 2. Create Banner Plans in Web UI

1. Open project in web app
2. Go to Banner Builder
3. Create your H1 categories and H2 columns with logic equations
4. Banner plans are automatically saved to Supabase

### 3. Generate Cross-Tabs

1. Click **Tools → Cross-Tabs** in navigation
2. Click **Launch Cross-Tab Generator**
3. In Shiny app:
   - **Step 1**: Upload your SPSS Codes CSV file
   - **Step 2**: Enter your **Project ID** (UUID from project URL)
   - Click **🔄 Fetch from Database**
   - Banner plans automatically load with all H1/H2 structure
   - **Step 3**: Configure question types (auto-detected from database)
   - **Step 4**: Click **🚀 Generate Cross-Tabs**
   - Download CSV with all tables

### 4. Project ID Location

Your project ID is in the URL:
```
http://localhost:5173/#/project/[PROJECT-ID]/editor
                                 ↑ Copy this UUID
```

Example: `123e4567-e89b-12d3-a456-426614174000`

## Data Flow

### Banner Plans from Supabase

**Database Tables:**
- `banner_definitions` - Project-level banner configurations
- `banner_groups` - H1 categories (main demographic groups)
- `banner_columns` - H2 columns (subgroups with logic equations)

**API Endpoints:**
- `GET /api/projects/:projectId/banners` - Fetch all banner plans
- `GET /api/projects/:projectId/questions` - Fetch questions with auto-types

**Returned Format:**
```json
{
  "id": "banner-uuid",
  "name": "Demographics Banner",
  "groups": [
    {
      "name": "Gender",
      "columns": [
        {
          "id": "col-uuid",
          "name": "Male",
          "equation": "S7=1"
        },
        {
          "id": "col-uuid",
          "name": "Female",
          "equation": "S7=2"
        }
      ]
    }
  ]
}
```

### Question Type Auto-Detection

Questions are automatically classified based on `question_mode`:
- **categorical**: `single`, `multi`, `dropdown`, `radio`
- **numeric**: `numeric_simple`, `numeric_dropdown`
- **likert**: `likert`, `grid_single`, `grid_multi`

## Files Modified

### API Layer
- `apps/web/api-server.js` - Express server on port 5174
- `apps/web/src/api/crosstabs.js` - Supabase query functions
- `apps/web/src/lib/supa-node.js` - Node.js-compatible Supabase client

### Shiny App
- `shiny_app/main_with_crosstabs.py` - Enhanced UI with database fetching
- `shiny_app/supabase_connector.py` - Python API client

### Startup
- `start-app.bat` - Updated to launch all three servers

## Benefits

✅ **No manual exports** - Banner plans sync automatically
✅ **Always up-to-date** - Changes in UI immediately available
✅ **Type safety** - Questions auto-typed based on database schema
✅ **Fallback support** - CSV upload still available if API is down

## Troubleshooting

### API Server Not Connected

If you see "⚠️ API server not running":
1. Check that `start-app.bat` was used to launch
2. Manually start: `cd apps\web && node api-server.js`
3. Check health: `curl http://localhost:5174/api/health`

### No Banner Plans Found

1. Verify project ID is correct (copy from URL)
2. Check that banner plans exist in database
3. Use web UI to create banner plans first

### Fallback to CSV

If API is unavailable, use CSV upload:
1. Export banner plan from database (manual query)
2. Format as CSV with columns: `group_name`, `column_name`, `equation`
3. Upload via "📁 Or upload CSV file" option

## Next Steps

- **Auto-Project Detection**: Detect current project from web UI
- **Multi-Banner Selection**: Choose which banner plan to use
- **Result Export**: Save cross-tabs back to Supabase
- **Batch Processing**: Process multiple projects at once