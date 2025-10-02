// src/views/project/report.js
import './reportStyles.css';

// Global state for the reporting module
let spssData = {
  labels: null,
  codes: null,
  questions: null,
  metadata: null, // SPSS metadata with column mappings
  loaded: false
};

let currentProject = null;
let draggedQuestion = null;
let activeBannerFilters = []; // Active banner filters for cross-tabulation
let bannerHierarchy = []; // Loaded banner hierarchy from database
let questionOptionsMap = {}; // Maps question_id -> array of options with labels and codes (fallback)

export async function renderReporting(el) {
  // Get current project data
  const projectId = window.ui_state?.active_project_id;
  if (projectId) {
    console.log('🔄 Loading project data for reporting...');
    currentProject = await loadProjectData(projectId);
    console.log('✅ Project data loaded, questionOptionsMap has', Object.keys(questionOptionsMap).length, 'questions');
  }

  el.innerHTML = `
    <div class="reporting-workspace">
      <!-- Data Import Section -->
      <div class="reporting-header">
        <div class="data-import-panel">
          <h3>SPSS Data Import</h3>
          <div class="import-controls">
            <div class="file-upload-group">
              <label class="file-upload-btn">
                <input type="file" id="labels-file" accept=".csv" style="display: none;">
                Upload Labels CSV
              </label>
              <span id="labels-status" class="upload-status">No file selected</span>
            </div>
            <div class="file-upload-group">
              <label class="file-upload-btn">
                <input type="file" id="codes-file" accept=".csv" style="display: none;">
                Upload Codes CSV
              </label>
              <span id="codes-status" class="upload-status">No file selected</span>
            </div>
            <div class="file-upload-group">
              <label class="file-upload-btn">
                <input type="file" id="metadata-file" accept=".json" style="display: none;">
                Upload Metadata JSON (Optional)
              </label>
              <span id="metadata-status" class="upload-status">Optional - improves label accuracy</span>
            </div>
            <button id="process-data" class="btn primary" disabled>Process Data</button>
            <button id="clear-cache" class="btn secondary" style="display: none;">Clear Cached Data</button>
          </div>
          <div id="data-summary" class="data-summary" style="display: none;">
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">Responses:</span>
                <span id="response-count" class="stat-value">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Questions:</span>
                <span id="question-count" class="stat-value">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Status:</span>
                <span id="data-status" class="stat-value status-ready">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Reporting Interface -->
      <div class="reporting-main" id="reporting-main" style="display: none;">
        <!-- Left Panel: Question Palette -->
        <div class="question-palette">
          <div class="palette-header">
            <h4>Questions</h4>
            <div class="palette-filters">
              <button class="filter-btn active" data-filter="all">All</button>
              <button class="filter-btn" data-filter="screener">Screener</button>
              <button class="filter-btn" data-filter="main">Main</button>
            </div>
          </div>
          <div class="palette-content" id="question-list">
            <!-- Questions will be populated here -->
          </div>
        </div>

        <!-- Center Panel: Chart Canvas -->
        <div class="chart-canvas">
          <div class="canvas-header">
            <h4>Chart Canvas</h4>
            <div class="canvas-controls">
              <select id="chart-type-selector" class="form-control" style="width: 200px;">
                <option value="auto">Auto-detect Chart Type</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="likert">Likert Scale</option>
                <option value="table">Data Table</option>
                <option value="histogram">Histogram</option>
              </select>
              <button id="export-chart" class="btn secondary">Export</button>
            </div>
          </div>
          <div class="canvas-content" id="chart-container">
            <div class="canvas-placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon"></div>
                <h3>Drag a Question Here</h3>
                <p>Select a question from the left panel to create a chart</p>
                <div class="drop-zone-hints">
                  <div class="hint-item">Single questions → Bar/Pie charts</div>
                  <div class="hint-item">Likert scales → Stacked bar charts</div>
                  <div class="hint-item">Numeric questions → Histograms</div>
                  <div class="hint-item">Tables → Heatmaps</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Banner/Cross-tab Options -->
        <div class="banner-palette">
          <div class="palette-header">
            <h4>Cross-tabulation</h4>
            <div class="banner-toggle">
              <label class="toggle-switch">
                <input type="checkbox" id="enable-crosstab">
                <span class="toggle-slider"></span>
              </label>
              <span>Enable Cross-tab</span>
            </div>
          </div>
          <div class="palette-content" id="banner-list">
            <!-- Banner options will be populated here -->
          </div>

          <!-- Chart Customization -->
          <div class="chart-customization" id="chart-customization" style="display: none;">
            <h5>Customize Chart</h5>
            <div class="customization-controls">
              <div class="control-group">
                <label>Theme:</label>
                <select id="chart-theme" class="form-control">
                  <option value="cue-brand">Cue Brand</option>
                  <option value="professional">Professional</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div class="control-group">
                <label>Colors:</label>
                <div class="color-picker-group">
                  <input type="color" id="primary-color" value="#212161" title="Primary Color">
                  <input type="color" id="secondary-color" value="#F2B800" title="Secondary Color">
                  <input type="color" id="accent-color" value="#3F6AB7" title="Accent Color">
                </div>
              </div>
              <div class="control-group">
                <label>Title:</label>
                <input type="text" id="chart-title" class="form-control" placeholder="Enter chart title">
              </div>
              <div class="control-group">
                <label>Show:</label>
                <div class="checkbox-group">
                  <label><input type="checkbox" id="show-values" checked> Values</label>
                  <label><input type="checkbox" id="show-percentages" checked> Percentages</label>
                  <label><input type="checkbox" id="show-legend" checked> Legend</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize the reporting interface
  await initializeReporting();
}

async function loadProjectData(projectId) {
  console.log('🔄 loadProjectData() called with projectId:', projectId);

  try {
    // Load questions from Supabase with proper question_mode
    const { default: supabase } = await import('../../lib/supa.js');

    console.log('📡 Querying questions from Supabase...');
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_id, question_text, question_mode, question_type')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Supabase query error:', error);
      return { id: projectId, questions: generateMockQuestions() };
    }

    console.log(`✅ Loaded ${questions?.length || 0} questions from Supabase`);

    if (questions && questions.length > 0) {
      // Load options for all questions
      const questionIds = questions.map(q => q.id);
      console.log('📡 Querying options for', questionIds.length, 'questions...');
      console.log('   Question IDs:', questionIds.slice(0, 5), '...');

      const { data: options, error: optionsError } = await supabase
        .from('question_options')
        .select('question_id, option_code, option_label, order_index')
        .in('question_id', questionIds)
        .order('order_index', { ascending: true });

      console.log(`✅ Received ${options?.length || 0} options from Supabase`);

      if (!optionsError && options && options.length > 0) {
        // Build options map: question_id -> array of options
        questionOptionsMap = {};
        console.log('🔄 Building questionOptionsMap...');

        options.forEach((opt, index) => {
          const question = questions.find(q => q.id === opt.question_id);
          const questionCode = question?.question_id;

          if (index < 3) {
            console.log(`   Option ${index}: question_id=${opt.question_id}, code=${opt.option_code}, label="${opt.option_label}"`);
            console.log(`   Mapped to questionCode: ${questionCode}`);
          }

          if (questionCode) {
            if (!questionOptionsMap[questionCode]) {
              questionOptionsMap[questionCode] = [];
            }
            questionOptionsMap[questionCode].push({
              code: opt.option_code,
              label: opt.option_label,
              orderIndex: opt.order_index
            });
          } else {
            console.warn(`❌ Could not find question for option:`, opt);
          }
        });

        console.log('✅ Loaded options for', Object.keys(questionOptionsMap).length, 'questions');
        console.log('📋 Question options map keys:', Object.keys(questionOptionsMap));
        console.log('📋 S7 options:', questionOptionsMap['S7']);
      } else if (optionsError) {
        console.error('❌ Error loading options:', optionsError);
      } else {
        console.warn('⚠️ No options returned from query');
      }

      // Map database question_mode to reporting types
      const mappedQuestions = questions.map(q => ({
        id: q.question_id,
        text: q.question_text,
        type: mapQuestionModeToReportType(q.question_mode || q.question_type),
        mode: q.question_mode,
        section: q.question_id?.startsWith('S') ? 'screener' : 'main',
        hasSubQuestions: isTableQuestion(q.question_mode)
      }));

      console.log('✅ Loaded', mappedQuestions.length, 'questions from Supabase');
      return { id: projectId, questions: mappedQuestions };
    }
  } catch (error) {
    console.warn('Could not load project data:', error);
  }

  // Fallback: return mock data based on SPSS structure
  return {
    id: projectId,
    questions: generateMockQuestions()
  };
}

// Map database question_mode to reporting visualization types
function mapQuestionModeToReportType(mode) {
  const typeMap = {
    // List questions
    'single': 'single',
    'multi': 'multi',

    // Numeric questions
    'numeric_simple': 'numeric',
    'numeric_dropdown': 'numeric',

    // Scale questions
    'likert': 'likert',
    'scale': 'likert',

    // Grid/Table questions
    'grid_single': 'likert_table',
    'grid_multi': 'likert_table',
    'table': 'table',
    'table_single': 'likert_table',
    'table_multi': 'likert_table',
    'advanced_table': 'likert_table',

    // Text questions
    'text': 'open',
    'open_end': 'open',
    'open': 'open',

    // Other types
    'ranking': 'ranking',
    'repeated': 'table'
  };

  return typeMap[mode] || 'single';
}

/**
 * Get human-readable option label from questionnaire data
 * PRIORITY: 1) Metadata file, 2) Database options, 3) Original ID
 *
 * @param {string} spssColumnId - SPSS column ID like "S7r1", "S7r2", or "S7"
 * @returns {string} - Human-readable label or original ID if not found
 */
function getOptionLabel(spssColumnId) {
  // FIRST: Try to get from metadata (single source of truth)
  if (spssData.metadata?.columnMappings) {
    const mapping = spssData.metadata.columnMappings[spssColumnId];
    if (mapping) {
      console.log(`✅ [METADATA] ${spssColumnId} → ${mapping.optionLabel}`);
      return mapping.optionLabel;
    }
  }

  // FALLBACK: Try database options (legacy support)
  const match = spssColumnId.match(/^([A-Z]\d+)r(\d+)$/);

  if (match) {
    // Multi-select format: S7r1, S7r2, etc.
    const questionId = match[1];
    const optionCode = match[2];

    console.log(`🔍 [DATABASE FALLBACK] Looking up ${spssColumnId}: questionId=${questionId}, optionCode=${optionCode}`);

    if (questionOptionsMap[questionId]) {
      const option = questionOptionsMap[questionId].find(opt =>
        String(opt.code) === String(optionCode)
      );

      if (option) {
        console.log(`✅ [DATABASE] Found match: ${option.label}`);
        return option.label;
      }
    }

    console.log(`⚠️ [NO MATCH] ${spssColumnId} not found in metadata or database`);
  }

  // Last resort: return original ID
  return spssColumnId;
}

function isTableQuestion(mode) {
  return ['grid_single', 'grid_multi', 'table', 'table_single', 'table_multi', 'advanced_table', 'repeated'].includes(mode);
}

function generateMockQuestions() {
  // Generate questions based on the SPSS column structure we analyzed
  return [
    // Screener Questions
    { id: 'S0', text: 'Consent to participate', type: 'single', section: 'screener' },
    { id: 'S1', text: 'What is your gender?', type: 'single', section: 'screener' },
    { id: 'S2', text: 'Health conditions', type: 'multi', section: 'screener' },
    { id: 'S3', text: 'Please enter your age', type: 'numeric', section: 'screener' },
    { id: 'S4', text: 'Contact lens experience', type: 'multi', section: 'screener' },
    { id: 'S5', text: 'Current contact lens type', type: 'multi', section: 'screener' },
    { id: 'S6', text: 'Type of contact lenses worn', type: 'single', section: 'screener' },
    { id: 'S7', text: 'Brand currently worn', type: 'multi', section: 'screener' },
    { id: 'S8', text: 'When did you first start wearing contact lenses?', type: 'single', section: 'screener' },
    { id: 'S9', text: 'Contact lens switching behavior', type: 'multi', section: 'screener' },

    // Main Questions
    { id: 'Q1', text: 'Hours per day wearing contact lenses', type: 'numeric', section: 'main' },
    { id: 'Q2', text: 'Overall satisfaction', type: 'likert', section: 'main' },
    { id: 'Q3', text: 'Agreement with product statements', type: 'likert_table', section: 'main' },
    { id: 'Q4', text: 'Likelihood to recommend', type: 'single', section: 'main' },
    { id: 'Q5', text: 'Open feedback', type: 'open', section: 'main' },
    { id: 'Q6', text: 'Product attribute ratings', type: 'likert_table', section: 'main' },
    { id: 'Q7', text: 'Usage situations that apply', type: 'multi', section: 'main' },
    { id: 'Q8', text: 'Purchase intent', type: 'likert', section: 'main' },
    { id: 'Q9', text: 'Value perception', type: 'likert', section: 'main' }
  ];
}

async function initializeReporting() {
  // Try to load saved data first
  const dataLoaded = await loadDataFromStorage();

  // File upload handlers
  const labelsFile = document.getElementById('labels-file');
  const codesFile = document.getElementById('codes-file');
  const metadataFile = document.getElementById('metadata-file');
  const processBtn = document.getElementById('process-data');

  labelsFile?.addEventListener('change', handleFileSelect);
  codesFile?.addEventListener('change', handleFileSelect);
  metadataFile?.addEventListener('change', handleMetadataSelect);
  processBtn?.addEventListener('click', processSpssData);

  // Clear cache handler
  const clearCacheBtn = document.getElementById('clear-cache');
  clearCacheBtn?.addEventListener('click', clearDataCache);

  // Question palette filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterQuestions(e.target.dataset.filter);
    });
  });

  // Cross-tab toggle
  const crosstabToggle = document.getElementById('enable-crosstab');
  crosstabToggle?.addEventListener('change', toggleCrosstab);

  // Chart customization controls
  setupChartCustomization();

  // Populate initial questions if project data is available
  if (currentProject?.questions) {
    populateQuestionPalette(currentProject.questions);
  }

  if (dataLoaded) {
    console.log('✅ Auto-loaded SPSS data from cache - no need to re-upload!');
    // Show clear cache button when data is loaded from cache
    const clearCacheBtn = document.getElementById('clear-cache');
    if (clearCacheBtn) {
      clearCacheBtn.style.display = 'inline-block';
    }
  }
}

function clearDataCache() {
  const projectId = window.ui_state?.active_project_id;
  if (projectId) {
    const storageKey = `spss_data_${projectId}`;
    localStorage.removeItem(storageKey);

    // Reset UI
    document.getElementById('labels-status').textContent = 'No file selected';
    document.getElementById('labels-status').className = 'upload-status';
    document.getElementById('codes-status').textContent = 'No file selected';
    document.getElementById('codes-status').className = 'upload-status';
    document.getElementById('process-data').disabled = true;
    document.getElementById('process-data').textContent = 'Process Data';
    document.getElementById('clear-cache').style.display = 'none';
    document.getElementById('data-summary').style.display = 'none';
    document.getElementById('reporting-main').style.display = 'none';

    // Reset data
    spssData.labels = null;
    spssData.codes = null;
    spssData.questions = null;
    spssData.loaded = false;

    console.log('Cache cleared - please upload new files');
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  const fileType = event.target.id === 'labels-file' ? 'labels' : 'codes';
  const statusEl = document.getElementById(`${fileType}-status`);

  if (file) {
    statusEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    statusEl.className = 'upload-status file-selected';

    // Read and store the file
    const reader = new FileReader();
    reader.onload = (e) => {
      spssData[fileType] = parseCSV(e.target.result);
      checkDataReady();
    };
    reader.readAsText(file);
  }
}

async function handleMetadataSelect(event) {
  const file = event.target.files[0];
  const statusEl = document.getElementById('metadata-status');

  if (file) {
    try {
      // Import the metadata parser
      const { parseMetadataFile } = await import('../../lib/spssMetadata.js');

      const metadata = await parseMetadataFile(file);
      spssData.metadata = metadata;

      statusEl.textContent = `${file.name} (${Object.keys(metadata.columnMappings).length} mappings)`;
      statusEl.className = 'upload-status file-selected';

      console.log('✅ Metadata loaded with', Object.keys(metadata.columnMappings).length, 'column mappings');

      // Save to localStorage for persistence
      saveDataToStorage();
    } catch (error) {
      statusEl.textContent = `❌ Error: ${error.message}`;
      statusEl.className = 'upload-status error';
      console.error('Failed to parse metadata:', error);
    }
  }
}

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());

  // Parse headers - handle quoted headers with commas
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : '';
    });
    data.push(row);
  }

  console.log(`📊 Parsed CSV: ${headers.length} columns, ${data.length} rows`);
  console.log(`📊 First 10 headers:`, headers.slice(0, 10));
  console.log(`📊 First row sample:`, data[0] ? Object.keys(data[0]).slice(0, 10).map(k => `${k}=${data[0][k]}`) : 'No data');

  return { headers, data, rowCount: data.length };
}

function parseCSVLine(line) {
  // Proper CSV parsing that handles quoted values with commas
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push the last value
  values.push(current.trim());

  return values;
}

function checkDataReady() {
  const processBtn = document.getElementById('process-data');
  if (spssData.labels && spssData.codes) {
    processBtn.disabled = false;
    processBtn.textContent = 'Process Data ✓';

    // Save data to localStorage for persistence
    saveDataToStorage();
  }
}

function saveDataToStorage() {
  const projectId = window.ui_state?.active_project_id;
  if (projectId && spssData.labels && spssData.codes) {
    const storageKey = `spss_data_${projectId}`;
    const dataToSave = {
      labels: spssData.labels,
      codes: spssData.codes,
      metadata: spssData.metadata, // Save metadata too
      timestamp: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log('SPSS data saved to localStorage (with metadata:', !!spssData.metadata, ')');
  }
}

async function loadDataFromStorage() {
  const projectId = window.ui_state?.active_project_id;
  if (projectId) {
    const storageKey = `spss_data_${projectId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Check if data is less than 24 hours old
        const isDataFresh = (Date.now() - parsedData.timestamp) < (24 * 60 * 60 * 1000);

        if (isDataFresh) {
          spssData.labels = parsedData.labels;
          spssData.codes = parsedData.codes;
          spssData.metadata = parsedData.metadata; // Restore metadata

          // Update UI to show data is loaded
          document.getElementById('labels-status').textContent = 'Loaded from cache';
          document.getElementById('labels-status').className = 'upload-status file-selected';
          document.getElementById('codes-status').textContent = 'Loaded from cache';
          document.getElementById('codes-status').className = 'upload-status file-selected';

          if (spssData.metadata) {
            document.getElementById('metadata-status').textContent = `Loaded from cache (${Object.keys(spssData.metadata.columnMappings).length} mappings)`;
            document.getElementById('metadata-status').className = 'upload-status file-selected';
          }

          // CRITICAL: Ensure project data (including options) is loaded BEFORE processing SPSS data
          if (!currentProject) {
            console.log('⏳ Waiting for project data to load before processing SPSS...');
            currentProject = await loadProjectData(projectId);
          }

          console.log('📊 questionOptionsMap before SPSS processing:', Object.keys(questionOptionsMap).length, 'questions');

          // Auto-process the data
          await processSpssData();

          console.log('SPSS data loaded from localStorage');
          return true;
        }
      } catch (error) {
        console.warn('Error loading cached data:', error);
      }
    }
  }
  return false;
}

async function processSpssData() {
  if (!spssData.labels || !spssData.codes) return;

  // Validate metadata against SPSS data if metadata exists
  if (spssData.metadata) {
    const { validateSpssData } = await import('../../lib/spssMetadata.js');
    const validation = validateSpssData(spssData.labels.headers, spssData.metadata);

    console.log('📋 Metadata validation:', validation);

    if (validation.warnings.length > 0) {
      console.warn('⚠️ Metadata warnings:', validation.warnings);
    }

    if (!validation.valid) {
      console.error('❌ Metadata validation failed:', validation.errors);
      alert('Metadata validation failed. Check console for details.');
      return;
    }
  } else {
    console.warn('⚠️ No metadata file provided - using database fallback for labels');
  }

  // Update summary stats
  document.getElementById('response-count').textContent = spssData.labels.rowCount;
  document.getElementById('question-count').textContent =
    spssData.labels.headers.filter(h => h.startsWith('S') || h.startsWith('Q')).length;
  document.getElementById('data-status').textContent = 'Loaded';

  // Show summary and main interface
  document.getElementById('data-summary').style.display = 'block';
  document.getElementById('reporting-main').style.display = 'flex';

  // Extract questions from SPSS headers and populate palette
  const questions = extractQuestionsFromSpss();

  // CRITICAL: Set spssData.questions BEFORE calling populateBannerPalette
  spssData.questions = questions;
  spssData.loaded = true;

  // Load banners from database
  await loadBanners();

  // Now populate palettes (they rely on spssData.questions and bannerHierarchy)
  populateQuestionPalette(questions);
  populateBannerPalette();

  console.log('SPSS data processed successfully:', spssData);
}

function extractQuestionsFromSpss() {
  const questionHeaders = spssData.labels.headers.filter(h =>
    h.match(/^[SQ]\d+$/) || h.match(/^[SQ]\d+r\d+$/)
  );

  const questions = [];
  const questionIds = new Set();

  questionHeaders.forEach(header => {
    const baseId = header.replace(/r\d+$/, ''); // Remove r1, r2, etc.
    if (!questionIds.has(baseId)) {
      questionIds.add(baseId);

      // Determine question type based on data patterns
      const sampleData = spssData.labels.data.slice(0, 10).map(row => row[header]);
      const type = detectQuestionType(header, sampleData);

      questions.push({
        id: baseId,
        text: generateQuestionText(baseId),
        type: type,
        section: baseId.startsWith('S') ? 'screener' : 'main',
        hasSubQuestions: questionHeaders.some(h => h.startsWith(baseId + 'r'))
      });
    }
  });

  return questions.sort((a, b) => {
    if (a.section !== b.section) {
      return a.section === 'screener' ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });
}

function detectQuestionType(header, sampleData) {
  // Enhanced type detection for SPSS data

  // 1. Check if it's a table/grid question (has r1, r2, etc.)
  if (header.match(/^[SQ]\d+r\d+$/)) return 'likert_table';

  // 2. Check if it's a Likert scale (common patterns)
  const likertPatterns = [
    'Strongly agree', 'Agree', 'Neither', 'Disagree', 'Strongly disagree',
    'Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied',
    'Definitely would', 'Probably would', 'Might or might not', 'Probably would not', 'Definitely would not',
    'Extremely', 'Very', 'Moderately', 'Slightly', 'Not at all'
  ];
  const hasLikertValues = sampleData.some(val =>
    likertPatterns.some(pattern => val && val.toString().includes(pattern))
  );
  if (hasLikertValues) return 'likert';

  // 3. Check if numeric (all non-empty values are numbers)
  const numericValues = sampleData.filter(val => val !== null && val !== '' && val !== undefined);
  const isNumeric = numericValues.length > 0 && numericValues.every(val => !isNaN(parseFloat(val)));
  if (isNumeric) return 'numeric';

  // 4. Check if multi-select (has multiple 1s/0s or comma-separated values)
  const hasMultiPattern = sampleData.some(val => {
    if (!val) return false;
    const str = val.toString();
    // Check for comma-separated values
    if (str.includes(',') && str.split(',').length > 1) return true;
    // Check for multiple selections indicated by semicolons
    if (str.includes(';') && str.split(';').length > 1) return true;
    return false;
  });
  if (hasMultiPattern) return 'multi';

  // 5. Check if open-ended (long text responses)
  const hasLongText = sampleData.some(val => val && val.toString().length > 50);
  if (hasLongText) return 'open';

  // 6. Check unique value count to determine single vs multi
  const uniqueValues = new Set(sampleData.filter(val => val !== null && val !== ''));

  // If very few unique values (2-10), likely single choice
  if (uniqueValues.size >= 2 && uniqueValues.size <= 10) return 'single';

  // If many unique values but short text, likely single with many options
  if (uniqueValues.size > 10 && uniqueValues.size < 30) return 'single';

  // Default to single choice
  return 'single';
}

function generateQuestionText(questionId) {
  // Map known question IDs to descriptive text
  const questionMap = {
    'S0': 'Consent to participate',
    'S1': 'Gender',
    'S2': 'Health conditions',
    'S3': 'Age',
    'S4': 'Contact lens experience',
    'S5': 'Current contact lens type',
    'S6': 'Type of contact lenses worn',
    'S7': 'Brand currently worn',
    'S8': 'When first started wearing contacts',
    'S9': 'Contact lens switching behavior',
    'Q1': 'Hours per day wearing contact lenses',
    'Q2': 'Overall satisfaction',
    'Q3': 'Agreement with product statements',
    'Q4': 'Likelihood to recommend',
    'Q5': 'Open feedback',
    'Q6': 'Product attribute ratings',
    'Q7': 'Usage situations that apply',
    'Q8': 'Purchase intent',
    'Q9': 'Value perception'
  };

  return questionMap[questionId] || `Question ${questionId}`;
}

function populateQuestionPalette(questions) {
  const questionList = document.getElementById('question-list');
  if (!questionList || !questions) return;

  questionList.innerHTML = questions.map(q => `
    <div class="question-item draggable"
         draggable="true"
         data-question-id="${q.id}"
         data-question-type="${q.type}"
         data-question-mode="${q.mode || ''}"
         data-section="${q.section}">
      <div class="question-header">
        <span class="question-id">${q.id}</span>
        <span class="question-type-badge ${q.type}" title="${getTypeLabel(q.type)} - ${q.mode || q.type}">
          ${getTypeLabel(q.type)}
        </span>
      </div>
      <div class="question-text">${q.text}</div>
      <div class="question-meta">
        ${q.hasSubQuestions ? '<span class="sub-questions">Multi-part</span>' : ''}
        ${q.mode ? `<span class="mode-badge">${q.mode}</span>` : ''}
        <span class="section-badge ${q.section}">${q.section}</span>
      </div>
    </div>
  `).join('');

  // Add drag and drop handlers
  questionList.querySelectorAll('.draggable').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('click', handleQuestionClick);
  });

  // Add drop zone to canvas
  const canvas = document.getElementById('chart-container');
  canvas.addEventListener('dragover', handleDragOver);
  canvas.addEventListener('drop', handleDrop);
}

// Icon function removed - using CSS-based type badges instead

function getTypeLabel(type) {
  const labels = {
    'single': 'Single',
    'multi': 'Multi',
    'likert': 'Scale',
    'table': 'Table',
    'numeric': 'Numeric',
    'open': 'Text',
    'likert_table': 'Grid',
    'ranking': 'Ranking'
  };
  return labels[type] || 'Unknown';
}

async function loadBanners() {
  const projectId = window.ui_state?.active_project_id;
  if (!projectId) {
    console.warn('No project ID available for loading banners');
    return;
  }

  try {
    // Import banner manager
    const { default: bannerManager } = await import('../../services/bannerManager.js');

    console.log('🔄 Loading banners for project:', projectId);

    // Load banner definitions for this project
    const bannersResult = await bannerManager.getBannerDefinitions(projectId);

    console.log('📦 Banner query result:', {
      success: bannersResult.success,
      dataLength: bannersResult.data?.length || 0,
      error: bannersResult.error
    });

    if (bannersResult.success && bannersResult.data.length > 0) {
      const currentBanner = bannersResult.data[0];
      console.log('✅ Loaded banner for reporting:', currentBanner.name || currentBanner.banner_name);
      console.log('   Full banner data:', currentBanner);

      // Use nested banner_groups data (already loaded by getBannerDefinitions)
      const bannerGroups = currentBanner.banner_groups || [];
      console.log('📊 Banner groups found:', bannerGroups.length);
      console.log('   Raw groups data:', bannerGroups);

      // Map to our banner hierarchy structure
      bannerHierarchy = bannerGroups.map(group => {
        const h2Columns = (group.banner_columns || []).map(col => ({
          id: col.id,
          name: col.name,
          questionId: col.question_id,
          logicEquation: col.logic_equation || `${col.question_id}=1`
        }));

        console.log(`   Group "${group.name}": ${h2Columns.length} H2 columns`);

        return {
          id: group.id,
          name: group.name,
          h2Columns: h2Columns
        };
      });

      console.log(`✅ Loaded ${bannerHierarchy.length} H1 groups with ${bannerHierarchy.reduce((sum, h1) => sum + h1.h2Columns.length, 0)} H2 columns`);
    } else {
      console.warn('No banners found for this project');
      bannerHierarchy = [];
    }
  } catch (error) {
    console.error('Error loading banners:', error);
    bannerHierarchy = [];
  }
}

function populateBannerPalette() {
  const bannerList = document.getElementById('banner-list');
  if (!bannerList) return;

  // Check if we have banner hierarchy loaded
  if (bannerHierarchy.length === 0) {
    bannerList.innerHTML = `
      <div class="empty-state">
        <p style="color: #666; padding: 20px; text-align: center;">
          No banner options available.<br>
          <small>Create banners in the Banner Builder tab.</small>
        </p>
      </div>
    `;
    return;
  }

  // Always show "Total" as first option
  let bannerHTML = `
    <div class="banner-item" data-banner-equation="" data-banner-name="Total">
      <div class="banner-info">
        <span class="banner-text">Total</span>
        <span class="banner-id">All respondents</span>
      </div>
    </div>
  `;

  // Add all H2 columns from all H1 groups
  bannerHierarchy.forEach(h1Group => {
    h1Group.h2Columns.forEach(h2Col => {
      bannerHTML += `
        <div class="banner-item" data-banner-equation="${h2Col.logicEquation}" data-banner-name="${h2Col.name}">
          <div class="banner-info">
            <span class="banner-text">${h2Col.name}</span>
            <span class="banner-id">${h2Col.logicEquation}</span>
          </div>
        </div>
      `;
    });
  });

  bannerList.innerHTML = bannerHTML;

  bannerList.querySelectorAll('.banner-item').forEach(item => {
    item.addEventListener('click', handleBannerSelect);
  });
}

// Icon function removed - using CSS-based styling instead

function handleDragStart(e) {
  draggedQuestion = {
    id: e.target.dataset.questionId,
    type: e.target.dataset.questionType,
    mode: e.target.dataset.questionMode,
    section: e.target.dataset.section
  };
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  if (draggedQuestion) {
    generateChart(draggedQuestion);
    draggedQuestion = null;
  }
}

function handleQuestionClick(e) {
  const questionId = e.currentTarget.dataset.questionId;
  const questionType = e.currentTarget.dataset.questionType;
  const questionMode = e.currentTarget.dataset.questionMode;
  const questionData = {
    id: questionId,
    type: questionType,
    mode: questionMode
  };

  generateChart(questionData);
}

function generateChart(questionData) {
  if (!spssData.loaded) return;

  // Store for regeneration
  currentQuestionData = questionData;

  const chartContainer = document.getElementById('chart-container');
  const customization = document.getElementById('chart-customization');

  // Show customization panel
  customization.style.display = 'block';

  // Generate chart based on question type
  const chartConfig = getChartConfig(questionData);
  const chartHtml = createChartVisualization(questionData, chartConfig);

  chartContainer.innerHTML = chartHtml;

  console.log('Generated chart for question:', questionData);
}

function getChartConfig(questionData) {
  const theme = document.getElementById('chart-theme')?.value || 'cue-brand';
  const primaryColor = document.getElementById('primary-color')?.value || '#212161';
  const secondaryColor = document.getElementById('secondary-color')?.value || '#F2B800';

  return {
    theme,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: document.getElementById('accent-color')?.value || '#3F6AB7'
    },
    showValues: document.getElementById('show-values')?.checked ?? true,
    showPercentages: document.getElementById('show-percentages')?.checked ?? true,
    showLegend: document.getElementById('show-legend')?.checked ?? true,
    title: document.getElementById('chart-title')?.value || `Chart for ${questionData.id}`
  };
}

function parseEquation(equation) {
  // Parse equations like "S7=2", "S7=10 AND S1=1", "Q1>5", "S7=2 AND Q1 BETWEEN 1 AND 9"
  const parts = [];

  // Split by AND/OR (case insensitive)
  const conditions = equation.split(/\s+(AND|OR)\s+/i);

  for (let i = 0; i < conditions.length; i += 2) {
    const condition = conditions[i].trim();
    const operator = conditions[i + 1]; // AND or OR

    // Parse individual condition like "S7=2" or "Q1>5"
    const match = condition.match(/^([A-Z]\d+)\s*(=|!=|>|<|>=|<=)\s*(.+)$/i);
    if (match) {
      parts.push({
        questionId: match[1],
        operator: match[2],
        value: match[3].trim(),
        logicalOperator: operator || null
      });
    }
  }

  return parts;
}

function filterDataByEquation(data, equation) {
  if (!equation || equation.trim() === '') {
    return data; // No filter = return all data
  }

  const conditions = parseEquation(equation);
  console.log(`🔍 Filtering ${data.length} rows by equation: ${equation}`, conditions);

  // Debug: Show first row's values for the questions we're filtering on
  if (data.length > 0) {
    const firstRow = data[0];
    conditions.forEach(cond => {
      console.log(`   ${cond.questionId} in first row:`, firstRow[cond.questionId], `(looking for ${cond.operator} ${cond.value})`);

      // Check for multi-select column too
      const multiSelectColumn = `${cond.questionId}r${cond.value}`;
      if (firstRow[multiSelectColumn] !== undefined) {
        console.log(`   ${multiSelectColumn} in first row:`, firstRow[multiSelectColumn]);
      }
    });

    // Show all S7 columns and their values
    const s7Columns = Object.keys(firstRow).filter(k => k.startsWith('S7'));
    console.log(`   All S7 columns in first row:`, s7Columns.map(col => `${col}=${firstRow[col]}`));

    // Count how many rows have S7r2=Yes
    const s7r2YesCount = data.filter(row => row['S7r2'] === 'Yes').length;
    console.log(`   Total rows with S7r2=Yes: ${s7r2YesCount} out of ${data.length}`);
  }

  const filtered = data.filter((row, index) => {
    let result = true;

    for (let i = 0; i < conditions.length; i++) {
      const cond = conditions[i];
      let rowValue = row[cond.questionId];
      let conditionMet = false;

      // Check if this is a multi-select question (e.g., S7=2 should check S7r2=Yes)
      const multiSelectColumn = `${cond.questionId}r${cond.value}`;
      const hasMultiSelectColumn = Object.keys(row).includes(multiSelectColumn);

      if (hasMultiSelectColumn && cond.operator === '=') {
        // This is a multi-select question - check if the specific option is selected
        rowValue = row[multiSelectColumn];

        // Debug first few rows
        if (index < 3) {
          console.log(`   Row ${index} ${multiSelectColumn}:`, rowValue, `(multi-select check)`);
          console.log(`   Checking: "${rowValue}" === "Yes"? ${rowValue === 'Yes'}`);
          console.log(`   Type of rowValue:`, typeof rowValue);
        }

        // For multi-select, "Yes" means selected
        conditionMet = (rowValue === 'Yes' || rowValue === 'yes' || rowValue === 'YES' || rowValue === '1' || rowValue === 1);

        if (index < 3) {
          console.log(`   conditionMet:`, conditionMet);
        }
      } else {
        // Regular question - check direct value
        if (index < 3) {
          console.log(`   Row ${index} ${cond.questionId}:`, rowValue, `comparing to ${cond.value}`);
        }

        // Convert values to numbers if possible, and trim strings
        const cleanRowValue = typeof rowValue === 'string' ? rowValue.trim() : rowValue;
        const cleanCondValue = typeof cond.value === 'string' ? cond.value.trim() : cond.value;
        const numRowValue = parseFloat(cleanRowValue);
        const numCondValue = parseFloat(cleanCondValue);

        switch (cond.operator) {
          case '=':
          case '==':
            // Try exact match, numeric match, and string match
            conditionMet = (cleanRowValue == cleanCondValue) ||
                          (numRowValue == numCondValue) ||
                          (String(cleanRowValue) === String(cleanCondValue));
            break;
        case '!=':
          conditionMet = (cleanRowValue != cleanCondValue) && (numRowValue != numCondValue);
          break;
        case '>':
          conditionMet = !isNaN(numRowValue) && !isNaN(numCondValue) && numRowValue > numCondValue;
          break;
        case '<':
          conditionMet = !isNaN(numRowValue) && !isNaN(numCondValue) && numRowValue < numCondValue;
          break;
        case '>=':
          conditionMet = !isNaN(numRowValue) && !isNaN(numCondValue) && numRowValue >= numCondValue;
          break;
        case '<=':
          conditionMet = !isNaN(numRowValue) && !isNaN(numCondValue) && numRowValue <= numCondValue;
          break;
        }
      }

      // Apply logical operator
      if (i === 0) {
        result = conditionMet;
      } else {
        const prevOperator = conditions[i - 1].logicalOperator;
        if (prevOperator && prevOperator.toUpperCase() === 'AND') {
          result = result && conditionMet;
        } else if (prevOperator && prevOperator.toUpperCase() === 'OR') {
          result = result || conditionMet;
        }
      }
    }

    return result;
  });

  console.log(`✅ Filtered to ${filtered.length} rows`);
  return filtered;
}

function createChartVisualization(questionData, config) {
  // Use ALL responses for accurate charts
  const questionId = questionData.id;
  let allData = spssData.labels.data; // Start with all 270 responses

  // Apply banner filters if any
  if (activeBannerFilters.length > 0) {
    for (const equation of activeBannerFilters) {
      allData = filterDataByEquation(allData, equation);
    }
  }

  console.log(`📊 Generating chart for ${questionId} (type: ${questionData.type}, mode: ${questionData.mode}) with ${allData.length} responses (filtered: ${activeBannerFilters.length > 0})`);

  // Check if question exists in SPSS data
  const questionExists = spssData.labels.headers.includes(questionId);
  console.log(`   Question ${questionId} exists in SPSS: ${questionExists}`);

  if (!questionExists) {
    // Check for sub-questions
    const subQuestions = findSubQuestions(questionId);
    console.log(`   Found ${subQuestions.length} sub-questions:`, subQuestions);
  }

  // Check if this is a multi-part grid/table question (like Q6 with Q6r1, Q6r2, etc.)
  const isGridQuestion = questionData.type === 'likert_table' ||
                         questionData.mode === 'advanced_table' ||
                         questionData.mode === 'grid_single' ||
                         questionData.mode === 'grid_multi' ||
                         questionData.mode === 'table_single' ||
                         questionData.mode === 'table_multi';

  console.log(`   Is grid question: ${isGridQuestion}`);

  // Check for sub-questions FIRST - this overrides database mode
  const subQuestions = findSubQuestions(questionId);
  console.log(`   Sub-questions found: ${subQuestions.length}`);

  if (isGridQuestion && subQuestions.length > 0) {
    // Generate SEPARATE charts for each statement/row
    return createSeparateGridCharts(questionId, subQuestions, allData, config);
  } else if (subQuestions.length > 0) {
    // Has sub-questions but not a grid = multi-select question
    console.log(`   ✅ Detected as multi-select (has ${subQuestions.length} sub-questions)`);
    return createMultiSelectChart(questionId, subQuestions, allData, config);
  } else if (questionData.type === 'multi') {
    // Multi-select question but no sub-questions in SPSS data (fallback)
    console.warn(`⚠️ Multi-select question ${questionId} has no sub-questions in SPSS data`);
    return createBarChart(questionId, allData, config);
  } else if (questionData.type === 'likert' || questionData.mode === 'likert') {
    // Single likert/scale question (not a grid)
    console.log(`   Creating single likert chart for ${questionId}`);
    return createLikertChart(questionId, allData, config);
  } else if (questionData.type === 'numeric') {
    console.log(`   Creating numeric chart for ${questionId}`);
    return createNumericChart(questionId, allData, config);
  } else if (questionData.type === 'single') {
    console.log(`   Creating bar chart for ${questionId}`);
    return createBarChart(questionId, allData, config);
  } else {
    console.log(`   Creating generic chart for ${questionId}`);
    return createGenericChart(questionId, allData, config);
  }
}

function findSubQuestions(baseQuestionId) {
  // Find all sub-questions like Q3r1, Q3r2, Q3r3, etc.
  if (!spssData.labels?.headers) return [];

  const subQuestions = spssData.labels.headers.filter(header =>
    header.startsWith(baseQuestionId + 'r') && header.match(/^[A-Z]\d+r\d+$/)
  );

  // Sort numerically by row number (Q6r1, Q6r2, Q6r10 -> correct order)
  return subQuestions.sort((a, b) => {
    const numA = parseInt(a.match(/r(\d+)$/)?.[1] || '0');
    const numB = parseInt(b.match(/r(\d+)$/)?.[1] || '0');
    return numA - numB;
  });
}

function createSeparateGridCharts(baseQuestionId, subQuestions, data, config) {
  // Create individual charts for each statement in a grid question
  console.log(`📋 Creating ${subQuestions.length} separate charts for ${baseQuestionId}`);

  const charts = subQuestions.map(subQid => {
    // Get statement text
    const statementText = getStatementText(subQid);

    // Count responses for this statement
    const responses = {};
    let responseCount = 0;
    let hasLongText = false;
    let uniqueResponseCount = 0;

    data.forEach(row => {
      const value = row[subQid];
      if (value && value.trim() !== '') {
        // Check if this is open-ended text (long responses or very unique values)
        if (value.length > 50) {
          hasLongText = true;
        }
        responses[value] = (responses[value] || 0) + 1;
        responseCount++;
      }
    });

    uniqueResponseCount = Object.keys(responses).length;
    const total = responseCount;

    // Skip this question if it appears to be open-ended text
    // (many unique responses or long text responses)
    if (hasLongText || uniqueResponseCount > 20) {
      console.log(`⚠️ Skipping ${subQid} - appears to be open-ended text (${uniqueResponseCount} unique responses)`);
      return `
        <div class="statement-chart" style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #FFC107;">
          <div class="statement-header">
            <h4 style="margin: 0 0 10px 0; color: #212161; font-size: 16px;">${statementText}</h4>
            <small style="color: #666;">${subQid} • Open-ended responses (${total} total)</small>
          </div>
          <p style="color: #666; margin: 10px 0 0 0;">
            This appears to be an open-ended text question. Use text analysis tools to view responses.
          </p>
        </div>
      `;
    }

    // Calculate T2B and B2B
    const topBoxKeys = [
      'Strongly agree', 'Agree', 'Somewhat agree',
      'Extremely satisfied', 'Very satisfied', 'Satisfied',
      'Definitely would', 'Probably would',
      'Extremely', 'Very'
    ];
    const t2b = topBoxKeys.reduce((sum, key) => sum + (responses[key] || 0), 0);
    const t2bPercent = total > 0 ? Math.round((t2b / total) * 100) : 0;

    const bottomBoxKeys = [
      'Strongly disagree', 'Disagree', 'Somewhat disagree',
      'Extremely dissatisfied', 'Very dissatisfied', 'Dissatisfied',
      'Definitely would not', 'Probably would not',
      'Slightly', 'Not at all'
    ];
    const b2b = bottomBoxKeys.reduce((sum, key) => sum + (responses[key] || 0), 0);
    const b2bPercent = total > 0 ? Math.round((b2b / total) * 100) : 0;

    // Generate individual likert bar chart for this statement
    return `
      <div class="statement-chart" style="margin-bottom: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div class="statement-header" style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #212161; font-size: 16px;">${statementText}</h4>
              <small style="color: #666;">${subQid} • Base: ${total} responses</small>
            </div>
            <div style="display: flex; gap: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #F2B800;">${b2bPercent}%</div>
                <div style="font-size: 12px; color: #666;">B2B</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #3F6AB7;">${t2bPercent}%</div>
                <div style="font-size: 12px; color: #666;">T2B</div>
              </div>
            </div>
          </div>
        </div>
        <div class="likert-bar-container" style="display: flex; height: 40px; border-radius: 4px; overflow: hidden;">
          ${createLikertBarsInline(responses, total)}
        </div>
        <div class="response-breakdown" style="margin-top: 10px; font-size: 12px; color: #666;">
          ${Object.entries(responses).map(([label, count]) =>
            `<span style="margin-right: 15px;">${label}: ${count} (${Math.round((count/total)*100)}%)</span>`
          ).join('')}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="separate-charts-container">
      <div class="chart-header" style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0; color: #212161;">${generateQuestionText(baseQuestionId)}</h3>
        <p style="margin: 5px 0 0 0; color: #666;">Each statement shown as separate chart</p>
      </div>
      ${charts}
    </div>
  `;
}

function createLikertBarsInline(responses, total) {
  // Similar to createLikertBars but for inline display
  const allScales = Object.keys(responses);

  const scaleOrderMap = {
    'Strongly agree': 1, 'Agree': 2, 'Somewhat agree': 2.5, 'Neither agree nor disagree': 3, 'Neither': 3,
    'Somewhat disagree': 3.5, 'Disagree': 4, 'Strongly disagree': 5,
    'Extremely satisfied': 1, 'Very satisfied': 2, 'Satisfied': 2.5, 'Neutral': 3,
    'Dissatisfied': 4, 'Very dissatisfied': 4.5, 'Extremely dissatisfied': 5,
    'Definitely would': 1, 'Probably would': 2, 'Might or might not': 3,
    'Probably would not': 4, 'Definitely would not': 5,
    'Extremely': 1, 'Very': 2, 'Moderately': 3, 'Slightly': 4, 'Not at all': 5
  };

  const sortedScales = allScales.sort((a, b) => {
    const orderA = scaleOrderMap[a] || 99;
    const orderB = scaleOrderMap[b] || 99;
    return orderA - orderB;
  });

  const colorMap = {
    'Strongly agree': '#2E7D32', 'Agree': '#66BB6A', 'Somewhat agree': '#81C784',
    'Neither': '#FDD835', 'Neither agree nor disagree': '#FDD835', 'Neutral': '#FDD835',
    'Disagree': '#FF7043', 'Somewhat disagree': '#EF5350', 'Strongly disagree': '#C62828',
    'Extremely satisfied': '#2E7D32', 'Very satisfied': '#66BB6A', 'Satisfied': '#81C784',
    'Dissatisfied': '#FF7043', 'Very dissatisfied': '#EF5350', 'Extremely dissatisfied': '#C62828',
    'Definitely would': '#2E7D32', 'Probably would': '#66BB6A',
    'Might or might not': '#FDD835',
    'Probably would not': '#FF7043', 'Definitely would not': '#C62828'
  };

  return sortedScales.map(scale => {
    const count = responses[scale] || 0;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    const color = colorMap[scale] || '#BDBDBD';

    if (percent === 0) return '';

    return `
      <div style="
        width: ${percent}%;
        background-color: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      ">
        ${percent >= 8 ? `${percent}%` : ''}
      </div>
    `;
  }).join('');
}

function createMultiLikertChart(baseQuestionId, subQuestions, data, config) {
  // Create a chart for multi-part Likert questions like Q3r1, Q3r2, Q3r3
  const statements = {};
  const baseCount = data.length;

  // Process each sub-question
  subQuestions.forEach(subQid => {
    const statementData = {};
    let responseCount = 0;

    // Get statement text from codes data
    const statementText = getStatementText(subQid);

    // Count responses for this statement
    data.forEach(row => {
      const value = row[subQid];
      if (value && value.trim() !== '') {
        statementData[value] = (statementData[value] || 0) + 1;
        responseCount++;
      }
    });

    if (responseCount > 0) {
      statements[subQid] = {
        text: statementText,
        data: statementData,
        count: responseCount
      };
    }
  });

  // Calculate T2B and B2B for each statement
  const processedStatements = Object.entries(statements).map(([qid, statement]) => {
    const total = statement.count;
    const responses = statement.data;

    // Dynamically detect T2B (Top 2 Box) - look for positive responses
    const topBoxKeys = [
      'Strongly agree', 'Agree', 'Somewhat agree',
      'Extremely satisfied', 'Very satisfied', 'Satisfied',
      'Definitely would', 'Probably would',
      'Extremely', 'Very'
    ];
    const t2b = topBoxKeys.reduce((sum, key) => sum + (responses[key] || 0), 0);
    const t2bPercent = total > 0 ? Math.round((t2b / total) * 100) : 0;

    // Dynamically detect B2B (Bottom 2 Box) - look for negative responses
    const bottomBoxKeys = [
      'Strongly disagree', 'Disagree', 'Somewhat disagree',
      'Extremely dissatisfied', 'Very dissatisfied', 'Dissatisfied',
      'Definitely would not', 'Probably would not',
      'Slightly', 'Not at all'
    ];
    const b2b = bottomBoxKeys.reduce((sum, key) => sum + (responses[key] || 0), 0);
    const b2bPercent = total > 0 ? Math.round((b2b / total) * 100) : 0;

    return {
      id: qid,
      text: statement.text,
      total: total,
      t2b: t2bPercent,
      b2b: b2bPercent,
      responses: responses
    };
  }).sort((a, b) => {
    // Sort by row number (Q6r1, Q6r2, Q6r3...) not by T2B
    const numA = parseInt(a.id.match(/r(\d+)$/)?.[1] || '0');
    const numB = parseInt(b.id.match(/r(\d+)$/)?.[1] || '0');
    return numA - numB;
  });

  const totalResponses = Math.max(...Object.values(statements).map(s => s.count));

  return `
    <div class="chart-container multi-likert">
      <div class="chart-header">
        <h3>${generateQuestionText(baseQuestionId)}</h3>
        <div class="chart-subtitle">Claims</div>
      </div>
      <div class="likert-statements">
        <div class="statement-header">
          <div class="statement-header-cell"></div>
          <div class="statement-header-cell"></div>
          <div class="statement-header-cell b2b-header">B2B</div>
          <div class="statement-header-cell t2b-header">T2B</div>
        </div>
        ${processedStatements.map(statement => `
          <div class="statement-row">
            <div class="statement-cell statement-text">${statement.text}</div>
            <div class="statement-cell statement-chart">
              <div class="likert-scale">
                ${createLikertBars(statement.responses, statement.total)}
              </div>
            </div>
            <div class="statement-metrics b2b-cell">${statement.b2b}%</div>
            <div class="statement-metrics t2b-cell">${statement.t2b}%</div>
          </div>
        `).join('')}
      </div>
      <div class="chart-legend">
        <div class="legend-item strongly-agree">Strongly agree</div>
        <div class="legend-item agree">Agree</div>
        <div class="legend-item neither">Neither agree nor disagree</div>
        <div class="legend-item disagree">Disagree</div>
        <div class="legend-item strongly-disagree">Strongly disagree</div>
      </div>
    </div>
  `;
}

function getStatementText(questionId) {
  // First, try to get the label from the questionnaire options
  const optionLabel = getOptionLabel(questionId);
  if (optionLabel !== questionId) {
    return optionLabel;
  }

  // Fallback: Extract statement text from SPSS codes data
  if (spssData.codes?.data) {
    const codeRow = spssData.codes.data.find(row => row[spssData.codes.headers[0]] === questionId);
    if (codeRow && spssData.codes.headers[1]) {
      return codeRow[spssData.codes.headers[1]] || questionId;
    }
  }

  // Final fallback: return the questionId as-is
  return questionId;
}

function createLikertBars(responses, total) {
  // Dynamically detect all scale options from actual data
  const allScales = Object.keys(responses);

  // Try to order them intelligently (positive to negative)
  const scaleOrderMap = {
    'Strongly agree': 1, 'Agree': 2, 'Somewhat agree': 2.5, 'Neither agree nor disagree': 3, 'Neither': 3,
    'Somewhat disagree': 3.5, 'Disagree': 4, 'Strongly disagree': 5,
    'Extremely satisfied': 1, 'Very satisfied': 2, 'Satisfied': 2.5, 'Neutral': 3,
    'Dissatisfied': 4, 'Very dissatisfied': 4.5, 'Extremely dissatisfied': 5,
    'Definitely would': 1, 'Probably would': 2, 'Might or might not': 3,
    'Probably would not': 4, 'Definitely would not': 5,
    'Extremely': 1, 'Very': 2, 'Moderately': 3, 'Slightly': 4, 'Not at all': 5
  };

  const sortedScales = allScales.sort((a, b) => {
    const orderA = scaleOrderMap[a] || 99;
    const orderB = scaleOrderMap[b] || 99;
    return orderA - orderB;
  });

  const scaleClassMap = {
    'Strongly agree': 'strongly-agree', 'Agree': 'agree', 'Somewhat agree': 'agree',
    'Neither': 'neither', 'Neither agree nor disagree': 'neither', 'Neutral': 'neither',
    'Disagree': 'disagree', 'Somewhat disagree': 'disagree', 'Strongly disagree': 'strongly-disagree'
  };

  return sortedScales.map(scale => {
    const count = responses[scale] || 0;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    const scaleClass = scaleClassMap[scale] || 'neutral';

    return `
      <div class="likert-bar ${scaleClass}" style="width: ${percent}%;">
        <span class="bar-label">${percent > 8 ? percent + '%' : ''}</span>
      </div>
    `;
  }).join('');
}

function createLikertChart(questionId, data, config) {
  // Define standard Likert scale options (in order)
  const standardScales = {
    'agreement': ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree'],
    'satisfaction': ['Extremely satisfied', 'Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied', 'Extremely dissatisfied'],
    'likelihood': ['Definitely would', 'Probably would', 'Might or might not', 'Probably would not', 'Definitely would not'],
    'intensity': ['Extremely', 'Very', 'Moderately', 'Slightly', 'Not at all']
  };

  // Count actual responses
  const actualResponses = {};
  data.forEach(row => {
    const value = row[questionId];
    if (value) {
      actualResponses[value] = (actualResponses[value] || 0) + 1;
    }
  });

  // Detect which scale type is being used
  const allLabels = Object.keys(actualResponses);
  let scaleType = 'agreement'; // default
  let orderedLabels = [];

  for (const [type, labels] of Object.entries(standardScales)) {
    if (allLabels.some(label => labels.includes(label))) {
      scaleType = type;
      orderedLabels = labels;
      break;
    }
  }

  // Initialize responses with all scale points (even if 0)
  const responses = {};
  orderedLabels.forEach(label => {
    responses[label] = actualResponses[label] || 0;
  });

  // If no standard scale detected, use actual data order
  if (orderedLabels.length === 0) {
    Object.assign(responses, actualResponses);
  }

  const total = Object.values(responses).reduce((a, b) => a + b, 0);

  // Get color for each scale point
  const getBarColor = (label) => {
    const positiveLabels = ['Strongly agree', 'Agree', 'Extremely satisfied', 'Very satisfied', 'Satisfied', 'Definitely would', 'Probably would', 'Extremely', 'Very'];
    const neutralLabels = ['Neither agree nor disagree', 'Neutral', 'Might or might not', 'Moderately', 'Neither'];
    const negativeLabels = ['Disagree', 'Strongly disagree', 'Dissatisfied', 'Very dissatisfied', 'Extremely dissatisfied', 'Probably would not', 'Definitely would not', 'Slightly', 'Not at all'];

    if (positiveLabels.includes(label)) return '#66BB6A';
    if (neutralLabels.includes(label)) return '#FDD835';
    if (negativeLabels.includes(label)) return '#EF5350';
    return config.colors.primary;
  };

  return `
    <div class="chart-visualization likert-chart">
      <div class="chart-title">${config.title}</div>
      <div class="chart-content">
        <div class="likert-bars">
          ${Object.entries(responses).map(([label, count]) => {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const barColor = getBarColor(label);
            return `
              <div class="likert-bar-row">
                <div class="likert-label">${label}</div>
                <div class="likert-bar">
                  <div class="bar-fill" style="width: ${percentage}%; background-color: ${barColor};">
                    ${config.showValues && count > 0 ? count : ''} ${config.showPercentages && count > 0 ? `(${percentage}%)` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="chart-footer">
          <small>Base: ${total} responses | Question: ${questionId}</small>
        </div>
      </div>
    </div>
  `;
}

function createMultiSelectChart(questionId, subQuestions, data, config) {
  // For multi-select questions, count "Yes" responses for each option
  console.log(`📊 Creating multi-select chart for ${questionId}`);
  console.log(`   questionOptionsMap at chart creation time:`, Object.keys(questionOptionsMap));
  console.log(`   Full map contents:`, questionOptionsMap);

  const responses = {};
  const total = data.length; // Base is total respondents, not total selections

  subQuestions.forEach(subQid => {
    const yesCount = data.filter(row => {
      const value = row[subQid];
      return value === 'Yes' || value === 'yes' || value === 'YES' || value === '1' || value === 1;
    }).length;

    if (yesCount > 0) {
      // Get human-readable label
      const label = getOptionLabel(subQid);
      responses[label] = yesCount;
    }
  });

  const maxCount = Math.max(...Object.values(responses), 1);

  // Sort by count descending
  const sortedResponses = Object.entries(responses).sort((a, b) => b[1] - a[1]);

  return `
    <div class="chart-visualization bar-chart multi-select-chart">
      <div class="chart-title">${config.title}</div>
      <div class="chart-content">
        <div class="bar-chart-container horizontal">
          ${sortedResponses.map(([label, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const width = (count / maxCount) * 100;
            return `
              <div class="bar-row" style="margin-bottom: 10px;">
                <div class="bar-label-left" style="width: 250px; text-align: left; padding-right: 10px; font-size: 14px;">
                  ${label}
                </div>
                <div class="bar-horizontal" style="flex: 1; display: flex; align-items: center;">
                  <div class="bar-fill" style="
                    width: ${width}%;
                    background-color: ${config.colors.primary};
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 10px;
                    color: white;
                    font-weight: bold;
                    border-radius: 4px;
                  ">
                    ${config.showValues ? count : ''} ${config.showPercentages ? `(${percentage}%)` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="chart-footer" style="margin-top: 20px;">
          <small>Base: ${total} respondents | Question: ${questionId} | Multiple selections allowed</small>
        </div>
      </div>
    </div>
  `;
}

function createBarChart(questionId, data, config) {
  // Define standard Likert scale options
  const standardScales = {
    'agreement': ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree'],
    'satisfaction': ['Extremely satisfied', 'Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied', 'Extremely dissatisfied'],
    'likelihood': ['Definitely would', 'Probably would', 'Might or might not', 'Probably would not', 'Definitely would not'],
    'intensity': ['Extremely', 'Very', 'Moderately', 'Slightly', 'Not at all']
  };

  // Count actual responses
  const actualResponses = {};
  data.forEach(row => {
    const value = row[questionId];
    if (value) {
      actualResponses[value] = (actualResponses[value] || 0) + 1;
    }
  });

  // Detect if this is a Likert scale question
  const allLabels = Object.keys(actualResponses);
  let isLikert = false;
  let orderedLabels = [];

  for (const [type, labels] of Object.entries(standardScales)) {
    if (allLabels.some(label => labels.includes(label))) {
      isLikert = true;
      orderedLabels = labels;
      break;
    }
  }

  // If Likert, initialize all scale points (including 0 counts)
  const responses = {};
  if (isLikert) {
    orderedLabels.forEach(label => {
      responses[label] = actualResponses[label] || 0;
    });
  } else {
    Object.assign(responses, actualResponses);
  }

  const total = Object.values(responses).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(responses), 1);

  return `
    <div class="chart-visualization bar-chart">
      <div class="chart-title">${config.title}</div>
      <div class="chart-content">
        <div class="bar-chart-container">
          ${Object.entries(responses).map(([label, count]) => {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return `
              <div class="bar-column">
                <div class="bar" style="height: ${height}%; background-color: ${config.colors.primary};">
                  <div class="bar-value">
                    ${config.showValues && count > 0 ? count : ''} ${config.showPercentages && count > 0 ? `(${percentage}%)` : ''}
                  </div>
                </div>
                <div class="bar-label">${label}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="chart-footer">
          <small>Base: ${total} responses | Question: ${questionId}</small>
        </div>
      </div>
    </div>
  `;
}

function createNumericChart(questionId, data, config) {
  const values = data.map(row => parseFloat(row[questionId])).filter(v => !isNaN(v));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

  return `
    <div class="chart-visualization numeric-chart">
      <div class="chart-title">${config.title}</div>
      <div class="chart-content">
        <div class="numeric-summary">
          <div class="summary-stat">
            <div class="stat-value">${mean.toFixed(1)}</div>
            <div class="stat-label">Mean</div>
          </div>
          <div class="summary-stat">
            <div class="stat-value">${median}</div>
            <div class="stat-label">Median</div>
          </div>
          <div class="summary-stat">
            <div class="stat-value">${values.length}</div>
            <div class="stat-label">Count</div>
          </div>
        </div>
        <div class="histogram-placeholder" style="height: 200px; background: ${config.colors.primary}20; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <span style="color: ${config.colors.primary};">Histogram visualization would appear here</span>
        </div>
        <div class="chart-footer">
          <small>Range: ${Math.min(...values)} - ${Math.max(...values)} | Question: ${questionId}</small>
        </div>
      </div>
    </div>
  `;
}

function createGenericChart(questionId, data, config) {
  return `
    <div class="chart-visualization generic-chart">
      <div class="chart-title">${config.title}</div>
      <div class="chart-content">
        <div class="placeholder-chart" style="height: 300px; background: ${config.colors.primary}10; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px dashed ${config.colors.primary};">
          <div style="text-align: center; color: ${config.colors.primary};">
            <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Chart for ${questionId}</div>
            <small>Data processing for this question type coming soon</small>
          </div>
        </div>
        <div class="chart-footer">
          <small>Question: ${questionId} | Type: ${questionData.type || 'Unknown'}</small>
        </div>
      </div>
    </div>
  `;
}

function filterQuestions(filter) {
  const questions = document.querySelectorAll('.question-item');
  questions.forEach(q => {
    const section = q.dataset.section;
    if (filter === 'all' || filter === section) {
      q.style.display = 'block';
    } else {
      q.style.display = 'none';
    }
  });
}

function toggleCrosstab(e) {
  const bannerPalette = document.querySelector('.banner-palette .palette-content');
  if (e.target.checked) {
    bannerPalette.style.display = 'block';
  } else {
    bannerPalette.style.display = 'none';
  }
}

function handleBannerSelect(e) {
  // Handle banner selection for cross-tabulation
  const bannerEquation = e.currentTarget.dataset.bannerEquation;
  const bannerName = e.currentTarget.dataset.bannerName;

  document.querySelectorAll('.banner-item').forEach(item => item.classList.remove('selected'));
  e.currentTarget.classList.add('selected');

  console.log('Selected banner:', bannerName, '| Equation:', bannerEquation);

  // Set active filter
  if (bannerEquation && bannerEquation.trim() !== '') {
    activeBannerFilters = [bannerEquation];
  } else {
    activeBannerFilters = []; // No filter = Total
  }

  // Regenerate current chart with filtered data
  regenerateCurrentChart();
}

let currentQuestionData = null; // Store current question for regeneration

function regenerateCurrentChart() {
  if (!currentQuestionData) {
    console.log('No chart to regenerate');
    return;
  }

  console.log('Regenerating chart with filters:', activeBannerFilters);
  generateChart(currentQuestionData);
}

function setupChartCustomization() {
  // Real-time updates for chart customization
  const customizationInputs = [
    'chart-theme', 'primary-color', 'secondary-color', 'accent-color',
    'chart-title', 'show-values', 'show-percentages', 'show-legend'
  ];

  customizationInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    input?.addEventListener('change', () => {
      // Regenerate current chart with new settings
      console.log('Chart customization changed:', inputId);
    });
  });
}