/**
 * Cross-Tab Generator View
 * Wrapper for React component to integrate with vanilla JS routing
 */

import { createRoot } from 'react-dom/client';
import CrossTabGenerator from './CrossTabGenerator.jsx';

export function renderCrossTabView(hostEl) {
  // Clear existing content
  hostEl.innerHTML = '';

  // Get project info from window state
  const projectId = window.ui_state?.active_project_id;
  const projectName = window.state?.project?.name || 'Unnamed Project';

  if (!projectId) {
    hostEl.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2 style="color: #ef4444;">No Project Selected</h2>
        <p style="color: #64748b;">Please select a project to generate cross-tabs.</p>
      </div>
    `;
    return;
  }

  // Create React root and render component
  const reactContainer = document.createElement('div');
  reactContainer.id = 'crosstab-generator-root';
  hostEl.appendChild(reactContainer);

  const root = createRoot(reactContainer);
  root.render(<CrossTabGenerator projectId={projectId} projectName={projectName} />);
}