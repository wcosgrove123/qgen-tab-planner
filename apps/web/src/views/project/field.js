// src/views/project/field.js
import { renderTabPlanPreview } from './tabplan/tabPlanRenderer.js';
import simpleBannerPage from './banner/simpleBannerPage.js';

// Load banner styles using dynamic import
async function loadBannerStyles() {
  console.log('loadBannerStyles called');

  if (document.querySelector('style[data-banner-styles]') || document.querySelector('style[data-banner-styles-fallback]')) {
    console.log('Banner styles already loaded, skipping');
    return; // Already loaded
  }

  try {
    console.log('Attempting to fetch CSS from:', '/src/views/project/banner/bannerStyles.css');
    // Try to fetch the CSS file
    const response = await fetch('/src/views/project/banner/bannerStyles.css');
    console.log('Banner CSS fetch response:', response.status, response.ok);

    if (response.ok) {
      const cssText = await response.text();
      console.log('Banner CSS loaded, length:', cssText?.length);
      const style = document.createElement('style');
      style.setAttribute('data-banner-styles', 'true');
      style.textContent = cssText;
      document.head.appendChild(style);
      console.log('Banner CSS loaded successfully and added to head');
    } else {
      console.warn('Could not load banner CSS:', response.status);
      // Fallback to inline basic styles
      addFallbackBannerStyles();
    }
  } catch (error) {
    console.warn('Error loading banner CSS:', error);
    // Fallback to inline basic styles
    addFallbackBannerStyles();
  }
}

// Load tab plan styles using dynamic import
async function loadTabPlanStyles() {
  console.log('loadTabPlanStyles called');

  if (document.querySelector('style[data-tab-plan-styles]') || document.querySelector('style[data-tab-plan-styles-fallback]')) {
    console.log('Tab plan styles already loaded, skipping');
    return; // Already loaded
  }

  try {
    console.log('Attempting to fetch CSS from:', '/src/views/project/tabplan/tabPlanStyles.css');
    // Try to fetch the CSS file
    const response = await fetch('/src/views/project/tabplan/tabPlanStyles.css');
    console.log('CSS fetch response:', response.status, response.ok);

    if (response.ok) {
      const cssText = await response.text();
      console.log('CSS loaded, length:', cssText?.length);
      const style = document.createElement('style');
      style.setAttribute('data-tab-plan-styles', 'true');
      style.textContent = cssText;
      document.head.appendChild(style);
      console.log('Tab plan CSS loaded successfully and added to head');
    } else {
      console.warn('Could not load tab plan CSS:', response.status);
      // Fallback to inline basic styles
      addFallbackTabPlanStyles();
    }
  } catch (error) {
    console.warn('Error loading tab plan CSS:', error);
    // Fallback to inline basic styles
    addFallbackTabPlanStyles();
  }
}

// Fallback inline styles if CSS file can't be loaded
function addFallbackTabPlanStyles() {
  console.log('addFallbackTabPlanStyles called - adding inline CSS');
  const style = document.createElement('style');
  style.setAttribute('data-tab-plan-styles-fallback', 'true');
  style.textContent = `
    .tab-plan-preview {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .tab-plan-header {
      background: linear-gradient(135deg, #FFE47A 0%, #F2B800 100%);
      padding: 16px 20px;
      border-bottom: 2px solid #212161;
    }
    .tab-plan-title {
      font-size: 18px;
      font-weight: 700;
      color: #212161;
      margin: 0 0 8px 0;
      text-align: center;
    }
    .tab-plan-table {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    .tab-plan-header-row {
      display: table-row;
      background: #212161;
    }
    .tab-plan-header-cell.single-column {
      display: table-cell;
      padding: 0;
      font-weight: 700;
      color: #F2B800;
      background: #212161;
      border: 1px solid #8197D0;
    }
    .column-grid {
      display: grid;
      grid-template-columns: 80px 250px 180px 160px 1fr;
      gap: 0;
    }
    .grid-header-cell {
      padding: 8px 12px;
      font-weight: 700;
      color: #F2B800;
      background: #212161;
      border-right: 1px solid #8197D0;
      text-align: center;
      font-size: 11px;
    }
    .tab-plan-row {
      display: table-row;
      border-bottom: 1px solid #8197D0;
    }
    .tab-plan-cell.single-column {
      display: table-cell;
      padding: 0;
      border: 1px solid #8197D0;
      background: white;
    }
    .grid-cell {
      padding: 6px 8px;
      border-right: 1px solid #8197D0;
      vertical-align: top;
      font-size: 10px;
      line-height: 1.3;
    }
  `;
  document.head.appendChild(style);
  console.log('Fallback tab plan styles added');
}

// Fallback inline styles for banner if CSS file can't be loaded
function addFallbackBannerStyles() {
  console.log('addFallbackBannerStyles called - adding inline CSS');
  const style = document.createElement('style');
  style.setAttribute('data-banner-styles-fallback', 'true');
  style.textContent = `
    .banner-page {
      font-family: 'Aptos', system-ui, -apple-system, sans-serif;
      background: var(--bg);
    }
    .banner-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      background: linear-gradient(135deg, #FFE47A 0%, #F2B800 100%);
      border-bottom: 2px solid #212161;
    }
    .banner-page-title h1 {
      font-size: 24px;
      font-weight: 700;
      color: #212161;
      margin: 0;
    }
    .banner-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: 16px;
    }
    .banner-name {
      font-size: 16px;
      font-weight: 600;
      color: #212161;
      background: rgba(255, 255, 255, 0.3);
      padding: 4px 12px;
      border-radius: 12px;
    }
    .column-builder-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--line);
    }
    .builder-title h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--fg);
      margin: 0 0 4px 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      white-space: nowrap;
    }
    .btn.primary {
      background: linear-gradient(135deg, #212161 0%, #335899 100%);
      color: white;
    }
    .btn.large {
      padding: 12px 20px;
      font-size: 15px;
      font-weight: 600;
    }
    .banner-preview {
      background: var(--surface-1);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .banner-preview-header {
      background: linear-gradient(135deg, #212161 0%, #335899 100%);
      padding: 16px 20px;
      color: white;
      text-align: center;
    }
    .banner-grid {
      display: grid;
      gap: 0;
      background: var(--surface-1);
    }
    .banner-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      background: var(--surface-1);
      border: 1px solid var(--line);
      min-height: 48px;
    }
    .banner-cell.category-header {
      background: #A7B5DB;
      color: white;
      font-weight: 700;
      font-size: 13px;
      text-align: center;
    }
    .banner-cell.column-header {
      background: var(--surface-2);
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      text-align: center;
    }
    .column-label {
      font-weight: 600;
      color: var(--fg);
    }
    .column-source {
      font-size: 10px;
      color: var(--muted);
      font-family: 'Consolas', monospace;
    }
    .spss-variable {
      font-size: 10px;
      background: #FFFDF3;
      color: #2d3748;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
    }
  `;
  document.head.appendChild(style);
  console.log('Fallback banner styles added');
}

export async function renderFielding(el) {
  el.innerHTML = `
    <div class="workbench" style="margin-top: 16px;">
      <div class="card">
        <div class="card-header">
          <strong>Fielding Tools</strong>
          <div class="fielding-tabs">
            <button class="fielding-tab active" data-tab="tabplan">Tab Plan</button>
            <button class="fielding-tab" data-tab="banner">Banner Builder</button>
          </div>
        </div>
        <div class="card-content">
          <div id="fielding-tab-tabplan" class="fielding-tab-content active">
            <div class="tab-plan-controls" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--line); background: var(--surface-2);">
              <div class="tab-plan-info">
                <span style="font-weight: 600; color: var(--text-1);">Tab Plan Preview</span>
                <span style="color: var(--muted); margin-left: 8px; font-size: 13px;">Live preview of your questionnaire tab plan</span>
              </div>
              <div class="tab-plan-actions">
                <button id="export-tab-plan-btn" class="btn secondary" style="display: flex; align-items: center; gap: 6px;">
                  <span>📊</span>
                  Export to Excel
                </button>
              </div>
            </div>
            <div id="tabplan-content-host"></div>
          </div>
          <div id="fielding-tab-banner" class="fielding-tab-content">
            <div id="banner-content-host"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load banner styles if not already loaded
  if (!document.querySelector('link[href*="bannerStyles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './src/views/project/banner/bannerStyles.css';
    document.head.appendChild(link);
  }

  // Load tab plan styles if not already loaded
  await loadTabPlanStyles();

  // FORCE: Always add fallback styles for debugging
  if (!document.querySelector('style[data-tab-plan-debug-force]')) {
    console.log('FORCE: Adding emergency tab plan styles for debugging');
    const style = document.createElement('style');
    style.setAttribute('data-tab-plan-debug-force', 'true');
    style.textContent = `
      .tab-plan-preview {
        font-family: system-ui, -apple-system, sans-serif !important;
        font-size: 11px !important;
        background: white !important;
        border: 2px solid #007acc !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        padding: 10px !important;
      }
      .tab-plan-header {
        background: linear-gradient(135deg, #FFE47A 0%, #F2B800 100%) !important;
        padding: 20px 24px !important;
        border-bottom: 2px solid #212161 !important;
        position: relative !important;
      }
      .tab-plan-title {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #212161 !important;
        margin: 0 0 12px 0 !important;
        text-align: center !important;
      }
      .tab-plan-meta {
        position: absolute !important;
        bottom: 16px !important;
        right: 20px !important;
        display: flex !important;
        gap: 16px !important;
        font-size: 11px !important;
        color: #212161 !important;
        font-weight: 500 !important;
      }
      .tab-plan-notes {
        font-size: 11px !important;
        color: #212161 !important;
        line-height: 1.4 !important;
        margin-bottom: 8px !important;
      }
      .tab-plan-table {
        display: table !important;
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
      }
      .tab-plan-header-row {
        display: table-row !important;
        background: #212161 !important;
      }
      .tab-plan-header-cell {
        display: table-cell !important;
        padding: 8px !important;
        font-weight: 700 !important;
        color: #F2B800 !important;
        background: #212161 !important;
        border: 1px solid #8197D0 !important;
      }
      .tab-plan-row {
        display: table-row !important;
        border-bottom: 1px solid #8197D0 !important;
      }
      .tab-plan-cell {
        display: table-cell !important;
        padding: 6px 8px !important;
        border: 1px solid #8197D0 !important;
        background: white !important;
        vertical-align: top !important;
        font-size: 10px !important;
        line-height: 1.3 !important;
      }
      .column-grid {
        display: grid !important;
        grid-template-columns: 80px 250px 180px 160px 1fr !important;
        gap: 0 !important;
      }
      .grid-header-cell {
        padding: 8px 12px !important;
        font-weight: 700 !important;
        color: #F2B800 !important;
        background: #212161 !important;
        border-right: 1px solid #8197D0 !important;
        text-align: center !important;
        font-size: 11px !important;
      }
      .grid-cell {
        padding: 6px 8px !important;
        border-right: 1px solid #8197D0 !important;
        vertical-align: top !important;
        font-size: 10px !important;
        line-height: 1.3 !important;
      }
      .tab-plan-section-header {
        display: table-row !important;
        background: #A7B5DB !important;
      }
      .section-title {
        display: table-cell !important;
        padding: 12px 16px !important;
        background: linear-gradient(135deg, #A7B5DB 0%, #8197D0 100%) !important;
        border: 2px solid #212161 !important;
        color: #212161 !important;
        font-weight: 700 !important;
        text-align: center !important;
        font-size: 13px !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        box-shadow: inset 0 1px 2px rgba(255,255,255,0.3) !important;
      }
      .tab-plan-footer {
        background: #f8f9fa !important;
        padding: 12px 20px !important;
        border-top: 1px solid #dee2e6 !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        font-size: 11px !important;
        color: #6c757d !important;
        font-weight: 500 !important;
      }
      .footer-left {
        color: #495057 !important;
        font-weight: 600 !important;
      }
      .footer-right {
        color: #6c757d !important;
        font-style: italic !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Load fielding tab styles
  if (!document.querySelector('style[data-fielding-tabs]')) {
    const style = document.createElement('style');
    style.setAttribute('data-fielding-tabs', 'true');
    style.textContent = `
      .fielding-tabs {
        display: flex;
        gap: 0;
        margin-left: auto;
      }

      .fielding-tab {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-bottom: none;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #6b7280;
        border-radius: 6px 6px 0 0;
        transition: all 0.2s ease;
        position: relative;
        top: 1px;
      }

      .fielding-tab:first-child {
        margin-right: -1px;
      }

      .fielding-tab:hover {
        background: #e5e7eb;
        color: #374151;
      }

      .fielding-tab.active {
        background: white;
        color: #1f2937;
        font-weight: 500;
        border-color: #d1d5db;
        z-index: 1;
      }

      .fielding-tab-content {
        display: none;
      }

      .fielding-tab-content.active {
        display: block;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      [data-theme="dark"] .fielding-tab {
        background: #374151;
        border-color: #4b5563;
        color: #9ca3af;
      }

      [data-theme="dark"] .fielding-tab:hover {
        background: #4b5563;
        color: #f3f4f6;
      }

      [data-theme="dark"] .fielding-tab.active {
        background: #1f2937;
        color: #f9fafb;
        border-color: #4b5563;
      }
    `;
    document.head.appendChild(style);
  }

  // Wire up tab switching
  const tabs = el.querySelectorAll('.fielding-tab');
  const contents = el.querySelectorAll('.fielding-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update tab states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update content states
      contents.forEach(c => c.classList.remove('active'));
      el.querySelector(`#fielding-tab-${targetTab}`).classList.add('active');

      // Render content for the active tab
      if (targetTab === 'banner') {
        const host = document.getElementById('banner-content-host');
        if (host) {
          // Use the new simple banner builder
          simpleBannerPage.render(host).catch(error => {
            console.error('❌ Error rendering banner page:', error);
          });
        }
      } else if (targetTab === 'tabplan') {
        const host = document.getElementById('tabplan-content-host');
        if (host) {
          renderTabPlanPreview(host);
        }
      }
    });
  });

  // Initially render the tab plan (default active tab)
  const host = document.getElementById('tabplan-content-host');
  if (host) {
    renderTabPlanPreview(host);
  }

  // Add export tab plan functionality
  const exportTabPlanBtn = el.querySelector('#export-tab-plan-btn');
  if (exportTabPlanBtn) {
    exportTabPlanBtn.addEventListener('click', async () => {
      try {
        await exportTabPlanToExcel();
      } catch (error) {
        console.error('Tab plan export failed:', error);
        alert('Failed to export tab plan. Please try again.');
      }
    });
  }
}

// Export tab plan functionality
async function exportTabPlanToExcel() {
  try {
    console.log('Starting tab plan export to Excel...');

    // Show loading state
    const exportBtn = document.getElementById('export-tab-plan-btn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<span>⏳</span> Exporting...';
    exportBtn.disabled = true;

    // Get the current tab plan DOM content
    const tabPlanElement = document.getElementById('tabplan-content-host');
    if (!tabPlanElement) {
      throw new Error('Tab plan not found');
    }

    // Generate the Excel workbook
    const excelData = await generateTabPlanExcelData();
    const excelBlob = await generateTabPlanExcelFile(excelData);

    // Generate filename
    const projectName = window.state?.project?.name || 'questionnaire';
    const safeName = projectName.replace(/[^\w\-_]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}_tab_plan_${timestamp}.xlsx`;

    // Download the file
    downloadFile(excelBlob, filename);

    // Success message
    console.log('Tab plan exported successfully to Excel');

    // Restore button state
    exportBtn.innerHTML = originalText;
    exportBtn.disabled = false;

  } catch (error) {
    console.error('Tab plan export error:', error);

    // Restore button state
    const exportBtn = document.getElementById('export-tab-plan-btn');
    if (exportBtn) {
      exportBtn.innerHTML = '<span>📊</span> Export to Excel';
      exportBtn.disabled = false;
    }

    throw error;
  }
}

// Generate Excel data for the tab plan
async function generateTabPlanExcelData() {
  const project = window.state?.project || {};
  const questions = window.state?.questions || [];

  // Get project data
  const projectName = project.name || 'Untitled Project';
  const projectType = project.project_type || '';
  const client = project.client || '';
  const title = projectType ? `${projectName}: ${projectType}` : projectName;

  // Initialize Excel data structure
  const excelData = {
    metadata: {
      title: title,
      client: client,
      questions: questions.length,
      generated: new Date().toLocaleDateString()
    },
    headers: [
      'Q#',
      'Base Verbiage',
      'Base Definition',
      'Nets (English & code #s)',
      'Additional Table Instructions'
    ],
    rows: []
  };

  // Process questions using the same logic as the tab plan renderer
  const filteredQuestions = questions.filter(q => {
    // Hide text-only questions
    const textOnlyTypes = ['TXT_1', 'STXT_1'];
    if (textOnlyTypes.includes(q.type)) return false;
    if (q.mode === 'text') return false;
    return true;
  });

  // Group by sections
  let currentSection = '';

  for (const question of filteredQuestions) {
    const sectionName = question.id?.toString().toUpperCase().startsWith('S') ? 'Screener' : 'Main Survey';

    // Add section header if changed
    if (sectionName !== currentSection) {
      currentSection = sectionName;
      excelData.rows.push({
        type: 'section',
        data: [sectionName, '', '', '', '']
      });
    }

    // Process the question data
    const questionData = await processQuestionForTabPlan(question);

    // Add main question row
    excelData.rows.push({
      type: 'question',
      data: [
        questionData.id || '',
        questionData.baseVerbiage || 'Total (qualified respondents)',
        questionData.baseDefinition || '',
        questionData.nets || '',
        questionData.additionalInstructions || ''
      ]
    });

    // Add summary rows if they exist
    if (questionData.summaryRows) {
      for (const summaryRow of questionData.summaryRows) {
        excelData.rows.push({
          type: 'summary',
          data: [
            summaryRow.id || '',
            summaryRow.baseVerbiage || questionData.baseVerbiage || 'Total (qualified respondents)',
            summaryRow.baseDefinition || '',
            summaryRow.nets || '',
            summaryRow.additionalInstructions || ''
          ]
        });
      }
    }
  }

  return excelData;
}

// Process a single question for tab plan (simplified version of tab plan renderer logic)
async function processQuestionForTabPlan(question) {
  // Import the necessary modules dynamically
  const { formatQuestionNets } = await import('./tabplan/netsFormatter.js');
  const { getTabInstructions } = await import('./tabplan/instructionsExtractor.js');
  const { getConditionsDescription } = await import('../../lib/conditionalLogic.js');

  const result = {
    id: question.id,
    type: question.type,
    baseVerbiage: 'Total (qualified respondents)',
    baseDefinition: '',
    nets: '',
    additionalInstructions: ''
  };

  // Extract base verbiage (conditional logic description)
  try {
    if (question.conditions && question.conditions.mode !== 'none' &&
        question.conditions.rules && question.conditions.rules.length > 0) {
      const description = getConditionsDescription(question.conditions, window.state?.questions || []);
      if (description && description !== 'No conditions set') {
        result.baseVerbiage = cleanHTMLForDisplay(description);
      }
    }
  } catch (e) {
    console.warn('Error extracting base verbiage for', question.id, e);
  }

  // Extract base definition (raw conditional logic)
  try {
    if (question.conditions && question.conditions.mode !== 'none' &&
        question.conditions.rules && question.conditions.rules.length > 0) {
      result.baseDefinition = extractRawConditionEquation(question.conditions);
    }
  } catch (e) {
    console.warn('Error extracting base definition for', question.id, e);
  }

  // Extract nets
  try {
    result.nets = formatQuestionNets(question) || '';
  } catch (e) {
    console.warn('Error formatting nets for', question.id, e);
  }

  // Extract instructions
  try {
    result.additionalInstructions = getTabInstructions(question) || '';
  } catch (e) {
    console.warn('Error extracting instructions for', question.id, e);
  }

  // Check for Likert scale and add summary rows
  if (isLikertQuestion(question)) {
    result.summaryRows = generateLikertSummaryRows(question, result);
  }

  return result;
}

// Helper functions
function cleanHTMLForDisplay(htmlText) {
  if (!htmlText) return '';
  const temp = document.createElement('div');
  temp.innerHTML = htmlText;
  return temp.textContent || temp.innerText || htmlText;
}

function extractRawConditionEquation(conditions) {
  if (!conditions.rules || conditions.rules.length === 0) return '';

  const equations = conditions.rules.map(rule => {
    const qid = rule.source_qid || '';
    const operator = rule.operator || '==';
    const values = Array.isArray(rule.values) ? rule.values : [rule.values];

    const opMap = {
      '==': '=', '!=': '≠', '>': '>', '>=': '≥', '<': '<', '<=': '≤',
      'in': '=', 'not_in': '≠'
    };

    const displayOp = opMap[operator] || operator;
    const valuesList = values.filter(v => v !== null && v !== undefined && v !== '').join(',');

    return `${qid} ${displayOp} ${valuesList}`;
  });

  const logic = conditions.logic === 'OR' ? ' OR ' : ' AND ';
  return equations.join(logic);
}

function isLikertQuestion(question) {
  // Check for table_type first (3-column taxonomy)
  if (question.table_type?.startsWith('likert_')) return true;

  // Check for advanced table Likert modes
  if (question.mode === 'advanced_table' &&
      ['likert_agreement', 'likert_sentiment', 'likert_custom'].includes(question.advancedTable?.tableVariation)) {
    return true;
  }

  // Check for grid questions with Likert-like columns
  const type = question.type?.toLowerCase() || '';
  const cols = question.advancedTable?.cols || question.grid?.cols || [];

  if ((type.startsWith('grid') || question.mode === 'advanced_table') && cols.length >= 4) {
    const colText = cols.join(' ').toLowerCase();
    const likertPatterns = [
      ['dissatisfied', 'satisfied'], ['disagree', 'agree'], ['never', 'always'],
      ['poor', 'excellent'], ['neither', 'neutral']
    ];

    return likertPatterns.some(pattern =>
      pattern.every(keyword => colText.includes(keyword))
    );
  }

  return false;
}

function generateLikertSummaryRows(question, basicData) {
  const qPrefix = (question.id || '').replace(/\./g, '_');

  // Determine scale type based on metadata or column count
  const metadata = question.table_metadata;
  let netTypes = ['T2B', 'B2B'];

  if (metadata?.auto_nets?.length) {
    netTypes = metadata.auto_nets;
  } else {
    const cols = question.advancedTable?.cols || question.grid?.cols || [];
    const scalePoints = cols.length;
    const isT3B = scalePoints === 7 || scalePoints === 10;
    netTypes = isT3B ? ['T3B', 'B3B'] : ['T2B', 'B2B'];
  }

  const summaryKeys = ['TB', netTypes[0], netTypes[1], 'BB', 'Mean'];

  return summaryKeys.map(key => ({
    id: `${qPrefix}_${key} Summary`,
    type: question.type,
    baseVerbiage: basicData.baseVerbiage,
    baseDefinition: '',
    nets: '',
    additionalInstructions: getLikertSummaryInstruction(key)
  }));
}

function getLikertSummaryInstruction(key) {
  const instructions = {
    "TB": "Show table for each statement with TB ratings data shown.",
    "T2B": "Show table for each statement with T2B ratings data shown.",
    "T3B": "Show table for each statement with T3B ratings data shown.",
    "B2B": "Show table for each statement with B2B ratings data shown.",
    "B3B": "Show table for each statement with B3B ratings data shown.",
    "BB": "Show table for each statement with BB ratings data shown.",
    "Mean": "Show table for each statement with mean data shown."
  };
  return instructions[key] || '';
}

// Generate Excel file from tab plan data using SheetJS
async function generateTabPlanExcelFile(excelData) {
  // Import the XLSX library
  const XLSX = await import('xlsx');

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Set workbook properties for enterprise branding
  workbook.Props = {
    Title: `${excelData.metadata.title} - Tab Plan`,
    Subject: 'Professional Tab Plan Export',
    Author: 'Cue Insights',
    Company: 'Cue Insights',
    CreatedDate: new Date()
  };

  // Define modern enterprise color palette (Cue Insights branding)
  const colors = {
    cuePrimary: '1F2C5C',      // Cue navy blue (darker than 212161)
    cueGold: 'F2B800',         // Cue gold
    cueSecondary: '3A4A7A',    // Lighter navy for accents
    lightGold: 'FFF4D1',       // Very light gold for subtle backgrounds
    headerDark: '141B3C',      // Even darker navy for headers
    textPrimary: '2C3E50',     // Professional dark text
    textSecondary: '7F8C8D',   // Muted text
    borderLight: 'E8EAED',     // Light professional borders
    white: 'FFFFFF',
    lightBlue: 'F8F9FD',       // Very light blue background
    modernAccent: '4A90E2',    // Modern blue accent
    successGreen: '27AE60',    // Success green
    gradientStart: 'FFE47A',   // Gradient gold start
    gradientEnd: 'F2B800',     // Gradient gold end
    premiumPurple: '6B73FF'    // Premium purple accent
  };

  // Define professional font styles
  const fonts = {
    title: { name: 'Aptos', size: 18, bold: true, color: { rgb: colors.cuePrimary } },
    heading: { name: 'Aptos', size: 14, bold: true, color: { rgb: colors.cuePrimary } },
    subheading: { name: 'Aptos', size: 12, bold: true, color: { rgb: colors.cueSecondary } },
    header: { name: 'Aptos', size: 11, bold: true, color: { rgb: colors.white } },
    body: { name: 'Aptos', size: 10, color: { rgb: colors.textPrimary } },
    caption: { name: 'Aptos', size: 9, color: { rgb: colors.textSecondary } }
  };

  // Prepare worksheet data with professional structure
  const worksheetData = [];
  let currentRow = 0;

  // Row 1: Professional company branding
  worksheetData.push(['CUE INSIGHTS', '', '', 'TAB PLAN', 'CONFIDENTIAL']);
  currentRow++;

  // Row 2: Empty row for clean spacing
  worksheetData.push(['', '', '', '', '']);
  currentRow++;

  // Row 3: Project title
  worksheetData.push([excelData.metadata.title, '', '', '', '']);
  currentRow++;

  // Row 4: Professional subtitle
  worksheetData.push(['Professional Tab Plan & Analytical Framework', '', '', '', '']);
  currentRow++;

  // Row 5: Empty row
  worksheetData.push(['', '', '', '', '']);
  currentRow++;

  // Row 6: Project metadata
  worksheetData.push([
    `Client: ${excelData.metadata.client || 'N/A'}`,
    `Total Questions: ${excelData.metadata.questions}`,
    `Generated: ${excelData.metadata.generated}`,
    '',
    ''
  ]);
  currentRow++;

  // Row 7: Separator
  worksheetData.push(['', '', '', '', '']);
  currentRow++;

  // Row 8: Analytics requirements header
  worksheetData.push(['ANALYTICAL REQUIREMENTS & SPECIFICATIONS', '', '', '', '']);
  currentRow++;

  // Row 9-12: Professional requirements
  const instructions = [
    'Provide banner-by-banner cross-tabulation tables with statistical significance testing',
    'Include means, medians, and descriptive statistics for all numeric variables',
    'Deliver Excel outputs: percentages only, zero decimals with % formatting',
    'Supply SPSS data file with complete variable labels and value definitions'
  ];

  for (const instruction of instructions) {
    worksheetData.push([instruction, '', '', '', '']);
    currentRow++;
  }

  // Add spacing before data table
  worksheetData.push(['', '', '', '', '']);
  worksheetData.push(['', '', '', '', '']);
  currentRow += 2;

  // Headers with enhanced styling
  const headerRowIndex = currentRow;
  worksheetData.push(excelData.headers);
  currentRow++;

  // Add data rows with row type tracking
  const dataStartRow = currentRow;
  for (const row of excelData.rows) {
    if (row.type === 'section') {
      // Section header row (merged)
      worksheetData.push([row.data[0], '', '', '', '']);
    } else {
      // Regular data row
      worksheetData.push(row.data);
    }
    currentRow++;
  }

  // Add footer section
  worksheetData.push(['', '', '', '', '']);
  worksheetData.push(['', '', '', '', '']);
  worksheetData.push([
    'Cue Insights | Professional Market Research',
    '',
    '',
    '',
    `Generated: ${new Date().toLocaleString()}`
  ]);

  // Create worksheet from data
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set professional column widths
  worksheet['!cols'] = [
    { wch: 12 },  // Q# column - slightly wider
    { wch: 45 },  // Base Verbiage column - wider for readability
    { wch: 32 },  // Base Definition column
    { wch: 28 },  // Nets column
    { wch: 42 }   // Additional Instructions column
  ];

  // Apply enterprise-level styling
  const range = XLSX.utils.decode_range(worksheet['!ref']);

  // Style brand header row (row 0)
  for (let col = 0; col <= 4; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

    if (col === 0) {
      // Cue Insights brand cell with gradient-like effect
      worksheet[cellRef].s = {
        font: { name: 'Aptos', size: 16, bold: true, color: { rgb: colors.white } },
        fill: { fgColor: { rgb: colors.cuePrimary } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: {
          top: { style: 'thick', color: { rgb: colors.headerDark } },
          bottom: { style: 'medium', color: { rgb: colors.cueGold } },
          left: { style: 'thick', color: { rgb: colors.headerDark } },
          right: { style: 'thin', color: { rgb: colors.cueGold } }
        }
      };
    } else if (col === 3) {
      // TAB PLAN cell
      worksheet[cellRef].s = {
        font: { name: 'Aptos', size: 14, bold: true, color: { rgb: colors.cuePrimary } },
        fill: { fgColor: { rgb: colors.cueGold } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thick', color: { rgb: colors.headerDark } },
          bottom: { style: 'medium', color: { rgb: colors.cuePrimary } },
          left: { style: 'thin', color: { rgb: colors.cuePrimary } },
          right: { style: 'thin', color: { rgb: colors.cuePrimary } }
        }
      };
    } else if (col === 4) {
      // Confidential cell
      worksheet[cellRef].s = {
        font: { name: 'Aptos', size: 10, bold: true, color: { rgb: colors.textSecondary } },
        fill: { fgColor: { rgb: colors.lightGold } },
        alignment: { horizontal: 'right', vertical: 'center' },
        border: {
          top: { style: 'thick', color: { rgb: colors.headerDark } },
          bottom: { style: 'medium', color: { rgb: colors.cueGold } },
          left: { style: 'thin', color: { rgb: colors.cueGold } },
          right: { style: 'thick', color: { rgb: colors.headerDark } }
        }
      };
    } else {
      // Middle cells
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: colors.gradientStart } },
        border: {
          top: { style: 'thick', color: { rgb: colors.headerDark } },
          bottom: { style: 'medium', color: { rgb: colors.cueGold } }
        }
      };
    }
  }

  // Style project title (row 2)
  const titleCell = XLSX.utils.encode_cell({ r: 2, c: 0 });
  if (!worksheet[titleCell]) worksheet[titleCell] = { t: 's', v: '' };
  worksheet[titleCell].s = {
    font: fonts.title,
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  // Style subtitle (row 3)
  const subtitleCell = XLSX.utils.encode_cell({ r: 3, c: 0 });
  if (!worksheet[subtitleCell]) worksheet[subtitleCell] = { t: 's', v: '' };
  worksheet[subtitleCell].s = {
    font: fonts.heading,
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  // Style metadata headers (row 5)
  for (let col = 0; col <= 4; col += 2) {
    const cellRef = XLSX.utils.encode_cell({ r: 5, c: col });
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
    worksheet[cellRef].s = {
      font: fonts.subheading,
      fill: { fgColor: { rgb: colors.lightBlue } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: colors.borderLight } }
      }
    };
  }

  // Style metadata values (row 6)
  for (let col = 0; col <= 4; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c: col });
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
    worksheet[cellRef].s = {
      font: fonts.body,
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: colors.borderLight } }
      }
    };
  }

  // Style instructions header (row 8) - make it stand out more
  const instructionsHeaderCell = XLSX.utils.encode_cell({ r: 8, c: 0 });
  if (!worksheet[instructionsHeaderCell]) worksheet[instructionsHeaderCell] = { t: 's', v: '' };
  worksheet[instructionsHeaderCell].s = {
    font: { name: 'Aptos', size: 14, bold: true, color: { rgb: colors.white } },
    fill: { fgColor: { rgb: colors.cueSecondary } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thick', color: { rgb: colors.cuePrimary } },
      bottom: { style: 'thick', color: { rgb: colors.cuePrimary } },
      left: { style: 'thick', color: { rgb: colors.cuePrimary } },
      right: { style: 'thick', color: { rgb: colors.cuePrimary } }
    }
  };

  // Style instruction rows (rows 9-12) with enhanced formatting
  for (let row = 9; row <= 12; row++) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
    worksheet[cellRef].s = {
      font: { name: 'Aptos', size: 11, color: { rgb: colors.textPrimary } },
      fill: { fgColor: { rgb: colors.lightBlue } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        left: { style: 'thick', color: { rgb: colors.cueGold } },
        right: { style: 'thin', color: { rgb: colors.borderLight } },
        top: { style: 'thin', color: { rgb: colors.borderLight } },
        bottom: { style: 'thin', color: { rgb: colors.borderLight } }
      }
    };
  }

  // Style table headers (main data table) with modern gradient effect
  for (let col = 0; col <= 4; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

    // Create gradient-like effect across headers
    const gradientColors = [colors.cuePrimary, colors.cueSecondary, colors.cuePrimary, colors.cueSecondary, colors.cuePrimary];

    worksheet[cellRef].s = {
      font: { name: 'Aptos', size: 12, bold: true, color: { rgb: colors.cueGold } },
      fill: { fgColor: { rgb: gradientColors[col] } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thick', color: { rgb: colors.headerDark } },
        bottom: { style: 'thick', color: { rgb: colors.cueGold } },
        left: { style: 'medium', color: { rgb: colors.cueGold } },
        right: { style: 'medium', color: { rgb: colors.cueGold } }
      }
    };
  }

  // Style data rows with alternating colors
  for (let row = dataStartRow; row < currentRow - 3; row++) {
    const isEvenRow = (row - dataStartRow) % 2 === 0;
    const isSection = worksheetData[row] && (worksheetData[row][0] === 'Screener' || worksheetData[row][0] === 'Main Survey');

    for (let col = 0; col <= 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

      if (isSection) {
        // Section header styling
        worksheet[cellRef].s = {
          font: { name: 'Aptos', size: 12, bold: true, color: { rgb: colors.white } },
          fill: { fgColor: { rgb: colors.cueSecondary } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thick', color: { rgb: colors.cuePrimary } },
            bottom: { style: 'thick', color: { rgb: colors.cuePrimary } },
            left: { style: 'thin', color: { rgb: colors.white } },
            right: { style: 'thin', color: { rgb: colors.white } }
          }
        };
      } else {
        // Regular data row styling
        worksheet[cellRef].s = {
          font: fonts.body,
          fill: { fgColor: { rgb: isEvenRow ? colors.white : colors.lightBlue } },
          alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: colors.borderLight } },
            bottom: { style: 'thin', color: { rgb: colors.borderLight } },
            left: { style: 'thin', color: { rgb: colors.borderLight } },
            right: { style: 'thin', color: { rgb: colors.borderLight } }
          }
        };

        // Special styling for Q# column
        if (col === 0) {
          worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
          worksheet[cellRef].s.font = { ...fonts.body, bold: true };
        }
      }
    }
  }

  // Style footer
  const footerRow = currentRow - 1;
  for (let col = 0; col <= 4; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: footerRow, c: col });
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
    worksheet[cellRef].s = {
      font: fonts.caption,
      fill: { fgColor: { rgb: colors.lightGold } },
      alignment: { horizontal: col === 0 ? 'left' : col === 4 ? 'right' : 'center', vertical: 'center' },
      border: {
        top: { style: 'thick', color: { rgb: colors.cuePrimary } }
      }
    };
  }

  // Add professional merges
  const merges = [];

  // Brand header merges
  merges.push({ s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }); // Middle brand area

  // Title merges
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }); // Project title
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }); // Subtitle

  // Metadata merges
  merges.push({ s: { r: 5, c: 1 }, e: { r: 5, c: 1 } }); // Spacing
  merges.push({ s: { r: 5, c: 3 }, e: { r: 5, c: 4 } }); // Timeline section

  // Instructions header merge
  merges.push({ s: { r: 8, c: 0 }, e: { r: 8, c: 4 } });

  // Instruction rows merges
  for (let row = 9; row <= 12; row++) {
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } });
  }

  // Section header merges in data table
  for (let i = dataStartRow; i < currentRow - 3; i++) {
    const row = worksheetData[i];
    if (row && row.length > 0 && (row[0] === 'Screener' || row[0] === 'Main Survey')) {
      merges.push({ s: { r: i, c: 0 }, e: { r: i, c: 4 } });
    }
  }

  // Footer merge
  merges.push({ s: { r: footerRow, c: 1 }, e: { r: footerRow, c: 3 } });

  worksheet['!merges'] = merges;

  // Set row heights for better visual hierarchy
  worksheet['!rows'] = [];
  worksheet['!rows'][0] = { hpt: 24 }; // Brand header
  worksheet['!rows'][2] = { hpt: 28 }; // Title
  worksheet['!rows'][3] = { hpt: 20 }; // Subtitle
  worksheet['!rows'][headerRowIndex] = { hpt: 30 }; // Table headers

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tab Plan');

  // Generate Excel file buffer with enterprise settings
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true,
    Props: workbook.Props
  });

  // Create blob
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return blob;
}

// Download file utility
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}