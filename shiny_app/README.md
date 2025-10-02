# 📊 SPSS Data Visualization Dashboard

## Professional market research chart generation with Shiny for Python

### 🚀 **Quick Start**

1. **Navigate to the Shiny app directory:**
   ```bash
   cd shiny_app
   ```

2. **Run the application:**
   ```bash
   python run.py
   ```

3. **Open your browser to:** `http://localhost:7394`

### 📋 **Features**

#### **🎯 Professional Chart Generation**
- **Multi-Likert Tables**: Exact recreation of your reference slide format
- **Cross-tabulation**: Banner analysis with demographic breaks
- **Numeric Distributions**: Histograms with statistics overlays
- **Categorical Charts**: Clean bar charts for single/multi-select questions

#### **📁 Data Processing**
- **SPSS CSV Upload**: Drag-and-drop file upload for labels and codes
- **Automatic Question Detection**: Smart parsing of question structure
- **Real-time Processing**: Pandas-powered data analysis
- **Question Filtering**: Filter by screener/main sections

#### **🎨 Professional Styling**
- **Cue Brand Colors**: Your exact color scheme (#212161, #F2B800, etc.)
- **Market Research Layout**: Professional table format with T2B/B2B metrics
- **Responsive Design**: Clean, modern interface
- **Interactive Charts**: Hover effects and professional tooltips

#### **📊 Chart Types Supported**
- **Q3**: Multi-statement Likert agreement scales
- **Q6**: Product attribute ratings
- **Q1, Q8**: Numeric distributions with statistics
- **Q2, Q4**: Single Likert scales
- **S1, S7**: Categorical breakdowns

#### **🔗 Cross-tabulation Features**
- **Banner Variables**: Gender, Age Groups, Brand segments
- **Side-by-side Comparison**: Multiple demographic breaks
- **Statistical Significance**: Visual indicators for key differences
- **Export Ready**: Professional format for client presentations

#### **📤 Export Options**
- **PNG**: High-resolution images for presentations
- **PDF**: Vector graphics for print materials
- **HTML**: Interactive charts for digital reports

### 💻 **System Requirements**

- Python 3.8+
- 8GB RAM (recommended for large datasets)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 📦 **Dependencies**

All dependencies are automatically installed via `run.py`:

- **shiny**: Core framework
- **pandas**: Data processing
- **plotly**: Professional chart generation
- **numpy**: Numerical computations
- **shinyswatch**: UI themes

### 🛠️ **Manual Installation**

If you prefer manual setup:

```bash
pip install -r requirements.txt
python main.py
```

### 📊 **Usage Guide**

#### **Step 1: Upload Data**
- Upload your **labels.csv** file (survey responses)
- Upload your **codes.csv** file (question definitions)
- Wait for processing confirmation

#### **Step 2: Select Questions**
- Browse questions in the left palette
- Filter by Screener/Main sections
- Click questions to select them

#### **Step 3: Generate Charts**
- Charts auto-generate when questions are selected
- Multi-Likert questions (Q3, Q6) create professional tables
- Numeric questions show distributions with statistics

#### **Step 4: Cross-tabulation (Optional)**
- Toggle "Enable Cross-tab" switch
- Select banner variable (Gender, Age, etc.)
- View side-by-side demographic comparisons

#### **Step 5: Export**
- Choose format (PNG, PDF, HTML)
- Click "Export Chart"
- Download high-quality visualization

### 🎯 **Example Use Cases**

#### **Market Research Presentations**
```
1. Upload Q3 agreement data
2. Generate professional Likert table
3. Export as PNG for PowerPoint
4. Perfect for client presentations
```

#### **Cross-tabulated Analysis**
```
1. Select Q3 product statements
2. Enable cross-tab with Gender
3. Compare Male vs Female agreement
4. Export side-by-side comparison
```

#### **Statistical Reporting**
```
1. Upload Q1 numeric data
2. Generate distribution histogram
3. View mean, median, std dev
4. Export for statistical reports
```

### 🔧 **Advanced Features**

#### **Custom Statement Mapping**
The engine automatically maps question codes to readable text:
- `Q3r1` → "Provides long-lasting comfort"
- `Q3r2` → "Feels natural in my eyes"
- `Q6r1` → "Comfort throughout the day"

#### **Automatic T2B/B2B Calculation**
- **Top 2 Box**: Strongly Agree + Agree
- **Bottom 2 Box**: Strongly Disagree + Disagree
- **Ranked by Performance**: Auto-sorted by T2B descending

#### **Professional Color Schemes**
- **Likert Scale**: Yellow-to-orange gradient
- **Brand Colors**: Cue primary (#212161) and secondary (#F2B800)
- **Accessibility**: High contrast for readability

### 🐛 **Troubleshooting**

#### **"No sub-questions found"**
- Ensure CSV has columns like Q3r1, Q3r2, etc.
- Check column naming convention

#### **"Question data not found"**
- Verify question ID exists in uploaded data
- Check for typos in column names

#### **Charts not displaying**
- Refresh the page
- Check browser console for errors
- Ensure files uploaded successfully

### 📞 **Support**

For technical support or feature requests, please check:
1. Browser developer console for errors
2. File format matches expected SPSS structure
3. Internet connection for Plotly rendering

### 🚀 **Future Enhancements**

- **PowerPoint Export**: Direct .pptx generation
- **Statistical Tests**: Significance testing between groups
- **Custom Themes**: Additional color schemes
- **Batch Processing**: Multiple questions at once
- **Advanced Filtering**: Complex demographic combinations

---

**Built with ❤️ using Shiny for Python and Plotly**