# Integrated Reporting Dashboard Setup

Your web app now has a **"Cross-Tabs"** button that launches the professional Shiny reporting dashboard!

## 🎯 How It Works

### From Your Web App:

1. **Open any project** in your web app
2. Click the **hamburger menu** (☰) in the top left
3. Under "Tools" section, click **"Cross-Tabs"**
4. You'll see a launch page with:
   - Your **Project ID** (auto-filled and copyable)
   - **"Launch Reporting Dashboard"** button
   - Instructions and features

### Two Ways to Launch:

#### Option A: One-Click Launch (Recommended)
1. Run `START_BOTH_APPS.bat` from the root folder
2. This starts **both**:
   - Web app on http://localhost:5173
   - Reporting dashboard on http://localhost:8000
3. Navigate to Cross-Tabs in web app
4. Click "Launch Reporting Dashboard" → Opens in new window

#### Option B: Manual Launch
1. Run web app normally: `npm run dev` in `apps/web`
2. In a separate terminal, run: `shiny_app/START_REPORTING_APP.bat`
3. Navigate to Cross-Tabs in web app
4. Click "Launch Reporting Dashboard" → Opens in new window

## 🔄 Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Workflow                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Build Questionnaire in Web App                          │
│     └─ Create questions, banners, logic                     │
│                                                              │
│  2. Click "Cross-Tabs" in menu                              │
│     └─ See project ID and launch button                     │
│                                                              │
│  3. Click "Launch Reporting Dashboard"                       │
│     └─ Opens Shiny app in new window                        │
│                                                              │
│  4. In Shiny App:                                           │
│     ├─ Upload SPSS files                                    │
│     ├─ Paste Project ID                                     │
│     ├─ Click "Load from Supabase"                           │
│     └─ Your banner plans load automatically!                │
│                                                              │
│  5. Generate Charts:                                        │
│     ├─ Click any question → Interactive chart               │
│     ├─ Click banner → Filter data                           │
│     ├─ Customize chart                                      │
│     └─ Export PNG/CSV/Excel                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 What You Get

### In the Web App (localhost:5173):
- ✅ Questionnaire builder
- ✅ Banner builder
- ✅ Question logic
- ✅ Project management

### In the Shiny App (localhost:8000):
- ✅ Interactive Plotly charts
- ✅ **All Likert scale points shown** (including 0%)
- ✅ Cross-tabulation with your banners
- ✅ Data filtering and manipulation
- ✅ Export: PNG, CSV, Excel
- ✅ Zoom, pan, hover tooltips

## 🚀 Quick Start

### First Time Setup:

```bash
# 1. Install Shiny dependencies (one time only)
cd shiny_app
pip install -r requirements.txt
cd ..

# 2. Start both apps
START_BOTH_APPS.bat
```

### Daily Use:

```bash
# Just double-click this:
START_BOTH_APPS.bat
```

## 📁 File Locations

```
your-project/
├── START_BOTH_APPS.bat           # Launch EVERYTHING
├── apps/web/
│   └── src/views/project/
│       └── shell.js              # Updated: Cross-Tabs button wired up
└── shiny_app/
    ├── app.py                    # NEW: Modern Shiny app
    ├── START_REPORTING_APP.bat   # Launch Shiny only
    ├── INSTALL_AND_RUN.bat       # First-time setup
    └── SHINY_APP_GUIDE.md        # Full Shiny documentation
```

## 🎨 Design Consistency

Both apps now share the **exact same design system**:

| Feature | Web App | Shiny App |
|---------|---------|-----------|
| Colors | Cue Primary #212161, Gold #F2B800 | ✅ Same |
| Typography | Aptos font | ✅ Same |
| Layout | 3-panel | ✅ Same |
| Emojis | None | ✅ None |
| Buttons | Gradient gold | ✅ Same |
| Shadows | Professional | ✅ Same |

## 🔗 Integration Features

### Auto Project ID Transfer
- Web app **automatically** passes project ID to launch page
- **One-click copy** button
- **Auto-filled** when you paste in Shiny app

### Shared Database
- Both apps read from **same Supabase** database
- Banner plans created in web app → **instantly available** in Shiny
- No manual export/import needed

### Port Configuration
- Web App: `5173` (Vite default)
- Shiny App: `8000` (Python Shiny default)
- No port conflicts!

## 🐛 Troubleshooting

### "Shiny app is not running" message?

**Solution 1:** Run `START_BOTH_APPS.bat` to start everything

**Solution 2:** Start Shiny manually:
```bash
cd shiny_app
START_REPORTING_APP.bat
```

Then click "Launch Reporting Dashboard" again.

### Port 8000 already in use?

**Kill existing Shiny process:**
```bash
# Windows
taskkill /F /IM python.exe

# Then restart
START_REPORTING_APP.bat
```

### Charts not showing all scale points?

✅ **Fixed!** The new app shows ALL Likert scale points, even if 0 responses.

Just make sure you're using `shiny_app/app.py` (not the old `main_with_crosstabs.py`).

### Banner plans not loading?

1. Check Project ID is correct
2. Verify you created banner plans in web app
3. Check Supabase connection in `.env` file
4. Look for errors in Shiny app console

## 💡 Pro Tips

### Tip 1: Keep Both Apps Open
- Build questionnaire in web app
- Switch to Shiny app to test charts
- No need to close/reopen

### Tip 2: Use Project ID Copy Button
- Saves typing
- Prevents UUID typos
- Works even if Shiny app isn't running yet

### Tip 3: Live Reload
- Shiny app runs with `--reload` flag
- Edit `app.py` → Changes appear instantly
- Perfect for customization

### Tip 4: Export Workflow
1. Generate chart in Shiny
2. Export as PNG (high-res)
3. Drop into PowerPoint
4. Professional presentation ready!

## 🎯 Next Steps

### Planned Enhancements:
- [ ] Auto-start Shiny app from web UI (single button)
- [ ] Embedded iframe mode (no separate window)
- [ ] Statistical significance testing
- [ ] PowerPoint template export
- [ ] Automated report scheduling

### Customization:
- Modify `shiny_app/app.py` for custom features
- Update colors in CSS section
- Add new chart types
- Create custom export templates

## 📚 Documentation

- **Web App Guide:** See main README.md
- **Shiny App Guide:** See `shiny_app/SHINY_APP_GUIDE.md`
- **Banner Format:** See `CROSSTAB_USAGE.md`
- **Rendering Patterns:** See `RENDERING_PATTERNS.md`

## 🎉 You're All Set!

Your integrated reporting system is ready to use:

1. **Build** questionnaires and banners in web app
2. **Launch** reporting dashboard with one click
3. **Analyze** data with interactive charts
4. **Export** professional reports

Both apps work together seamlessly with your Cue Insights branding!

---

**Questions?** Check the guides above or create an issue on GitHub.
