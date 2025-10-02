/**
 * Cross-Tab Generator UI Component
 * Professional interface for generating cross-tabulation tables from banner plans + SPSS data
 *
 * WORKFLOW:
 * 1. Select banner plan from project
 * 2. Upload SPSS codes.csv file
 * 3. Configure tab plan (which questions to analyze)
 * 4. Generate cross-tabs with one click
 * 5. Preview results and export to CSV/Excel
 *
 * Created: 2025-09-30
 */

import { useState, useEffect } from 'react';
import {
  parseSpssFile,
  generateCrossTabReport,
  exportReportToCSV
} from '../../../services/crossTabGenerator.js';
import { getBannerDefinitions } from '../../../services/bannerManager.js';

export default function CrossTabGenerator({ projectId, projectName }) {
  const [bannerPlans, setBannerPlans] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [spssFile, setSpssFile] = useState(null);
  const [spssData, setSpssData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [tabPlanConfig, setTabPlanConfig] = useState({
    questions: []
  });

  // Load banner plans on mount
  useEffect(() => {
    loadBannerPlans();
  }, [projectId]);

  async function loadBannerPlans() {
    setLoading(true);
    try {
      const result = await getBannerDefinitions(projectId);
      if (result.success) {
        setBannerPlans(result.data || []);
        console.log('✅ Loaded banner plans:', result.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error loading banner plans:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await parseSpssFile(file);
      setSpssData(data);
      setSpssFile(file);
      console.log('✅ Loaded SPSS data:', data.length, 'respondents');

      // Auto-detect question variables from CSV columns
      const columns = Object.keys(data[0] || {});
      const questionColumns = columns.filter(col =>
        /^[SQ]\d+/.test(col) || /^Q\d+r\d+/.test(col)
      );

      // Auto-populate tab plan with detected questions
      setTabPlanConfig({
        questions: questionColumns.map(col => ({
          questionId: col,
          questionText: `Question ${col}`,
          questionType: 'categorical'
        }))
      });
    } catch (error) {
      console.error('❌ Error parsing SPSS file:', error);
      alert('Error parsing SPSS file. Please check the file format.');
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateCrossTabs() {
    if (!selectedBanner || !spssData) {
      alert('Please select a banner plan and upload SPSS data first.');
      return;
    }

    setLoading(true);
    try {
      const tabPlan = {
        projectName: projectName,
        questions: tabPlanConfig.questions
      };

      const generatedReport = generateCrossTabReport(tabPlan, selectedBanner, spssData);
      setReport(generatedReport);
      console.log('✅ Generated cross-tab report:', generatedReport);
    } catch (error) {
      console.error('❌ Error generating cross-tabs:', error);
      alert('Error generating cross-tabs. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCSV() {
    if (!report) return;

    const csv = exportReportToCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CrossTabs_${report.metadata.bannerName}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleQuestionType(questionId, newType) {
    setTabPlanConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.questionId === questionId ? { ...q, questionType: newType } : q
      )
    }));
  }

  return (
    <div className="crosstab-generator">
      <style>{`
        .crosstab-generator {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #212161;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #212161;
          margin: 0;
        }

        .section-subtitle {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }

        .form-select, .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-select:focus, .form-input:focus {
          outline: none;
          border-color: #212161;
          box-shadow: 0 0 0 3px rgba(33, 33, 97, 0.1);
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #212161;
          color: white;
        }

        .btn-primary:hover {
          background: #1a1a4d;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-success {
          background: #dcfce7;
          color: #166534;
        }

        .status-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .question-config {
          display: grid;
          grid-template-columns: 150px 1fr 200px;
          gap: 10px;
          align-items: center;
          padding: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .question-id {
          font-weight: 700;
          color: #212161;
        }

        .question-text {
          color: #64748b;
          font-size: 13px;
        }

        .question-type-selector {
          display: flex;
          gap: 5px;
        }

        .type-btn {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          background: white;
          transition: all 0.2s;
        }

        .type-btn.active {
          background: #212161;
          color: white;
          border-color: #212161;
        }

        .report-preview {
          max-height: 500px;
          overflow-y: auto;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
        }

        .table-preview {
          margin-bottom: 30px;
        }

        .table-title {
          font-weight: 700;
          color: #212161;
          margin-bottom: 10px;
        }

        .crosstab-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-size: 12px;
        }

        .crosstab-table th,
        .crosstab-table td {
          padding: 8px;
          text-align: left;
          border: 1px solid #e2e8f0;
        }

        .crosstab-table th {
          background: #212161;
          color: white;
          font-weight: 600;
        }

        .crosstab-table td {
          background: white;
        }

        .crosstab-table .row-header {
          background: #f1f5f9;
          font-weight: 600;
        }
      `}</style>

      {/* Header */}
      <div className="section">
        <h1 style={{ margin: 0, color: '#212161' }}>📊 Cross-Tabulation Generator</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Execute your tab banner plan against SPSS data to generate professional cross-tabulation tables
        </p>
      </div>

      {/* Step 1: Select Banner Plan */}
      <div className="section">
        <div className="section-header">
          <span style={{ fontSize: '24px' }}>1️⃣</span>
          <h3 className="section-title">Select Banner Plan</h3>
        </div>
        <p className="section-subtitle">
          Choose the banner plan blueprint you created (H1 categories + H2 subgroups with equations)
        </p>

        <div className="form-group">
          <label className="form-label">Banner Plan</label>
          <select
            className="form-select"
            value={selectedBanner?.id || ''}
            onChange={(e) => {
              const banner = bannerPlans.find(b => b.id === e.target.value);
              setSelectedBanner(banner);
            }}
          >
            <option value="">-- Select a banner plan --</option>
            {bannerPlans.map(banner => (
              <option key={banner.id} value={banner.id}>
                {banner.name} ({banner.banner_groups?.length || 0} H1 categories)
              </option>
            ))}
          </select>
        </div>

        {selectedBanner && (
          <div style={{ marginTop: '10px' }}>
            <span className="status-badge status-success">
              ✓ Selected: {selectedBanner.name}
            </span>
            <span className="status-badge status-info" style={{ marginLeft: '10px' }}>
              {selectedBanner.banner_groups?.reduce((sum, g) => sum + (g.banner_columns?.length || 0), 0) || 0} H2 columns total
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Upload SPSS Data */}
      <div className="section">
        <div className="section-header">
          <span style={{ fontSize: '24px' }}>2️⃣</span>
          <h3 className="section-title">Upload SPSS Data</h3>
        </div>
        <p className="section-subtitle">
          Upload your SPSS codes.csv file (numeric response data)
        </p>

        <div className="form-group">
          <label className="form-label">SPSS Codes CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="form-input"
          />
        </div>

        {spssData && (
          <div style={{ marginTop: '10px' }}>
            <span className="status-badge status-success">
              ✓ Loaded: {spssData.length} respondents
            </span>
            <span className="status-badge status-info" style={{ marginLeft: '10px' }}>
              {Object.keys(spssData[0] || {}).length} variables detected
            </span>
          </div>
        )}
      </div>

      {/* Step 3: Configure Tab Plan */}
      {spssData && (
        <div className="section">
          <div className="section-header">
            <span style={{ fontSize: '24px' }}>3️⃣</span>
            <h3 className="section-title">Configure Questions</h3>
          </div>
          <p className="section-subtitle">
            Select which questions to analyze and specify their type (categorical, numeric, or Likert scale)
          </p>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tabPlanConfig.questions.map(q => (
              <div key={q.questionId} className="question-config">
                <div className="question-id">{q.questionId}</div>
                <div className="question-text">{q.questionText}</div>
                <div className="question-type-selector">
                  {['categorical', 'numeric', 'likert'].map(type => (
                    <button
                      key={type}
                      className={`type-btn ${q.questionType === type ? 'active' : ''}`}
                      onClick={() => toggleQuestionType(q.questionId, type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Generate Cross-Tabs */}
      {selectedBanner && spssData && (
        <div className="section">
          <div className="section-header">
            <span style={{ fontSize: '24px' }}>4️⃣</span>
            <h3 className="section-title">Generate Cross-Tabs</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleGenerateCrossTabs}
              disabled={loading}
            >
              {loading ? '⏳ Generating...' : '🚀 Generate Cross-Tabs'}
            </button>

            {report && (
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                💾 Export to CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preview Results */}
      {report && (
        <div className="section">
          <div className="section-header">
            <span style={{ fontSize: '24px' }}>📋</span>
            <h3 className="section-title">Results Preview</h3>
          </div>

          <div className="report-preview">
            {report.tables.slice(0, 3).map(table => (
              <div key={table.questionId} className="table-preview">
                <div className="table-title">
                  {table.questionId}: {table.questionText}
                </div>

                <table className="crosstab-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {Object.values(table.data).map((col, idx) => (
                        <th key={idx}>{col.columnName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="row-header">Base</td>
                      {Object.values(table.data).map((col, idx) => (
                        <td key={idx}>{col.base}</td>
                      ))}
                    </tr>
                    {table.questionType === 'numeric' && (
                      <>
                        <tr>
                          <td className="row-header">Mean</td>
                          {Object.values(table.data).map((col, idx) => (
                            <td key={idx}>{col.mean || '-'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="row-header">Median</td>
                          {Object.values(table.data).map((col, idx) => (
                            <td key={idx}>{col.median || '-'}</td>
                          ))}
                        </tr>
                      </>
                    )}
                    {table.questionType === 'likert' && (
                      <>
                        <tr>
                          <td className="row-header">Top Box %</td>
                          {Object.values(table.data).map((col, idx) => (
                            <td key={idx}>{col.topBox || '-'}%</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="row-header">Bottom Box %</td>
                          {Object.values(table.data).map((col, idx) => (
                            <td key={idx}>{col.bottomBox || '-'}%</td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ))}

            {report.tables.length > 3 && (
              <p style={{ textAlign: 'center', color: '#64748b' }}>
                ... and {report.tables.length - 3} more tables. Export to CSV to see all results.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}