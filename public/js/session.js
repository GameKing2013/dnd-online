let user, campaign, isDM, socket;
let state = { tokens: [], initiative: [], activeIndex: -1, mapUrl: '' };
let chatLog = [];
const TOKEN_COLORS = ['#c9a24b', '#8f2d2d', '#4a7a4a', '#3a6a8f', '#8a4a8f', '#c97a3a'];

function layoutShell() {
  document.getElementById('app').innerHTML = `
    <div class="session-layout">
      <div class="session-col" id="initCol">
        <h2 style="border-bottom:1px solid var(--border);padding-bottom:8px;color:var(--gold-bright);font-size:16px;margin-top:0;">Initiative</h2>
        <ul class="init-list" id="initList"></ul>
        ${isDM ? `
        <div class="row mt" style="gap:6px;">
          <input id="initName" placeholder="Name" style="flex:2;">
          <input id="initVal" type="number" placeholder="#" style="flex:1;">
        </div>
        <div class="row mt" style="gap:6px;">
          <button id="initAddBtn" style="flex:1;">Add</button>
          <button id="initNextBtn" class="secondary" style="flex:1;">Next Turn</button>
        </div>` : ''}
      </div>

      <div class="session-col" style="padding:8px;">
        ${isDM ? `
        <div class="row" style="gap:6px;margin-bottom:8px;">
          <input id="mapUrlInput" placeholder="Background image URL" value="${escapeHtml(state.mapUrl || '')}" style="flex:1;">
          <button id="mapSetBtn">Set</button>
        </div>
        <div class="row" style="gap:6px;margin-bottom:8px;">
          <input id="tokenNameInput" placeholder="Token name" style="flex:1;">
          <button id="tokenAddBtn">+ Token</button>
        </div>` : ''}
        <div class="map-area" id="mapArea"></div>
      </div>

      <div class="session-col">
        <h2 style="border-bottom:1px solid var(--border);padding-bottom:8px;color:var(--gold-bright);font-size:16px;margin-top:0;">Chat &amp; Dice</h2>
        <div class="chat-log" id="chatLog"></div>
        <div class="row" style="gap:6px;">
          <input id="diceInput" placeholder="1d20+5" style="flex:1;">
          <button id="rollBtn">Roll</button>
        </div>
        <div class="row mt" style="gap:4px;flex-wrap:wrap;">
          ${['d4','d6','d8','d10','d12','d20','d100'].map(d => `<button class="secondary quickroll" data-die="${d}" style="flex:1;padding:6px;">${d}</button>`).join('')}
        </div>
        <div class="row mt" style="gap:6px;">
          <input id="chatInput" placeholder="Say something..." style="flex:1;">
          <button id="sendBtn">Send</button>
        </div>
      </div>
    </div>
  `;
}

function renderInitiative() {
  const el = document.getElementById('initList');
  if (!state.initiative.length) {
    el.innerHTML = '<li class="muted">No combatants yet.</li>';
    return;
  }
  el.innerHTML = state.initiative.map((c, i) => `
    <li class="${i === state.activeIndex ? 'active' : ''}">
      <span class="val">${c.value}</span>
      <span style="flex:1;">${escapeHtml(c.name)}</span>
      ${isDM ? `<button class="danger" style="padding:2px 8px;" onclick="removeCombatant(${i})">&times;</button>` : ''}
    </li>
  `).join('');
}

function renderMap() {
  const mapArea = document.getElementById('mapArea');
  mapArea.style.backgroundImage = state.mapUrl ? `url("${state.mapUrl.replace(/"/g,'')}")` : 'none';
  mapArea.innerHTML = state.tokens.map((t) => `
    <div class="token" data-id="${t.id}" style="left:${t.x}%; top:${t.y}%; background:${t.color}; transform: translate(-50%, -50%);" title="${escapeHtml(t.name)}">
      ${escapeHtml((t.name || '?').slice(0,4))}
    </div>
  `).join('');
  bindTokenDrag();
}

function renderChat() {
  const el = document.getElementById('chatLog');
  el.innerHTML = chatLog.map((m) => {
    if (m.type === 'roll') {
      return `<div class="chat-msg roll"><span class="who">${escapeHtml(m.username)}</span> rolled <strong>${m.roll.expression}</strong>: [${m.roll.rolls.join(', ')}]${m.roll.modifier ? (m.roll.modifier>0?' +':' ')+m.roll.modifier : ''} = <strong>${m.roll.total}</strong></div>`;
    }
    if (m.type === 'system') {
      return `<div class="chat-msg system">${escapeHtml(m.text)}</div>`;
    }
    return `<div class="chat-msg"><span class="who">${escapeHtml(m.username)}:</span> ${escapeHtml(m.text)}</div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function bindTokenDrag() {
  const mapArea = document.getElementById('mapArea');
  mapArea.querySelectorAll('.token').forEach((tokenEl) => {
    tokenEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const id = tokenEl.dataset.id;
      const rect = mapArea.getBoundingClientRect();

      function onMove(ev) {
        let x = ((ev.clientX - rect.left) / rect.width) * 100;
        let y = ((ev.clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        tokenEl.style.left = x + '%';
        tokenEl.style.top = y + '%';
        const t = state.tokens.find((t) => t.id === id);
        if (t) { t.x = x; t.y = y; }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        socket.emit('token:update', state.tokens);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

window.removeCombatant = function (i) {
  state.initiative.splice(i, 1);
  socket.emit('initiative:update', state.initiative);
  renderInitiative();
};

function wireControls() {
  if (isDM) {
    document.getElementById('initAddBtn').addEventListener('click', () => {
      const name = document.getElementById('initName').value.trim();
      const value = parseInt(document.getElementById('initVal').value, 10) || 0;
      if (!name) return;
      state.initiative.push({ name, value });
      state.initiative.sort((a, b) => b.value - a.value);
      socket.emit('initiative:update', state.initiative);
      renderInitiative();
      document.getElementById('initName').value = '';
      document.getElementById('initVal').value = '';
    });
    document.getElementById('initNextBtn').addEventListener('click', () => {
      socket.emit('initiative:next');
    });
    document.getElementById('mapSetBtn').addEventListener('click', () => {
      const url = document.getElementById('mapUrlInput').value.trim();
      state.mapUrl = url;
      socket.emit('map:set', url);
      renderMap();
    });
    document.getElementById('tokenAddBtn').addEventListener('click', () => {
      const name = document.getElementById('tokenNameInput').value.trim() || 'Token';
      const color = TOKEN_COLORS[state.tokens.length % TOKEN_COLORS.length];
      state.tokens.push({ id: 't' + Date.now() + Math.random().toString(36).slice(2,6), name, color, x: 50, y: 50 });
      socket.emit('token:update', state.tokens);
      renderMap();
      document.getElementById('tokenNameInput').value = '';
    });
  }

  document.getElementById('rollBtn').addEventListener('click', () => {
    const expr = document.getElementById('diceInput').value.trim();
    if (!expr) return;
    socket.emit('dice-roll', expr);
    document.getElementById('diceInput').value = '';
  });
  document.getElementById('diceInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('rollBtn').click();
  });
  document.querySelectorAll('.quickroll').forEach((btn) => {
    btn.addEventListener('click', () => socket.emit('dice-roll', '1' + btn.dataset.die));
  });

  document.getElementById('sendBtn').addEventListener('click', sendChat);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  socket.emit('chat-message', text);
  input.value = '';
}

async function init() {
  user = await requireUser();
  if (!user) return;
  renderTopbar('session', user);

  const params = new URLSearchParams(window.location.search);
  const campaignId = params.get('campaign');
  if (!campaignId) { window.location.href = '/dashboard.html'; return; }

  try {
    const { campaign: c, myRole } = await api('GET', `/api/campaigns/${campaignId}`);
    campaign = c;
    isDM = myRole === 'dm';
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="panel error" style="margin:20px;">${escapeHtml(err.message)}</div>`;
    return;
  }

  layoutShell();
  wireControls();

  socket = io();
  socket.on('connect', () => {
    socket.emit('join-campaign', campaignId, (res) => {
      if (res.error) {
        alert(res.error);
        return;
      }
      state = res.state;
      chatLog = res.chat || [];
      renderInitiative();
      renderMap();
      renderChat();
    });
  });

  socket.on('state', (newState) => {
    state = newState;
    renderInitiative();
    renderMap();
  });

  socket.on('chat-message', (msg) => {
    chatLog.push(msg);
    renderChat();
  });

  socket.on('presence', ({ type, user: u }) => {
    chatLog.push({ type: 'system', text: `${u.username} ${type === 'joined' ? 'joined' : 'left'} the session.` });
    renderChat();
  });

  socket.on('error-message', (msg) => {
    chatLog.push({ type: 'system', text: msg });
    renderChat();
  });
}

init();
