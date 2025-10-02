// apps/web/src/lib/status.js
export function setStatus(msg, ok = true, timeoutMs = 2200) {
  console[(ok ? 'log' : 'warn')]('[status]', msg);
  const host = ensureToastHost();
  const el = document.createElement('div');
  el.className = `toast ${ok ? 'ok' : 'err'}`;
  el.textContent = String(msg || '');
  host.appendChild(el);
  setTimeout(() => el.remove(), timeoutMs);
}

function ensureToastHost() {
  let h = document.getElementById('toastHost');
  if (!h) {
    h = document.createElement('div');
    h.id = 'toastHost';
    h.style.position = 'fixed';
    h.style.right = '16px';
    h.style.bottom = '16px';
    h.style.display = 'flex';
    h.style.flexDirection = 'column';
    h.style.gap = '8px';
    h.style.zIndex = '9999';
    document.body.appendChild(h);
  }
  return h;
}
