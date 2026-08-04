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

const RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
const BACKGROUNDS = ['Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero', 'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin'];
const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
const CLASS_DATA = {
  Barbarian: { hitDie: 12, choose: 2, skills: ['athletics', 'intimidation', 'animalHandling', 'nature', 'perception', 'survival'] },
  Bard: { hitDie: 8, choose: 3, skills: 'any' },
  Cleric: { hitDie: 8, choose: 2, skills: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
  Druid: { hitDie: 8, choose: 2, skills: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
  Fighter: { hitDie: 10, choose: 2, skills: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
  Monk: { hitDie: 8, choose: 2, skills: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
  Paladin: { hitDie: 10, choose: 2, skills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
  Ranger: { hitDie: 10, choose: 3, skills: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
  Rogue: { hitDie: 8, choose: 4, skills: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'] },
  Sorcerer: { hitDie: 6, choose: 2, skills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
  Warlock: { hitDie: 8, choose: 2, skills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
  Wizard: { hitDie: 6, choose: 2, skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'] }
};

const ABILITY_TIPS = {
  str: 'Strength: physical power. Affects melee attack/damage rolls, the Athletics skill, and how much you can carry.',
  dex: 'Dexterity: agility and reflexes. Affects Armor Class, Initiative, ranged attacks, and Acrobatics/Sleight of Hand/Stealth.',
  con: 'Constitution: health and stamina. Affects your hit points and Concentration saves.',
  int: 'Intelligence: reasoning and memory. Affects Arcana/History/Investigation/Nature/Religion, and Wizard spellcasting.',
  wis: 'Wisdom: awareness and insight. Affects Animal Handling/Insight/Medicine/Perception/Survival, and Cleric/Druid/Ranger spellcasting.',
  cha: 'Charisma: force of personality. Affects Deception/Intimidation/Performance/Persuasion, and Bard/Paladin/Sorcerer/Warlock spellcasting.'
};

const SKILL_TIPS = {
  acrobatics: 'Balance, tumbling, and escaping grapples.',
  animalHandling: 'Calming, controlling, or reading the intentions of animals.',
  arcana: 'Knowledge of spells, magic items, and magical traditions.',
  athletics: 'Climbing, jumping, swimming, and grappling.',
  deception: 'Convincingly hiding the truth.',
  history: 'Knowledge of historical events, people, and civilizations.',
  insight: 'Reading true intentions and detecting lies.',
  intimidation: 'Influencing someone through threats or a show of force.',
  investigation: 'Finding clues and deducing information from evidence.',
  medicine: 'Diagnosing illness and stabilizing the dying.',
  nature: 'Knowledge of terrain, plants, animals, and weather.',
  perception: 'Spotting, hearing, or otherwise noticing things.',
  performance: 'Entertaining an audience with music, acting, or storytelling.',
  persuasion: 'Influencing others through tact and social grace.',
  religion: 'Knowledge of deities, rites, and religious hierarchies.',
  sleightOfHand: 'Manual trickery, like pickpocketing or planting an item.',
  stealth: 'Hiding, moving silently, and avoiding notice.',
  survival: 'Tracking, foraging, and navigating the wilderness.'
};

const FIELD_TIPS = {
  race: "Your character's lineage. Mostly flavor and a few minor traits — doesn't restrict class or background choices.",
  class: "Your character's adventuring profession. Determines hit die, combat role, and which skills/spells you can access.",
  background: "Your character's life before adventuring. Grants extra skill proficiencies and roleplay hooks. In 5e rules, ANY background can pair with ANY class — there's no restriction, so a Barbarian Sage or Wizard Soldier is completely legal.",
  alignment: "A rough moral/ethical compass for roleplay (e.g. Chaotic Good). It's a guideline for how your character acts, not a hard mechanical rule.",
  level: 'Your character’s overall power tier (1–20). Higher levels grant more hit points, a bigger proficiency bonus, and new class features.',
  experience: 'Experience points earned from adventuring. Accumulating enough XP raises your level.',
  profBonus: "Bonus added to any roll you're proficient in (skills, saves, attacks). Grows automatically as you level up.",
  ac: 'Armor Class: how hard you are to hit. An attack roll must meet or beat this number to land.',
  initiativeBonus: 'A flat bonus to your Initiative roll, beyond your Dexterity modifier (usually 0 unless a feature grants more).',
  initiative: 'Rolled as 1d20 + this total at the start of combat to determine turn order — higher goes first.',
  speed: 'How many feet you can move on your turn.',
  hpMax: 'The most hit points you can have at full health.',
  hpCurrent: 'Your hit points right now. You fall unconscious at 0.',
  hpTemp: 'Temporary hit points from spells/abilities. Lost before your real HP, and don’t stack with themselves.',
  hitDice: 'Dice you can spend on a short rest to heal. You regain them on a long rest. Auto-fills from your class and level.'
};

function tipAttr(text) {
  return `data-tip="${escapeHtml(text)}"`;
}

let character = null;
let sheet = null;
let saveTimer = null;
let campaigns = [];
let customMode = { race: false, class: false, background: false, alignment: false };

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
      <label ${tipAttr(ABILITY_TIPS[a])}>${ABILITY_LABELS[a].slice(0,3).toUpperCase()}</label>
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
      <span ${tipAttr(ABILITY_TIPS[a] + ' Check the box if you are proficient in this saving throw.')}>${ABILITY_LABELS[a]}</span>
    </div>
  `).join('');
}

function skillsBlock() {
  const cd = CLASS_DATA[sheet.class];
  const classSkills = cd ? (cd.skills === 'any' ? SKILLS.map((s) => s[0]) : cd.skills) : [];
  const hint = cd
    ? `<p class="muted" style="margin-top:-4px;margin-bottom:10px;">${escapeHtml(sheet.class)} typically picks ${cd.choose} skill${cd.choose > 1 ? 's' : ''} from the highlighted options below.</p>`
    : '';
  const rows = SKILLS.map(([key, label, ability]) => {
    const isClassSkill = classSkills.includes(key);
    return `
    <div class="row" style="margin-bottom:5px;${isClassSkill ? 'background:rgba(201,162,75,0.1);border-radius:4px;padding:2px 4px;' : ''}">
      <input type="checkbox" data-path="skillProficiencies.${key}" ${sheet.skillProficiencies[key] ? 'checked' : ''} style="width:auto;">
      <span class="val" id="skill-${key}-bonus" style="width:34px;display:inline-block;color:var(--gold-bright);font-weight:bold;">${fmtMod(abilityMod(sheet.abilities[ability]) + (sheet.skillProficiencies[key] ? profBonus() : 0))}</span>
      <span ${tipAttr(SKILL_TIPS[key] || '')}>${label} <span class="muted">(${ability.toUpperCase()})</span>${isClassSkill ? ' <span class="pill dm" style="padding:0 6px;font-size:10px;">class</span>' : ''}</span>
    </div>`;
  }).join('');
  return hint + rows;
}

function isCustomValue(field, options) {
  return customMode[field] || !!(sheet[field] && !options.includes(sheet[field]));
}

function choiceField(field, label, options) {
  const val = sheet[field];
  const custom = isCustomValue(field, options);
  const opts = options.map((o) => `<option value="${escapeHtml(o)}" ${val === o && !custom ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('');
  return `
    <div class="field">
      <label ${tipAttr(FIELD_TIPS[field] || '')}>${label}</label>
      <select onchange='onChoiceChange(this, "${field}", ${JSON.stringify(options)})'>
        <option value="">-- Choose --</option>
        ${opts}
        <option value="__custom__" ${custom ? 'selected' : ''}>Custom / Other...</option>
      </select>
      ${custom ? `<input id="${field}CustomInput" placeholder="Enter custom ${label.toLowerCase()}" value="${escapeHtml(val || '')}" oninput="onCustomInput(this,'${field}')" style="margin-top:6px;">` : ''}
    </div>
  `;
}

function onChoiceChange(select, field, options) {
  const val = select.value;
  if (val === '__custom__') {
    customMode[field] = true;
    render();
    setTimeout(() => {
      const el = document.getElementById(field + 'CustomInput');
      if (el) el.focus();
    }, 0);
    return;
  }
  customMode[field] = false;
  setPath(sheet, field, val);
  if (field === 'class') {
    const cd = CLASS_DATA[val];
    if (cd) sheet.hitDice = `${parseInt(sheet.level, 10) || 1}d${cd.hitDie}`;
  }
  render();
  scheduleSave();
}

window.onChoiceChange = onChoiceChange;

window.onCustomInput = function (input, field) {
  setPath(sheet, field, input.value);
  scheduleSave();
};

window.onLevelChange = function (input) {
  const level = parseInt(input.value, 10) || 1;
  sheet.level = level;
  const cd = CLASS_DATA[sheet.class];
  if (cd) {
    sheet.hitDice = `${level}d${cd.hitDie}`;
    const hitDiceInput = document.querySelector('[data-path="hitDice"]');
    if (hitDiceInput) hitDiceInput.value = sheet.hitDice;
  }
  updateDerived();
  scheduleSave();
};

function rollAbilityScore() {
  const rolls = [0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6));
  rolls.sort((a, b) => a - b);
  rolls.shift();
  return rolls.reduce((a, b) => a + b, 0);
}

window.applyStandardArray = function () {
  const arr = [15, 14, 13, 12, 10, 8];
  ABILITIES.forEach((a, i) => { sheet.abilities[a] = arr[i]; });
  render();
  scheduleSave();
};

window.applyRolledStats = function () {
  ABILITIES.forEach((a) => { sheet.abilities[a] = rollAbilityScore(); });
  render();
  scheduleSave();
};

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
        ${choiceField('race', 'Race', RACES)}
        ${choiceField('class', 'Class', Object.keys(CLASS_DATA))}
        ${choiceField('background', 'Background', BACKGROUNDS)}
        ${choiceField('alignment', 'Alignment', ALIGNMENTS)}
        <div class="field"><label ${tipAttr(FIELD_TIPS.level)}>Level</label><input type="number" min="1" max="20" data-path="level" data-numeric value="${sheet.level}" onchange="onLevelChange(this)"></div>
        <div class="field"><label ${tipAttr(FIELD_TIPS.experience)}>Experience</label><input type="number" min="0" data-path="experience" data-numeric value="${sheet.experience}"></div>
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
        <div class="row" style="gap:8px;margin-bottom:10px;">
          <button type="button" class="secondary" onclick="applyStandardArray()">Standard Array</button>
          <button type="button" class="secondary" onclick="applyRolledStats()">Roll for Stats</button>
        </div>
        <div class="grid" style="grid-template-columns:repeat(6,1fr);gap:8px;">${abilityBoxes()}</div>
        <p class="muted mt">Proficiency Bonus: <span id="profBonusDisplay" ${tipAttr(FIELD_TIPS.profBonus)}>${fmtMod(profBonus())}</span></p>
      </div>

      <div class="panel">
        <h2>Combat</h2>
        <div class="grid grid-3">
          <div class="field"><label ${tipAttr(FIELD_TIPS.ac)}>Armor Class</label><input type="number" data-path="ac" data-numeric value="${sheet.ac}"></div>
          <div class="field"><label ${tipAttr(FIELD_TIPS.initiativeBonus)}>Initiative Bonus</label><input type="number" data-path="initiativeBonus" data-numeric value="${sheet.initiativeBonus}"></div>
          <div class="field"><label ${tipAttr(FIELD_TIPS.speed)}>Speed</label><input type="number" data-path="speed" data-numeric value="${sheet.speed}"></div>
        </div>
        <p class="muted">Total Initiative: <span id="initDisplay" ${tipAttr(FIELD_TIPS.initiative)}>${fmtMod(abilityMod(sheet.abilities.dex) + (parseInt(sheet.initiativeBonus,10)||0))}</span></p>
        <div class="grid grid-3">
          <div class="field"><label ${tipAttr(FIELD_TIPS.hpMax)}>Max HP</label><input type="number" data-path="hpMax" data-numeric value="${sheet.hpMax}"></div>
          <div class="field"><label ${tipAttr(FIELD_TIPS.hpCurrent)}>Current HP</label><input type="number" data-path="hpCurrent" data-numeric value="${sheet.hpCurrent}"></div>
          <div class="field"><label ${tipAttr(FIELD_TIPS.hpTemp)}>Temp HP</label><input type="number" data-path="hpTemp" data-numeric value="${sheet.hpTemp}"></div>
        </div>
        <div class="field"><label ${tipAttr(FIELD_TIPS.hitDice)}>Hit Dice</label><input data-path="hitDice" value="${escapeHtml(sheet.hitDice)}"></div>
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
