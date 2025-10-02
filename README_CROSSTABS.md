# Cross-Tabs Quick Start

## 🚀 Two Ways to Run

### Option 1: Run Both Apps Together (Recommended)
```bash
START_BOTH_APPS.bat
```
This starts:
- **Web App**: http://localhost:5173
- **Cross-Tabs**: http://localhost:8080

Then in the web app:
1. Open a project
2. Click **Cross-Tabs** in the Tools menu
3. Click **"🚀 Launch Cross-Tab Generator"**
4. The Shiny app opens in a new window!

### Option 2: Run Cross-Tabs Only
```bash
START_CROSSTAB_APP.bat
```
Opens cross-tab generator at http://localhost:8080

---

## 📋 Using Cross-Tabs from Web UI

1. **Start the apps**: Run `START_BOTH_APPS.bat`

2. **Navigate to Cross-Tabs**:
   - Open web app → http://localhost:5173
   - Sign in to your project
   - Click hamburger menu (☰)
   - Under "Tools" → Click **"Cross-Tabs"**

3. **Launch Shiny**:
   - Click the big blue button: **"🚀 Launch Cross-Tab Generator"**
   - Shiny app opens in new window automatically

4. **Generate Cross-Tabs**:
   - Upload SPSS `Codes.csv` file
   - Upload banner plan JSON
   - Configure question types
   - Click **"🚀 Generate Cross-Tabs"**
   - Download results as CSV

---

## 📁 Test Files

Use these to test the system:

- **SPSS Data**: `apps/web/examples/SPSS/Codes.csv`
- **Banner Plan**: `shiny_app/sample_banner_plan.json`

---

## 🔧 Troubleshooting

### "Cross-Tabs button does nothing"
The Shiny app isn't running. Run `START_BOTH_APPS.bat` instead of just `npm run dev`.

### "Port 8080 already in use"
Kill the existing process:
```bash
netstat -ano | findstr :8080
taskkill /PID <process_id> /F
```

### "Shiny app won't open"
Manually visit: http://localhost:8080

---

## 🎯 Full Workflow Example

```bash
# 1. Start both apps
START_BOTH_APPS.bat

# 2. In browser (http://localhost:5173):
#    - Sign in
#    - Open project
#    - Build your banner plan in Pre-Field tab
#    - Export banner to JSON (coming soon)

# 3. Click Cross-Tabs → Launch
#    - Shiny app opens automatically

# 4. In Shiny app (http://localhost:8080):
#    - Upload Codes.csv
#    - Upload banner JSON
#    - Generate cross-tabs
#    - Download CSV results

# 5. Use CSV in Excel/PowerPoint for reports
```

---

See `SHINY_CROSSTAB_GUIDE.md` for detailed Shiny app usage.