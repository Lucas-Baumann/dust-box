/* DUST BOX v1.3.0 — Castelo da Poeira Eterna (Engine Principal) */
(function(){
"use strict";
const SAVE_KEY = 'dustbox_save_v1';
const PREFS_KEY = 'dustbox_prefs_v1';

const {
  THEMES, WEAPON_ORDER, ARMOR_ORDER, BAG_ORDER,
  ACCELS, ACCELS_ACT2, RELICS, WEAPONS, ARMORS, BAGS, TOOLS, POTIONS, SKILLS,
  ITEM_LABELS, SECRETS, ACHIEVEMENT_INFO,
  COMBAT_ZONES, ALL_MONSTERS, LEVERS
} = window.DustData;
const ART = window.DustArt;
const DIALOGUES = window.DustDialogues;
const PUZZLES = window.DustPuzzles;
const I18n = window.DustI18n;
const t = (k, v, fb) => I18n ? I18n.t(k, v, fb) : (fb || k);
const tx = (k, v, fb) => I18n ? I18n.tx(k, v, fb) : esc(fb || k);
const trAttr = (k, v) => I18n ? I18n.trAttr(k, v) : '';
const o = (p, id, f, fb) => I18n ? I18n.obj(p, id, f, fb) : fb;
const ox = (p, id, f, fb) => I18n ? I18n.objTx(p, id, f, fb) : esc(fb);

function registerPtCatalog(){
  if(!I18n) return;
  const pt = {};
  const addObj = (prefix, map, fields) => {
    for(const id in map){
      const it = map[id];
      fields.forEach(f => { if(it && it[f] !== undefined) pt[`${prefix}.${id}.${f}`] = it[f]; });
    }
  };
  addObj('acc', ACCELS, ['name', 'desc']);
  addObj('acc', ACCELS_ACT2, ['name', 'desc']);
  addObj('rel', RELICS, ['name', 'effect', 'desc']);
  addObj('wep', WEAPONS, ['name', 'passive', 'desc', 'hint']);
  addObj('arm', ARMORS, ['name', 'desc', 'hint']);
  addObj('bag', BAGS, ['name', 'desc', 'hint']);
  addObj('tool', TOOLS, ['name', 'effect', 'desc', 'hint']);
  addObj('pot', POTIONS, ['name', 'effect', 'desc']);
  addObj('sk', SKILLS, ['name', 'desc', 'hint']);
  for(const id in ITEM_LABELS) pt[`itm.${id}.name`] = ITEM_LABELS[id];
  addObj('sec', SECRETS, ['name', 'bonusText', 'desc', 'hint']);
  addObj('ach', ACHIEVEMENT_INFO, ['name', 'desc']);
  COMBAT_ZONES.forEach(z => {
    pt[`zone.${z.id}.name`] = z.name;
    pt[`zone.${z.id}.short`] = z.short;
    pt[`zone.${z.id}.desc`] = z.desc;
  });
  ALL_MONSTERS.forEach(m => {
    pt[`mon.${m.id}.name`] = m.name;
    pt[`mon.${m.id}.desc`] = m.desc;
  });
  I18n.register('pt', pt);
}
registerPtCatalog();

function defaultState(){
  return {
    version: "2.1.0",
    ngPlus: 0,
    resources: { dust: 0, magicDust: 0, socks: 0, dustPerSecond: 1, maxDust: 1000, totalEarned: 0 },
    unlocks: { outOfRoom:false, metMoth:false, hasMap:false, hasLantern:false, hasCompendium:false, candyLooted:false, windLooted:false, puzzleSolved:false, act2:false, cablesSolved:false, clockUnlocked:false, finalChoiceReady:false, ending:null, viewingEnding:false, victory:false },
    accelerators: { window:0, cat:0, carpet:0, fan:0, pillow:0, box16:0, dvds:0 },
    inventory: { weapon:'none', armor:'roupa_mofada', bag:'bolso_furado', tools:[], relics:[], potions:{ cha_poeira:0, tonico_cafeina:0, cafe_meia:0 }, items:[] },
    upgrades: { skillLv: 0, magicBless: 0, sockStitch: 0 },
    player: { hp:100, maxHp:100, attack:2 },
    puzzle: { solution:null, current:[0,0,0], attempts:0 },
    safe: null,
    radio: null,
    maze: null,
    clockDial: null,
    cables: { order:['P2','VGA','USB','HDMI'] },
    gears: { cable:false, boss:false },
    key: { fragments:0, complete:false },
    achievements: [],
    secrets: [],
    discoveredMonsters: {},
    combat: { active:false, autoTea:false, realm:'castelo', zone:0, unlockedZones:1, zoneLoops:[1,1,1,1,1,1,1], idx:0, monster:null, mhp:0, mmax:1, clog:[], kills:0 },
    flags: {},
    ui: { tab:'quarto', subview:null, compTab:'equip' },
    intro: { cleans: 0, done: false },
    lastSeen: Date.now()
  };
}

let S = defaultState();

const uiEphemeral = {
  npcSpeech: {},
  npcChoices: {},
  npcTalkIdx: {},
  feedbackTimer: null,
  toastTimer: null,
  lastIntroReady: false,
  lastRatVisible: false,
  cursorClicks: 0,
  barataClicks: 0,
  remoteClicks: 0,
  guitarClicks: 0,
  candyClicks: 0,
  idleSeconds: 0,
  moteTimer: 45,
  moteEl: null,
  flashTimer: 110,
  flashEvent: null,
  fitaUsed: false,
  sofaCd: 0,
  track: { ppos: 2, mpos: 28, fx: '' },
  skillCd: { sweep: 0, cloud: 0, sneeze: 0 },
  buffs: { cloudTurns: 0, stunTurns: 0, tonicSec: 0 }
};

function save(){
  if(window.__dustboxSkipSave) return;
  S.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e){}
}
function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const d = JSON.parse(raw);
    const def = defaultState();
    S = Object.assign(def, d);
    S.resources = Object.assign(def.resources, d.resources||{});
    S.unlocks = Object.assign(def.unlocks, d.unlocks||{});
    S.accelerators = Object.assign(def.accelerators, d.accelerators||{});
    S.inventory = Object.assign(def.inventory, d.inventory||{});
    if(!Array.isArray(S.inventory.tools)) S.inventory.tools = [];
    if(!Array.isArray(S.inventory.relics)) S.inventory.relics = [];
    if(!Array.isArray(S.inventory.items)) S.inventory.items = [];
    S.inventory.potions = Object.assign({ cha_poeira:0, tonico_cafeina:0, cafe_meia:0 }, S.inventory.potions||{});
    S.upgrades = Object.assign(def.upgrades, d.upgrades||{});
    S.player = Object.assign(def.player, d.player||{});
    S.puzzle = Object.assign(def.puzzle, d.puzzle||{});
    S.safe = d.safe || null;
    S.radio = d.radio || null;
    S.maze = d.maze || null;
    S.clockDial = d.clockDial || null;
    S.cables = Object.assign(def.cables, d.cables||{});
    if(!Array.isArray(S.cables.order) || S.cables.order.length !== 4) S.cables.order = ['P2','VGA','USB','HDMI'];
    S.gears = Object.assign(def.gears, d.gears||{});
    S.key = Object.assign(def.key, d.key||{});
    if(typeof S.ngPlus !== 'number' || S.ngPlus < 0) S.ngPlus = 0;
    S.unlocks.viewingEnding = false;
    S.combat = Object.assign(def.combat, d.combat||{});
    if(!Array.isArray(S.combat.zoneLoops) || S.combat.zoneLoops.length < 7){
      const old = Array.isArray(S.combat.zoneLoops) ? S.combat.zoneLoops : [S.combat.loop||1];
      S.combat.zoneLoops = [old[0]||1, old[1]||1, old[2]||1, old[3]||1, old[4]||1, old[5]||1, old[6]||1];
    }
    if(typeof S.combat.zone !== 'number' || S.combat.zone < 0 || S.combat.zone >= COMBAT_ZONES.length) S.combat.zone = 0;
    if(typeof S.combat.unlockedZones !== 'number' || S.combat.unlockedZones < 1) S.combat.unlockedZones = 1;
    // migracao suave: quem ja tinha aberto o Portao no Ato I entra direto no Ato II
    if(S.unlocks.victory){ S.unlocks.act2 = true; S.unlocks.victory = false; }
    S.combat.active = false;
    S.combat.monster = null;
    S.combat.idx = 0;
    S.combat.mhp = 0;
    S.ui = { tab:'quarto', subview:null, compTab:'equip' };
    S.intro = (d.intro && typeof d.intro.cleans === 'number') ? { cleans: d.intro.cleans, done: !!d.intro.done } : { cleans: 3, done: true };
    S.flags = d.flags||{};
    S.achievements = Array.isArray(d.achievements) ? d.achievements : [];
    S.secrets = Array.isArray(d.secrets) ? d.secrets : [];
    S.discoveredMonsters = (d.discoveredMonsters && typeof d.discoveredMonsters === 'object') ? d.discoveredMonsters : {};
    return true;
  } catch(e){ return false; }
}

function tierRank(order, id){
  const idx = order.indexOf(id);
  return idx < 0 ? 0 : idx;
}
function hasWeaponTier(id){ return tierRank(WEAPON_ORDER, S.inventory.weapon) >= tierRank(WEAPON_ORDER, id); }
function hasArmorTier(id){  return tierRank(ARMOR_ORDER, S.inventory.armor)   >= tierRank(ARMOR_ORDER, id); }
function hasBagTier(id){    return tierRank(BAG_ORDER, S.inventory.bag)       >= tierRank(BAG_ORDER, id); }
function hasTool(id){       return S.inventory.tools.includes(id); }
function hasRelic(id){      return S.inventory.relics.includes(id); }
function hasSecret(id){     return S.secrets.includes(id); }
function hasSkillUnlocked(id){
  const sk = SKILLS[id];
  return !!(sk && (!sk.reqWeapon || hasWeaponTier(sk.reqWeapon)));
}

/* ---------- preferencias, idioma, tema e som ---------- */
let prefs = { theme: 0, sound: false, lang: 'pt', hoverLang: 'off' };
let audioCtx = null;

function loadPrefs(){
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if(raw){
      const p = JSON.parse(raw);
      if(typeof p.theme === 'number' && p.theme >= 0 && p.theme < THEMES.length) prefs.theme = p.theme;
      prefs.sound = !!p.sound;
      if(typeof p.lang === 'string' && I18n && I18n.VANILLA_LANGS.includes(p.lang)) prefs.lang = p.lang;
      if(typeof p.hoverLang === 'string') prefs.hoverLang = p.hoverLang;
    }
  } catch(e){}
  if(I18n){
    I18n.setLang(prefs.lang);
    I18n.setHoverLang(prefs.hoverLang);
  }
}
function savePrefs(){
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch(e){}
}
function applyLangUI(){
  if(I18n){
    I18n.setLang(prefs.lang);
    I18n.applyStatic();
  }
  document.body.classList.toggle('hover-tr-on', prefs.hoverLang !== 'off');
  const bLang = document.getElementById('btn-lang');
  if(bLang) bLang.textContent = t('footer.lang', { v: prefs.lang });
  const bHover = document.getElementById('btn-hover-lang');
  if(bHover) bHover.textContent = t('footer.hover', { v: I18n ? I18n.getHoverLabel() : prefs.hoverLang });
  applyTheme();
  applySoundLabel();
}
function cycleLang(){
  if(!I18n) return;
  const list = I18n.VANILLA_LANGS;
  const idx = (list.indexOf(prefs.lang) + 1) % list.length;
  prefs.lang = list[idx];
  I18n.setLang(prefs.lang);
  savePrefs();
  applyLangUI();
  render();
  sfx('click');
}
function cycleHoverLang(){
  if(!I18n) return;
  const opts = I18n.getHoverOptions();
  const curIdx = opts.findIndex(o => o.code === prefs.hoverLang);
  const next = opts[(curIdx + 1) % opts.length];
  prefs.hoverLang = next.code;
  savePrefs();
  I18n.setHoverLang(prefs.hoverLang, () => {
    applyLangUI();
    render();
  });
  sfx('click');
}
function applyTheme(){
  const tObj = THEMES[prefs.theme] || THEMES[0];
  document.body.classList.remove('theme-green', 'theme-amber', 'crt');
  tObj.classes.forEach(cls => document.body.classList.add(cls));
  const btn = document.getElementById('btn-theme');
  if(btn) btn.textContent = t('footer.theme', { v: tObj.label });
}
function cycleTheme(){
  prefs.theme = (prefs.theme + 1) % THEMES.length;
  applyTheme();
  savePrefs();
  sfx('click');
}
function applySoundLabel(){
  const btn = document.getElementById('btn-sound');
  if(btn) btn.textContent = t('footer.sound', { v: prefs.sound ? 'on' : 'off' });
}
function toggleSound(){
  prefs.sound = !prefs.sound;
  applySoundLabel();
  savePrefs();
  if(prefs.sound) sfx('unlock');
}
function sfx(type){
  if(!prefs.sound) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    if(!audioCtx) audioCtx = new AC();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const map = {
      click:   { f1: 520, f2: 440, dur: 0.04, wave: 'square',   vol: 0.03 },
      buy:     { f1: 440, f2: 660, dur: 0.09, wave: 'triangle', vol: 0.05 },
      unlock:  { f1: 520, f2: 880, dur: 0.14, wave: 'triangle', vol: 0.05 },
      hit:     { f1: 180, f2: 110, dur: 0.05, wave: 'sawtooth', vol: 0.03 },
      error:   { f1: 220, f2: 140, dur: 0.11, wave: 'sawtooth', vol: 0.04 },
      victory: { f1: 523, f2: 1046, dur: 0.25, wave: 'triangle', vol: 0.06 }
    };
    const cfg = map[type] || map.click;
    osc.type = cfg.wave;
    osc.frequency.setValueAtTime(cfg.f1, now);
    osc.frequency.exponentialRampToValueAtTime(cfg.f2, now + cfg.dur);
    gain.gain.setValueAtTime(cfg.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.dur);
    osc.start(now);
    osc.stop(now + cfg.dur + 0.01);
  } catch(e){}
}

function accelTable(k){
  return ACCELS[k] || ACCELS_ACT2[k];
}
function accelCost(k){
  const a = accelTable(k);
  const owned = S.accelerators[k]||0;
  return Math.floor(a.base * Math.pow(1.75, owned));
}
function secretDpsMult(){
  let bonus = 0;
  S.secrets.forEach(id => {
    if(SECRETS[id] && SECRETS[id].dpsBonus) bonus += SECRETS[id].dpsBonus;
  });
  return 1 + bonus;
}
function relicDpsMult(){
  let bonus = 0;
  (S.inventory.relics||[]).forEach(id => {
    if(RELICS[id] && RELICS[id].dpsBonus) bonus += RELICS[id].dpsBonus;
  });
  return 1 + bonus;
}
function secretAtkMult(){
  let bonus = 0;
  S.secrets.forEach(id => {
    if(SECRETS[id] && SECRETS[id].atkBonus) bonus += SECRETS[id].atkBonus;
  });
  return 1 + bonus;
}
function relicAtkMult(){
  let bonus = 0;
  (S.inventory.relics||[]).forEach(id => {
    if(RELICS[id] && RELICS[id].atkBonus) bonus += RELICS[id].atkBonus;
  });
  return 1 + bonus;
}
function baseDps(){
  let dps = 1;
  for(const k in ACCELS) dps += ACCELS[k].bonus * (S.accelerators[k]||0);
  for(const k in ACCELS_ACT2) dps += ACCELS_ACT2[k].bonus * (S.accelerators[k]||0);
  return dps;
}
function recalc(){
  const ngDpsMult = 1 + (S.ngPlus || 0);
  const ngAtkMult = 1 + (S.ngPlus || 0) * 0.30;
  const throneMult = S.unlocks.ending === 'trono' ? 1.5 : 1.0;
  const blessMult = 1 + ((S.upgrades && S.upgrades.magicBless) || 0) * 0.15;
  const stitchMult = 1 + ((S.upgrades && S.upgrades.sockStitch) || 0) * 0.15;
  const dps = baseDps() * secretDpsMult() * relicDpsMult() * ngDpsMult * throneMult * blessMult;
  S.resources.dustPerSecond = Math.round(dps*100)/100;
  const w = WEAPONS[S.inventory.weapon];
  S.player.attack = Math.round((2 + (w ? w.atk : 0)) * relicAtkMult() * secretAtkMult() * ngAtkMult * stitchMult);
  const a = ARMORS[S.inventory.armor];
  if(a){
    S.player.maxHp = Math.round(a.maxHp * stitchMult);
    if(S.player.hp > S.player.maxHp) S.player.hp = S.player.maxHp;
  }
  const b = BAGS[S.inventory.bag];
  if(b){
    const dynamicFloor = S.inventory.bag !== 'bolso_furado' ? Math.floor(S.resources.dustPerSecond * 7200) : 0;
    const bagMult = hasSecret('pano_vo') ? 1.10 : 1.0;
    S.resources.maxDust = Math.round(Math.max(b.max, dynamicFloor) * bagMult);
  }
}

/* ---------- feedback limpo (Opcao A, duracao estendida) ---------- */
function notify(msg, cls){
  const el = document.getElementById('feedback');
  if(!el) return;
  el.className = 'feedback visible' + (cls ? ' ' + cls : '');
  el.textContent = msg;
  if(uiEphemeral.feedbackTimer) clearTimeout(uiEphemeral.feedbackTimer);
  uiEphemeral.feedbackTimer = setTimeout(()=>{
    el.classList.remove('visible');
  }, 7000);
}
function showToast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  if(uiEphemeral.toastTimer) clearTimeout(uiEphemeral.toastTimer);
  uiEphemeral.toastTimer = setTimeout(()=>{
    el.classList.add('hidden');
  }, 8500);
}
function npcSay(npcId, text, choices, trKey, trVars){
  uiEphemeral.npcSpeech[npcId] = trKey ? { key: trKey, vars: trVars || null, fallback: text } : text;
  uiEphemeral.npcChoices[npcId] = choices || null;
}
function getNpcBubble(npcId, defaultKey){
  const cur = uiEphemeral.npcSpeech[npcId];
  if(!cur) return { text: t(defaultKey), key: defaultKey, vars: null };
  if(typeof cur === 'object' && cur.key){
    return { text: t(cur.key, cur.vars, cur.fallback), key: cur.key, vars: cur.vars };
  }
  return { text: cur, key: null, vars: null };
}
function once(key, msg, cls){
  if(S.flags[key]) return;
  S.flags[key] = true;
  notify(msg, cls||'');
}
function achievement(id, name, desc){
  if(S.achievements.includes(id)) return;
  S.achievements.push(id);
  const trName = o('ach', id, 'name', name);
  const trDesc = o('ach', id, 'desc', desc);
  showToast(t('msg.ach_toast', { name: trName, desc: trDesc }));
}
function unlockSecret(id){
  if(hasSecret(id) || !SECRETS[id]) return false;
  S.secrets.push(id);
  recalc();
  sfx('victory');
  showToast(t('msg.sec_toast', {
    name: o('sec', id, 'name', SECRETS[id].name),
    bonus: o('sec', id, 'bonusText', SECRETS[id].bonusText)
  }));
  save();
  render();
  return true;
}

/* ---------- dialogos vivos dos NPCs ---------- */
function talkNpc(npcId){
  const pool = DIALOGUES.getPool(npcId, S);
  if(!pool || !pool.length) return;
  const idx = (uiEphemeral.npcTalkIdx[npcId] || 0) % pool.length;
  uiEphemeral.npcTalkIdx[npcId] = idx + 1;
  const entry = pool[idx];

  S.flags['talked_' + npcId] = true;
  const allTalked = ['rat','moth','termite','spider','beetle'].every(id => S.flags['talked_' + id]);
  if(allTalked) achievement('tagarela', 'Tagarela do Castelo', 'Conversou com todos os 5 habitantes do Castelo');
  if(npcId === 'rat' && (S.ngPlus || 0) >= 1 && !hasSecret('determinacao')){
    unlockSecret('determinacao');
  }

  sfx('click');
  npcSay(npcId, entry.text, entry.choices ? { id: entry.id || `${npcId}_${idx}`, list: entry.choices } : null, entry.key || null, entry.vars || null);
  save();
  render();
}

function chooseDialogue(npcId, choiceIdx){
  const active = uiEphemeral.npcChoices[npcId];
  if(!active || !active.list || !active.list[choiceIdx]) return;
  const ch = active.list[choiceIdx];
  const flagKey = 'dlg_' + active.id;

  let rewardText = '';
  if(!S.flags[flagKey]){
    if(ch.rewardDust){
      const gain = Math.min(ch.rewardDust, Math.max(0, S.resources.maxDust - S.resources.dust));
      S.resources.dust += gain;
      S.resources.totalEarned += gain;
      rewardText = t('msg.reward_dust', { v: fmt(gain) });
      sfx('buy');
    } else if(ch.rewardSocks){
      S.resources.socks = (S.resources.socks || 0) + ch.rewardSocks;
      rewardText = t('msg.reward_socks', { n: ch.rewardSocks });
      sfx('unlock');
    } else {
      sfx('click');
    }
    S.flags[flagKey] = true;
  } else {
    sfx('click');
  }

  npcSay(npcId, ch.reply, null, ch.replyKey || null, null);
  if(rewardText) notify(t('msg.dlg_reward', { reward: rewardText }), 'amber');
  save();
  render();
}

function renderNpcTalkControls(npcId){
  const active = uiEphemeral.npcChoices[npcId];
  let h = `<div class="actions">`;
  if(active && active.list){
    active.list.forEach((ch, idx) => {
      const lbl = ch.labelKey ? t(ch.labelKey, null, ch.label) : ch.label;
      h += `<button class="cmd"${ch.labelKey ? trAttr(ch.labelKey) : ''} onclick="Game.chooseDialogue('${npcId}',${idx})">${esc(lbl)}</button>`;
    });
  } else {
    h += `<button class="cmd subtle"${trAttr('btn.talk')} onclick="Game.talkNpc('${npcId}')">${esc(t('btn.talk'))}</button>`;
  }
  h += `</div>`;
  return h;
}

/* ---------- helpers de texto e balao ASCII ---------- */
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function wrapLines(text, maxWidth){
  const out = [];
  String(text).split('\n').forEach(para => {
    const words = para.split(/\s+/).filter(Boolean);
    if(!words.length){ out.push(''); return; }
    let line = words[0];
    for(let i = 1; i < words.length; i++){
      if((line + ' ' + words[i]).length <= maxWidth){
        line += ' ' + words[i];
      } else {
        out.push(line);
        line = words[i];
      }
    }
    out.push(line);
  });
  return out;
}

function speechBubble(text, maxWidth, secretWord, secretFn, trKey, trVars){
  const lines = wrapLines(text, maxWidth || 44);
  const w = Math.max(12, ...lines.map(l => l.length));
  const top = ' .' + '-'.repeat(w + 2) + '.';
  const body = lines.map(l => ' | ' + l + ' '.repeat(w - l.length) + ' |');
  const leftDash = Math.floor((w - 2) / 2);
  const rightDash = w - 2 - leftDash;
  const bot = " '" + '-'.repeat(leftDash) + '.  .' + '-'.repeat(rightDash) + "'";
  const tail = ' '.repeat(leftDash + 3) + '\\/';
  let html = esc([top, ...body, bot, tail].join('\n'));
  if(secretWord && secretFn){
    const re = new RegExp(esc(secretWord));
    html = html.replace(re, `<span class="secret-word" onclick="${secretFn}">${esc(secretWord)}</span>`);
  }
  const attr = trKey ? trAttr(trKey, trVars) : '';
  return `<pre class="speech-bubble"${attr}>${html}</pre>`;
}

function fmt(n){
  if(n >= 1000000) return (n/1000000).toFixed(2)+'M';
  if(n >= 10000) return (n/1000).toFixed(1)+'k';
  if(Math.floor(n) !== n) return n.toFixed(1);
  return Math.floor(n).toString();
}

/* ---------- acoes ---------- */
function buyAccel(k){
  const a = accelTable(k);
  if(!a) return;
  const npcId = ACCELS_ACT2[k] ? 'remote' : 'moth';
  const c = accelCost(k);
  if(S.resources.dust < c){
    sfx('error');
    npcSay(npcId, t('msg.no_dust_npc'), null, 'msg.no_dust_npc');
    notify(t('msg.no_dust'));
    render();
    return;
  }
  S.resources.dust -= c;
  S.accelerators[k] = (S.accelerators[k] || 0) + 1;
  sfx('buy');
  const aname = o('acc', k, 'name', a.name);
  npcSay(npcId, t('msg.accel_npc', { name: aname, bonus: a.bonus }), null, 'msg.accel_npc', { name: aname, bonus: a.bonus });
  notify(t('msg.accel_not', { name: aname, bonus: a.bonus }), 'amber');
  recalc(); save(); render();
}

function lubricate(){
  if(S.resources.dust < 100){
    sfx('error');
    npcSay('rat', t('msg.lub_no_npc'), null, 'msg.lub_no_npc');
    notify(t('msg.lub_no'));
    render();
    return;
  }
  S.resources.dust -= 100;
  S.unlocks.outOfRoom = true;
  S.unlocks.metMoth = true;
  S.ui.tab = 'hall';
  sfx('unlock');
  npcSay('moth', t('msg.lub_moth'), null, 'msg.lub_moth');
  showToast(t('msg.lub_toast'));
  recalc(); save(); render();
}

function buyItem(id){
  const R = S.resources;
  const inv = S.inventory.items;
  const need = (cost, npcId)=>{
    if(R.dust < cost){
      sfx('error');
      if(npcId) npcSay(npcId, t('msg.no_dust_buy'), null, 'msg.no_dust_buy');
      notify(t('msg.no_dust'));
      render();
      return false;
    }
    R.dust -= cost;
    return true;
  };
  if(TOOLS[id]){
    if(hasTool(id)) return;
    const npcId = id==='pa_lixo' ? 'moth' : id==='luva_borracha' ? 'spider' : id==='flanela_microfibra' ? 'termite' : id==='fita_isolante' ? 'remote' : 'guitar';
    if(!need(TOOLS[id].price, npcId)) return;
    S.inventory.tools.push(id);
    sfx('buy');
    const tname = o('tool', id, 'name', TOOLS[id].name);
    const teff = o('tool', id, 'effect', TOOLS[id].effect);
    npcSay(npcId, t('msg.tool_npc', { name: tname, effect: teff }), null, 'msg.tool_npc', { name: tname, effect: teff });
    notify(t('msg.tool_not', { name: tname, effect: teff }), 'amber');
    recalc(); save(); render();
    return;
  }
  switch(id){
    case 'mapa_castelo':
      if(inv.includes('mapa_castelo')) return;
      if(!need(150, 'moth')) return;
      inv.push('mapa_castelo'); S.unlocks.hasMap = true;
      sfx('unlock');
      npcSay('moth', t('msg.map_npc'), null, 'msg.map_npc');
      showToast(t('msg.map_toast')); break;
    case 'lanterna':
      if(inv.includes('lanterna')) return;
      if(!need(300, 'moth')) return;
      inv.push('lanterna'); S.unlocks.hasLantern = true;
      sfx('unlock');
      npcSay('moth', t('msg.lantern_npc'), null, 'msg.lantern_npc');
      notify(t('msg.lantern_not'), 'amber'); break;
    case 'pedra_peso':
      if(inv.includes('pedra_peso')) return;
      if(!need(500, 'moth')) return;
      inv.push('pedra_peso');
      sfx('buy');
      npcSay('moth', t('msg.stone_npc'), null, 'msg.stone_npc');
      notify(t('msg.stone_not'), 'amber'); break;
    case 'vassoura_quebrada':
    case 'espanador_pena':
    case 'rodo_combate':
    case 'cabo_hdmi':
    case 'aspirador_entupido':
    case 'vassoura_eletrica':
    case 'ponteiro_12h': {
      const w = WEAPONS[id];
      if(hasWeaponTier(id) || (w.req && !hasWeaponTier(w.req))) return;
      const npcId = id==='ponteiro_12h' ? null : (id==='vassoura_eletrica' ? 'guitar' : (S.ui.subview==='leste' ? 'termite' : 'moth'));
      if(!need(w.price, npcId)) return;
      S.inventory.weapon = id;
      sfx('buy');
      const wname = o('wep', id, 'name', w.name);
      const wpas = o('wep', id, 'passive', w.passive);
      const extra = w.passive !== 'Nenhuma' ? t('msg.wep_passive', { p: wpas }) : t('msg.wep_nopassive');
      if(npcId) npcSay(npcId, t('msg.wep_npc', { name: wname, extra }), null, 'msg.wep_npc', { name: wname, extra });
      notify(t('msg.wep_not', { name: wname, atk: w.atk }), 'amber');
      for(const sid in SKILLS){
        if(SKILLS[sid].reqWeapon === id){
          showToast(t('msg.skill_toast', { key: SKILLS[sid].key, name: o('sk', sid, 'name', SKILLS[sid].name) }));
        }
      }
      break;
    }
    case 'casaco_pano_mofado':
    case 'mascara_antipoeira':
    case 'capa_teia':
    case 'armadura_papelao':
    case 'cobertor_pesado':
    case 'manto_tempo': {
      const a = ARMORS[id];
      if(hasArmorTier(id) || (a.req && !hasArmorTier(a.req))) return;
      const npcId = id==='manto_tempo' ? null : (id==='cobertor_pesado' ? 'guitar' : 'spider');
      if(!need(a.price, npcId)) return;
      const prevMax = S.player.maxHp;
      S.inventory.armor = id;
      S.player.hp = Math.min(a.maxHp, S.player.hp + Math.max(0, a.maxHp - prevMax));
      sfx('buy');
      const aname = o('arm', id, 'name', a.name);
      if(npcId) npcSay(npcId, t('msg.arm_npc', { name: aname }), null, 'msg.arm_npc', { name: aname });
      notify(t('msg.arm_not', { name: aname, hp: a.maxHp }), 'amber'); break;
    }
    case 'saco_teia':
    case 'saco_compactado':
    case 'mala_sotao':
    case 'bau_sem_fundo': {
      const b = BAGS[id];
      if(hasBagTier(id) || (b.req && !hasBagTier(b.req))) return;
      if(!need(b.price, 'spider')) return;
      S.inventory.bag = id;
      sfx('buy');
      const bname = o('bag', id, 'name', b.name);
      npcSay('spider', t('msg.bag_npc', { name: bname }), null, 'msg.bag_npc', { name: bname });
      notify(t('msg.bag_not', { name: bname }), 'amber'); break;
    }
    default:
      return;
  }
  recalc(); save(); render();
}

function transmute(){
  if(S.resources.dust < 10000){
    sfx('error');
    npcSay('beetle', t('msg.trans_no_npc'), null, 'msg.trans_no_npc');
    notify(t('msg.trans_no'));
    render();
    return;
  }
  S.resources.dust -= 10000;
  S.resources.magicDust += 1;
  sfx('unlock');
  npcSay('beetle', t('msg.trans_ok_npc'), null, 'msg.trans_ok_npc');
  notify(t('msg.trans_ok'), 'amber');
  save(); render();
}

function transmuteAll(){
  const count = Math.floor(S.resources.dust / 10000);
  if(count <= 0){ transmute(); return; }
  S.resources.dust -= count * 10000;
  S.resources.magicDust += count;
  sfx('unlock');
  npcSay('beetle', t('msg.trans_all_npc', { n: count, dust: fmt(count * 10000) }), null, 'msg.trans_all_npc', { n: count, dust: fmt(count * 10000) });
  notify(t('msg.trans_all', { n: count }), 'amber');
  save(); render();
}

function craftFragment(){
  if(S.key.complete){ npcSay('beetle', t('msg.frag_done_npc'), null, 'msg.frag_done_npc'); render(); return; }
  if(S.key.fragments >= 3){ npcSay('beetle', t('msg.frag_max_npc'), null, 'msg.frag_max_npc'); render(); return; }
  if(S.resources.magicDust < 2){ sfx('error'); npcSay('beetle', t('msg.frag_nomagic_npc'), null, 'msg.frag_nomagic_npc'); notify(t('msg.frag_nomagic')); render(); return; }
  if(S.resources.dust < 5000){ sfx('error'); npcSay('beetle', t('msg.frag_nodust_npc'), null, 'msg.frag_nodust_npc'); notify(t('msg.frag_nodust')); render(); return; }
  S.resources.magicDust -= 2;
  S.resources.dust -= 5000;
  S.key.fragments++;
  sfx('unlock');
  if(S.key.fragments === 3) npcSay('beetle', t('msg.frag_3_npc'), null, 'msg.frag_3_npc');
  else npcSay('beetle', t('msg.frag_n_npc', { n: S.key.fragments }), null, 'msg.frag_n_npc', { n: S.key.fragments });
  notify(t('msg.frag_not', { n: S.key.fragments }), 'amber');
  save(); render();
}

function fuseKey(){
  if(S.key.fragments < 3){ sfx('error'); npcSay('beetle', t('msg.fuse_no_npc'), null, 'msg.fuse_no_npc'); render(); return; }
  S.key.complete = true;
  if(!S.inventory.items.includes('grande_chave')) S.inventory.items.push('grande_chave');
  sfx('victory');
  npcSay('beetle', t('msg.fuse_ok_npc'), null, 'msg.fuse_ok_npc');
  achievement('chave', 'Chaveiro do Apocalipse Higiênico', 'Fundiu a Grande Chave do Portão');
  save(); render();
}

function openGate(){
  if(!S.key.complete){
    sfx('error');
    notify(t('msg.gate_locked'), 'red');
    return;
  }
  S.unlocks.act2 = true;
  if(S.combat.unlockedZones < 4) S.combat.unlockedZones = 4;
  S.ui.tab = 'desvao';
  S.ui.subview = null;
  sfx('victory');
  achievement('fuga', 'Ar Puro (alegadamente)', 'Abriu o Portão Principal');
  achievement('desvao', 'Além do Portão', 'Entrou no Desvão do Mundo');
  showToast(t('msg.act2_toast'));
  save(); render();
}

/* ---------- Ato II: O Desvao do Mundo ---------- */
function rummageSofa(){
  if(uiEphemeral.sofaCd > 0) return;
  uiEphemeral.sofaCd = 10;
  S.resources.socks = (S.resources.socks || 0) + 1;
  const bonusDust = Math.max(500, Math.floor(S.resources.dustPerSecond * 30));
  S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + bonusDust);
  S.resources.totalEarned += bonusDust;
  sfx('unlock');
  npcSay('remote', t('msg.sofa_npc', { dust: fmt(bonusDust) }), null, 'msg.sofa_npc', { dust: fmt(bonusDust) });
  notify(t('msg.sofa_not', { dust: fmt(bonusDust) }), 'amber');
  save(); render();
}

function buyRelic(id){
  const r = RELICS[id];
  if(!r || hasRelic(id)) return;
  if((S.resources.socks || 0) < r.costSocks){
    sfx('error');
    npcSay('remote', t('msg.relic_no_npc', { n: r.costSocks }), null, 'msg.relic_no_npc', { n: r.costSocks });
    notify(t('msg.relic_no'));
    render();
    return;
  }
  S.resources.socks -= r.costSocks;
  S.inventory.relics.push(id);
  recalc();
  sfx('victory');
  const rname = o('rel', id, 'name', r.name);
  const reff = o('rel', id, 'effect', r.effect);
  npcSay('remote', t('msg.relic_ok_npc', { name: rname, effect: reff }), null, 'msg.relic_ok_npc', { name: rname, effect: reff });
  showToast(t('msg.relic_toast', { name: rname, effect: reff }));
  if(Object.keys(RELICS).every(rid => hasRelic(rid))){
    achievement('colecionador', 'Colecionador de Meias', 'Adquiriu todas as 3 Relíquias do Fundo do Sofá');
  }
  save(); render();
}

function swapCable(i){
  const ord = S.cables.order;
  if(i < 0 || i >= ord.length - 1) return;
  const tmp = ord[i];
  ord[i] = ord[i+1];
  ord[i+1] = tmp;
  sfx('click');
  const solved = ord[0]==='USB' && ord[1]==='HDMI' && ord[2]==='P2' && ord[3]==='VGA';
  if(solved){
    if(!S.unlocks.cablesSolved){
      S.unlocks.cablesSolved = true;
      S.gears.cable = true;
      S.resources.socks = (S.resources.socks || 0) + 3;
      S.resources.magicDust += 2;
      sfx('victory');
      achievement('cabos', 'Desembaraçador Profissional', 'Organizou a Gaveta dos Cabos Emaranhados');
      showToast(t('msg.cable_toast'));
    } else {
      const gain = Math.min(5000, Math.max(0, S.resources.maxDust - S.resources.dust));
      S.resources.dust += gain;
      S.resources.totalEarned += gain;
      notify(t('msg.cable_repeat', { dust: fmt(gain) }));
    }
  }
  save(); render();
}

function unlockClockTower(){
  if(!S.gears.cable || !S.gears.boss){
    sfx('error');
    notify(t('msg.clock_no'));
    return;
  }
  S.unlocks.clockUnlocked = true;
  if(S.combat.unlockedZones < 7) S.combat.unlockedZones = 7;
  sfx('victory');
  showToast(t('msg.clock_toast'));
  save(); render();
}

/* ---------- 4 novos puzzles + Altar + Eventos Relampago ---------- */
function safeDigit(i, delta){
  PUZZLES.ensureSafe(S);
  if(S.safe.solved) return;
  S.safe.guess[i] = (S.safe.guess[i] + delta + 10) % 10;
  sfx('click');
  save(); render();
}
function testSafe(){
  PUZZLES.ensureSafe(S);
  if(S.safe.solved){ notify(t('msg.safe_already')); return; }
  const res = PUZZLES.evalSafe(S.safe.guess, S.safe.code);
  const str = S.safe.guess.join('');
  S.safe.history.unshift(`${str} -> ${'●'.repeat(res.exact)}${'○'.repeat(res.partial)}${(res.exact+res.partial===0)?'—':''}`);
  S.safe.history = S.safe.history.slice(0, 6);
  if(res.exact === 3){
    S.safe.solved = true;
    S.resources.magicDust += 2;
    const g = Math.min(1500, Math.max(0, S.resources.maxDust - S.resources.dust));
    S.resources.dust += g; S.resources.totalEarned += g;
    sfx('victory');
    achievement('cofre', 'Arrombador de Cofre', 'Decifrou a senha do Cofre Antigo');
    notify(t('msg.safe_open'), 'amber');
  } else {
    sfx('error');
  }
  save(); render();
}

function radioBand(){
  PUZZLES.ensureRadio(S);
  S.radio.band = S.radio.band === 'AM' ? 'FM' : 'AM';
  sfx('click');
  checkRadioSolved();
  save(); render();
}
function radioFreq(delta){
  PUZZLES.ensureRadio(S);
  S.radio.freq = Math.max(88, Math.min(108, S.radio.freq + delta));
  sfx('click');
  checkRadioSolved();
  save(); render();
}
function checkRadioSolved(){
  const sig = PUZZLES.radioSignal(S.radio);
  if(sig.locked && !S.radio.solved){
    S.radio.solved = true;
    S.resources.socks = (S.resources.socks || 0) + 3;
    sfx('victory');
    achievement('radio', 'Sintonizador de Memórias', 'Captou a transmissão secreta no Rádio Velho');
    showToast(t('msg.radio_toast'));
  }
}

function mazeMove(dx, dy){
  PUZZLES.ensureMaze(S);
  const res = PUZZLES.moveMaze(S.maze, dx, dy);
  if(res === 'wall'){ sfx('error'); notify(t('msg.maze_wall')); return; }
  sfx('click');
  if(res === 'goal' && !S.maze.solved){
    S.maze.solved = true;
    S.resources.socks = (S.resources.socks || 0) + 4;
    S.resources.magicDust += 2;
    sfx('victory');
    achievement('labirinto', 'Cartógrafo do Escuro', 'Encontrou o tesouro no Labirinto da Meia Perdida');
    showToast(t('msg.maze_toast'));
  }
  save(); render();
}

function turnClock(i){
  PUZZLES.ensureClockDial(S);
  if(S.unlocks.clockUnlocked) return;
  sfx('click');
  const solved = PUZZLES.turnClockDial(S.clockDial, i);
  if(solved){
    S.clockDial.solved = true;
    unlockClockTower();
    return;
  }
  save(); render();
}

function upgradeSkillLv(){
  const lv = (S.upgrades && S.upgrades.skillLv) || 0;
  if(lv >= 5){ notify(t('msg.sklv_max')); return; }
  const cost = 2 + lv;
  if(S.resources.magicDust < cost){ sfx('error'); notify(t('msg.need_magic', { n: cost })); return; }
  S.resources.magicDust -= cost;
  S.upgrades.skillLv = lv + 1;
  sfx('unlock');
  notify(t('msg.sklv_ok', { lv: S.upgrades.skillLv, pct: S.upgrades.skillLv*15, cd: (S.upgrades.skillLv*0.5).toFixed(1) }), 'amber');
  save(); render();
}

function upgradeMagicBless(){
  const lv = (S.upgrades && S.upgrades.magicBless) || 0;
  const cost = 2 + lv;
  if(S.resources.magicDust < cost){ sfx('error'); notify(t('msg.need_magic', { n: cost })); return; }
  S.resources.magicDust -= cost;
  S.upgrades.magicBless = lv + 1;
  recalc();
  sfx('unlock');
  notify(t('msg.bless_ok', { lv: S.upgrades.magicBless, pct: S.upgrades.magicBless*15 }), 'amber');
  save(); render();
}

function upgradeSockStitch(){
  const lv = (S.upgrades && S.upgrades.sockStitch) || 0;
  const cost = 3 + lv * 2;
  if((S.resources.socks || 0) < cost){ sfx('error'); notify(t('msg.need_socks', { n: cost })); return; }
  S.resources.socks -= cost;
  S.upgrades.sockStitch = lv + 1;
  recalc();
  sfx('unlock');
  notify(t('msg.stitch_ok', { lv: S.upgrades.sockStitch, pct: S.upgrades.sockStitch*15 }), 'amber');
  save(); render();
}

function spawnFlashEvent(){
  if(uiEphemeral.flashEvent || !S.intro.done || S.combat.active || S.unlocks.viewingEnding) return;
  const ev = PUZZLES.FLASH_EVENTS[Math.floor(Math.random() * PUZZLES.FLASH_EVENTS.length)];
  uiEphemeral.flashEvent = ev;
  render();
  setTimeout(()=>{
    if(uiEphemeral.flashEvent === ev){
      uiEphemeral.flashEvent = null;
      render();
    }
  }, 18000);
}

function resolveFlashEvent(choiceIdx){
  const ev = uiEphemeral.flashEvent;
  if(!ev || !ev.choices[choiceIdx]) return;
  const ch = ev.choices[choiceIdx];
  const chMsg = ch.msgKey ? t(ch.msgKey) : (ch.msg || '');
  uiEphemeral.flashEvent = null;
  if(ch.reward === 'dust'){
    const gain = Math.max(80, Math.floor(S.resources.dustPerSecond * (ch.multSec || 90)));
    const added = Math.min(gain, Math.max(0, S.resources.maxDust - S.resources.dust));
    S.resources.dust += added; S.resources.totalEarned += added;
    sfx('buy');
    notify(`${chMsg} (${t('msg.reward_dust', { v: fmt(added) })})`, 'amber');
  } else if(ch.reward === 'sockOrDust'){
    if(S.unlocks.act2){
      S.resources.socks = (S.resources.socks || 0) + 1;
      sfx('unlock');
      notify(chMsg, 'amber');
    } else {
      const gain = Math.max(120, Math.floor(S.resources.dustPerSecond * 120));
      const added = Math.min(gain, Math.max(0, S.resources.maxDust - S.resources.dust));
      S.resources.dust += added; S.resources.totalEarned += added;
      sfx('buy');
      notify(`${chMsg} (${t('msg.reward_dust', { v: fmt(added) })})`, 'amber');
    }
  } else if(ch.reward === 'magic'){
    S.resources.magicDust += 1;
    sfx('unlock');
    notify(chMsg, 'amber');
  } else if(ch.reward === 'tea'){
    S.inventory.potions.cha_poeira = (S.inventory.potions.cha_poeira || 0) + 1;
    sfx('buy');
    notify(chMsg, 'amber');
  }
  save(); render();
}

function chooseEnding(kind){
  if(!S.unlocks.finalChoiceReady) return;
  if(kind !== 'aspirador' && kind !== 'trono') return;
  S.unlocks.ending = kind;
  S.unlocks.viewingEnding = true;
  if(kind === 'aspirador'){
    achievement('final_aspirador', 'Faxina Cósmica', 'Escolheu ligar o Grande Aspirador e retornar ao mundo real');
  } else {
    achievement('final_trono', 'Monarca do Ócio', 'Escolheu assumir o Trono da Poeira e preservar o Dust Box');
  }
  recalc();
  sfx('victory');
  save(); render();
}

function continueAfterEnding(){
  S.unlocks.viewingEnding = false;
  S.ui.tab = 'desvao';
  S.ui.subview = 'torre';
  sfx('click');
  save(); render();
}

function startNewGamePlus(){
  const nextNg = (S.ngPlus || 0) + 1;
  const keepAch = S.achievements.slice();
  const keepSec = S.secrets.slice();
  const keepMon = Object.assign({}, S.discoveredMonsters);
  const keepComp = !!S.unlocks.hasCompendium;

  S = defaultState();
  S.ngPlus = nextNg;
  S.achievements = keepAch;
  S.secrets = keepSec;
  S.discoveredMonsters = keepMon;
  S.unlocks.hasCompendium = keepComp;
  if(keepComp) S.inventory.items.push('compendio');
  S.intro = { cleans: 3, done: true };
  S.flags.rat = true;
  resetCombatRuntime();
  recalc();
  sfx('victory');
  showToast(t('msg.ng_toast', { n: nextNg, dps: nextNg*100, atk: nextNg*30 }));
  save(); render();
}

/* puzzles & estante do compendio */
function ensurePuzzle(){
  if(!S.puzzle.solution){
    S.puzzle.solution = [Math.floor(Math.random()*3), Math.floor(Math.random()*3), Math.floor(Math.random()*3)];
  }
}
function cycleLever(i){
  ensurePuzzle();
  S.puzzle.current[i] = (S.puzzle.current[i]+1)%3;
  sfx('click');
  save(); render();
}
function testLevers(){
  ensurePuzzle();
  const a = S.puzzle.current, b = S.puzzle.solution;
  if(a[0]===b[0] && a[1]===b[1] && a[2]===b[2]){
    if(!S.unlocks.puzzleSolved){
      S.unlocks.puzzleSolved = true;
      S.resources.magicDust += 1;
      sfx('unlock');
      achievement('eletricista', 'Eletricista de Ruína', 'Acendeu a Câmara Escura');
      notify(t('msg.levers_ok'), 'amber');
    } else {
      S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + 200);
      sfx('buy');
      notify(t('msg.levers_repeat'));
    }
  } else {
    S.player.hp -= 2;
    S.resources.dust = Math.min(S.resources.dust + 10, S.resources.maxDust);
    S.puzzle.attempts++;
    sfx('error');
    notify(t('msg.levers_fail'), 'red');
    if(S.player.hp <= 0) faint();
  }
  save(); render();
}

function searchCandy(){
  if(S.unlocks.candyLooted){ notify(t('msg.candy_done')); return; }
  S.unlocks.candyLooted = true;
  S.resources.magicDust += 1;
  sfx('unlock');
  achievement('dieta', 'Caixa de Doces Vazia', 'Revirou o nicho esquecido e achou 1 Poeira Mágica');
  notify(t('msg.candy_ok'), 'amber');
  save(); render();
}

function enterWind(){
  const has = S.inventory.items.includes('pedra_peso');
  if(!has){
    const lost = Math.floor(S.resources.dust);
    S.resources.dust = 0;
    sfx('error');
    achievement('vento', 'Perdeu Tudo no Vento', 'Entrou no Túnel do Vento sem a Pedra de Peso');
    notify(t('msg.wind_lost', { dust: fmt(lost) }), 'red');
  } else {
    if(!S.unlocks.windLooted){
      S.unlocks.windLooted = true;
      S.resources.magicDust += 1;
      sfx('unlock');
      notify(t('msg.wind_ok'), 'amber');
    } else {
      S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + 300);
      sfx('buy');
      notify(t('msg.wind_repeat'));
    }
  }
  save(); render();
}

function pullBook(n){
  if(S.unlocks.hasCompendium){
    notify(t('msg.book_done'));
    return;
  }
  if(n === 1){
    sfx('error');
    notify(t('msg.book_1'));
  } else if(n === 2){
    sfx('error');
    notify(t('msg.book_2'));
  } else if(n === 3){
    S.unlocks.hasCompendium = true;
    if(!S.inventory.items.includes('compendio')) S.inventory.items.push('compendio');
    sfx('victory');
    achievement('bibliotecario', 'Leitor de Poeira', 'Encontrou o Compêndio na Estante Antiga');
    showToast(t('msg.book_3_toast'));
    save(); render();
  }
}

/* ---------- interacoes secretas ---------- */
function pokeTitleCursor(){
  if(!S.intro.done) return;
  uiEphemeral.cursorClicks++;
  sfx('click');
  if(uiEphemeral.cursorClicks === 5 && !hasSecret('cursor_inquieto')){
    notify(t('msg.cursor_5'));
  }
  if(uiEphemeral.cursorClicks >= 10){
    unlockSecret('cursor_inquieto');
  }
}
function pokeRat(){
  sfx('click');
  if((S.accelerators.cat || 0) >= 3 && !hasSecret('caramelo')){
    npcSay('rat', t('msg.rat_caramelo'), null, 'msg.rat_caramelo');
    unlockSecret('caramelo');
    return;
  }
  npcSay('rat', t('msg.rat_poke'), null, 'msg.rat_poke');
  render();
}
function pokeSpiderWord(){
  if(unlockSecret('pano_vo')){
    npcSay('spider', t('msg.spider_secret'), null, 'msg.spider_secret');
    render();
  }
}
function pokeTermite(){
  sfx('click');
  if(S.unlocks.hasLantern && !hasSecret('cafe_ontem')){
    npcSay('termite', t('msg.termite_secret'), null, 'msg.termite_secret');
    unlockSecret('cafe_ontem');
    return;
  }
  npcSay('termite', t('msg.termite_poke'), null, 'msg.termite_poke');
  render();
}
function pokeMonster(){
  const c = S.combat;
  if(!c.active || !c.monster) return;
  if(c.monster.id === 'barata' && !hasSecret('chinelo_havaiana')){
    uiEphemeral.barataClicks++;
    sfx('hit');
    if(uiEphemeral.barataClicks >= 5){
      unlockSecret('chinelo_havaiana');
    }
  }
}
function pokeRemote(){
  sfx('click');
  uiEphemeral.remoteClicks++;
  if(uiEphemeral.remoteClicks >= 5 && !hasSecret('tapa_controle')){
    npcSay('remote', t('msg.remote_secret'), null, 'msg.remote_secret');
    unlockSecret('tapa_controle');
    return;
  }
  if(!hasSecret('tapa_controle')){
    notify(`*tap* (${uiEphemeral.remoteClicks}/5)`);
  }
}
function pokeGuitar(){
  sfx('click');
  uiEphemeral.guitarClicks++;
  if(uiEphemeral.guitarClicks >= 3 && !hasSecret('acorde_desafinado')){
    npcSay('guitar', t('msg.guitar_secret'), null, 'msg.guitar_secret');
    unlockSecret('acorde_desafinado');
    return;
  }
}
function pokeCandy(){
  if(!S.unlocks.candyLooted) return;
  sfx('click');
  uiEphemeral.candyClicks++;
  if(uiEphemeral.candyClicks >= 3 && !hasSecret('maldicao_do_3')){
    unlockSecret('maldicao_do_3');
  }
}
function spawnGoldenMote(){
  if(uiEphemeral.moteEl || !S.intro.done || S.unlocks.victory) return;
  if(typeof document === 'undefined' || !document.body || !document.body.appendChild) return;
  const btn = document.createElement('button');
  btn.className = 'golden-mote';
  btn.textContent = '*';
  btn.title = t('msg.mote_title');
  btn.style.top = (18 + Math.floor(Math.random()*58)) + 'vh';
  btn.style.left = (12 + Math.floor(Math.random()*74)) + 'vw';
  btn.onclick = ()=>{
    if(btn.parentNode) btn.parentNode.removeChild(btn);
    uiEphemeral.moteEl = null;
    const bonus = Math.max(25, Math.floor(S.resources.dustPerSecond * 120));
    S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + bonus);
    S.resources.totalEarned += bonus;
    sfx('unlock');
    if(!hasSecret('grao_dourado')){
      unlockSecret('grao_dourado');
    } else {
      notify(t('msg.mote_catch', { dust: fmt(bonus) }), 'amber');
    }
    save();
  };
  document.body.appendChild(btn);
  uiEphemeral.moteEl = btn;
  setTimeout(()=>{
    if(uiEphemeral.moteEl === btn){
      if(btn.parentNode) btn.parentNode.removeChild(btn);
      uiEphemeral.moteEl = null;
    }
  }, 11000);
}

function buyPotion(id, qty){
  const p = POTIONS[id];
  const n = qty || 1;
  if(!p) return;
  const npcId = id === 'cha_poeira' ? 'moth' : id === 'cafe_meia' ? 'remote' : 'beetle';
  const totalCost = p.price * n;
  if(S.resources.dust < totalCost){
    sfx('error');
    npcSay(npcId, t('msg.pot_no_npc'), null, 'msg.pot_no_npc');
    notify(t('msg.no_dust'));
    render();
    return;
  }
  S.resources.dust -= totalCost;
  S.inventory.potions[id] = (S.inventory.potions[id] || 0) + n;
  sfx('buy');
  const pname = o('pot', id, 'name', p.name);
  npcSay(npcId, t('msg.pot_ok_npc', { name: pname, n, tot: S.inventory.potions[id] }), null, 'msg.pot_ok_npc', { name: pname, n, tot: S.inventory.potions[id] });
  notify(t('msg.pot_ok', { name: pname, tot: S.inventory.potions[id] }), 'amber');
  save(); render();
}

function toggleAutoTea(){
  S.combat.autoTea = !S.combat.autoTea;
  sfx('click');
  save(); render();
}

function usePotion(id){
  const p = POTIONS[id];
  const qty = (S.inventory.potions && S.inventory.potions[id]) || 0;
  if(!p || qty <= 0){
    sfx('error');
    notify(t('msg.pot_none'));
    return;
  }
  if(!S.combat.active){
    notify(t('msg.pot_combat'));
    return;
  }
  if(id === 'cha_poeira'){
    if(S.player.hp >= S.player.maxHp){ notify(t('msg.hp_full')); return; }
    S.inventory.potions[id]--;
    const heal = Math.round(S.player.maxHp * 0.50);
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
    S.combat.clog.unshift(t('msg.pot_tea_log', { heal }));
    S.combat.clog = S.combat.clog.slice(0, 6);
    sfx('unlock');
    save(); render();
  } else if(id === 'tonico_cafeina'){
    S.inventory.potions[id]--;
    uiEphemeral.buffs.tonicSec = 15;
    S.combat.clog.unshift(t('msg.pot_tonic_log'));
    S.combat.clog = S.combat.clog.slice(0, 6);
    sfx('unlock');
    save(); render();
  } else if(id === 'cafe_meia'){
    S.inventory.potions[id]--;
    S.player.hp = S.player.maxHp;
    uiEphemeral.skillCd = { sweep: 0, cloud: 0, sneeze: 0 };
    S.combat.clog.unshift(t('msg.pot_coffee_log'));
    S.combat.clog = S.combat.clog.slice(0, 6);
    sfx('victory');
    save(); render();
  }
}

/* ---------- combate (sem pausa, pista lateral ASCII, 3 fases, habilidades e passivas) ---------- */
function effectiveAtk(){
  const mult = uiEphemeral.buffs.tonicSec > 0 ? 1.5 : 1.0;
  return Math.round(S.player.attack * mult);
}

function resetCombatRuntime(){
  uiEphemeral.track = { ppos: 2, mpos: 28, fx: '' };
  uiEphemeral.skillCd = { sweep: 0, cloud: 0, sneeze: 0 };
  uiEphemeral.buffs = { cloudTurns: 0, stunTurns: 0, tonicSec: 0 };
  uiEphemeral.fitaUsed = false;
}

function selectRealm(r){
  if(S.combat.active) return;
  S.combat.realm = r;
  const first = COMBAT_ZONES.findIndex(z => (z.realm || 'castelo') === r && z.id < S.combat.unlockedZones);
  if(first >= 0) S.combat.zone = first;
  sfx('click');
  save(); render();
}

function selectZone(z){
  if(S.combat.active) return;
  if(z < 0 || z >= S.combat.unlockedZones || z >= COMBAT_ZONES.length) return;
  S.combat.zone = z;
  S.combat.realm = COMBAT_ZONES[z].realm || 'castelo';
  sfx('click');
  save(); render();
}

function spawnMonster(){
  const c = S.combat;
  const zone = COMBAT_ZONES[c.zone] || COMBAT_ZONES[0];
  const base = zone.monsters[c.idx % zone.monsters.length];
  const loop = (c.zoneLoops && c.zoneLoops[c.zone]) || 1;
  const hpMult = 1 + (loop - 1) * 0.35;
  const atkMult = 1 + (loop - 1) * 0.20;
  c.monster = Object.assign({}, base, { atk: Math.max(1, Math.round(base.atk * atkMult)) });
  c.mhp = Math.round(base.hp * hpMult);
  c.mmax = c.mhp;
  uiEphemeral.track = { ppos: 2, mpos: 28, fx: '' };
  uiEphemeral.buffs.cloudTurns = 0;
  uiEphemeral.buffs.stunTurns = 0;
  if(!S.discoveredMonsters[base.id]) S.discoveredMonsters[base.id] = 0;
}

function startExpedition(){
  if(S.inventory.weapon === 'none'){
    sfx('error');
    notify(t('msg.no_weapon'));
    return;
  }
  if(S.combat.active) return;
  const zone = COMBAT_ZONES[S.combat.zone] || COMBAT_ZONES[0];
  resetCombatRuntime();
  S.combat.active = true;
  S.combat.idx = 0;
  S.combat.clog = [t('msg.exp_enter', {
    zone: o('zone', zone.id, 'short', zone.short),
    wep: o('wep', S.inventory.weapon, 'name', WEAPONS[S.inventory.weapon].name)
  })];
  spawnMonster();
  sfx('click');
  save(); render();
}

function retreatExpedition(){
  if(!S.combat.active) return;
  S.combat.active = false;
  S.combat.monster = null;
  S.combat.idx = 0;
  S.combat.mhp = 0;
  resetCombatRuntime();
  sfx('click');
  notify(t('msg.retreat'));
  save(); render();
}

function handleMonsterDefeated(){
  const c = S.combat;
  const zone = COMBAT_ZONES[c.zone] || COMBAT_ZONES[0];
  const loop = (c.zoneLoops && c.zoneLoops[c.zone]) || 1;
  const toolMult = (hasTool('pa_lixo') ? 1.20 : 1.0) * (hasTool('ima_geladeira') ? 1.25 : 1.0);
  const rw = Math.round(c.monster.reward * (1 + (loop - 1) * 0.45) * toolMult);
  S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + rw);
  S.resources.totalEarned += rw;
  let extra = '';
  if(c.monster.magic){ S.resources.magicDust += c.monster.magic; extra += t('msg.extra_magic', { n: c.monster.magic }); }
  else if(c.monster.magicChance && Math.random() < c.monster.magicChance){ S.resources.magicDust += 1; extra += t('msg.extra_magic', { n: 1 }); }
  if(c.monster.socks){ S.resources.socks = (S.resources.socks || 0) + c.monster.socks; extra += t('msg.extra_socks', { n: c.monster.socks }); }
  else if(zone.realm === 'desvao' && hasTool('ima_geladeira') && Math.random() < 0.20){ S.resources.socks = (S.resources.socks || 0) + 1; extra += t('msg.extra_magnet'); }
  const mname = o('mon', c.monster.id, 'name', c.monster.name);
  c.clog.unshift(t('msg.mon_defeated', { name: mname, dust: rw, extra }));
  c.kills++;
  S.discoveredMonsters[c.monster.id] = (S.discoveredMonsters[c.monster.id] || 0) + 1;

  if(c.monster.boss){
    if(c.monster.id === 'rei_mofo') achievement('mofo', 'Assassino de Mofo Real', 'Derrotou o REI MOFO');
    if(c.monster.id === 'baratao') achievement('baratao', 'Pânico da Cozinha', 'Derrotou o BARATÃO BLINDADO');
    if(c.monster.id === 'lorde_acaro') achievement('ancestral', 'Senhor da Alergia', 'Derrotou o LORDE ÁCARO ANCESTRAL');
    if(c.monster.id === 'rei_meias') achievement('rei_meias', 'Par Finalmente Encontrado', 'Derrotou o REI DAS MEIAS SEM PAR');
    if(c.monster.id === 'roteador') achievement('roteador', 'Tirou da Tomada e Botou de Novo', 'Derrotou o ROTEADOR SEM SINAL');
    if(c.monster.id === 'promessa_seg'){
      achievement('promessa', 'Segunda-Feira Chegou', 'Derrotou a PROMESSA DE SEGUNDA-FEIRA');
      if(!S.gears.boss){
        S.gears.boss = true;
        showToast(t('msg.gear_attic_toast'));
      }
    }
    if(c.monster.finalBoss){
      achievement('senhor_tempo', 'O Relógio Voltou a Girar', 'Derrotou O GRANDE ADIAMENTO no topo da Torre');
      S.unlocks.finalChoiceReady = true;
      c.zoneLoops[c.zone] = loop + 1;
      c.active = false;
      c.monster = null;
      c.idx = 0;
      c.mhp = 0;
      resetCombatRuntime();
      sfx('victory');
      showToast(t('msg.final_boss_toast'));
      return;
    }
  }

  if(c.idx + 1 >= zone.monsters.length){
    c.zoneLoops[c.zone] = loop + 1;
    // Fases 1->2->3 (Castelo) e 4->5 (Desvao) desbloqueiam por vitoria
    if((c.zone < 2 || c.zone === 3) && c.zone + 1 >= c.unlockedZones){
      c.unlockedZones = c.zone + 2;
      const nz = COMBAT_ZONES[c.zone + 1];
      showToast(t('msg.zone_unlock_toast', { name: o('zone', nz.id, 'name', nz.name) }));
    }
    c.clog.unshift(t('msg.zone_clear', { zone: o('zone', zone.id, 'short', zone.short), loop: c.zoneLoops[c.zone] }));
    c.idx = 0;
  } else {
    c.idx++;
  }
  spawnMonster();
  if(c.kills === 1) once('k1', t('msg.first_kill'));
  if(c.kills === 10) achievement('exterminador', 'Exterminador de Sujeira', '10 abates nas expedições');
}

function useSkill(id){
  const c = S.combat;
  const sk = SKILLS[id];
  if(!sk || !hasSkillUnlocked(id) || !c.active || !c.monster) return;
  if((uiEphemeral.skillCd[id] || 0) > 0) return;

  const lv = (S.upgrades && S.upgrades.skillLv) || 0;
  const cdFinal = Math.max(2, sk.cd - lv * 0.5);
  const pwrMult = 1 + lv * 0.15;
  uiEphemeral.skillCd[id] = cdFinal;
  const skName = o('sk', id, 'name', sk.name);
  const mname = o('mon', c.monster.id, 'name', c.monster.name);
  if(id === 'sweep'){
    let dmg = Math.round(effectiveAtk() * 2.2 * pwrMult);
    if(c.monster.insect && hasSecret('chinelo_havaiana')) dmg = Math.round(dmg * 1.15);
    c.mhp -= dmg;
    uiEphemeral.track.fx = '>>';
    let note = '';
    if(S.inventory.weapon === 'aspirador_entupido'){
      const heal = Math.max(1, Math.round(dmg * 0.10));
      S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
      note = ` (+${heal} HP)`;
    } else if(S.inventory.weapon === 'ponteiro_12h'){
      const heal = Math.max(1, Math.round(dmg * 0.05));
      S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
      note = ` (+${heal} HP)`;
    }
    c.clog.unshift(t('msg.sk_sweep_log', { sk: skName, dmg, note, mon: mname }));
    sfx('unlock');
    if(c.mhp <= 0) handleMonsterDefeated();
  } else if(id === 'cloud'){
    uiEphemeral.buffs.cloudTurns = 3 + Math.floor(lv / 2);
    uiEphemeral.track.fx = '~~';
    c.clog.unshift(t('msg.sk_cloud_log', { sk: skName, mon: mname, t: uiEphemeral.buffs.cloudTurns }));
    sfx('click');
  } else if(id === 'sneeze'){
    let dmg = Math.round(effectiveAtk() * 1.2 * pwrMult);
    if(c.monster.insect && hasSecret('chinelo_havaiana')) dmg = Math.round(dmg * 1.15);
    c.mhp -= dmg;
    uiEphemeral.track.mpos = Math.min(30, uiEphemeral.track.mpos + 8);
    uiEphemeral.buffs.stunTurns = 1;
    uiEphemeral.track.fx = '!!';
    c.clog.unshift(t('msg.sk_sneeze_log', { sk: skName, mon: mname, dmg }));
    sfx('unlock');
    if(c.mhp <= 0) handleMonsterDefeated();
  }
  c.clog = c.clog.slice(0, 6);
  save(); render();
}

function combatRound(){
  const c = S.combat;
  if(!c.active || !c.monster) return;
  if(S.player.hp <= 0) return;

  // se ainda estao se aproximando na pista, avanca!
  if(uiEphemeral.track.mpos - uiEphemeral.track.ppos > 3){
    uiEphemeral.track.ppos = Math.min(uiEphemeral.track.ppos + 3, uiEphemeral.track.mpos - 3);
    uiEphemeral.track.mpos = Math.max(uiEphemeral.track.ppos + 3, uiEphemeral.track.mpos - 2);
    uiEphemeral.track.fx = '';
    return;
  }

  const variance = Math.floor(Math.random()*3);
  let dmg = effectiveAtk() + variance;
  let note = '';

  if(S.inventory.weapon === 'espanador_pena' && Math.random() < 0.15){
    dmg = Math.round(dmg * 1.5);
    note = t('msg.hit_crit');
  }
  if(S.inventory.weapon === 'cabo_hdmi' && Math.random() < 0.25){
    dmg = Math.round(dmg * 1.5);
    note = t('msg.hit_whip');
  }
  if(S.inventory.weapon === 'vassoura_eletrica' && Math.random() < 0.30){
    dmg = Math.round(dmg * 1.8);
    note = t('msg.hit_bolt');
  }
  if(S.inventory.weapon === 'ponteiro_12h' && Math.random() < 0.35){
    dmg = Math.round(dmg * 2.0);
    note = t('msg.hit_noon');
  }
  if(c.monster.insect && hasSecret('chinelo_havaiana')){
    dmg = Math.round(dmg * 1.15);
  }

  c.mhp -= dmg;
  uiEphemeral.track.fx = '*';
  sfx('hit');

  if(S.inventory.weapon === 'aspirador_entupido'){
    const heal = Math.max(1, Math.round(dmg * 0.10));
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
    note += ` (+${heal} HP)`;
  } else if(S.inventory.weapon === 'ponteiro_12h'){
    const heal = Math.max(1, Math.round(dmg * 0.05));
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
    note += ` (+${heal} HP)`;
  }

  const mname = o('mon', c.monster.id, 'name', c.monster.name);
  c.clog.unshift(t('msg.hit_log', { dmg, note, mon: mname, hp: Math.max(0, c.mhp), max: c.mmax }));

  if(c.mhp <= 0){
    handleMonsterDefeated();
  } else {
    if(uiEphemeral.buffs.stunTurns > 0){
      uiEphemeral.buffs.stunTurns--;
      c.clog.unshift(t('msg.mon_stunned', { mon: mname }));
    } else {
      const stunned = S.inventory.weapon === 'rodo_combate' && Math.random() < 0.20;
      if(stunned){
        c.clog.unshift(t('msg.rodo_push', { mon: mname }));
      } else {
        let md = Math.max(1, c.monster.atk + Math.floor(Math.random()*3) - 1);
        if(hasTool('luva_borracha')) md = Math.max(1, Math.round(md * 0.85));
        if(uiEphemeral.buffs.cloudTurns > 0){
          md = Math.max(1, Math.round(md * 0.50));
          uiEphemeral.buffs.cloudTurns--;
        }
        S.player.hp -= md;
        c.clog.unshift(t('msg.mon_hit', { mon: mname, dmg: md }));
        if(S.player.hp <= 0){
          if(hasTool('fita_isolante') && !uiEphemeral.fitaUsed){
            uiEphemeral.fitaUsed = true;
            S.player.hp = 1;
            c.clog.unshift(t('msg.fita_save'));
            sfx('unlock');
          } else {
            faint(); return;
          }
        }
        // Auto-Cha opcional quando HP < 35%
        if(S.combat.autoTea && (S.player.hp / S.player.maxHp) < 0.35 && ((S.inventory.potions && S.inventory.potions.cha_poeira) || 0) > 0){
          S.inventory.potions.cha_poeira--;
          const heal = Math.round(S.player.maxHp * 0.50);
          S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
          c.clog.unshift(t('msg.autotea_log', { heal }));
          sfx('unlock');
        }
      }
    }
  }
  c.clog = c.clog.slice(0, 6);
}

function faint(){
  const lost = Math.floor(S.resources.dust * 0.2);
  S.resources.dust -= lost;
  S.player.hp = S.player.maxHp;
  S.combat.active = false;
  S.combat.monster = null;
  S.combat.idx = 0;
  S.combat.mhp = 0;
  resetCombatRuntime();
  sfx('error');
  notify(t('msg.faint', { dust: fmt(lost) }), 'red');
}

function renderCorridorTrack(){
  const width = 36;
  const z = S.combat.zone || 0;
  const wallChar = z === 0 ? '=' : z === 1 ? '#' : '~';
  const floorChar = z === 0 ? '.' : z === 1 ? '_' : ':';
  const border = wallChar.repeat(width);
  const chars = Array(width).fill(' ');
  for(let i = 0; i < width; i += 5) chars[i] = floorChar;

  const p = Math.max(1, Math.min(width - 6, uiEphemeral.track.ppos));
  const m = Math.max(p + 3, Math.min(width - 4, uiEphemeral.track.mpos));
  chars[p] = '@';
  chars[p + 1] = '>';

  if(uiEphemeral.track.fx && (m - p <= 4)){
    const fx = uiEphemeral.track.fx;
    for(let k = 0; k < fx.length && (p + 2 + k) < m; k++) chars[p + 2 + k] = fx[k];
  }

  const mToken = (S.combat.monster && S.combat.monster.boss) ? '[B]' : 'o_o';
  for(let k = 0; k < mToken.length && (m + k) < width; k++) chars[m + k] = mToken[k];

  return `${border}\n${chars.join('')}\n${border}`;
}

function rest(){
  if(S.combat.active){
    sfx('error');
    notify(t('msg.rest_combat'));
    return;
  }
  if(S.player.hp >= S.player.maxHp){ notify(t('msg.rest_full')); return; }
  S.player.hp = S.player.maxHp;
  sfx('unlock');
  notify(t('msg.rest_ok'), 'amber');
  save(); render();
}

/* ---------- navegacao ---------- */
function go(tab, subview){
  S.ui.tab = tab;
  S.ui.subview = (subview===undefined ? null : subview);
  save(); render();
}
function setCompTab(ct){
  S.ui.compTab = ct;
  sfx('click');
  render();
}
function setMapHint(text){
  const el = document.getElementById('map-hint');
  if(el) el.textContent = text;
}

/* ---------- render ---------- */
function tabs(){
  const list = [];
  list.push({id:'quarto', key:'tab.quarto', label: t('tab.quarto')});
  if(S.unlocks.outOfRoom) list.push({id:'hall', key:'tab.hall', label: t('tab.hall')});
  if(S.unlocks.outOfRoom) list.push({id:'inventario', key:'tab.inventario', label: t('tab.inventario')});
  if(S.unlocks.hasMap) list.push({id:'mapa', key:'tab.mapa', label: t('tab.mapa')});
  if(S.unlocks.act2) list.push({id:'desvao', key:'tab.desvao', label: t('tab.desvao')});
  if(S.unlocks.outOfRoom) list.push({id:'aventura', key:'tab.aventura', label: t('tab.aventura')});
  if(S.unlocks.hasCompendium) list.push({id:'compendio', key:'tab.compendio', label: t('tab.compendio')});
  return list;
}

function paintStats(){
  document.getElementById('stat-dust').textContent = fmt(Math.floor(S.resources.dust));
  document.getElementById('stat-max').textContent = S.intro.done ? `/${fmt(S.resources.maxDust)}` : '';
  const dustSpan = document.getElementById('s-dust');
  if(dustSpan) dustSpan.classList.toggle('full-alert', S.intro.done && !S.flags.dustInf && S.resources.dust >= S.resources.maxDust);
  document.getElementById('stat-magic').textContent = S.resources.magicDust;
  const sockEl = document.getElementById('stat-socks');
  if(sockEl) sockEl.textContent = S.resources.socks || 0;
  document.getElementById('stat-ps').textContent = S.resources.dustPerSecond.toFixed(2);
  document.getElementById('stat-hp').textContent = `${Math.max(0,Math.ceil(S.player.hp))}/${S.player.maxHp}`;
  document.getElementById('hp-fill').style.width = Math.max(0, (S.player.hp/S.player.maxHp*100)) + '%';
  document.getElementById('stat-atk').textContent = S.player.attack;

  const show = (id, v)=>{ const el = document.getElementById(id); if(el) el.style.display = v ? '' : 'none'; };
  const step = S.intro.done ? 3 : (S.intro.cleans || 0);
  show('s-magic', S.resources.magicDust > 0 || S.unlocks.candyLooted || S.unlocks.puzzleSolved || S.unlocks.windLooted);
  show('s-socks', S.unlocks.act2 || (S.resources.socks || 0) > 0);
  show('s-ps', step >= 1);
  show('s-hp', step >= 2);
  show('s-atk', step >= 2 && S.inventory.weapon !== 'none');
}

function render(){
  recalc();
  paintStats();
  document.body.classList.toggle('intro', !S.intro.done);
  if(!S.intro.done){ renderIntro(); return; }

  const nav = document.getElementById('tabs');
  nav.innerHTML = '';
  tabs().forEach((tb, idx)=>{
    const b = document.createElement('button');
    b.innerHTML = `${esc(tb.label)}<span class="tab-key">${idx+1}</span>`;
    const hv = I18n ? I18n.th(tb.key) : null;
    if(hv && b.setAttribute) b.setAttribute('data-tr', hv);
    if(S.ui.tab === tb.id) b.className = 'active';
    b.onclick = ()=>{ sfx('click'); go(tb.id); };
    nav.appendChild(b);
  });

  const c = document.getElementById('content');
  let bodyHtml = '';
  if(S.unlocks.viewingEnding) { bodyHtml = viewEnding(); }
  else if(S.ui.tab==='quarto') bodyHtml = viewQuarto();
  else if(S.ui.tab==='hall') bodyHtml = S.ui.subview ? viewSub(S.ui.subview) : viewHall();
  else if(S.ui.tab==='inventario') bodyHtml = viewInventario();
  else if(S.ui.tab==='mapa') bodyHtml = S.ui.subview ? viewSub(S.ui.subview) : viewMapa();
  else if(S.ui.tab==='desvao') bodyHtml = S.ui.subview ? viewDesvaoSub(S.ui.subview) : viewDesvao();
  else if(S.ui.tab==='aventura') bodyHtml = viewAventura();
  else if(S.ui.tab==='compendio') bodyHtml = viewCompendio();

  if(uiEphemeral.flashEvent && !S.unlocks.viewingEnding){
    const ev = uiEphemeral.flashEvent;
    const evTxt = ev.textKey ? tx(ev.textKey) : esc(ev.text || '');
    const banner = `<div class="flash-event"><div>✦ ${evTxt}</div><div class="actions">${ev.choices.map((ch, idx)=>{
      const lbl = ch.labelKey ? t(ch.labelKey) : (ch.label || '');
      return `<button class="cmd"${ch.labelKey ? trAttr(ch.labelKey) : ''} onclick="Game.resolveFlashEvent(${idx})">${esc(lbl)}</button>`;
    }).join('')}</div></div>`;
    bodyHtml = banner + bodyHtml;
  }
  c.innerHTML = bodyHtml;
}

function refreshDynamic(){
  const d = Math.floor(S.resources.dust);
  if(!S.intro.done){
    const ready = d >= 20;
    if(ready !== uiEphemeral.lastIntroReady){
      uiEphemeral.lastIntroReady = ready;
      render();
      return;
    }
    const counter = document.getElementById('intro-counter');
    if(counter) counter.textContent = `\n[${d}/20]`;
    return;
  }

  if(S.ui.tab === 'quarto' && !S.unlocks.victory){
    const ratNow = S.resources.dust >= 20 || !!S.flags.rat;
    if(ratNow !== uiEphemeral.lastRatVisible){
      uiEphemeral.lastRatVisible = ratNow;
      render();
      return;
    }
  }

  const root = document.getElementById('content');
  if(!root || !root.querySelectorAll) return;
  root.querySelectorAll('button[data-cost]').forEach(btn => {
    const cost = Number(btn.getAttribute('data-cost')) || 0;
    const mcost = Number(btn.getAttribute('data-magic-cost')) || 0;
    const reqOk = btn.getAttribute('data-req-ok') !== '0';
    btn.disabled = (S.resources.dust < cost) || (S.resources.magicDust < mcost) || !reqOk;
  });
  const dynDust = document.getElementById('dyn-dust');
  if(dynDust) dynDust.textContent = fmt(d);
  const dynHp = document.getElementById('dyn-hp');
  if(dynHp) dynHp.textContent = `${Math.ceil(S.player.hp)}/${S.player.maxHp}`;

  if(S.ui.tab === 'aventura' && S.combat.active){
    root.querySelectorAll('button[data-skill]').forEach(btn => {
      const sid = btn.getAttribute('data-skill');
      const sk = SKILLS[sid];
      if(!sk) return;
      const cd = uiEphemeral.skillCd[sid] || 0;
      const skName = o('sk', sid, 'name', sk.name);
      btn.disabled = cd > 0;
      btn.textContent = cd > 0 ? `[${sk.key}] ${skName} (${Math.ceil(cd)}s)` : `[${sk.key}] ${skName}`;
    });
  }
  const sofaBtn = document.getElementById('btn-sofa');
  if(sofaBtn){
    const cd = uiEphemeral.sofaCd || 0;
    sofaBtn.disabled = cd > 0;
    sofaBtn.textContent = cd > 0 ? t('scene.sofa.rummage_cd', { s: Math.ceil(cd) }) : t('scene.sofa.rummage');
  }
}

function renderIntro(){
  document.getElementById('tabs').innerHTML = '';
  const c = document.getElementById('content');
  const d = Math.floor(S.resources.dust);
  const n = S.intro.cleans;
  uiEphemeral.lastIntroReady = d >= 20;

  if(n >= 3){ S.intro.done = true; render(); return; }
  const stanzaKey = `intro.${n}`;
  const btnKey = `intro.btn.${n}`;
  let h = `<div class="stage intro-text"><pre${trAttr(stanzaKey)}>${esc(t(stanzaKey))}</pre>`;
  h += d >= 20
    ? `<div class="actions"><button class="cmd"${trAttr(btnKey)} onclick="Game.cleanBody()">${esc(t(btnKey))}</button></div>`
    : `<pre id="intro-counter" class="muted">\n[${d}/20]</pre>`;
  h += `</div>`;
  c.innerHTML = h;
}

function cleanBody(){
  if(S.intro.done || S.resources.dust < 20) return;
  S.resources.dust = 0;
  S.intro.cleans++;
  uiEphemeral.lastIntroReady = false;
  sfx('unlock');
  if(S.intro.cleans === 1) showToast(t('msg.intro_t1'));
  if(S.intro.cleans === 2) showToast(t('msg.intro_t2'));
  if(S.intro.cleans >= 3){
    S.intro.done = true;
    document.body.classList.remove('intro');
    showToast(t('msg.intro_t3'));
  }
  save(); render();
}

function viewQuarto(){
  const seenRat = S.intro.done && (S.resources.dust >= 20 || S.flags.rat);
  uiEphemeral.lastRatVisible = seenRat;
  let h = `<div class="stage"><div class="scene-title">${tx('scene.quarto')}</div>`;
  if(!seenRat){
    h += `<div class="scene-text"><pre style="white-space:pre-wrap"${trAttr('scene.quarto.dark')}>${esc(t('scene.quarto.dark'))}</pre></div>`;
    h += `<div class="muted">${tx('scene.quarto.silence')}</div>`;
  } else {
    if(!S.flags.rat){
      S.flags.rat = true;
      showToast(t('msg.rat_appear'));
    }
    const bub = getNpcBubble('rat', 'scene.rat.default');
    h += speechBubble(bub.text, 42, null, null, bub.key, bub.vars);
    h += `<pre class="ascii-art npc-idle" style="cursor:pointer" onclick="Game.pokeRat()">${esc(ART.rat)}</pre>`;
    h += `<div class="muted">${tx('scene.rat.title')}</div>`;
    h += renderNpcTalkControls('rat');
    h += `<div class="box">`;
    if(!S.unlocks.outOfRoom){
      h += `<div class="scene-text">${tx('scene.quarto.door')}</div>
      <div class="actions">
        <button class="cmd"${trAttr('scene.quarto.lubricate')} data-cost="100" onclick="Game.lubricate()" ${S.resources.dust<100?'disabled':''}>${esc(t('scene.quarto.lubricate'))}</button>
      </div>
      <div class="muted"><span id="dyn-dust">${fmt(Math.floor(S.resources.dust))}</span> / 100</div>`;
    } else {
      h += `<div class="muted">${tx('scene.quarto.open')}</div>
      <div class="actions">
        <button class="cmd"${trAttr('scene.quarto.go_hall')} onclick="Game.go('hall')">${esc(t('scene.quarto.go_hall'))}</button>
        <button class="cmd"${trAttr('scene.quarto.lie_down')} onclick="Game.rest()" ${S.combat.active?'disabled':''}>${esc(t('scene.quarto.lie_down'))}</button>
      </div>
      <div class="muted">HP: <span id="dyn-hp">${Math.ceil(S.player.hp)}/${S.player.maxHp}</span></div>`;
    }
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

function viewHall(){
  const bub = getNpcBubble('moth', 'scene.moth.default');
  let h = `<div class="stage"><div class="scene-title">${tx('scene.hall')}</div>`;
  h += speechBubble(bub.text, 46, null, null, bub.key, bub.vars);
  h += `<pre class="ascii-art npc-idle">${esc(ART.moth)}</pre>`;
  h += renderNpcTalkControls('moth');

  const dustUnit = esc(t('btn.dust_unit'));
  h += `<div class="box"><span class="box-title">${tx('scene.hall.shop')}</span>`;
  const has = (x)=> S.inventory.items.includes(x) || (x in WEAPONS && hasWeaponTier(x)) || hasTool(x);
  const item = (id, nameHtml, price, descHtml)=>{
    const owned = has(id);
    return `<div class="shop-item"><b>${nameHtml}</b> ${owned?`<span class="muted">${tx('btn.owned')}</span>`:`— <b>${price} ${dustUnit}</b>`}<br><span class="muted">${descHtml}</span><br>
    ${owned?'':`<button class="cmd"${trAttr('btn.buy')} data-cost="${price}" onclick="Game.buyItem('${id}')" ${S.resources.dust<price?'disabled':''}>${esc(t('btn.buy'))}</button>`}</div>`;
  };
  h += item('mapa_castelo', ox('itm','mapa_castelo','name', ITEM_LABELS.mapa_castelo), 150, tx('shop.mapa.desc'));
  h += item('vassoura_quebrada', ox('wep','vassoura_quebrada','name', WEAPONS.vassoura_quebrada.name), 100, tx('shop.vassoura.desc'));
  h += item('lanterna', ox('itm','lanterna','name', ITEM_LABELS.lanterna), 300, tx('shop.lanterna.desc'));
  h += item('pedra_peso', ox('itm','pedra_peso','name', ITEM_LABELS.pedra_peso), 500, tx('shop.pedra.desc'));
  h += item('pa_lixo', ox('tool','pa_lixo','name', TOOLS.pa_lixo.name), TOOLS.pa_lixo.price, `${ox('tool','pa_lixo','effect', TOOLS.pa_lixo.effect)}. ${ox('tool','pa_lixo','desc', TOOLS.pa_lixo.desc)}`);
  const cha = POTIONS.cha_poeira;
  const chaQty = (S.inventory.potions && S.inventory.potions.cha_poeira) || 0;
  h += `<div class="shop-item"><b>${ox('pot','cha_poeira','name', cha.name)}</b> <span class="muted">${tx('btn.you_have', { n: chaQty })}</span> — <b>${cha.price} ${dustUnit}</b><br><span class="muted">${ox('pot','cha_poeira','effect', cha.effect)}. ${ox('pot','cha_poeira','desc', cha.desc)}</span><br><button class="cmd"${trAttr('btn.buy_x1')} data-cost="${cha.price}" onclick="Game.buyPotion('cha_poeira',1)" ${S.resources.dust<cha.price?'disabled':''}>${esc(t('btn.buy_x1'))}</button><button class="cmd" data-cost="${cha.price*5}" onclick="Game.buyPotion('cha_poeira',5)" ${S.resources.dust<cha.price*5?'disabled':''}>+5 (${fmt(cha.price*5)})</button></div>`;
  h += `</div>`;

  h += `<div class="box"><span class="box-title">${tx('scene.hall.upgrades')}</span><div class="muted">${tx('scene.hall.upgrades_sub')}</div>`;
  for(const k in ACCELS){
    const a = ACCELS[k], owned = S.accelerators[k]||0, cost = accelCost(k);
    h += `<div class="shop-item"><b>${ox('acc', k, 'name', a.name)}</b> x${owned}<br><span class="muted">${ox('acc', k, 'desc', a.desc)} (+${a.bonus} P/s)</span><br>
    <button class="cmd"${trAttr('btn.buy')} data-cost="${cost}" onclick="Game.buyAccel('${k}')" ${S.resources.dust<cost?'disabled':''}>${esc(t('btn.buy'))} (${fmt(cost)})</button></div>`;
  }
  h += `</div>`;

  h += `<div class="actions">`;
  if(S.unlocks.hasMap) h += `<button class="cmd"${trAttr('scene.hall.open_map')} onclick="Game.go('mapa')">${esc(t('scene.hall.open_map'))}</button>`;
  h += `<button class="cmd"${trAttr('scene.hall.go_battle')} onclick="Game.go('aventura')">${esc(t('scene.hall.go_battle'))}</button></div></div>`;
  return h;
}

function viewInventario(){
  const wId = S.inventory.weapon;
  const aId = S.inventory.armor;
  const bId = S.inventory.bag;
  const w = WEAPONS[wId];
  const a = ARMORS[aId];
  const b = BAGS[bId];
  const secBonusPct = Math.round((secretDpsMult() - 1) * 100);
  const relBonusPct = Math.round((relicDpsMult() - 1) * 100);
  const totalAch = Object.keys(ACHIEVEMENT_INFO).length;
  const gearCount = (S.gears.cable ? 1 : 0) + (S.gears.boss ? 1 : 0);

  let h = `<div class="stage"><div class="scene-title">${tx('inv.title')}</div><div class="inv-grid">`;

  h += `<div class="inv-card"><div class="inv-card-title">${tx('inv.equip')}</div>
    <div class="inv-row"><span>${tx('inv.weapon')}</span><b>${w ? ox('wep', wId, 'name', w.name) : tx('inv.unarmed')}</b></div>
    <div class="muted" style="font-size:12px;margin-bottom:6px">${w ? `+${w.atk} ATK · ${ox('wep', wId, 'passive', w.passive)}` : '+0 ATK'}</div>
    <div class="inv-row"><span>${tx('inv.armor')}</span><b>${a ? ox('arm', aId, 'name', a.name) : '—'}</b></div>
    <div class="muted" style="font-size:12px;margin-bottom:6px">HP max ${a?a.maxHp:'?'}</div>
    <div class="inv-row"><span>${tx('inv.bag')}</span><b>${b ? ox('bag', bId, 'name', b.name) : '—'}</b></div>
    <div class="muted" style="font-size:12px">${tx('inv.eff_cap', { v: fmt(S.resources.maxDust) })}</div>
  </div>`;

  h += `<div class="inv-card"><div class="inv-card-title">${tx('inv.prod')}</div>
    <div class="inv-row"><span>${tx('inv.base')}</span><b>${baseDps().toFixed(2)} P/s</b></div>
    <div class="inv-row"><span>${tx('inv.sec_rel')}</span><b>+${secBonusPct}% / +${relBonusPct}%</b></div>
    <div class="inv-row"><span>${tx('inv.total_ps')}</span><b class="amber">${S.resources.dustPerSecond.toFixed(2)} P/s</b></div>
    <div class="inv-row"><span>${tx('inv.total_dust')}</span><b>${fmt(Math.floor(S.resources.totalEarned))}</b></div>
    <div class="inv-row"><span>${tx('inv.kills_sec')}</span><b>${S.combat.kills} / ${S.secrets.length}</b></div>
    ${S.ngPlus > 0 ? `<div class="inv-row"><span>${tx('inv.ngplus')}</span><b class="amber">NG+${S.ngPlus} (+${S.ngPlus*100}% P/s)</b></div>` : ''}
    ${S.unlocks.act2 ? `<div class="inv-row"><span>${tx('inv.gears')}</span><b>${gearCount}/2</b></div>` : `<div class="inv-row"><span>${tx('inv.key')}</span><b>${S.key.complete ? tx('inv.key_ready') : `${S.key.fragments}/3`}</b></div>`}
  </div>`;

  h += `<div class="inv-card"><div class="inv-card-title">${tx('inv.tools')}</div>`;
  if(!S.inventory.tools.length && !(S.inventory.relics && S.inventory.relics.length)){
    h += `<div class="muted">${tx('inv.no_tools')}</div>`;
  } else {
    h += S.inventory.tools.map(id => {
      const tl = TOOLS[id];
      return tl ? `<div style="margin:4px 0"><b>${ox('tool', id, 'name', tl.name)}</b><br><span class="muted">${ox('tool', id, 'effect', tl.effect)}</span></div>` : '';
    }).join('');
    h += (S.inventory.relics||[]).map(id => {
      const r = RELICS[id];
      return r ? `<div style="margin:4px 0"><b>✦ ${ox('rel', id, 'name', r.name)}</b><br><span class="muted">${ox('rel', id, 'effect', r.effect)}</span></div>` : '';
    }).join('');
  }
  h += `</div>`;

  h += `<div class="inv-card"><div class="inv-card-title">${tx('inv.items')}</div>`;
  if(!S.inventory.items.length){
    h += `<div class="muted">${tx('inv.no_items')}</div>`;
  } else {
    h += S.inventory.items.map(i => `<span class="inv-tag">${ox('itm', i, 'name', ITEM_LABELS[i]||i)}</span>`).join('');
  }
  const chaQ = (S.inventory.potions && S.inventory.potions.cha_poeira) || 0;
  const tonQ = (S.inventory.potions && S.inventory.potions.tonico_cafeina) || 0;
  const cfQ  = (S.inventory.potions && S.inventory.potions.cafe_meia) || 0;
  if(chaQ > 0 || tonQ > 0 || cfQ > 0){
    h += `<div style="margin-top:8px;border-top:1px dotted var(--line);padding-top:6px">`;
    if(chaQ > 0) h += `<span class="inv-tag">${ox('pot','cha_poeira','name', POTIONS.cha_poeira.name)} x${chaQ}</span>`;
    if(tonQ > 0) h += `<span class="inv-tag">${ox('pot','tonico_cafeina','name', POTIONS.tonico_cafeina.name)} x${tonQ}</span>`;
    if(cfQ > 0)  h += `<span class="inv-tag">${ox('pot','cafe_meia','name', POTIONS.cafe_meia.name)} x${cfQ}</span>`;
    h += `</div>`;
  }
  h += `</div></div>`;

  h += `<div class="box"><span class="box-title">${tx('inv.ach', { cur: S.achievements.length, tot: totalAch })}</span>`;
  if(S.achievements.length){
    h += S.achievements.map(id=>{
      const info = ACHIEVEMENT_INFO[id];
      return info
        ? `<div style="margin:4px 0">★ <b>${ox('ach', id, 'name', info.name)}</b> <span class="muted">— ${ox('ach', id, 'desc', info.desc)}</span></div>`
        : `<div>★ ${esc(id)}</div>`;
    }).join('');
  } else {
    h += `<span class="muted">${tx('inv.no_ach')}</span>`;
  }
  h += `</div></div>`;
  return h;
}

function mapBtn(label, sub, hint, locked, trKey){
  const safeHint = esc(hint).replace(/'/g, '&#39;');
  const attr = trKey ? trAttr(trKey) : '';
  if(locked){
    return `<button class="map-node"${attr} disabled onmouseenter="Game.setMapHint('${safeHint}')" title="${safeHint}">${esc(label)}</button>`;
  }
  return `<button class="map-node"${attr} onclick="Game.go('mapa','${sub}')" onmouseenter="Game.setMapHint('${safeHint}')" onfocus="Game.setMapHint('${safeHint}')">${esc(label)}</button>`;
}

function viewMapa(){
  const pad = (k, w) => I18n ? I18n.padNode(t(k), w) : `[${t(k)}]`;
  const bHall    = mapBtn(pad('map.node.hall', 6),    'hall',    t('map.hall'), false, 'map.hall');
  const bOeste   = mapBtn(pad('map.node.oeste', 7),   'oeste',   t('map.oeste'), false, 'map.oeste');
  const bLeste   = mapBtn(pad('map.node.leste', 7),   'leste',   t('map.leste'), false, 'map.leste');
  const bGaleria = mapBtn(pad('map.node.galeria', 9), 'galeria', t('map.galeria'), false, 'map.galeria');
  const hCor     = esc(t('map.corredores')).replace(/'/g, '&#39;');
  const hQua     = esc(t('map.quarto')).replace(/'/g, '&#39;');
  const bAvent   = `<button class="map-node"${trAttr('map.corredores')} onclick="Game.go('aventura')" onmouseenter="Game.setMapHint('${hCor}')" onfocus="Game.setMapHint('${hCor}')">${esc(pad('map.node.corredores', 12))}</button>`;
  const bQuarto  = `<button class="map-node"${trAttr('map.quarto')} onclick="Game.go('quarto')" onmouseenter="Game.setMapHint('${hQua}')" onfocus="Game.setMapHint('${hQua}')">${esc(pad('map.node.quarto', 8))}</button>`;
  const bPortao  = mapBtn(pad('map.node.portao', 8),  'portao',  S.key.complete ? t('map.portao_open') : t('map.portao_lock'), false, S.key.complete ? 'map.portao_open' : 'map.portao_lock');
  const bPorao   = mapBtn(S.unlocks.hasLantern ? pad('map.node.porao', 8) : pad('map.node.porao_q', 8), 'porao',
    S.unlocks.hasLantern ? t('map.porao_open') : t('map.porao_lock'),
    !S.unlocks.hasLantern, S.unlocks.hasLantern ? 'map.porao_open' : 'map.porao_lock');

  const castle = [
    `                       /\\`,
    `                      /  \\`,
    `            /\\       /____\\       /\\`,
    `           /  \\     |  ::  |     /  \\`,
    `          /____\\====|${bHall}|====/____\\`,
    `         |${bOeste}|  |  ||  |  |${bLeste}|`,
    `         |       |  |  ||  |  |       |`,
    `          \\__  _/   |  ||  |   \\_  __/`,
    `             ||     |  ||  |     ||`,
    `      .------''-.   |  ||  |   .-''---------.`,
    `     ( ${bGaleria} )  |  ||  |  ( ${bAvent} )`,
    `      '---------'   |  ||  |   '------------'`,
    `                    |  ||  |`,
    `                 .--'  ''  '--. `,
    `                /   ${bQuarto}   \\`,
    `               |    _..--.._    |`,
    `               |   /${bPortao}\\   |`,
    `               |__|__________|__|`,
    `                       ..`,
    `                 . ~ ' || ' ~ .`,
    `                (   ${bPorao}   )`,
    `                 ' ~ . .. . ~ '`
  ].join('\n');

  let h = `<div class="stage"><div class="scene-title">${tx('scene.mapa')}</div>`;
  h += `<pre class="map-ascii">${castle}</pre>`;
  h += `<div id="map-hint" class="map-hint">${tx('scene.mapa.hint')}</div>`;
  h += `</div>`;
  return h;
}

function viewGaleria(){
  const pad = (k, w) => I18n ? I18n.padNode(t(k), w) : `[${t(k)}]`;
  const bPuz    = mapBtn(pad('map.node.puzzles', 16), 'puzzles', t('map.gal.puzzles'), false, 'map.gal.puzzles');
  const bCandy  = mapBtn(pad('map.node.candy', 17),   'candy',   t('map.gal.candy'),   false, 'map.gal.candy');
  const bVento  = mapBtn(pad('map.node.vento', 16),   'vento',   t('map.gal.vento'),   false, 'map.gal.vento');
  const bEstante= mapBtn(pad('map.node.estante', 17), 'estante', t('map.gal.estante'), false, 'map.gal.estante');
  const bCofre  = mapBtn(pad('map.node.cofre', 14),   'cofre',   t('map.gal.cofre'),   false, 'map.gal.cofre');
  const titleStr = t('map.gal.title');
  const padT = Math.max(0, 31 - titleStr.length);
  const tLine = ' '.repeat(Math.floor(padT/2)) + titleStr + ' '.repeat(padT - Math.floor(padT/2));

  const submap = [
    `           ___________________________________`,
    `         .'  ${esc(tLine)}  '.`,
    `        /                                       \\`,
    `       |  ${bPuz}   ${bCandy} |`,
    `       |         \\                     /        |`,
    `       |          \\___ ${bCofre} ___/         |`,
    `       |                    | |                 |`,
    `       |          .---------' '---------.       |`,
    `       |         /                       \\      |`,
    `       |  ${bVento}   ${bEstante} |`,
    `        \\_______________________________________/`
  ].join('\n');

  let h = `<div class="stage"><div class="actions"><button class="cmd subtle"${trAttr('btn.back_castle')} onclick="Game.go('mapa')">${esc(t('btn.back_castle'))}</button></div>`;
  h += `<div class="scene-title">${tx('scene.galeria')}</div>`;
  h += `<pre class="map-ascii">${submap}</pre>`;
  h += `<div id="map-hint" class="map-hint">${tx('scene.galeria.hint')}</div></div>`;
  return h;
}

function viewSub(sub){
  if(sub==='galeria') return viewGaleria();
  const inGal = ['puzzles','candy','vento','estante','cofre'].includes(sub);
  const backTarget = inGal ? "Game.go('mapa','galeria')" : "Game.go('mapa')";
  const backKey    = inGal ? 'btn.back_gallery' : 'btn.back_castle';
  const dustUnit   = esc(t('btn.dust_unit'));
  let h = `<div class="stage"><div class="actions"><button class="cmd subtle"${trAttr(backKey)} onclick="${backTarget}">${esc(t(backKey))}</button></div>`;
  if(sub==='hall') return h + `</div>` + viewHall();
  if(sub==='cofre'){
    PUZZLES.ensureSafe(S);
    h += `<div class="scene-title">${tx('scene.cofre')}</div>`;
    h += `<pre class="ascii-art">${esc(ART.safeBox)}</pre>`;
    h += `<div class="box"><div class="muted">${tx('scene.cofre.desc')}</div><br><div class="row">`;
    S.safe.guess.forEach((d, i) => {
      h += `<div><button class="cmd" onclick="Game.safeDigit(${i},1)">+</button><br><span class="safe-digit">${d}</span><br><button class="cmd" onclick="Game.safeDigit(${i},-1)">-</button></div>`;
    });
    const safeBtnKey = S.safe.solved ? 'scene.cofre.done' : 'scene.cofre.test';
    h += `</div><div class="actions"><button class="cmd"${trAttr(safeBtnKey)} onclick="Game.testSafe()" ${S.safe.solved?'disabled':''}>${esc(t(safeBtnKey))}</button></div>`;
    if(S.safe.history.length){
      h += `<div class="muted" style="margin-top:8px">${S.safe.history.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`;
    }
    h += `</div></div>`;
    return h;
  }

  if(sub==='leste'){
    const bub = getNpcBubble('termite', 'scene.termite.default');
    h += `<div class="scene-title">${tx('scene.leste')}</div>`;
    h += speechBubble(bub.text, 44, null, null, bub.key, bub.vars);
    h += `<pre class="ascii-art npc-idle" style="cursor:pointer" onclick="Game.pokeTermite()">${esc(ART.termite)}</pre>`;
    h += renderNpcTalkControls('termite');
    h += `<div class="box"><span class="box-title">${tx('scene.leste.forge')}</span>`;
    const wrow = (id)=>{
      const w = WEAPONS[id];
      const equipped = S.inventory.weapon===id;
      const owned = hasWeaponTier(id);
      const okReq = !w.req || hasWeaponTier(w.req);
      const badge = equipped ? `<span class="muted">${tx('btn.equipped')}</span>` : owned ? `<span class="muted">${tx('btn.owned')}</span>` : `— <b>${fmt(w.price)} ${dustUnit}</b>`;
      const reqName = w.req ? o('wep', w.req, 'name', WEAPONS[w.req].name) : '';
      return `<div class="shop-item"><b>${ox('wep', id, 'name', w.name)}</b> ${badge}<br><span class="muted">${ox('wep', id, 'desc', w.desc)}${w.passive!=='Nenhuma' ? ' · ' + ox('wep', id, 'passive', w.passive) : ''}</span><br>${(!owned)?`<button class="cmd"${trAttr('btn.forge')} data-cost="${w.price}" data-req-ok="${okReq?1:0}" onclick="Game.buyItem('${id}')" ${(S.resources.dust<w.price||!okReq)?'disabled':''}>${esc(t('btn.forge'))}</button>${!okReq?`<div class="muted">${tx('btn.requires', { name: reqName })}</div>`:''}`:''}</div>`;
    };
    ['vassoura_quebrada','espanador_pena','rodo_combate','cabo_hdmi','aspirador_entupido'].forEach(id => { h += wrow(id); });
    const fl = TOOLS.flanela_microfibra;
    const hasFl = hasTool('flanela_microfibra');
    h += `<div class="shop-item"><b>${ox('tool','flanela_microfibra','name', fl.name)}</b> ${hasFl?`<span class="muted">${tx('btn.owned')}</span>`:`— <b>${fmt(fl.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('tool','flanela_microfibra','effect', fl.effect)}. ${ox('tool','flanela_microfibra','desc', fl.desc)}</span><br>${!hasFl?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${fl.price}" onclick="Game.buyItem('flanela_microfibra')" ${S.resources.dust<fl.price?'disabled':''}>${esc(t('btn.acquire'))}</button>`:''}</div>`;
    h += `</div><div class="actions"><button class="cmd"${trAttr('scene.leste.go_corridors')} onclick="Game.go('aventura')">${esc(t('scene.leste.go_corridors'))}</button></div></div>`;
    return h;
  }

  if(sub==='oeste'){
    const bub = getNpcBubble('spider', 'scene.spider.default');
    h += `<div class="scene-title">${tx('scene.oeste')}</div>`;
    h += speechBubble(bub.text, 44, hasSecret('pano_vo') ? null : t('scene.spider.secret_word'), 'Game.pokeSpiderWord()', bub.key, bub.vars);
    h += `<pre class="ascii-art npc-idle">${esc(ART.spider)}</pre>`;
    h += renderNpcTalkControls('spider');
    h += `<div class="box"><span class="box-title">${tx('scene.oeste.atelier')}</span>`;
    const arow = (id, kind)=>{
      const table = kind==='armor' ? ARMORS : BAGS;
      const pref = kind==='armor' ? 'arm' : 'bag';
      const item = table[id];
      const equipped = kind==='armor' ? (S.inventory.armor===id) : (S.inventory.bag===id);
      const owned = kind==='armor' ? hasArmorTier(id) : hasBagTier(id);
      const reqOk = !item.req || (kind==='armor' ? hasArmorTier(item.req) : hasBagTier(item.req));
      const reqName = item.req ? o(pref, item.req, 'name', table[item.req].name) : '';
      const badge = equipped ? `<span class="muted">${tx('btn.equipped')}</span>` : owned ? `<span class="muted">${tx('btn.owned')}</span>` : `— <b>${fmt(item.price)} ${dustUnit}</b>`;
      return `<div class="shop-item"><b>${ox(pref, id, 'name', item.name)}</b> ${badge}<br><span class="muted">${ox(pref, id, 'desc', item.desc)}</span><br>${!owned?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${item.price}" data-req-ok="${reqOk?1:0}" onclick="Game.buyItem('${id}')" ${(S.resources.dust<item.price||!reqOk)?'disabled':''}>${esc(t('btn.acquire'))}</button>${!reqOk?`<div class="muted">${tx('btn.requires', { name: reqName })}</div>`:''}`:''}</div>`;
    };
    ['saco_teia','saco_compactado','mala_sotao','bau_sem_fundo'].forEach(id => { h += arow(id,'bag'); });
    ['casaco_pano_mofado','mascara_antipoeira','capa_teia','armadura_papelao'].forEach(id => { h += arow(id,'armor'); });
    const lv = TOOLS.luva_borracha;
    const hasLv = hasTool('luva_borracha');
    h += `<div class="shop-item"><b>${ox('tool','luva_borracha','name', lv.name)}</b> ${hasLv?`<span class="muted">${tx('btn.owned')}</span>`:`— <b>${fmt(lv.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('tool','luva_borracha','effect', lv.effect)}. ${ox('tool','luva_borracha','desc', lv.desc)}</span><br>${!hasLv?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${lv.price}" onclick="Game.buyItem('luva_borracha')" ${S.resources.dust<lv.price?'disabled':''}>${esc(t('btn.acquire'))}</button>`:''}</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='porao'){
    if(!S.unlocks.hasLantern){
      return h + `<div class="box"><span class="red">${tx('scene.porao.dark')}</span></div></div>`;
    }
    const bub = getNpcBubble('beetle', 'scene.beetle.default');
    h += `<div class="scene-title">${tx('scene.porao')}</div>`;
    h += speechBubble(bub.text, 44, null, null, bub.key, bub.vars);
    h += `<pre class="ascii-art npc-idle">${esc(ART.beetle)}</pre>`;
    h += renderNpcTalkControls('beetle');
    h += `<div class="box"><span class="box-title">${tx('scene.porao.transmute')}</span><div class="muted">${tx('scene.porao.transmute_desc')}</div>
    <div class="actions">
      <button class="cmd"${trAttr('scene.porao.compact_one')} data-cost="10000" onclick="Game.transmute()" ${S.resources.dust<10000?'disabled':''}>${esc(t('scene.porao.compact_one'))}</button>
      <button class="cmd"${trAttr('scene.porao.compact_all')} data-cost="20000" onclick="Game.transmuteAll()" ${S.resources.dust<20000?'disabled':''}>${esc(t('scene.porao.compact_all'))}</button>
    </div></div>`;
    const ton = POTIONS.tonico_cafeina;
    const tonQty = (S.inventory.potions && S.inventory.potions.tonico_cafeina) || 0;
    h += `<div class="box"><span class="box-title">${tx('scene.porao.potions')}</span><div class="shop-item"><b>${ox('pot','tonico_cafeina','name', ton.name)}</b> <span class="muted">${tx('btn.you_have', { n: tonQty })}</span> — <b>${fmt(ton.price)} ${dustUnit}</b><br><span class="muted">${ox('pot','tonico_cafeina','effect', ton.effect)}. ${ox('pot','tonico_cafeina','desc', ton.desc)}</span><br><button class="cmd"${trAttr('btn.prepare_x1')} data-cost="${ton.price}" onclick="Game.buyPotion('tonico_cafeina',1)" ${S.resources.dust<ton.price?'disabled':''}>${esc(t('btn.prepare_x1'))}</button><button class="cmd" data-cost="${ton.price*5}" onclick="Game.buyPotion('tonico_cafeina',5)" ${S.resources.dust<ton.price*5?'disabled':''}>+5 (${fmt(ton.price*5)})</button></div></div>`;
    h += `<div class="box"><span class="box-title">${tx('scene.porao.key')}</span><div class="muted">${tx('scene.porao.key_desc')}<br>${tx('scene.porao.frags')} <b>${S.key.fragments}/3</b></div>
    <div class="actions">
      <button class="cmd"${trAttr('scene.porao.craft_frag')} data-cost="5000" data-magic-cost="2" data-req-ok="${S.key.fragments<3?1:0}" onclick="Game.craftFragment()" ${(S.resources.magicDust<2||S.resources.dust<5000||S.key.fragments>=3)?'disabled':''}>${esc(t('scene.porao.craft_frag'))}</button>
      <button class="cmd"${trAttr('scene.porao.fuse_key')} data-cost="0" data-req-ok="${(S.key.fragments>=3 && !S.key.complete)?1:0}" onclick="Game.fuseKey()" ${(S.key.fragments<3||S.key.complete)?'disabled':''}>${esc(t('scene.porao.fuse_key'))}</button>
    </div></div></div>`;
    return h;
  }

  if(sub==='puzzles'){
    ensurePuzzle();
    h += `<div class="scene-title">${tx('scene.puzzles')}</div>`;
    h += `<div class="box"><span class="box-title">${tx('scene.puzzles.title')}</span><div class="muted">${tx('scene.puzzles.desc')}</div><br><div class="row">`;
    S.puzzle.current.forEach((v,i)=>{
      h += `<div>${tx('scene.puzzles.lever', { n: i+1 })}<br><b class="amber" style="font-size:22px">${LEVERS[v]}</b><br><button class="cmd"${trAttr('scene.puzzles.pull')} onclick="Game.cycleLever(${i})">${esc(t('scene.puzzles.pull'))}</button></div>`;
    });
    h += `</div><div class="actions"><button class="cmd"${trAttr('scene.puzzles.test')} onclick="Game.testLevers()">${esc(t('scene.puzzles.test'))}</button></div>`;
    h += `<div class="muted">${tx('scene.puzzles.attempts', { n: S.puzzle.attempts })}</div>`;
    if(S.unlocks.puzzleSolved) h += `<div class="amber" style="margin-top:8px">${tx('scene.puzzles.lit')}</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='candy'){
    const btnKey = S.unlocks.candyLooted ? 'scene.candy.done' : 'scene.candy.btn';
    h += `<div class="scene-title">${tx('scene.candy')}</div>`;
    h += `<pre class="ascii-art" style="cursor:pointer" onclick="Game.pokeCandy()">${esc(ART.candy)}</pre>`;
    h += `<div class="scene-text">${tx('scene.candy.quote')}</div>`;
    h += `<div class="actions"><button class="cmd"${trAttr(btnKey)} onclick="Game.searchCandy()" ${S.unlocks.candyLooted?'disabled':''}>${esc(t(btnKey))}</button></div></div>`;
    return h;
  }

  if(sub==='vento'){
    h += `<div class="scene-title">${tx('scene.vento')}</div>`;
    h += `<div class="box"><div class="scene-text">${tx('scene.vento.desc')}</div>
    <div class="actions"><button class="cmd danger"${trAttr('scene.vento.btn')} onclick="Game.enterWind()">${esc(t('scene.vento.btn'))}</button></div></div></div>`;
    return h;
  }

  if(sub==='estante'){
    h += `<div class="scene-title">${tx('scene.estante')}</div>`;
    h += `<pre class="ascii-art">${esc(ART.shelf)}</pre>`;
    h += `<div class="box"><div class="scene-text">${tx('scene.estante.desc')}</div>
    <div class="actions">
      <button class="cmd"${trAttr('scene.estante.b1')} onclick="Game.pullBook(1)">${esc(t('scene.estante.b1'))}</button>
      <button class="cmd"${trAttr('scene.estante.b2')} onclick="Game.pullBook(2)">${esc(t('scene.estante.b2'))}</button>
      <button class="cmd"${trAttr('scene.estante.b3')} onclick="Game.pullBook(3)">${esc(t('scene.estante.b3'))}</button>
    </div>`;
    if(S.unlocks.hasCompendium) h += `<div class="amber" style="margin-top:8px">${tx('scene.estante.done')}</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='portao'){
    h += `<div class="scene-title">${tx('scene.portao')}</div>`;
    h += `<pre class="ascii-art">${esc(ART.gate)}</pre>`;
    h += `<div class="box"><div class="muted">${tx('scene.portao.desc')}</div><br>`;
    if(S.unlocks.act2){
      h += `<div class="actions"><button class="cmd"${trAttr('scene.portao.enter_act2')} onclick="Game.go('desvao')">${esc(t('scene.portao.enter_act2'))}</button></div>`;
    } else if(S.key.complete){
      h += `<div class="actions"><button class="cmd"${trAttr('scene.portao.open')} onclick="Game.openGate()">${esc(t('scene.portao.open'))}</button></div>`;
    } else {
      h += `<div class="red">${tx('scene.portao.locked')}</div><div class="muted">${tx('scene.porao.frags')} ${S.key.fragments}/3</div>`;
    }
    h += `</div></div>`;
    return h;
  }

  return h + `<div class="muted">${tx('msg.unknown_room')}</div></div>`;
}

function desvaoBtn(label, sub, hint, trKey){
  const safeHint = esc(hint).replace(/'/g, '&#39;');
  const attr = trKey ? trAttr(trKey) : '';
  return `<button class="map-node"${attr} onclick="Game.go('desvao','${sub}')" onmouseenter="Game.setMapHint('${safeHint}')" onfocus="Game.setMapHint('${safeHint}')">${esc(label)}</button>`;
}

function viewDesvao(){
  const pad = (k, w) => I18n ? I18n.padNode(t(k), w) : `[${t(k)}]`;
  const bTorre   = desvaoBtn(pad('map.node.torre', 7),     'torre',     t('map.torre'),     'map.torre');
  const bSofa    = desvaoBtn(pad('map.node.sofa', 7),      'sofa',      t('map.sofa'),      'map.sofa');
  const bSotao   = desvaoBtn(pad('map.node.sotao', 7),     'sotao',     t('map.sotao'),     'map.sotao');
  const bGaveta  = desvaoBtn(pad('map.node.gaveta', 8),    'gaveta',    t('map.gaveta'),    'map.gaveta');
  const bRadio   = desvaoBtn(pad('map.node.radio', 7),     'radio',     t('map.radio'),     'map.radio');
  const bLab     = desvaoBtn(pad('map.node.labirinto', 11),'labirinto', t('map.labirinto'), 'map.labirinto');
  const hCast    = esc(t('map.castelo')).replace(/'/g, '&#39;');
  const bCastelo = `<button class="map-node"${trAttr('map.castelo')} onclick="Game.go('mapa')" onmouseenter="Game.setMapHint('${hCast}')" onfocus="Game.setMapHint('${hCast}')">${esc(pad('map.node.castelo', 9))}</button>`;

  const world = [
    `                          /\\`,
    `                         /  \\`,
    `                        |(11)|`,
    `                       |${bTorre}|`,
    `                         \\  /`,
    `          .~~~~~~~.       ||        .-------.`,
    `         ( ${bSofa} )======++=======(${bSotao})`,
    `          '~~..~~~'       ||        '--..---'`,
    `             ||           ||           ||`,
    `        .----''---. .-----''-----. .---''------.`,
    `       ( ${bRadio} )-(  ${bGaveta}  )-( ${bLab} )`,
    `        '---------' '-----..-----' '-----------'`,
    `                          ||`,
    `                      ${bCastelo}`
  ].join('\n');

  const gearCount = (S.gears.cable ? 1 : 0) + (S.gears.boss ? 1 : 0);
  let h = `<div class="stage"><div class="scene-title">${tx('scene.desvao')}</div>`;
  h += `<pre class="map-ascii">${world}</pre>`;
  h += `<div id="map-hint" class="map-hint">${tx('scene.desvao.hint')}</div>`;
  h += `<div class="muted" style="margin-top:6px">${tx('scene.gears_count')} <b>${gearCount}/2</b></div></div>`;
  return h;
}

function viewDesvaoSub(sub){
  const dustUnit = esc(t('btn.dust_unit'));
  const socksUnit = esc(t('btn.socks_unit'));
  const magicUnit = esc(t('btn.magic_unit'));
  let h = `<div class="stage"><div class="actions"><button class="cmd subtle"${trAttr('btn.back_desvao')} onclick="Game.go('desvao')">${esc(t('btn.back_desvao'))}</button></div>`;

  if(sub === 'sofa'){
    const bub = getNpcBubble('remote', 'scene.remote.default');
    h += `<div class="scene-title">${tx('scene.sofa')}</div>`;
    h += speechBubble(bub.text, 46, null, null, bub.key, bub.vars);
    h += `<pre class="ascii-art npc-idle" style="cursor:pointer" onclick="Game.pokeRemote()">${esc(ART.remote)}</pre>`;
    h += renderNpcTalkControls('remote');

    const cd = uiEphemeral.sofaCd || 0;
    h += `<div class="box"><span class="box-title">${tx('scene.sofa.cushions')}</span>
      <div class="actions">
        <button id="btn-sofa" class="cmd"${trAttr('scene.sofa.rummage')} onclick="Game.rummageSofa()" ${cd>0?'disabled':''}>${cd>0?esc(t('scene.sofa.rummage_cd', { s: Math.ceil(cd) })):esc(t('scene.sofa.rummage'))}</button>
        <button class="cmd"${trAttr('scene.sofa.go_phase4')} onclick="Game.selectZone(3);Game.go('aventura')">${esc(t('scene.sofa.go_phase4'))}</button>
      </div></div>`;

    h += `<div class="box"><span class="box-title">${tx('scene.sofa.accels')}</span>`;
    for(const k in ACCELS_ACT2){
      const a = ACCELS_ACT2[k], owned = S.accelerators[k]||0, cost = accelCost(k);
      h += `<div class="shop-item"><b>${ox('acc', k, 'name', a.name)}</b> x${owned}<br><span class="muted">${ox('acc', k, 'desc', a.desc)} (+${a.bonus} P/s)</span><br>
      <button class="cmd"${trAttr('btn.acquire')} data-cost="${cost}" onclick="Game.buyAccel('${k}')" ${S.resources.dust<cost?'disabled':''}>${esc(t('btn.acquire'))} (${fmt(cost)} ${dustUnit})</button></div>`;
    }
    const ft = TOOLS.fita_isolante;
    const hasFt = hasTool('fita_isolante');
    h += `<div class="shop-item"><b>${ox('tool','fita_isolante','name', ft.name)}</b> ${hasFt?`<span class="muted">${tx('btn.owned')}</span>`:`— <b>${fmt(ft.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('tool','fita_isolante','effect', ft.effect)}. ${ox('tool','fita_isolante','desc', ft.desc)}</span><br>${!hasFt?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${ft.price}" onclick="Game.buyItem('fita_isolante')" ${S.resources.dust<ft.price?'disabled':''}>${esc(t('btn.acquire'))}</button>`:''}</div>`;
    const cf = POTIONS.cafe_meia;
    const cfQty = (S.inventory.potions && S.inventory.potions.cafe_meia) || 0;
    h += `<div class="shop-item"><b>${ox('pot','cafe_meia','name', cf.name)}</b> <span class="muted">${tx('btn.you_have', { n: cfQty })}</span> — <b>${fmt(cf.price)} ${dustUnit}</b><br><span class="muted">${ox('pot','cafe_meia','effect', cf.effect)}. ${ox('pot','cafe_meia','desc', cf.desc)}</span><br><button class="cmd"${trAttr('btn.prepare_x1')} data-cost="${cf.price}" onclick="Game.buyPotion('cafe_meia',1)" ${S.resources.dust<cf.price?'disabled':''}>${esc(t('btn.prepare_x1'))}</button><button class="cmd" data-cost="${cf.price*5}" onclick="Game.buyPotion('cafe_meia',5)" ${S.resources.dust<cf.price*5?'disabled':''}>+5 (${fmt(cf.price*5)})</button></div>`;
    h += `</div>`;

    const stitchLv = (S.upgrades && S.upgrades.sockStitch) || 0;
    const stitchCost = 3 + stitchLv * 2;
    h += `<div class="box"><span class="box-title">${tx('scene.sofa.relics')}</span>`;
    for(const id in RELICS){
      const r = RELICS[id], owned = hasRelic(id);
      h += `<div class="shop-item"><b>${ox('rel', id, 'name', r.name)}</b> ${owned?`<span class="muted">${tx('btn.acquired_f')}</span>`:`— <b>${r.costSocks} ${socksUnit}</b>`}<br><span class="muted">${ox('rel', id, 'effect', r.effect)}. ${ox('rel', id, 'desc', r.desc)}</span><br>
      ${owned?'':`<button class="cmd"${trAttr('btn.trade')} onclick="Game.buyRelic('${id}')" ${(S.resources.socks||0)<r.costSocks?'disabled':''}>${esc(t('btn.trade'))}</button>`}</div>`;
    }
    h += `<div class="shop-item"><b>${tx('scene.sofa.stitch')}</b> Lv ${stitchLv} — <b>${stitchCost} ${socksUnit}</b><br><span class="muted">${tx('scene.sofa.stitch_desc')}</span><br>
      <button class="cmd"${trAttr('btn.upgrade')} onclick="Game.upgradeSockStitch()" ${(S.resources.socks||0)<stitchCost?'disabled':''}>${esc(t('btn.upgrade'))}</button></div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub === 'gaveta'){
    const ord = S.cables.order;
    const target = ['USB','HDMI','P2','VGA'];
    const tag = (i)=> ord[i] === target[i] ? `[ ${ord[i]} ✓ ]` : `[ ${ord[i]} ]`;
    h += `<div class="scene-title">${tx('scene.gaveta')}</div>`;
    h += `<div class="box"><div class="scene-text">${tx('scene.gaveta.desc')} <b>USB -&gt; HDMI -&gt; P2 -&gt; VGA</b>.</div>`;
    h += `<pre class="ascii-art">${tag(0)} ~~~ ${tag(1)} ~~~ ${tag(2)} ~~~ ${tag(3)}</pre>`;
    h += `<div class="actions">
      <button class="cmd"${trAttr('scene.gaveta.swap', { a:1, b:2 })} onclick="Game.swapCable(0)">${esc(t('scene.gaveta.swap', { a:1, b:2 }))}</button>
      <button class="cmd"${trAttr('scene.gaveta.swap', { a:2, b:3 })} onclick="Game.swapCable(1)">${esc(t('scene.gaveta.swap', { a:2, b:3 }))}</button>
      <button class="cmd"${trAttr('scene.gaveta.swap', { a:3, b:4 })} onclick="Game.swapCable(2)">${esc(t('scene.gaveta.swap', { a:3, b:4 }))}</button>
    </div>`;
    if(S.unlocks.cablesSolved) h += `<div class="amber" style="margin-top:8px">${tx('scene.gaveta.done')}</div>`;
    h += `</div>`;
    if(S.combat.unlockedZones >= 5){
      h += `<div class="actions"><button class="cmd"${trAttr('scene.gaveta.go_phase5')} onclick="Game.selectZone(4);Game.go('aventura')">${esc(t('scene.gaveta.go_phase5'))}</button></div>`;
    }
    h += `</div>`;
    return h;
  }

  if(sub === 'radio'){
    PUZZLES.ensureRadio(S);
    const sig = PUZZLES.radioSignal(S.radio);
    h += `<div class="scene-title">${tx('scene.radio')}</div>`;
    h += `<pre class="ascii-art">${esc(ART.oldRadio)}</pre>`;
    h += `<div class="box"><div class="amber">${sig.waveKey ? tx(sig.waveKey) : esc(sig.wave)}</div><div class="scene-text">${sig.msgKey ? tx(sig.msgKey) : esc(sig.msg)}</div>
      <div class="muted">${tx('scene.radio.meta', { band: S.radio.band, freq: S.radio.freq })}</div>
      <div class="actions">
        <button class="cmd"${trAttr('scene.radio.toggle')} onclick="Game.radioBand()">${esc(t('scene.radio.toggle'))}</button>
        <button class="cmd" onclick="Game.radioFreq(-2)">-2 MHz</button>
        <button class="cmd" onclick="Game.radioFreq(2)">+2 MHz</button>
      </div></div></div>`;
    return h;
  }

  if(sub === 'labirinto'){
    PUZZLES.ensureMaze(S);
    h += `<div class="scene-title">${tx('scene.labirinto')}</div>`;
    h += `<div class="box"><div class="muted">${tx('scene.labirinto.desc')}</div>
      <pre class="maze-grid">${esc(PUZZLES.renderMaze(S.maze))}</pre>
      <div class="actions">
        <button class="cmd"${trAttr('scene.labirinto.n')} onclick="Game.mazeMove(0,-1)">${esc(t('scene.labirinto.n'))}</button>
      </div>
      <div class="actions">
        <button class="cmd"${trAttr('scene.labirinto.w')} onclick="Game.mazeMove(-1,0)">${esc(t('scene.labirinto.w'))}</button>
        <button class="cmd"${trAttr('scene.labirinto.s')} onclick="Game.mazeMove(0,1)">${esc(t('scene.labirinto.s'))}</button>
        <button class="cmd"${trAttr('scene.labirinto.e')} onclick="Game.mazeMove(1,0)">${esc(t('scene.labirinto.e'))}</button>
      </div>
      ${S.maze.solved ? `<div class="amber">${tx('scene.labirinto.done')}</div>` : ''}
    </div></div>`;
    return h;
  }

  if(sub === 'sotao'){
    if(S.combat.unlockedZones < 6){
      S.combat.unlockedZones = 6;
      showToast(t('msg.attic_zone6'));
      save();
    }
    const bub = getNpcBubble('guitar', 'scene.guitar.default');
    h += `<div class="scene-title">${tx('scene.sotao')}</div>`;
    h += speechBubble(bub.text, 46, null, null, bub.key, bub.vars);
    h += `<pre class="ascii-art npc-idle" style="cursor:pointer" onclick="Game.pokeGuitar()">${esc(ART.guitar)}</pre>`;
    h += renderNpcTalkControls('guitar');

    const w = WEAPONS.vassoura_eletrica;
    const wOwned = hasWeaponTier('vassoura_eletrica');
    const wReqOk = hasWeaponTier(w.req);
    const a = ARMORS.cobertor_pesado;
    const aOwned = hasArmorTier('cobertor_pesado');
    const aReqOk = hasArmorTier(a.req);
    const im = TOOLS.ima_geladeira;
    const hasIm = hasTool('ima_geladeira');

    h += `<div class="box"><span class="box-title">${tx('scene.sotao.finds')}</span>
      <div class="shop-item"><b>${ox('wep','vassoura_eletrica','name', w.name)}</b> ${wOwned?`<span class="muted">${tx('btn.equipped')}</span>`:`— <b>${fmt(w.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('wep','vassoura_eletrica','desc', w.desc)} · ${ox('wep','vassoura_eletrica','passive', w.passive)}</span><br>${!wOwned?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${w.price}" data-req-ok="${wReqOk?1:0}" onclick="Game.buyItem('vassoura_eletrica')" ${(S.resources.dust<w.price||!wReqOk)?'disabled':''}>${esc(t('btn.acquire'))}</button>${!wReqOk?`<div class="muted">${tx('btn.requires', { name: o('wep', w.req, 'name', WEAPONS[w.req].name) })}</div>`:''}`:''}</div>
      <div class="shop-item"><b>${ox('arm','cobertor_pesado','name', a.name)}</b> ${aOwned?`<span class="muted">${tx('btn.equipped')}</span>`:`— <b>${fmt(a.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('arm','cobertor_pesado','desc', a.desc)}</span><br>${!aOwned?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${a.price}" data-req-ok="${aReqOk?1:0}" onclick="Game.buyItem('cobertor_pesado')" ${(S.resources.dust<a.price||!aReqOk)?'disabled':''}>${esc(t('btn.acquire'))}</button>${!aReqOk?`<div class="muted">${tx('btn.requires', { name: o('arm', a.req, 'name', ARMORS[a.req].name) })}</div>`:''}`:''}</div>
      <div class="shop-item"><b>${ox('tool','ima_geladeira','name', im.name)}</b> ${hasIm?`<span class="muted">${tx('btn.owned')}</span>`:`— <b>${fmt(im.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('tool','ima_geladeira','effect', im.effect)}. ${ox('tool','ima_geladeira','desc', im.desc)}</span><br>${!hasIm?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${im.price}" onclick="Game.buyItem('ima_geladeira')" ${S.resources.dust<im.price?'disabled':''}>${esc(t('btn.acquire'))}</button>`:''}</div>
    </div>`;
    h += `<div class="actions"><button class="cmd"${trAttr('scene.sotao.go_phase6')} onclick="Game.selectZone(5);Game.go('aventura')">${esc(t('scene.sotao.go_phase6'))}</button></div></div>`;
    return h;
  }

  if(sub === 'torre'){
    const gears = (S.gears.cable ? 1 : 0) + (S.gears.boss ? 1 : 0);
    h += `<div class="scene-title">${tx('scene.torre')}</div>`;
    h += `<pre class="ascii-art">${esc(ART.clockTower)}</pre>`;

    if(!S.unlocks.clockUnlocked){
      h += `<div class="box"><div class="scene-text">${tx('scene.torre.stopped')}</div>`;
      if(gears >= 2){
        PUZZLES.ensureClockDial(S);
        const v = S.clockDial.vals;
        h += `<div class="muted" style="margin-bottom:8px">${tx('scene.torre.align')}</div>`;
        h += `<div class="row">
          <div><b class="amber" style="font-size:20px">${v[0]}h</b><br><button class="cmd"${trAttr('scene.torre.turn', { n:'I' })} onclick="Game.turnClock(0)">${esc(t('scene.torre.turn', { n:'I' }))}</button></div>
          <div><b class="amber" style="font-size:20px">${v[1]}h</b><br><button class="cmd"${trAttr('scene.torre.turn', { n:'II' })} onclick="Game.turnClock(1)">${esc(t('scene.torre.turn', { n:'II' }))}</button></div>
          <div><b class="amber" style="font-size:20px">${v[2]}h</b><br><button class="cmd"${trAttr('scene.torre.turn', { n:'III' })} onclick="Game.turnClock(2)">${esc(t('scene.torre.turn', { n:'III' }))}</button></div>
        </div>`;
      } else {
        h += `<div class="red">${tx('scene.gears_count')} ${gears}/2</div><div class="muted">${tx('scene.torre.need_gears')}</div>`;
      }
      h += `</div></div>`;
      return h;
    }

    const w = WEAPONS.ponteiro_12h;
    const wOwned = hasWeaponTier('ponteiro_12h');
    const wReqOk = hasWeaponTier(w.req);
    const a = ARMORS.manto_tempo;
    const aOwned = hasArmorTier('manto_tempo');
    const aReqOk = hasArmorTier(a.req);

    h += `<div class="box"><span class="box-title">${tx('scene.torre.workshop')}</span>
      <div class="shop-item"><b>${ox('wep','ponteiro_12h','name', w.name)}</b> ${wOwned?`<span class="muted">${tx('btn.equipped')}</span>`:`— <b>${fmt(w.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('wep','ponteiro_12h','desc', w.desc)} · ${ox('wep','ponteiro_12h','passive', w.passive)}</span><br>${!wOwned?`<button class="cmd"${trAttr('btn.forge')} data-cost="${w.price}" data-req-ok="${wReqOk?1:0}" onclick="Game.buyItem('ponteiro_12h')" ${(S.resources.dust<w.price||!wReqOk)?'disabled':''}>${esc(t('btn.forge'))}</button>${!wReqOk?`<div class="muted">${tx('btn.requires', { name: o('wep', w.req, 'name', WEAPONS[w.req].name) })}</div>`:''}`:''}</div>
      <div class="shop-item"><b>${ox('arm','manto_tempo','name', a.name)}</b> ${aOwned?`<span class="muted">${tx('btn.equipped')}</span>`:`— <b>${fmt(a.price)} ${dustUnit}</b>`}<br><span class="muted">${ox('arm','manto_tempo','desc', a.desc)}</span><br>${!aOwned?`<button class="cmd"${trAttr('btn.acquire')} data-cost="${a.price}" data-req-ok="${aReqOk?1:0}" onclick="Game.buyItem('manto_tempo')" ${(S.resources.dust<a.price||!aReqOk)?'disabled':''}>${esc(t('btn.acquire'))}</button>${!aReqOk?`<div class="muted">${tx('btn.requires', { name: o('arm', a.req, 'name', ARMORS[a.req].name) })}</div>`:''}`:''}</div>
    </div>`;

    const skLv = (S.upgrades && S.upgrades.skillLv) || 0;
    const blLv = (S.upgrades && S.upgrades.magicBless) || 0;
    h += `<div class="box"><span class="box-title">${tx('scene.torre.altar')}</span>
      <div class="shop-item"><b>${tx('scene.torre.skill_mastery')}</b> Lv ${skLv}/5 ${skLv>=5?`<span class="muted">${tx('btn.max')}</span>`:`— <b>${2+skLv} ${magicUnit}</b>`}<br><span class="muted">${tx('scene.torre.skill_desc')}</span><br>${skLv<5?`<button class="cmd"${trAttr('btn.evolve')} onclick="Game.upgradeSkillLv()" ${S.resources.magicDust<(2+skLv)?'disabled':''}>${esc(t('btn.evolve'))}</button>`:''}</div>
      <div class="shop-item"><b>${tx('scene.torre.bless')}</b> Lv ${blLv} — <b>${2+blLv} ${magicUnit}</b><br><span class="muted">${tx('scene.torre.bless_desc')}</span><br><button class="cmd"${trAttr('btn.bless')} onclick="Game.upgradeMagicBless()" ${S.resources.magicDust<(2+blLv)?'disabled':''}>${esc(t('btn.bless'))}</button></div>
    </div>`;

    if(!S.unlocks.finalChoiceReady){
      h += `<div class="box"><div class="scene-text">${tx('scene.torre.top_desc')}</div>
      <div class="actions"><button class="cmd danger"${trAttr('scene.torre.go_phase7')} onclick="Game.selectZone(6);Game.go('aventura')">${esc(t('scene.torre.go_phase7'))}</button></div></div>`;
    } else {
      const ngN = (S.ngPlus || 0) + 1;
      const ngConf = esc(t('msg.ng_confirm')).replace(/'/g, '&#39;');
      h += `<div class="box"><span class="box-title">${tx('scene.torre.choice')}</span>
        <div class="scene-text">${tx('scene.torre.choice_sub')}</div>
        <div class="actions">
          <button class="cmd"${trAttr('scene.torre.btn_vac')} onclick="Game.chooseEnding('aspirador')">${esc(t('scene.torre.btn_vac'))}</button>
          <button class="cmd"${trAttr('scene.torre.btn_throne')} onclick="Game.chooseEnding('trono')">${esc(t('scene.torre.btn_throne'))}</button>
        </div>
        ${S.unlocks.ending ? `<div class="actions" style="margin-top:10px"><button class="cmd subtle"${trAttr('end.ngplus', { n: ngN })} onclick="if(confirm('${ngConf}')) Game.startNewGamePlus()">${esc(t('end.ngplus', { n: ngN }))}</button></div>` : ''}
      </div>`;
    }
    h += `</div>`;
    return h;
  }

  return h + `<div class="muted">${tx('msg.unknown_desvao')}</div></div>`;
}

function viewEnding(){
  const isAsp = S.unlocks.ending === 'aspirador';
  const art = isAsp ? ART.vacuumEnding : ART.throneEnding;
  const titleKey = isAsp ? 'end.vac.title' : 'end.throne.title';
  const bodyKey = isAsp ? 'end.vac.body' : 'end.throne.body';
  const ngN = (S.ngPlus || 0) + 1;
  const ngConf = esc(t('msg.ng_confirm')).replace(/'/g, '&#39;');

  return `<div class="stage"><div class="scene-title">— ${tx(titleKey)} —</div>
  <pre class="ascii-art">${esc(art)}</pre>
  <div class="box"><pre style="white-space:pre-wrap;text-align:center"${trAttr(bodyKey)}>${esc(t(bodyKey))}</pre><br>
  <div class="muted">${fmt(Math.floor(S.resources.totalEarned))} · ${S.combat.kills} · ${S.achievements.length}/${Object.keys(ACHIEVEMENT_INFO).length} · ${S.secrets.length}/${Object.keys(SECRETS).length}</div>
  <div class="actions" style="margin-top:14px">
    <button class="cmd"${trAttr('end.continue')} onclick="Game.continueAfterEnding()">${esc(t('end.continue'))}</button>
    <button class="cmd"${trAttr('end.ngplus', { n: ngN })} onclick="if(confirm('${ngConf}')) Game.startNewGamePlus()">${esc(t('end.ngplus', { n: ngN }))}</button>
  </div></div></div>`;
}

function viewAventura(){
  const c = S.combat;
  const zone = COMBAT_ZONES[c.zone] || COMBAT_ZONES[0];
  const realm = S.unlocks.act2 ? (c.realm || zone.realm || 'castelo') : 'castelo';
  const loop = (c.zoneLoops && c.zoneLoops[c.zone]) || 1;
  const wId = S.inventory.weapon;
  const w = WEAPONS[wId];

  let h = `<div class="stage"><div class="scene-title">— ${ox('zone', zone.id, 'name', zone.name)} —</div>`;
  if(S.unlocks.act2){
    h += `<div class="zone-tabs">
      <button class="zone-btn${realm==='castelo'?' active':''}"${trAttr('adv.castle')} onclick="Game.selectRealm('castelo')" ${c.active?'disabled':''}>${esc(t('adv.castle'))}</button>
      <button class="zone-btn${realm==='desvao'?' active':''}"${trAttr('adv.desvao')} onclick="Game.selectRealm('desvao')" ${c.active?'disabled':''}>${esc(t('adv.desvao'))}</button>
    </div>`;
  }
  h += `<div class="zone-tabs">`;
  COMBAT_ZONES.forEach((z, idx) => {
    if((z.realm || 'castelo') !== realm) return;
    const unlocked = idx < c.unlockedZones;
    const activeCls = idx === c.zone ? ' active' : '';
    const zAttr = unlocked ? trAttr(`zone.${z.id}.short`) : trAttr('adv.locked_zone', { n: idx+1 });
    h += `<button class="zone-btn${activeCls}"${zAttr} onclick="Game.selectZone(${idx})" ${(c.active || !unlocked) ? 'disabled' : ''}>${unlocked ? esc(o('zone', z.id, 'short', z.short)) : esc(t('adv.locked_zone', { n: idx+1 }))}</button>`;
  });
  h += `</div>`;

  const wLabel = w ? o('wep', wId, 'name', w.name) : t('inv.unarmed');
  h += `<div class="muted">${tx('adv.stats', { w: wLabel, atk: S.player.attack, k: c.kills, l: loop })}</div>`;
  h += `<div class="actions">`;
  if(!c.active){
    h += `<button class="cmd"${trAttr('btn.start_exp')} onclick="Game.startExpedition()">${esc(t('btn.start_exp'))}</button>`;
    h += `<button class="cmd"${trAttr('btn.rest')} onclick="Game.rest()">${esc(t('btn.rest'))}</button>`;
  } else {
    h += `<button class="cmd danger"${trAttr('btn.retreat')} onclick="Game.retreatExpedition()">${esc(t('btn.retreat'))}</button>`;
  }
  const hasCha = ((S.inventory.potions && S.inventory.potions.cha_poeira) || 0) > 0 || S.combat.autoTea;
  if(hasCha){
    h += `<button class="cmd subtle"${trAttr('btn.auto_tea', { v: S.combat.autoTea?'ON':'OFF' })} onclick="Game.toggleAutoTea()" title="${esc(t('msg.auto_tea_tip'))}">${esc(t('btn.auto_tea', { v: S.combat.autoTea?'ON':'OFF' }))}</button>`;
  }
  h += `</div>`;

  if(c.active && c.monster){
    const mmax = c.mmax || c.monster.hp || 1;
    const pct = Math.max(0, Math.min(100, c.mhp/mmax*100));
    const steps = Math.floor(pct/10);
    const buffs = [];
    if(uiEphemeral.buffs.tonicSec > 0) buffs.push(t('adv.buff_tonic', { s: Math.ceil(uiEphemeral.buffs.tonicSec) }));
    if(uiEphemeral.buffs.cloudTurns > 0) buffs.push(t('adv.buff_blind', { n: uiEphemeral.buffs.cloudTurns }));
    if(uiEphemeral.buffs.stunTurns > 0) buffs.push(t('adv.buff_stun'));

    h += `<div class="box">`;
    h += `<div class="muted" style="margin-bottom:4px">${tx('adv.encounter', { cur: c.idx + 1, tot: zone.monsters.length })}</div>`;
    h += `<pre class="ascii-art monster-art" onclick="Game.pokeMonster()">${esc(c.monster.art||'')}</pre>`;
    h += `<div><b>${ox('mon', c.monster.id, 'name', c.monster.name)}</b> ${c.monster.boss?`<b class="red">${tx('adv.boss')}</b>`:''} — HP ${Math.max(0,Math.ceil(c.mhp))}/${mmax} [${'#'.repeat(steps)}${'.'.repeat(10-steps)}]</div>`;
    h += `<pre class="corridor-track">${esc(renderCorridorTrack())}</pre>`;
    h += `<div class="buff-bar">${esc(buffs.join(' · '))}</div>`;

    h += `<div class="skill-bar">`;
    for(const sid in SKILLS){
      if(!hasSkillUnlocked(sid)) continue;
      const sk = SKILLS[sid];
      const cd = uiEphemeral.skillCd[sid] || 0;
      const skName = o('sk', sid, 'name', sk.name);
      const lbl = cd > 0 ? `[${sk.key}] ${skName} (${Math.ceil(cd)}s)` : `[${sk.key}] ${skName}`;
      h += `<button class="skill-btn" data-skill="${sid}"${trAttr(`sk.${sid}.desc`)} title="${esc(o('sk', sid, 'desc', sk.desc))}" onclick="Game.useSkill('${sid}')" ${cd>0?'disabled':''}>${esc(lbl)}</button>`;
    }
    const chaQty = (S.inventory.potions && S.inventory.potions.cha_poeira) || 0;
    const tonQty = (S.inventory.potions && S.inventory.potions.tonico_cafeina) || 0;
    const cfQty  = (S.inventory.potions && S.inventory.potions.cafe_meia) || 0;
    if(chaQty > 0) h += `<button class="skill-btn"${trAttr('adv.tea_btn', { n: chaQty })} onclick="Game.usePotion('cha_poeira')" title="${esc(o('pot','cha_poeira','effect', POTIONS.cha_poeira.effect))}">${esc(t('adv.tea_btn', { n: chaQty }))}</button>`;
    if(tonQty > 0) h += `<button class="skill-btn"${trAttr('adv.tonic_btn', { n: tonQty })} onclick="Game.usePotion('tonico_cafeina')" title="${esc(o('pot','tonico_cafeina','effect', POTIONS.tonico_cafeina.effect))}">${esc(t('adv.tonic_btn', { n: tonQty }))}</button>`;
    if(cfQty > 0)  h += `<button class="skill-btn"${trAttr('adv.coffee_btn', { n: cfQty })} onclick="Game.usePotion('cafe_meia')" title="${esc(o('pot','cafe_meia','effect', POTIONS.cafe_meia.effect))}">${esc(t('adv.coffee_btn', { n: cfQty }))}</button>`;
    h += `</div>`;

    h += `<div class="combat-log">${c.clog.map(l=>`<div>${esc(l)}</div>`).join('')}</div></div>`;
  } else {
    h += `<div class="box muted">${ox('zone', zone.id, 'desc', zone.desc)}<br>${tx('adv.no_pause')}</div>`;
  }
  h += `</div>`;
  return h;
}

function viewCompendio(){
  const ct = S.ui.compTab || 'equip';
  let h = `<div class="stage"><div class="scene-title">${tx('comp.title')}</div>`;
  h += `<div class="comp-tabs">
    <button class="zone-btn${ct==='equip'?' active':''}"${trAttr('comp.equip')} onclick="Game.setCompTab('equip')">${esc(t('comp.equip'))}</button>
    <button class="zone-btn${ct==='bestiario'?' active':''}"${trAttr('comp.bestiary')} onclick="Game.setCompTab('bestiario')">${esc(t('comp.bestiary'))}</button>
    <button class="zone-btn${ct==='segredos'?' active':''}"${trAttr('comp.secrets', { cur: S.secrets.length, tot: Object.keys(SECRETS).length })} onclick="Game.setCompTab('segredos')">${esc(t('comp.secrets', { cur: S.secrets.length, tot: Object.keys(SECRETS).length }))}</button>
  </div>`;

  if(ct === 'equip'){
    const renderEntry = (unlocked, titleHtml, statHtml, descHtml, hintHtml) => unlocked
      ? `<div class="comp-entry"><div class="comp-head"><b>${titleHtml}</b><span class="muted">${statHtml}</span></div><div class="muted">${descHtml}</div></div>`
      : `<div class="comp-entry locked"><div class="comp-head"><b>???</b><span class="muted">${tx('comp.locked')}</span></div><div class="muted">${hintHtml}</div></div>`;

    h += `<div class="box"><span class="box-title">${tx('comp.weapons')}</span>`;
    for(const id in WEAPONS){
      const w = WEAPONS[id];
      h += renderEntry(hasWeaponTier(id), ox('wep', id, 'name', w.name), `+${w.atk} ATK · ${ox('wep', id, 'passive', w.passive)}`, ox('wep', id, 'desc', w.desc), ox('wep', id, 'hint', w.hint));
    }
    h += `</div><div class="box"><span class="box-title">${tx('comp.armors_bags')}</span>`;
    for(const id in ARMORS){
      const a = ARMORS[id];
      h += renderEntry(hasArmorTier(id), ox('arm', id, 'name', a.name), `HP max ${a.maxHp}`, ox('arm', id, 'desc', a.desc), ox('arm', id, 'hint', a.hint));
    }
    for(const id in BAGS){
      const b = BAGS[id];
      h += renderEntry(hasBagTier(id), ox('bag', id, 'name', b.name), `Base ${fmt(b.max)}`, ox('bag', id, 'desc', b.desc), ox('bag', id, 'hint', b.hint));
    }
    h += `</div><div class="box"><span class="box-title">${tx('comp.tools_relics')}</span>`;
    for(const id in TOOLS){
      const tl = TOOLS[id];
      h += renderEntry(hasTool(id), ox('tool', id, 'name', tl.name), ox('tool', id, 'effect', tl.effect), ox('tool', id, 'desc', tl.desc), ox('tool', id, 'hint', tl.hint));
    }
    for(const id in RELICS){
      const r = RELICS[id];
      h += renderEntry(hasRelic(id), `✦ ${ox('rel', id, 'name', r.name)}`, ox('rel', id, 'effect', r.effect), ox('rel', id, 'desc', r.desc), tx('comp.relic_hint'));
    }
    h += `</div><div class="box"><span class="box-title">${tx('comp.skills')}</span>`;
    for(const sid in SKILLS){
      const sk = SKILLS[sid];
      h += renderEntry(hasSkillUnlocked(sid), `[${sk.key}] ${ox('sk', sid, 'name', sk.name)}`, `Cooldown ${sk.cd}s`, ox('sk', sid, 'desc', sk.desc), ox('sk', sid, 'hint', sk.hint));
    }
    h += `</div>`;
  } else if(ct === 'bestiario'){
    const seenCount = Object.keys(S.discoveredMonsters).length;
    h += `<div class="muted" style="margin-bottom:8px">${tx('comp.cataloged', { cur: seenCount, tot: ALL_MONSTERS.length })}</div>`;
    COMBAT_ZONES.forEach(z => {
      const zShort = o('zone', z.id, 'short', z.short);
      h += `<div class="box"><span class="box-title">— ${ox('zone', z.id, 'short', z.short)} —</span>`;
      z.monsters.forEach(m => {
        const seen = m.id in S.discoveredMonsters;
        const kills = S.discoveredMonsters[m.id] || 0;
        const bossTag = m.boss ? ` ${tx('adv.boss')}` : '';
        if(seen){
          h += `<div class="comp-entry"><div class="comp-head"><b>${ox('mon', m.id, 'name', m.name)}${bossTag}</b><span class="muted">${tx('msg.bestiary_stats', { hp: m.hp, atk: m.atk, k: kills })}</span></div>
          <pre class="ascii-art" style="font-size:12px;margin:4px 0">${esc(m.art)}</pre>
          <div class="muted">${ox('mon', m.id, 'desc', m.desc)}</div></div>`;
        } else {
          h += `<div class="comp-entry locked"><div class="comp-head"><b>???${bossTag}</b><span class="muted">${tx('comp.unseen')}</span></div><div class="muted">${tx('comp.inhabits', { zone: zShort })}</div></div>`;
        }
      });
      h += `</div>`;
    });
  } else if(ct === 'segredos'){
    h += `<div class="box"><span class="box-title">${tx('comp.secrets_title')}</span>`;
    for(const id in SECRETS){
      const sc = SECRETS[id];
      if(hasSecret(id)){
        h += `<div class="comp-entry"><div class="comp-head"><b>✦ ${ox('sec', id, 'name', sc.name)}</b><span class="amber">${ox('sec', id, 'bonusText', sc.bonusText)}</span></div><div class="muted">${ox('sec', id, 'desc', sc.desc)}</div></div>`;
      } else {
        h += `<div class="comp-entry locked"><div class="comp-head"><b>???</b><span class="muted">${tx('comp.hidden')}</span></div><div class="muted">${ox('sec', id, 'hint', sc.hint)}</div></div>`;
      }
    }
    h += `</div>`;
  }

  h += `</div>`;
  return h;
}

function viewVictory(){
  return `<div class="stage"><div class="scene-title">— Ar Puro —</div>
  <pre class="ascii-art">${esc(ART.gate)}</pre>
  <div class="box"><pre>O PORTÃO RANGE... E SE ABRE.

*** AR PURO ***

Você respira fundo. Tosse por 40 segundos.
Valeu a pena.

Poeira total acumulada: ${fmt(Math.floor(S.resources.totalEarned))}
Abates: ${S.combat.kills} — Poeiras Mágicas: ${S.resources.magicDust}
Conquistas: ${S.achievements.length} — Segredos: ${S.secrets.length}/${Object.keys(SECRETS).length}</pre><br>
  <div class="amber">FIM DO ATO I — O Castelo da Poeira Eterna será lembrado (e varrido, talvez).</div>
  <div class="muted" style="margin-top:6px">O Rato acena com o lenço. A Traça chora poeira. O Cupim já vende souvenirs da sua vitória.</div>
  <div class="actions" style="margin-top:14px"><button class="cmd" onclick="Game.reset()">Recomeçar (virar poeira de novo)</button></div></div></div>`;
}

/* ---------- debug (uso livre pelo console ou Ctrl+Shift+D) ---------- */
const Debug = {
  addDust(){ S.resources.dust += 1000; notify('[DEBUG] +1000 poeira.'); save(); render(); },
  addMagic(){ S.resources.magicDust += 10; notify('[DEBUG] +10 mágica.'); save(); render(); },
  toggleInf(){
    S.flags.dustInf = !S.flags.dustInf;
    if(!S.flags.dustInf){
      S.resources.dust = Math.min(S.resources.dust, S.resources.maxDust);
    }
    notify(S.flags.dustInf ? '[DEBUG] Poeira/Mágica infinitas ligadas.' : '[DEBUG] Modo infinito desligado.');
    save(); render();
  },
  skipIntro(){
    S.intro = { cleans: 3, done: true };
    notify('[DEBUG] Intro pulada.');
    save(); render();
  },
  openWorld(){
    S.intro = { cleans: 3, done: true };
    S.unlocks.outOfRoom = true; S.unlocks.metMoth = true;
    S.unlocks.hasMap = true; S.unlocks.hasLantern = true;
    S.unlocks.hasCompendium = true;
    S.combat.unlockedZones = COMBAT_ZONES.length;
    S.ui.tab = 'hall';
    notify('[DEBUG] Mundo e Compêndio abertos.');
    save(); render();
  },
  giveAll(){
    S.inventory.weapon = 'aspirador_entupido';
    S.inventory.armor = 'armadura_papelao';
    S.inventory.bag = 'bau_sem_fundo';
    S.inventory.tools = Object.keys(TOOLS);
    ['mapa_castelo','lanterna','pedra_peso','compendio'].forEach(i=>{ if(!S.inventory.items.includes(i)) S.inventory.items.push(i); });
    S.unlocks.hasCompendium = true;
    S.combat.unlockedZones = COMBAT_ZONES.length;
    S.key.fragments = 3; S.key.complete = true;
    S.resources.magicDust += 50;
    recalc();
    notify('[DEBUG] Tudo entregue.');
    save(); render();
  }
};

/* ---------- modal export/import ---------- */
function encodeSave(obj){
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
function decodeSave(str){
  const trimmed = str.trim();
  if(!trimmed) throw new Error('Código vazio.');
  if(trimmed.startsWith('{')) return JSON.parse(trimmed);
  const bin = atob(trimmed);
  const bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
function openModal(mode){
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const text = document.getElementById('modal-text');
  const btnConfirm = document.getElementById('modal-btn-confirm');
  const btnCopy = document.getElementById('modal-btn-copy');
  if(!modal) return;
  if(mode === 'export'){
    save();
    title.textContent = t('modal.export.title');
    desc.textContent = t('modal.export.desc');
    text.readOnly = true;
    text.value = encodeSave(S);
    btnConfirm.style.display = 'none';
    btnCopy.style.display = '';
  } else {
    title.textContent = t('modal.import.title');
    desc.textContent = t('modal.import.desc');
    text.readOnly = false;
    text.value = '';
    btnConfirm.style.display = '';
    btnCopy.style.display = 'none';
  }
  modal.classList.remove('hidden');
  text.focus();
  if(mode === 'export') text.select();
}
function closeModal(){
  const modal = document.getElementById('modal');
  if(modal) modal.classList.add('hidden');
}
function copyModalSave(){
  const text = document.getElementById('modal-text');
  if(!text) return;
  const done = ()=>{ sfx('buy'); notify(t('msg.copy_ok'), 'amber'); };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text.value).then(done).catch(()=>{
      text.select(); document.execCommand('copy'); done();
    });
  } else {
    text.select(); document.execCommand('copy'); done();
  }
}
function confirmImportSave(){
  const text = document.getElementById('modal-text');
  if(!text) return;
  try {
    const parsed = decodeSave(text.value);
    if(!parsed || typeof parsed !== 'object' || !parsed.resources){
      throw new Error('Invalid save structure.');
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    load();
    recalc();
    save();
    render();
    closeModal();
    sfx('unlock');
    showToast(t('msg.import_ok'));
  } catch(e){
    sfx('error');
    notify(t('msg.import_fail'), 'red');
    alert(t('msg.import_alert'));
  }
}

/* ---------- loop ---------- */
let combatAcc = 0, saveAcc = 0, uiAcc = 0;
function tick(dt){
  if(S.flags.dustInf){
    S.resources.dust = 9999999;
    if(S.resources.magicDust < 999) S.resources.magicDust = 999;
  } else {
    const gain = S.resources.dustPerSecond * dt;
    if(S.resources.dust + gain >= S.resources.maxDust){
      const room = S.resources.maxDust - S.resources.dust;
      if(room > 0){ S.resources.dust = S.resources.maxDust; S.resources.totalEarned += room; }
      once('full', t('msg.bag_full'));
    } else {
      S.resources.dust += gain;
      S.resources.totalEarned += gain;
    }
  }
  if(!S.combat.active && S.player.hp < S.player.maxHp){
    const regenRate = hasTool('flanela_microfibra') ? 2.0 : 1.0;
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + dt * regenRate);
  }

  if(uiEphemeral.sofaCd > 0) uiEphemeral.sofaCd = Math.max(0, uiEphemeral.sofaCd - dt);

  if(S.intro.done && !hasSecret('estatua_viva')){
    uiEphemeral.idleSeconds += dt;
    if(uiEphemeral.idleSeconds >= 60){
      unlockSecret('estatua_viva');
    }
  }

  if(S.intro.done && !S.unlocks.viewingEnding){
    uiEphemeral.moteTimer -= dt;
    if(uiEphemeral.moteTimer <= 0){
      uiEphemeral.moteTimer = 90 + Math.floor(Math.random()*90);
      spawnGoldenMote();
    }
    uiEphemeral.flashTimer -= dt;
    if(uiEphemeral.flashTimer <= 0){
      uiEphemeral.flashTimer = 140 + Math.floor(Math.random()*90);
      spawnFlashEvent();
    }
  }

  if(S.resources.totalEarned >= 1000) once('m1', t('msg.milestone_1k'));

  if(S.combat.active){
    for(const sid in uiEphemeral.skillCd){
      if(uiEphemeral.skillCd[sid] > 0) uiEphemeral.skillCd[sid] = Math.max(0, uiEphemeral.skillCd[sid] - dt);
    }
    if(uiEphemeral.buffs.tonicSec > 0) uiEphemeral.buffs.tonicSec = Math.max(0, uiEphemeral.buffs.tonicSec - dt);

    const approaching = (uiEphemeral.track.mpos - uiEphemeral.track.ppos) > 3;
    const interval = approaching ? 0.25 : (hasSecret('cafe_ontem') ? 0.72 : 0.80);
    combatAcc += dt;
    if(combatAcc >= interval){ combatAcc = 0; combatRound(); render(); }
  }
}

let loopHandle = null;
function startLoop(){
  if(loopHandle) return;
  loopHandle = setInterval(()=>{
    const dt = 0.1;
    tick(dt);
    paintStats();
    uiAcc += dt; saveAcc += dt;
    if(uiAcc >= 0.2){ uiAcc = 0; refreshDynamic(); }
    if(saveAcc >= 5){ saveAcc = 0; save(); }
  }, 100);
}

/* ---------- boot ---------- */
function boot(){
  loadPrefs();
  applyLangUI();
  if(I18n){
    I18n.initHoverBubble();
    I18n.loadCommunityIndex(() => { applyLangUI(); });
  }
  const had = load();
  recalc();
  if(had){
    const away = Math.min(12*3600, (Date.now() - (S.lastSeen||Date.now()))/1000);
    if(away > 60){
      const g = Math.min(S.resources.dustPerSecond * away, Math.max(0, S.resources.maxDust - S.resources.dust));
      S.resources.dust += g; S.resources.totalEarned += g;
      setTimeout(()=>showToast(t('msg.offline', { min: Math.floor(away/60), dust: fmt(Math.floor(g)) })), 300);
    }
  }
  const bind = (id, fn)=>{ const el = document.getElementById(id); if(el) el.onclick = fn; };
  bind('btn-save', ()=>{ save(); sfx('click'); notify(t('msg.saved')); });
  bind('btn-export', ()=>{ sfx('click'); openModal('export'); });
  bind('btn-import', ()=>{ sfx('click'); openModal('import'); });
  bind('btn-lang', cycleLang);
  bind('btn-hover-lang', cycleHoverLang);
  bind('btn-theme', cycleTheme);
  bind('btn-sound', toggleSound);
  bind('btn-reset', ()=>{ if(confirm(t('msg.reset_confirm'))) Game.reset(); });
  bind('modal-btn-close', closeModal);
  bind('modal-btn-copy', copyModalSave);
  bind('modal-btn-confirm', confirmImportSave);
  bind('title-cursor', pokeTitleCursor);

  const modal = document.getElementById('modal');
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

  document.addEventListener('click', ()=>{ uiEphemeral.idleSeconds = 0; });

  document.addEventListener('keydown', (e)=>{
    uiEphemeral.idleSeconds = 0;
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd'){
      e.preventDefault();
      const dbg = document.getElementById('dbgbtn');
      if(dbg) dbg.classList.toggle('visible');
      return;
    }
    if(e.key === 'Escape'){
      closeModal();
      return;
    }
    const tag = e.target && e.target.tagName;
    if(tag === 'TEXTAREA' || tag === 'INPUT') return;
    if(modal && !modal.classList.contains('hidden')) return;
    if(!S.intro.done || S.unlocks.victory) return;
    if(e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey && !e.metaKey){
      const list = tabs();
      const idx = parseInt(e.key, 10) - 1;
      if(list[idx]){ sfx('click'); go(list[idx].id); }
      return;
    }
    if(S.ui.tab === 'aventura' && S.combat.active && !e.ctrlKey && !e.altKey && !e.metaKey){
      const k = e.key.toLowerCase();
      if(k === 'q') useSkill('sweep');
      else if(k === 'w') useSkill('cloud');
      else if(k === 'e') useSkill('sneeze');
      else if(k === 'r') usePotion('cha_poeira');
      else if(k === 't') usePotion('tonico_cafeina');
      else if(k === 'f') usePotion('cafe_meia');
    }
  });

  render();
  startLoop();
}

window.Game = {
  buyAccel, lubricate, cleanBody, buyItem, buyPotion, usePotion, toggleAutoTea, transmute, transmuteAll, craftFragment, fuseKey, openGate,
  rummageSofa, buyRelic, swapCable, unlockClockTower, chooseEnding, continueAfterEnding, startNewGamePlus,
  safeDigit, testSafe, radioBand, radioFreq, mazeMove, turnClock,
  upgradeSkillLv, upgradeMagicBless, upgradeSockStitch, resolveFlashEvent,
  cycleLever, testLevers, searchCandy, enterWind, pullBook,
  selectRealm, selectZone, startExpedition, retreatExpedition, useSkill, rest,
  talkNpc, chooseDialogue,
  pokeRat, pokeSpiderWord, pokeTermite, pokeMonster, pokeRemote, pokeGuitar, pokeCandy,
  go, setCompTab, setMapHint,
  reset(){ window.__dustboxSkipSave = true; localStorage.removeItem(SAVE_KEY); location.reload(); },
  debug: Debug,
  get state(){ return S; }
};

document.addEventListener('DOMContentLoaded', boot);
})();
