const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_LABELS = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
const SKILLS = [
  ['acrobatics', 'Acrobatics', 'dex'],
  ['animalHandling', 'Animal Handling', 'wis'],
  ['arcana', 'Arcana', 'int'],
  ['athletics', 'Athletics', 'str'],
  ['deception', 'Deception', 'cha'],
  ['history', 'History', 'int'],
  ['insight', 'Insight', 'wis'],
  ['intimidation', 'Intimidation', 'cha'],
  ['investigation', 'Investigation', 'int'],
  ['medicine', 'Medicine', 'wis'],
  ['nature', 'Nature', 'int'],
  ['perception', 'Perception', 'wis'],
  ['performance', 'Performance', 'cha'],
  ['persuasion', 'Persuasion', 'cha'],
  ['religion', 'Religion', 'int'],
  ['sleightOfHand', 'Sleight of Hand', 'dex'],
  ['stealth', 'Stealth', 'dex'],
  ['survival', 'Survival', 'wis']
];

let character = null;
let sheet = null;
let saveTimer = null;
let campaigns = [];

function profBonus() {
  const level = parseInt(sheet.level, 10) || 1;
  return 2 + Math.floor((level - 1) / 4);
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

function getPath(obj, path) {
  return path.split('.').reduce((cur, key) => (cur == null ? cur : cur[key]), obj);
}

function scheduleSave(statusText) {
  const status = document.getElementById('saveStatus');
  if (status) status.textContent = 'Saving...';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await api('PUT', `/api/characters/${character.id}`, { name: character.name, sheet });
      if (status) status.textContent = 'Saved';
    } catch (err) {
      if (status) status.textContent = 'Save failed: ' + err.message;
    }
  }, 500);
}

function updateDerived() {
  ABILITIES.forEach((a) => {
    const mod = abilityMod(parseInt(sheet.abilities[a], 10) || 0);
    const el = document.getElementById(`mod-${a}`);
    if (el) el.textContent = fmtMod(mod);
    const saveEl = document.getElementById(`save-${a}-bonus`);
    if (saveEl) {
      const bonus = mod + (sheet.saveProficiencies[a] ? profBonus() : 0);
      saveEl.textContent = fmtMod(bonus);
    }
  });
  SKILLS.forEach(([key, , ability]) => {
    const mod = abilityMod(parseInt(sheet.abilities[ability], 10) || 0);
    const bonus = mod + (sheet.skillProficiencies[key] ? profBonus() : 0);
    const el = document.getElementById(`skill-${key}-bonus`);
    if (el) el.textContent = fmtMod(bonus);
  });
  const pb = document.getElementById('profBonusDisplay');
  if (pb) pb.textContent = fmtMod(profBonus());
  const initEl = document.getElementById('initDisplay');
  if (initEl) {
    const dexMod = abilityMod(parseInt(sheet.abilities.dex, 10) || 0);
    initEl.textContent = fmtMod(dexMod + (parseInt(sheet.initiativeBonus, 10) || 0));
  }
}

function bindInputs(root) {
  root.querySelectorAll('[data-path]').forEach((el) => {
    el.addEventListener('input', () => {
      const path = el.dataset.path;
      let value = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.numeric) value = value === '' ? 0 : parseInt(value, 10) || 0;
      setPath(sheet, path, value);
      updateDerived();
      scheduleSave();
    });
  });
  const nameInput = document.getElementById('charName');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      character.name = nameInput.value;
      scheduleSave();
    });
  }
  const campSelect = document.getElementById('campaignSelect');
  if (campSelect) {
    campSelect.addEventListener('change', async () => {
      character.campaignId = campSelect.value || null;
      await api('PUT', `/api/characters/${character.id}`, { campaignId: character.campaignId });
    });
  }
}

function abilityBoxes() {
  return ABILITIES.map((a) => `
    <div class="ability-box">
      <label>${ABILITY_LABELS[a].slice(0,3).toUpperCase()}</label>
      <input type="number" class="score" data-path="abilities.${a}" data-numeric value="${sheet.abilities[a]}" style="text-align:center;font-size:20px;font-weight:bold;">
      <div class="mod" id="mod-${a}">${fmtMod(abilityMod(sheet.abilities[a]))}</div>
    </div>
  `).join('');
}

function savesBlock() {
  return ABILITIES.map((a) => `
    <div class="row" style="margin-bottom:6px;">
      <input type="checkbox" data-path="saveProficiencies.${a}" ${sheet.saveProficiencies[a] ? 'checked' : ''} style="width:auto;">
      <span class="val" id="save-${a}-bonus" style="width:34px;display:inline-block;color:var(--gold-bright);font-weight:bold;">${fmtMod(abilityMod(sheet.abilities[a]) + (sheet.saveProficiencies[a] ? profBonus() : 0))}</span>
      <span>${ABILITY_LABELS[a]}</span>
    </div>
  `).join('');
}

function skillsBlock() {
  return SKILLS.map(([key, label, ability]) => `
    <div class="row" style="margin-bottom:5px;">
      <input type="checkbox" data-path="skillProficiencies.${key}" ${sheet.skillProficiencies[key] ? 'checked' : ''} style="width:auto;">
      <span class="val" id="skill-${key}-bonus" style="width:34px;display:inline-block;color:var(--gold-bright);font-weight:bold;">${fmtMod(abilityMod(sheet.abilities[ability]) + (sheet.skillProficiencies[key] ? profBonus() : 0))}</span>
      <span>${label} <span class="muted">(${ability.toUpperCase()})</span></span>
    </div>
  `).join('');
}

function attacksRows() {
  if (!sheet.attacks.length) return '<tr><td colspan="4" class="muted">No attacks added.</td></tr>';
  return sheet.attacks.map((atk, i) => `
    <tr>
      <td><input value="${escapeHtml(atk.name)}" onchange="updateArrayField('attacks',${i},'name',this.value)"></td>
      <td style="width:80px;"><input value="${escapeHtml(atk.bonus)}" onchange="updateArrayField('attacks',${i},'bonus',this.value)"></td>
      <td><input value="${escapeHtml(atk.damage)}" onchange="updateArrayField('attacks',${i},'damage',this.value)"></td>
      <td style="width:40px;"><button class="danger" onclick="removeArrayItem('attacks',${i})">&times;</button></td>
    </tr>
  `).join('');
}

function inventoryRows() {
  if (!sheet.inventory.length) return '<tr><td colspan="3" class="muted">No items yet.</td></tr>';
  return sheet.inventory.map((item, i) => `
    <tr>
      <td><input value="${escapeHtml(item.name)}" onchange="updateArrayField('inventory',${i},'name',this.value)"></td>
      <td style="width:70px;"><input type="number" value="${item.qty}" onchange="updateArrayField('inventory',${i},'qty',parseInt(this.value,10)||0)"></td>
      <td style="width:40px;"><button class="danger" onclick="removeArrayItem('inventory',${i})">&times;</button></td>
    </tr>
  `).join('');
}

function spellsRows() {
  if (!sheet.spells.length) return '<tr><td colspan="4" class="muted">No spells yet.</td></tr>';
  return sheet.spells.map((sp, i) => `
    <tr>
      <td><input value="${escapeHtml(sp.name)}" onchange="updateArrayField('spells',${i},'name',this.value)"></td>
      <td style="width:70px;"><input type="number" min="0" max="9" value="${sp.level}" onchange="updateArrayField('spells',${i},'level',parseInt(this.value,10)||0)"></td>
      <td style="width:80px;text-align:center;"><input type="checkbox" ${sp.prepared ? 'checked' : ''} onchange="updateArrayField('spells',${i},'prepared',this.checked)"></td>
      <td style="width:40px;"><button class="danger" onclick="removeArrayItem('spells',${i})">&times;</button></td>
    </tr>
  `).join('');
}

function spellSlotsBlock() {
  let out = '';
  for (let lvl = 1; lvl <= 9; lvl++) {
    out += `
      <div>
        <label>Lvl ${lvl}</label>
        <input type="number" min="0" data-path="spellSlots.${lvl}" data-numeric value="${sheet.spellSlots[lvl] || 0}">
      </div>
    `;
  }
  return `<div class="grid" style="grid-template-columns:repeat(9,1fr);gap:6px;">${out}</div>`;
}

window.updateArrayField = function (arrName, index, field, value) {
  sheet[arrName][index][field] = value;
  scheduleSave();
};
window.removeArrayItem = function (arrName, index) {
  sheet[arrName].splice(index, 1);
  render();
  scheduleSave();
};
window.addAttack = function () {
  sheet.attacks.push({ name: '', bonus: '+0', damage: '' });
  render();
};
window.addInventoryItem = function () {
  sheet.inventory.push({ name: '', qty: 1 });
  render();
};
window.addSpell = function () {
  sheet.spells.push({ name: '', level: 0, prepared: false });
  render();
};

function render() {
  const app = document.getElementById('app');
  const campaignOptions = campaigns.map((c) => `<option value="${c.id}" ${character.campaignId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

  app.innerHTML = `
    <div class="panel">
      <div class="row between">
        <div style="flex:1;">
          <label>Character Name</label>
          <input id="charName" value="${escapeHtml(character.name)}" style="font-size:18px;">
        </div>
        <div style="margin-left:16px;" class="muted" id="saveStatus">Saved</div>
      </div>

      <div class="grid grid-3 mt">
        <div class="field"><label>Race</label><input data-path="race" value="${escapeHtml(sheet.race)}"></div>
        <div class="field"><label>Class</label><input data-path="class" value="${escapeHtml(sheet.class)}"></div>
        <div class="field"><label>Background</label><input data-path="background" value="${escapeHtml(sheet.background)}"></div>
        <div class="field"><label>Alignment</label><input data-path="alignment" value="${escapeHtml(sheet.alignment)}"></div>
        <div class="field"><label>Level</label><input type="number" min="1" max="20" data-path="level" data-numeric value="${sheet.level}"></div>
        <div class="field"><label>Experience</label><input type="number" min="0" data-path="experience" data-numeric value="${sheet.experience}"></div>
      </div>

      <div class="field mt">
        <label>Campaign</label>
        <select id="campaignSelect">
          <option value="">Not linked to a campaign</option>
          ${campaignOptions}
        </select>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="panel">
        <h2>Ability Scores</h2>
        <div class="grid" style="grid-template-columns:repeat(6,1fr);gap:8px;">${abilityBoxes()}</div>
        <p class="muted mt">Proficiency Bonus: <span id="profBonusDisplay">${fmtMod(profBonus())}</span></p>
      </div>

      <div class="panel">
        <h2>Combat</h2>
        <div class="grid grid-3">
          <div class="field"><label>Armor Class</label><input type="number" data-path="ac" data-numeric value="${sheet.ac}"></div>
          <div class="field"><label>Initiative Bonus</label><input type="number" data-path="initiativeBonus" data-numeric value="${sheet.initiativeBonus}"></div>
          <div class="field"><label>Speed</label><input type="number" data-path="speed" data-numeric value="${sheet.speed}"></div>
        </div>
        <p class="muted">Total Initiative: <span id="initDisplay">${fmtMod(abilityMod(sheet.abilities.dex) + (parseInt(sheet.initiativeBonus,10)||0))}</span></p>
        <div class="grid grid-3">
          <div class="field"><label>Max HP</label><input type="number" data-path="hpMax" data-numeric value="${sheet.hpMax}"></div>
          <div class="field"><label>Current HP</label><input type="number" data-path="hpCurrent" data-numeric value="${sheet.hpCurrent}"></div>
          <div class="field"><label>Temp HP</label><input type="number" data-path="hpTemp" data-numeric value="${sheet.hpTemp}"></div>
        </div>
        <div class="field"><label>Hit Dice</label><input data-path="hitDice" value="${escapeHtml(sheet.hitDice)}"></div>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="panel">
        <h2>Saving Throws</h2>
        ${savesBlock()}
      </div>
      <div class="panel">
        <h2>Skills</h2>
        ${skillsBlock()}
      </div>
    </div>

    <div class="panel">
      <div class="row between"><h2 class="mb0" style="border:none;">Attacks</h2><button onclick="addAttack()">+ Add</button></div>
      <table class="mt"><thead><tr><th>Name</th><th>Bonus</th><th>Damage/Type</th><th></th></tr></thead>
      <tbody>${attacksRows()}</tbody></table>
    </div>

    <div class="grid grid-2">
      <div class="panel">
        <div class="row between"><h2 class="mb0" style="border:none;">Inventory</h2><button onclick="addInventoryItem()">+ Add</button></div>
        <table class="mt"><thead><tr><th>Item</th><th>Qty</th><th></th></tr></thead>
        <tbody>${inventoryRows()}</tbody></table>
      </div>
      <div class="panel">
        <h2>Spell Slots</h2>
        ${spellSlotsBlock()}
        <div class="row between mt"><h2 class="mb0" style="border:none;">Spells</h2><button onclick="addSpell()">+ Add</button></div>
        <table class="mt"><thead><tr><th>Name</th><th>Level</th><th>Prepared</th><th></th></tr></thead>
        <tbody>${spellsRows()}</tbody></table>
      </div>
    </div>

    <div class="panel">
      <h2>Features &amp; Traits</h2>
      <textarea data-path="features" rows="4">${escapeHtml(sheet.features)}</textarea>
    </div>

    <div class="panel">
      <h2>Notes / Backstory</h2>
      <textarea data-path="notes" rows="6">${escapeHtml(sheet.notes)}</textarea>
    </div>

    <div class="row">
      <button class="danger" id="deleteBtn">Delete Character</button>
    </div>
  `;

  bindInputs(app);
  document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!confirm(`Delete ${character.name}? This cannot be undone.`)) return;
    await api('DELETE', `/api/characters/${character.id}`);
    window.location.href = '/dashboard.html';
  });
}

async function init() {
  const user = await requireUser();
  if (!user) return;
  renderTopbar('character', user);

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = '/dashboard.html'; return; }

  try {
    const [{ character: c }, { campaigns: camps }] = await Promise.all([
      api('GET', `/api/characters/${id}`),
      api('GET', '/api/campaigns')
    ]);
    character = c;
    sheet = c.sheet;
    campaigns = camps;
    render();
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="panel error">${escapeHtml(err.message)}</div>`;
  }
}

init();
