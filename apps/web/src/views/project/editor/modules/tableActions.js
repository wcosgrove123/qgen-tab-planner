/**
 * Table Action Handlers
 *
 * Action handlers for table question types, following the debounced input pattern
 * and maintaining compatibility with the existing action system.
 */

import { syncTableFacets, updateTableVariation, ensureTableGrid } from './tableCore.js';

/**
 * Creates and returns all table-related action handlers
 * @param {Function} onUpdateQuestion - Main question update function
 * @param {Function} queueAutosave - Autosave queue function
 * @param {Function} renderEditorPanel - Panel render function
 * @returns {Object} Object containing all table action handlers
 */
export function getTableActions(onUpdateQuestion, queueAutosave, renderEditorPanel) {
    return {
        // Row management actions
        onAddTableRow: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);
            question.grid.rows.push('');
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onDeleteTableRow: (questionIndex, rowIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question || !question.grid?.rows) return;

            if (rowIndex >= 0 && rowIndex < question.grid.rows.length) {
                question.grid.rows.splice(rowIndex, 1);
                updateTableVariation(question);

                queueAutosave();
                renderEditorPanel();
            }
        },

        onInsertTableRow: (questionIndex, afterIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);
            const insertIndex = afterIndex + 1;
            question.grid.rows.splice(insertIndex, 0, '');
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onUpdateTableRow: (questionIndex, rowIndex, value) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question || !question.grid?.rows) return;

            if (rowIndex >= 0 && rowIndex < question.grid.rows.length) {
                question.grid.rows[rowIndex] = value;
                updateTableVariation(question);

                queueAutosave();
                // Note: Panel re-render handled by debounced input pattern
            }
        },

        onBulkAddRows: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            const input = prompt('Enter row labels, one per line:');
            if (!input) return;

            ensureTableGrid(question);
            const newRows = input.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            question.grid.rows.push(...newRows);
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onClearAllRows: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            if (!confirm('Are you sure you want to clear all rows?')) return;

            ensureTableGrid(question);
            question.grid.rows = [];
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        // Column management actions
        onAddTableCol: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);
            question.grid.cols.push('');
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onDeleteTableCol: (questionIndex, colIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question || !question.grid?.cols) return;

            if (colIndex >= 0 && colIndex < question.grid.cols.length) {
                question.grid.cols.splice(colIndex, 1);
                updateTableVariation(question);

                queueAutosave();
                renderEditorPanel();
            }
        },

        onInsertTableCol: (questionIndex, afterIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);
            const insertIndex = afterIndex + 1;
            question.grid.cols.splice(insertIndex, 0, '');
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onUpdateTableCol: (questionIndex, colIndex, value) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question || !question.grid?.cols) return;

            if (colIndex >= 0 && colIndex < question.grid.cols.length) {
                question.grid.cols[colIndex] = value;
                updateTableVariation(question);

                queueAutosave();
                // Note: Panel re-render handled by debounced input pattern
            }
        },

        onBulkAddCols: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            const input = prompt('Enter column labels, one per line:');
            if (!input) return;

            ensureTableGrid(question);
            const newCols = input.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            question.grid.cols.push(...newCols);
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onClearAllCols: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            if (!confirm('Are you sure you want to clear all columns?')) return;

            ensureTableGrid(question);
            question.grid.cols = [];
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        // Table type and configuration actions
        onUpdateTableType: (questionIndex, type) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            question.type = type;
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onToggleColumnSource: (questionIndex, enabled) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);

            if (enabled) {
                question.grid.columnSource = { qid: null, exclude: '' };
            } else {
                delete question.grid.columnSource;
            }

            updateTableVariation(question);
            queueAutosave();
            renderEditorPanel();
        },

        onUpdateColumnSource: (questionIndex, key, value) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);

            if (!question.grid.columnSource) {
                question.grid.columnSource = { qid: null, exclude: '' };
            }

            question.grid.columnSource[key] = value;
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        onUpdateTableValidation: (questionIndex, key, value) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            if (!question.validation) {
                question.validation = {};
            }

            question.validation[key] = value;

            // Clear target if validation type is not sum_equals_qid
            if (key === 'type' && value !== 'sum_equals_qid') {
                delete question.validation.target;
            }

            queueAutosave();
            renderEditorPanel();
        },

        // Dynamic column source actions
        onToggleDynamicCols: (questionIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);

            if (question.grid.columnSource) {
                delete question.grid.columnSource;
            } else {
                question.grid.columnSource = { qid: null, exclude: '' };
            }

            updateTableVariation(question);
            queueAutosave();
            renderEditorPanel();
        },

        onUpdateColSource: (questionIndex, key, value) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question) return;

            ensureTableGrid(question);

            if (!question.grid.columnSource) {
                question.grid.columnSource = { qid: null, exclude: '' };
            }

            question.grid.columnSource[key] = value;
            updateTableVariation(question);

            queueAutosave();
            renderEditorPanel();
        },

        // Drag and drop reordering
        onReorderTableRows: (questionIndex, oldIndex, newIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question || !question.grid?.rows) return;

            const rows = question.grid.rows;
            if (oldIndex >= 0 && oldIndex < rows.length && newIndex >= 0 && newIndex < rows.length) {
                const [movedRow] = rows.splice(oldIndex, 1);
                rows.splice(newIndex, 0, movedRow);

                updateTableVariation(question);
                queueAutosave();
                renderEditorPanel();
            }
        },

        onReorderTableCols: (questionIndex, oldIndex, newIndex) => {
            const question = window.state?.questions?.[questionIndex];
            if (!question || !question.grid?.cols) return;

            const cols = question.grid.cols;
            if (oldIndex >= 0 && oldIndex < cols.length && newIndex >= 0 && newIndex < cols.length) {
                const [movedCol] = cols.splice(oldIndex, 1);
                cols.splice(newIndex, 0, movedCol);

                updateTableVariation(question);
                queueAutosave();
                renderEditorPanel();
            }
        }
    };
}

/**
 * Legacy global table helper functions for backward compatibility
 * These maintain the same interface as the original _tb_* functions
 */
export function setupLegacyTableHelpers() {
    // Legacy row helpers
    window._tb_addRow = (questionIndex) => {
        if (window.tableActions?.onAddTableRow) {
            window.tableActions.onAddTableRow(questionIndex);
        }
    };

    window._tb_delRow = (questionIndex, rowIndex) => {
        if (window.tableActions?.onDeleteTableRow) {
            window.tableActions.onDeleteTableRow(questionIndex, rowIndex);
        }
    };

    window._tb_updRow = (questionIndex, rowIndex, value) => {
        if (window.tableActions?.onUpdateTableRow) {
            window.tableActions.onUpdateTableRow(questionIndex, rowIndex, value);
        }
    };

    // Legacy column helpers
    window._tb_addCol = (questionIndex) => {
        if (window.tableActions?.onAddTableCol) {
            window.tableActions.onAddTableCol(questionIndex);
        }
    };

    window._tb_delCol = (questionIndex, colIndex) => {
        if (window.tableActions?.onDeleteTableCol) {
            window.tableActions.onDeleteTableCol(questionIndex, colIndex);
        }
    };

    window._tb_updCol = (questionIndex, colIndex, value) => {
        if (window.tableActions?.onUpdateTableCol) {
            window.tableActions.onUpdateTableCol(questionIndex, colIndex, value);
        }
    };

    // Legacy column source helpers
    window.toggleColumnSource = (questionIndex, enabled) => {
        if (window.tableActions?.onToggleColumnSource) {
            window.tableActions.onToggleColumnSource(questionIndex, enabled);
        }
    };
}