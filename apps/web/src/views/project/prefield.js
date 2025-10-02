import { renderEditor } from './editor.js';

export async function renderPreField(el) {
    // Give the host element a consistent ID so the editor can re-render itself.
    el.id = 'prefield-content-host';
    
    // Call our new, fully modular editor.
    renderEditor(el);
}
