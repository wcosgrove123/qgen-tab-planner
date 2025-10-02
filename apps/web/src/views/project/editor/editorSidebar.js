// --- (imports and helper functions remain the same) ---
import { renderQuestionList } from './questionList.js';

function nextNumber(prefix, questions) {
  let n = 1;
  while (questions.some(q => q.id === (prefix + n))) {
    n++;
  }
  return n;
}

function createNewQuestion(type, questions) {
    let id;
    let nextNum;

    switch (type) {
        case 'S':
            nextNum = nextNumber('S', questions);
            id = `S${nextNum}`;
            break;
        case 'Q':
            nextNum = nextNumber('Q', questions);
            id = `Q${nextNum}`;
            break;
        case 'H':
            nextNum = nextNumber('Q', questions);
            id = `Q${nextNum}_H`;
            break;
        case 'SH':
            nextNum = nextNumber('S', questions);
            id = `S${nextNum}_H`;
            break;
        case 'R':
            nextNum = nextNumber('Q', questions);
            id = `Q${nextNum}_R`;
            break;
        case 'QC':
            nextNum = nextNumber('QC_', questions);
            id = `QC_${nextNum}`;
            break;
        case 'SQC':
            nextNum = nextNumber('SQC_', questions);
            id = `SQC_${nextNum}`;
            break;
        default:
            nextNum = nextNumber('Q', questions);
            id = `Q${nextNum}`;
    }
    return { id: id, type: 'single', text: '', options: [] };
}


export function renderEditorSidebar({ hostEl, questions, activeIndex, onSelectQuestion, onReorderQuestion, onAddQuestion }) {
  const screenerCount = questions.filter(q => q.id?.startsWith('S')).length;
  const mainCount = questions.filter(q => !q.id?.startsWith('S')).length;

  hostEl.innerHTML = `
    <div class="question-sidebar">
      <!-- Compact Button Bar -->
      <div class="sidebar-action-bar">
        <div class="add-buttons-row">
          <button class="add-quick-btn" data-add-type="S">+ Screener</button>
          <button class="add-quick-btn" data-add-type="Q">+ Main</button>
          <div class="more-dropdown">
            <button class="add-quick-btn more-btn" id="more-btn">More +</button>
            <div class="more-menu" id="more-menu">
              <button class="more-menu-item" data-add-type="H">Hidden</button>
              <button class="more-menu-item" data-add-type="R">QC Check</button>
              <div class="more-menu-divider"></div>
              <button class="more-menu-item" data-add-type="T">Text Only</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Screener Section -->
      <div class="question-list-section" id="screener-section">
        <div class="section-header" id="screener-header">
          <span class="section-title">Screener</span>
          <span class="section-count">${screenerCount}</span>
        </div>
        <div class="question-list-body" id="screener-list-body"></div>
      </div>

      <!-- Main Section -->
      <div class="question-list-section" id="main-section">
        <div class="section-header" id="main-header">
          <span class="section-title">Main Survey</span>
          <span class="section-count">${mainCount}</span>
        </div>
        <div class="question-list-body" id="main-list-body"></div>
      </div>
    </div>
  `;
  // Render question lists
  renderQuestionList({
    listEl: hostEl.querySelector('#screener-list-body'),
    headerEl: hostEl.querySelector('#screener-header'),
    questions: questions,
    activeIndex: activeIndex,
    filter: 'screener',
    onSelect: onSelectQuestion,
    onReorder: onReorderQuestion,
  });

  renderQuestionList({
    listEl: hostEl.querySelector('#main-list-body'),
    headerEl: hostEl.querySelector('#main-header'),
    questions: questions,
    activeIndex: activeIndex,
    filter: 'main',
    onSelect: onSelectQuestion,
    onReorder: onReorderQuestion,
  });

  // Handle More dropdown
  const moreBtn = hostEl.querySelector('#more-btn');
  const moreMenu = hostEl.querySelector('#more-menu');

  if (moreBtn && moreMenu) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moreMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.more-dropdown')) {
        moreMenu.classList.remove('show');
      }
    });
  }

  // Handle question type selection
  hostEl.querySelectorAll('[data-add-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      let type = btn.dataset.addType;

      // For Hidden, QC, and Text questions, check which section is expanded
      if (type === 'H' || type === 'R' || type === 'T') {
        const screenerSection = hostEl.querySelector('#screener-section');
        const screenerExpanded = screenerSection?.classList.contains('expanded');

        if (type === 'H') {
          type = screenerExpanded ? 'SH' : type;
        } else if (type === 'R') {
          type = screenerExpanded ? 'SQC' : 'QC';
        } else if (type === 'T') {
          type = screenerExpanded ? 'STXT' : 'TXT';
        }
      }

      onAddQuestion(type);
      if (moreMenu) {
        moreMenu.classList.remove('show');
      }
    });
  });

  // Add collapsible functionality for question sections
  const screenerHeader = hostEl.querySelector('#screener-header');
  const mainHeader = hostEl.querySelector('#main-header');
  const screenerSection = hostEl.querySelector('#screener-section');
  const mainSection = hostEl.querySelector('#main-section');

  // Initialize global sidebar state if it doesn't exist
  if (!window._sidebarState) {
    window._sidebarState = {
      screenerExpanded: true,
      mainExpanded: true
    };
  }

  if (screenerHeader && screenerSection) {
    screenerHeader.addEventListener('click', () => {
      screenerSection.classList.toggle('expanded');
      window._sidebarState.screenerExpanded = screenerSection.classList.contains('expanded');
    });
  }

  if (mainHeader && mainSection) {
    mainHeader.addEventListener('click', () => {
      mainSection.classList.toggle('expanded');
      window._sidebarState.mainExpanded = mainSection.classList.contains('expanded');
    });
  }

  // Restore expanded state from global sidebar state (default to expanded)
  if (window._sidebarState.screenerExpanded) {
    screenerSection?.classList.add('expanded');
  }
  if (window._sidebarState.mainExpanded) {
    mainSection?.classList.add('expanded');
  }
}

