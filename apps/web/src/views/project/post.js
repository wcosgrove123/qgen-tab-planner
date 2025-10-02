// src/views/project/post.js
export async function renderPost(el) {
    el.innerHTML = `
    <div class="workbench" style="margin-top: 16px;">
      <div class="card">
        <div class="card-header"><strong>Post-Survey</strong></div>
        <div class="card-content">
          <div class="pv-empty">Post-survey actions and data processing tools will be available here.</div>
        </div>
      </div>
    </div>
  `;
}