let user, campaign, myRole, myCharacters;

async function loadAll(id) {
  const [{ campaign: c, myRole: role }, { characters }] = await Promise.all([
    api('GET', `/api/campaigns/${id}`),
    api('GET', '/api/characters')
  ]);
  campaign = c;
  myRole = role;
  myCharacters = characters;
  render();
}

function memberRows() {
  return campaign.members.map((m) => `
    <tr>
      <td>${escapeHtml(m.user ? m.user.username : 'Unknown')} ${m.role === 'dm' ? '<span class="pill dm">DM</span>' : ''}</td>
      <td>${m.character ? `<a href="/character.html?id=${m.character.id}">${escapeHtml(m.character.name)}</a>` : '<span class="muted">No character linked</span>'}</td>
    </tr>
  `).join('');
}

function myCharacterOptions() {
  return myCharacters.map((c) => `<option value="${c.id}" ${campaign.members.find(m=>m.userId===user.id)?.characterId===c.id ? 'selected':''}>${escapeHtml(c.name)}</option>`).join('');
}

function render() {
  const app = document.getElementById('app');
  const isDM = myRole === 'dm';

  app.innerHTML = `
    <div class="panel">
      <div class="row between">
        <div style="flex:1;">
          <label>Campaign Name</label>
          <input id="campName" value="${escapeHtml(campaign.name)}" ${isDM ? '' : 'disabled'} style="font-size:18px;">
        </div>
        <div style="margin-left:16px;">
          <span class="pill">Invite Code: <strong>${campaign.inviteCode}</strong></span>
        </div>
      </div>
      <div class="field mt">
        <label>Description</label>
        <textarea id="campDesc" rows="3" ${isDM ? '' : 'disabled'}>${escapeHtml(campaign.description)}</textarea>
      </div>
      <div class="row mt">
        <button id="startSessionBtn">${isDM ? 'Start Live Session' : 'Join Live Session'}</button>
        ${isDM ? '<span class="muted">Share the invite code above so players can join.</span>' : ''}
      </div>
      <div class="error" id="campError"></div>
      <div class="success" id="campSuccess"></div>
    </div>

    <div class="panel">
      <h2>Party</h2>
      <table><thead><tr><th>Player</th><th>Character</th></tr></thead>
      <tbody>${memberRows()}</tbody></table>

      ${!isDM ? `
      <div class="field mt">
        <label>Link one of your characters to this campaign</label>
        <select id="linkCharacter">
          <option value="">-- None --</option>
          ${myCharacterOptions()}
        </select>
      </div>` : ''}
    </div>

    ${isDM ? `
    <div class="panel">
      <h2>DM Notes <span class="muted" style="font-size:12px;">(only you can see this)</span></h2>
      <textarea id="dmNotes" rows="8">${escapeHtml(campaign.dmNotes || '')}</textarea>
    </div>` : ''}
  `;

  if (isDM) {
    document.getElementById('campName').addEventListener('change', saveCampaign);
    document.getElementById('campDesc').addEventListener('change', saveCampaign);
    let notesTimer;
    document.getElementById('dmNotes').addEventListener('input', (e) => {
      clearTimeout(notesTimer);
      notesTimer = setTimeout(() => saveCampaign(), 600);
    });
  } else {
    const linkSelect = document.getElementById('linkCharacter');
    linkSelect.addEventListener('change', async () => {
      try {
        await api('POST', `/api/campaigns/${campaign.id}/character`, { characterId: linkSelect.value || null });
        document.getElementById('campSuccess').textContent = 'Character linked.';
        await loadAll(campaign.id);
      } catch (err) {
        document.getElementById('campError').textContent = err.message;
      }
    });
  }

  document.getElementById('startSessionBtn').addEventListener('click', () => {
    window.location.href = `/session.html?campaign=${campaign.id}`;
  });
}

async function saveCampaign() {
  try {
    await api('PUT', `/api/campaigns/${campaign.id}`, {
      name: document.getElementById('campName').value,
      description: document.getElementById('campDesc').value,
      dmNotes: document.getElementById('dmNotes') ? document.getElementById('dmNotes').value : undefined
    });
    document.getElementById('campSuccess').textContent = 'Saved.';
    setTimeout(() => { const s = document.getElementById('campSuccess'); if (s) s.textContent=''; }, 1500);
  } catch (err) {
    document.getElementById('campError').textContent = err.message;
  }
}

async function init() {
  user = await requireUser();
  if (!user) return;
  renderTopbar('campaign', user);
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = '/dashboard.html'; return; }
  try {
    await loadAll(id);
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="panel error">${escapeHtml(err.message)}</div>`;
  }
}

init();
