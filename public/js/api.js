async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

async function requireUser() {
  const { user } = await api('GET', '/api/auth/me');
  if (!user) {
    window.location.href = '/';
    return null;
  }
  return user;
}

function abilityMod(score) {
  return Math.floor((score - 10) / 2);
}

function fmtMod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderTopbar(activePage, user) {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <a class="logo-link" href="/dashboard.html"><h1>&#9876;&#65039; D&amp;D Online</h1></a>
    <nav>
      <a href="/dashboard.html" style="${activePage==='dashboard' ? 'color:var(--gold-bright)':''}">Dashboard</a>
      <span class="muted" style="margin-left:16px;">${user ? escapeHtml(user.username) : ''}</span>
      <a href="#" id="logoutLink">Log out</a>
    </nav>
  `;
  const logout = document.getElementById('logoutLink');
  if (logout) {
    logout.addEventListener('click', async (e) => {
      e.preventDefault();
      await api('POST', '/api/auth/logout');
      window.location.href = '/';
    });
  }
}
