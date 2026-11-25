/* DUST BOX v1.3.0 — Castelo da Poeira Eterna (Engine Principal) */
(function(){
"use strict";
const SAVE_KEY = 'dustbox_save_v1';
const PREFS_KEY = 'dustbox_prefs_v1';

const {
  THEMES, WEAPON_ORDER, ARMOR_ORDER, BAG_ORDER,
  ACCELS, WEAPONS, ARMORS, BAGS, TOOLS, POTIONS, SKILLS,
  ITEM_LABELS, SECRETS, ACHIEVEMENT_INFO,
  COMBAT_ZONES, ALL_MONSTERS, LEVERS
} = window.DustData;
const ART = window.DustArt;
const DIALOGUES = window.DustDialogues;

function defaultState(){
  return {
    version: "1.4.0",
    resources: { dust: 0, magicDust: 0, dustPerSecond: 1, maxDust: 1000, totalEarned: 0 },
    unlocks: { outOfRoom:false, metMoth:false, hasMap:false, hasLantern:false, hasCompendium:false, candyLooted:false, windLooted:false, puzzleSolved:false, victory:false },
    accelerators: { window:0, cat:0, carpet:0, fan:0 },
    inventory: { weapon:'none', armor:'roupa_mofada', bag:'bolso_furado', tools:[], potions:{ cha_poeira:0, tonico_cafeina:0 }, items:[] },
    player: { hp:100, maxHp:100, attack:2 },
    puzzle: { solution:null, current:[0,0,0], attempts:0 },
    key: { fragments:0, complete:false },
    achievements: [],
    secrets: [],
    discoveredMonsters: {},
    combat: { active:false, zone:0, unlockedZones:1, zoneLoops:[1,1,1], idx:0, monster:null, mhp:0, mmax:1, clog:[], kills:0 },
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
  idleSeconds: 0,
  moteTimer: 45,
  moteEl: null,
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
    if(!Array.isArray(S.inventory.items)) S.inventory.items = [];
    S.inventory.potions = Object.assign({ cha_poeira:0, tonico_cafeina:0 }, S.inventory.potions||{});
    S.player = Object.assign(def.player, d.player||{});
    S.puzzle = Object.assign(def.puzzle, d.puzzle||{});
    S.key = Object.assign(def.key, d.key||{});
    S.combat = Object.assign(def.combat, d.combat||{});
    if(!Array.isArray(S.combat.zoneLoops) || S.combat.zoneLoops.length < 3) S.combat.zoneLoops = [S.combat.loop||1, 1, 1];
    if(typeof S.combat.zone !== 'number' || S.combat.zone < 0 || S.combat.zone >= COMBAT_ZONES.length) S.combat.zone = 0;
    if(typeof S.combat.unlockedZones !== 'number' || S.combat.unlockedZones < 1) S.combat.unlockedZones = 1;
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
function hasSecret(id){     return S.secrets.includes(id); }
function hasSkillUnlocked(id){
  const sk = SKILLS[id];
  return !!(sk && (!sk.reqWeapon || hasWeaponTier(sk.reqWeapon)));
}

/* ---------- preferencias, tema e som ---------- */
let prefs = { theme: 0, sound: false };
let audioCtx = null;

function loadPrefs(){
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if(raw){
      const p = JSON.parse(raw);
      if(typeof p.theme === 'number' && p.theme >= 0 && p.theme < THEMES.length) prefs.theme = p.theme;
      prefs.sound = !!p.sound;
    }
  } catch(e){}
}
function savePrefs(){
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch(e){}
}
function applyTheme(){
  const t = THEMES[prefs.theme] || THEMES[0];
  document.body.classList.remove('theme-green', 'theme-amber', 'crt');
  t.classes.forEach(cls => document.body.classList.add(cls));
  const btn = document.getElementById('btn-theme');
  if(btn) btn.textContent = `tema: ${t.label}`;
}
function cycleTheme(){
  prefs.theme = (prefs.theme + 1) % THEMES.length;
  applyTheme();
  savePrefs();
  sfx('click');
}
function applySoundLabel(){
  const btn = document.getElementById('btn-sound');
  if(btn) btn.textContent = `som: ${prefs.sound ? 'on' : 'off'}`;
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

function accelCost(k){
  const owned = S.accelerators[k]||0;
  return Math.floor(ACCELS[k].base * Math.pow(1.75, owned));
}
function secretDpsMult(){
  let bonus = 0;
  S.secrets.forEach(id => {
    if(SECRETS[id] && SECRETS[id].dpsBonus) bonus += SECRETS[id].dpsBonus;
  });
  return 1 + bonus;
}
function baseDps(){
  let dps = 1;
  for(const k in ACCELS) dps += ACCELS[k].bonus * (S.accelerators[k]||0);
  return dps;
}
function recalc(){
  const dps = baseDps() * secretDpsMult();
  S.resources.dustPerSecond = Math.round(dps*100)/100;
  const w = WEAPONS[S.inventory.weapon];
  S.player.attack = 2 + (w ? w.atk : 0);
  const a = ARMORS[S.inventory.armor];
  if(a){
    S.player.maxHp = a.maxHp;
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
function npcSay(npcId, text, choices){
  uiEphemeral.npcSpeech[npcId] = text;
  uiEphemeral.npcChoices[npcId] = choices || null;
}
function once(key, msg, cls){
  if(S.flags[key]) return;
  S.flags[key] = true;
  notify(msg, cls||'');
}
function achievement(id, name, desc){
  if(S.achievements.includes(id)) return;
  S.achievements.push(id);
  showToast(`★ Conquista: ${name} — ${desc}`);
}
function unlockSecret(id){
  if(hasSecret(id) || !SECRETS[id]) return false;
  S.secrets.push(id);
  recalc();
  sfx('victory');
  showToast(`✦ Segredo descoberto: ${SECRETS[id].name} (${SECRETS[id].bonusText})`);
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

  sfx('click');
  npcSay(npcId, entry.text, entry.choices ? { id: entry.id || `${npcId}_${idx}`, list: entry.choices } : null);
  save();
  render();
}

function chooseDialogue(npcId, choiceIdx){
  const active = uiEphemeral.npcChoices[npcId];
  if(!active || !active.list || !active.list[choiceIdx]) return;
  const ch = active.list[choiceIdx];
  const flagKey = 'dlg_' + active.id;

  let rewardMsg = '';
  if(ch.rewardDust && !S.flags[flagKey]){
    S.flags[flagKey] = true;
    const gain = Math.min(ch.rewardDust, Math.max(0, S.resources.maxDust - S.resources.dust));
    S.resources.dust += gain;
    S.resources.totalEarned += gain;
    rewardMsg = ` (+${fmt(gain)} poeira)`;
    sfx('buy');
  } else {
    S.flags[flagKey] = true;
    sfx('click');
  }

  npcSay(npcId, ch.reply, null);
  if(rewardMsg) notify(`Recompensa de conversa${rewardMsg}`, 'amber');
  save();
  render();
}

function renderNpcTalkControls(npcId){
  const active = uiEphemeral.npcChoices[npcId];
  let h = `<div class="actions">`;
  if(active && active.list){
    active.list.forEach((ch, idx) => {
      h += `<button class="cmd" onclick="Game.chooseDialogue('${npcId}',${idx})">${esc(ch.label)}</button>`;
    });
  } else {
    h += `<button class="cmd subtle" onclick="Game.talkNpc('${npcId}')">Conversar</button>`;
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

function speechBubble(text, maxWidth, secretWord, secretFn){
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
  return `<pre class="speech-bubble">${html}</pre>`;
}

function fmt(n){
  if(n >= 1000000) return (n/1000000).toFixed(2)+'M';
  if(n >= 10000) return (n/1000).toFixed(1)+'k';
  if(Math.floor(n) !== n) return n.toFixed(1);
  return Math.floor(n).toString();
}

/* ---------- acoes ---------- */
function buyAccel(k){
  const c = accelCost(k);
  if(S.resources.dust < c){
    sfx('error');
    npcSay('moth', '"Poeira insuficiente. A pobreza também acumula, mas não paga a conta."');
    notify('Poeira insuficiente.');
    render();
    return;
  }
  S.resources.dust -= c;
  S.accelerators[k]++;
  sfx('buy');
  npcSay('moth', `"${ACCELS[k].name} instalado! (+${ACCELS[k].bonus} P/s). Seu quarto está objetivamente pior."`);
  notify(`${ACCELS[k].name} adquirido (+${ACCELS[k].bonus} P/s).`, 'amber');
  recalc(); save(); render();
}

function lubricate(){
  if(S.resources.dust < 100){
    sfx('error');
    npcSay('rat', '"Faltam poeiras para lubrificar. A porta range em julgamento."');
    notify('Faltam poeiras para abrir a porta (precisa de 100).');
    render();
    return;
  }
  S.resources.dust -= 100;
  S.unlocks.outOfRoom = true;
  S.unlocks.metMoth = true;
  S.ui.tab = 'hall';
  sfx('unlock');
  npcSay('moth', '"Olha só... mais uma pessoa! Deixa eu adivinhar: passa tempo demais no computador, né? Bem-vindo ao Castelo da Poeira Eterna."');
  showToast('Porta aberta — você chegou ao Hall Principal.');
  recalc(); save(); render();
}

function buyItem(id){
  const R = S.resources;
  const inv = S.inventory.items;
  const need = (cost, npcId)=>{
    if(R.dust < cost){
      sfx('error');
      if(npcId) npcSay(npcId, '"Poeira insuficiente. Prometo fingir que não te julguei."');
      notify('Poeira insuficiente.');
      render();
      return false;
    }
    R.dust -= cost;
    return true;
  };
  if(TOOLS[id]){
    if(hasTool(id)) return;
    const npcId = id==='pa_lixo' ? 'moth' : id==='luva_borracha' ? 'spider' : 'termite';
    if(!need(TOOLS[id].price, npcId)) return;
    S.inventory.tools.push(id);
    sfx('buy');
    npcSay(npcId, `"${TOOLS[id].name} adquirida! (${TOOLS[id].effect})."`);
    notify(`${TOOLS[id].name} equipada: ${TOOLS[id].effect}.`, 'amber');
    recalc(); save(); render();
    return;
  }
  switch(id){
    case 'mapa_castelo':
      if(inv.includes('mapa_castelo')) return;
      if(!need(150, 'moth')) return;
      inv.push('mapa_castelo'); S.unlocks.hasMap = true;
      sfx('unlock');
      npcSay('moth', '"Aqui está o Mapa do Castelo. Spoiler: está tudo sujo."');
      showToast('Aba [ Mapa ] desbloqueada!'); break;
    case 'lanterna':
      if(inv.includes('lanterna')) return;
      if(!need(300, 'moth')) return;
      inv.push('lanterna'); S.unlocks.hasLantern = true;
      sfx('unlock');
      npcSay('moth', '"Ela ilumina os lugares escuros... e revela coisas que você preferia não ver."');
      notify('Lanterna adquirida!', 'amber'); break;
    case 'pedra_peso':
      if(inv.includes('pedra_peso')) return;
      if(!need(500, 'moth')) return;
      inv.push('pedra_peso');
      sfx('buy');
      npcSay('moth', '"Sim, é só uma pedra. Tecnologia ancestral: gravidade."');
      notify('Pedra de Peso adquirida!', 'amber'); break;
    case 'vassoura_quebrada':
    case 'espanador_pena':
    case 'rodo_combate':
    case 'cabo_hdmi':
    case 'aspirador_entupido': {
      const w = WEAPONS[id];
      if(hasWeaponTier(id) || (w.req && !hasWeaponTier(w.req))) return;
      const npcId = S.ui.subview==='leste' ? 'termite' : 'moth';
      if(!need(w.price, npcId)) return;
      S.inventory.weapon = id;
      sfx('buy');
      npcSay(npcId, `"${w.name} equipada! ${w.passive !== 'Nenhuma' ? 'Passiva: ' + w.passive + '.' : 'O cabo range, mas resolve.'}"`);
      notify(`${w.name} equipada (+${w.atk} ATK).`, 'amber');
      for(const sid in SKILLS){
        if(SKILLS[sid].reqWeapon === id){
          showToast(`Nova habilidade desbloqueada: [${SKILLS[sid].key}] ${SKILLS[sid].name}!`);
        }
      }
      break;
    }
    case 'casaco_pano_mofado':
    case 'mascara_antipoeira':
    case 'capa_teia':
    case 'armadura_papelao': {
      const a = ARMORS[id];
      if(hasArmorTier(id) || (a.req && !hasArmorTier(a.req))) return;
      if(!need(a.price, 'spider')) return;
      S.inventory.armor = id;
      sfx('buy');
      npcSay('spider', `"${a.name} vestida! Caimento impecável de sótão."`);
      notify(`${a.name} equipada (HP máx ${a.maxHp}).`, 'amber'); break;
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
      npcSay('spider', `"${b.name} entregue! Agora sua poeira tem onde morar."`);
      notify(`${b.name} equipado!`, 'amber'); break;
    }
    default:
      return;
  }
  recalc(); save(); render();
}

function transmute(){
  if(S.resources.dust < 10000){
    sfx('error');
    npcSay('beetle', '"Isso aí mal dá pra umedecer uma asa. Traga 10.000 poeiras."');
    notify('Faltam poeiras para compactar (precisa de 10.000).');
    render();
    return;
  }
  S.resources.dust -= 10000;
  S.resources.magicDust += 1;
  sfx('unlock');
  npcSay('beetle', '"*CRONCH!* 10.000 poeiras viraram 1 Poeira Mágica. Alquimia ou digestão? Melhor não perguntar."');
  notify('+1 Poeira Mágica obtida!', 'amber');
  save(); render();
}

function craftFragment(){
  if(S.key.complete){ npcSay('beetle', '"A chave já está pronta. Ansiedade é poeira da alma."'); render(); return; }
  if(S.key.fragments >= 3){ npcSay('beetle', '"Você já tem os 3 fragmentos! Agora é hora de fundir."'); render(); return; }
  if(S.resources.magicDust < 2){ sfx('error'); npcSay('beetle', '"Faltam Poeiras Mágicas — preciso de 2 por fragmento."'); notify('Precisa de 2 Poeiras Mágicas.'); render(); return; }
  if(S.resources.dust < 5000){ sfx('error'); npcSay('beetle', '"Faltam 5.000 poeiras comuns para a liga."'); notify('Precisa de 5.000 poeiras.'); render(); return; }
  S.resources.magicDust -= 2;
  S.resources.dust -= 5000;
  S.key.fragments++;
  sfx('unlock');
  npcSay('beetle', S.key.fragments === 3
    ? '"Os 3 fragmentos zumbem juntos! Pode fundir a Grande Chave agora."'
    : `"Fragmento ${S.key.fragments}/3 forjado! Brilha feito arrependimento."`);
  notify(`Fragmento ${S.key.fragments}/3 da Grande Chave forjado!`, 'amber');
  save(); render();
}

function fuseKey(){
  if(S.key.fragments < 3){ sfx('error'); npcSay('beetle', '"Sem os 3 fragmentos, fundir é só derreter esperança."'); render(); return; }
  S.key.complete = true;
  if(!S.inventory.items.includes('grande_chave')) S.inventory.items.push('grande_chave');
  sfx('victory');
  npcSay('beetle', '"Pronto! A Grande Chave do Portão, compactada em Poeira Mágica. Pesa três desculpas."');
  achievement('chave', 'Chaveiro do Apocalipse Higiênico', 'Fundiu a Grande Chave do Portão');
  save(); render();
}

function openGate(){
  if(!S.key.complete){
    sfx('error');
    notify('O Portão nem range. Ele sabe que você não tem a chave.', 'red');
    return;
  }
  S.unlocks.victory = true;
  sfx('victory');
  achievement('fuga', 'Ar Puro (alegadamente)', 'Abriu o Portão Principal');
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
      notify('CLICK-CLACK-BZZZ! As luzes acendem e um baú cospe 1 Poeira Mágica e um recibo de 1987.', 'amber');
    } else {
      S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + 200);
      sfx('buy');
      notify('As luzes já estão acesas. O baú, com pena, cospe 200 poeiras de troco.');
    }
  } else {
    S.player.hp -= 2;
    S.resources.dust = Math.min(S.resources.dust + 10, S.resources.maxDust);
    S.puzzle.attempts++;
    sfx('error');
    notify('A lâmpada pisca, solta faíscas e joga poeira no seu olho! (+10 Poeiras, -2 HP).', 'red');
    if(S.player.hp <= 0) faint();
  }
  save(); render();
}

function searchCandy(){
  if(S.unlocks.candyLooted){ notify('A caixa continua vazia. Como seus planos de limpar o quarto.'); return; }
  S.unlocks.candyLooted = true;
  S.resources.magicDust += 1;
  sfx('unlock');
  achievement('dieta', 'Caixa de Doces Vazia', 'Revirou o nicho esquecido e achou 1 Poeira Mágica');
  notify('Você encontra 1 Poeira Mágica esquecida no fundo da caixa!', 'amber');
  save(); render();
}

function enterWind(){
  const has = S.inventory.items.includes('pedra_peso');
  if(!has){
    const lost = Math.floor(S.resources.dust);
    S.resources.dust = 0;
    sfx('error');
    achievement('vento', 'Perdeu Tudo no Vento', 'Entrou no Túnel do Vento sem a Pedra de Peso');
    notify(`VUUUSH! O ventilador sopra ${fmt(lost)} poeiras da sua mão direto pro infinito.`, 'red');
  } else {
    if(!S.unlocks.windLooted){
      S.unlocks.windLooted = true;
      S.resources.magicDust += 1;
      sfx('unlock');
      notify('Agarrado à Pedra de Peso, você atravessa o vendaval e acha 1 Poeira Mágica!', 'amber');
    } else {
      S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + 300);
      sfx('buy');
      notify('Travessia tranquila com sua pedra emocional. +300 poeiras.');
    }
  }
  save(); render();
}

function pullBook(n){
  if(S.unlocks.hasCompendium){
    notify('A estante já revelou seu segredo. O Compêndio está nas suas abas.');
    return;
  }
  if(n === 1){
    sfx('error');
    notify('Volume I ("Tratado da Limpeza Perfeita"): páginas totalmente em branco. Ninguém chegou a escrever.');
  } else if(n === 2){
    sfx('error');
    notify('Volume II ("Manual para Fazer Depois"): era uma caixa de papelão vazia com capa dura.');
  } else if(n === 3){
    S.unlocks.hasCompendium = true;
    if(!S.inventory.items.includes('compendio')) S.inventory.items.push('compendio');
    sfx('victory');
    achievement('bibliotecario', 'Leitor de Poeira', 'Encontrou o Compêndio na Estante Antiga');
    showToast('Aba [ Compêndio ] desbloqueada! Agora você pode registrar descobertas e segredos.');
    save(); render();
  }
}

/* ---------- interacoes secretas ---------- */
function pokeTitleCursor(){
  if(!S.intro.done) return;
  uiEphemeral.cursorClicks++;
  sfx('click');
  if(uiEphemeral.cursorClicks === 5 && !hasSecret('cursor_inquieto')){
    notify('O cursor treme... caiu um grão de poeira do teto.');
  }
  if(uiEphemeral.cursorClicks >= 10){
    unlockSecret('cursor_inquieto');
  }
}
function pokeRat(){
  sfx('click');
  if((S.accelerators.cat || 0) >= 3 && !hasSecret('caramelo')){
    npcSay('rat', '"Você trouxe tantos gatos que um vira-lata caramelo entrou pela janela e dominou o Hall. Ele parece feliz."');
    unlockSecret('caramelo');
    return;
  }
  npcSay('rat', '"Me cutucar não acelera o tempo. Mas respeito a curiosidade."');
  render();
}
function pokeSpiderWord(){
  if(unlockSecret('pano_vo')){
    npcSay('spider', '"Ah, você notou o fio dourado? Guarde esse Pano de Prato da Vó — aumenta qualquer saco."');
    render();
  }
}
function pokeTermite(){
  sfx('click');
  if(S.unlocks.hasLantern && !hasSecret('cafe_ontem')){
    npcSay('termite', '"Com essa luz dá pra achar a garrafa térmica! Toma um gole de café passado de ontem — você vai bater mais rápido."');
    unlockSecret('cafe_ontem');
    return;
  }
  npcSay('termite', '"Cuidado com as farpas. Madeira boa tem personalidade."');
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
function spawnGoldenMote(){
  if(uiEphemeral.moteEl || !S.intro.done || S.unlocks.victory) return;
  if(typeof document === 'undefined' || !document.body || !document.body.appendChild) return;
  const btn = document.createElement('button');
  btn.className = 'golden-mote';
  btn.textContent = '*';
  btn.title = 'Um grão brilhante...';
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
      notify(`Grão brilhante capturado! +${fmt(bonus)} poeira.`, 'amber');
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

function buyPotion(id){
  const p = POTIONS[id];
  if(!p) return;
  const npcId = id === 'cha_poeira' ? 'moth' : 'beetle';
  if(S.resources.dust < p.price){
    sfx('error');
    npcSay(npcId, '"Poeira insuficiente para essa poção."');
    notify('Poeira insuficiente.');
    render();
    return;
  }
  S.resources.dust -= p.price;
  S.inventory.potions[id] = (S.inventory.potions[id] || 0) + 1;
  sfx('buy');
  npcSay(npcId, `"${p.name} pronta! Agora você tem x${S.inventory.potions[id]}."`);
  notify(`${p.name} adquirida (x${S.inventory.potions[id]}).`, 'amber');
  save(); render();
}

function usePotion(id){
  const p = POTIONS[id];
  const qty = (S.inventory.potions && S.inventory.potions[id]) || 0;
  if(!p || qty <= 0){
    sfx('error');
    notify('Você não tem essa poção.');
    return;
  }
  if(!S.combat.active){
    notify('Guarde suas poções para quando estiver em combate!');
    return;
  }
  if(id === 'cha_poeira'){
    if(S.player.hp >= S.player.maxHp){ notify('Seu HP já está cheio!'); return; }
    S.inventory.potions[id]--;
    const heal = Math.round(S.player.maxHp * 0.50);
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
    S.combat.clog.unshift(`Você bebeu Chá de Poeira (+${heal} HP)!`);
    S.combat.clog = S.combat.clog.slice(0, 6);
    sfx('unlock');
    save(); render();
  } else if(id === 'tonico_cafeina'){
    S.inventory.potions[id]--;
    uiEphemeral.buffs.tonicSec = 15;
    S.combat.clog.unshift('Tônico de Cafeína Mofada! (+50% ATK por 15s)');
    S.combat.clog = S.combat.clog.slice(0, 6);
    sfx('unlock');
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
}

function selectZone(z){
  if(S.combat.active) return;
  if(z < 0 || z >= S.combat.unlockedZones || z >= COMBAT_ZONES.length) return;
  S.combat.zone = z;
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
    notify('Sem arma, sua estratégia é espirrar nos inimigos.');
    return;
  }
  if(S.combat.active) return;
  const zone = COMBAT_ZONES[S.combat.zone] || COMBAT_ZONES[0];
  resetCombatRuntime();
  S.combat.active = true;
  S.combat.idx = 0;
  S.combat.clog = [`@ entra em ${zone.short} empunhando ${WEAPONS[S.inventory.weapon].name}...`];
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
  notify('Você recuou para fora da fase. A próxima entrada começa do início.');
  save(); render();
}

function handleMonsterDefeated(){
  const c = S.combat;
  const zone = COMBAT_ZONES[c.zone] || COMBAT_ZONES[0];
  const loop = (c.zoneLoops && c.zoneLoops[c.zone]) || 1;
  const toolMult = hasTool('pa_lixo') ? 1.20 : 1.0;
  const rw = Math.round(c.monster.reward * (1 + (loop - 1) * 0.45) * toolMult);
  S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + rw);
  S.resources.totalEarned += rw;
  let extra = '';
  if(c.monster.magic){ S.resources.magicDust += c.monster.magic; extra = ` +${c.monster.magic} MÁGICA`; }
  else if(c.monster.magicChance && Math.random() < c.monster.magicChance){ S.resources.magicDust += 1; extra = ' +1 MÁGICA'; }
  c.clog.unshift(`${c.monster.name} virou poeira! +${rw} poeiras${extra}.`);
  c.kills++;
  S.discoveredMonsters[c.monster.id] = (S.discoveredMonsters[c.monster.id] || 0) + 1;

  if(c.monster.boss){
    if(c.monster.id === 'rei_mofo') achievement('mofo', 'Assassino de Mofo Real', 'Derrotou o REI MOFO');
    if(c.monster.id === 'baratao') achievement('baratao', 'Pânico da Cozinha', 'Derrotou o BARATÃO BLINDADO');
    if(c.monster.id === 'lorde_acaro') achievement('ancestral', 'Senhor da Alergia', 'Derrotou o LORDE ÁCARO ANCESTRAL');

    c.zoneLoops[c.zone] = loop + 1;
    if(c.zone + 1 >= c.unlockedZones && c.zone + 1 < COMBAT_ZONES.length){
      c.unlockedZones = c.zone + 2;
      showToast(`Nova fase desbloqueada: ${COMBAT_ZONES[c.zone + 1].name}!`);
    }
    c.clog.unshift(`${zone.short} concluída! Loop ${c.zoneLoops[c.zone]} liberado.`);
    c.idx = 0;
  } else {
    c.idx++;
  }
  spawnMonster();
  if(c.kills === 1) once('k1', 'Primeiro abate! A poeira agora tem medo de você.');
  if(c.kills === 10) achievement('exterminador', 'Exterminador de Sujeira', '10 abates nas expedições');
}

function useSkill(id){
  const c = S.combat;
  const sk = SKILLS[id];
  if(!sk || !hasSkillUnlocked(id) || !c.active || !c.monster) return;
  if((uiEphemeral.skillCd[id] || 0) > 0) return;

  uiEphemeral.skillCd[id] = sk.cd;
  if(id === 'sweep'){
    let dmg = Math.round(effectiveAtk() * 2.2);
    if(c.monster.insect && hasSecret('chinelo_havaiana')) dmg = Math.round(dmg * 1.15);
    c.mhp -= dmg;
    uiEphemeral.track.fx = '>>';
    let note = '';
    if(S.inventory.weapon === 'aspirador_entupido'){
      const heal = Math.max(1, Math.round(dmg * 0.10));
      S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
      note = ` (+${heal} HP)`;
    }
    c.clog.unshift(`[Varredura] @ acerta ${dmg}${note} em ${c.monster.name}!`);
    sfx('unlock');
    if(c.mhp <= 0) handleMonsterDefeated();
  } else if(id === 'cloud'){
    uiEphemeral.buffs.cloudTurns = 3;
    uiEphemeral.track.fx = '~~';
    c.clog.unshift(`[Nuvem de Poeira] ${c.monster.name} cego (-50% dano por 3 turnos)!`);
    sfx('click');
  } else if(id === 'sneeze'){
    let dmg = Math.round(effectiveAtk() * 1.2);
    if(c.monster.insect && hasSecret('chinelo_havaiana')) dmg = Math.round(dmg * 1.15);
    c.mhp -= dmg;
    uiEphemeral.track.mpos = Math.min(30, uiEphemeral.track.mpos + 8);
    uiEphemeral.buffs.stunTurns = 1;
    uiEphemeral.track.fx = '!!';
    c.clog.unshift(`[Espirro Sônico] @ empurra ${c.monster.name} (${dmg} dano + atordoado)!`);
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
    note = ' [CRÍTICO!]';
  }
  if(S.inventory.weapon === 'cabo_hdmi' && Math.random() < 0.25){
    dmg = Math.round(dmg * 1.5);
    note = ' [CHICOTE DUPLO!]';
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
  }

  c.clog.unshift(`@ bate ${dmg}${note} em ${c.monster.name} (${Math.max(0,c.mhp)}/${c.mmax})`);

  if(c.mhp <= 0){
    handleMonsterDefeated();
  } else {
    if(uiEphemeral.buffs.stunTurns > 0){
      uiEphemeral.buffs.stunTurns--;
      c.clog.unshift(`${c.monster.name} ainda está atordoado!`);
    } else {
      const stunned = S.inventory.weapon === 'rodo_combate' && Math.random() < 0.20;
      if(stunned){
        c.clog.unshift(`Empurrão do Rodo! ${c.monster.name} perdeu o equilíbrio.`);
      } else {
        let md = Math.max(1, c.monster.atk + Math.floor(Math.random()*3) - 1);
        if(hasTool('luva_borracha')) md = Math.max(1, Math.round(md * 0.85));
        if(uiEphemeral.buffs.cloudTurns > 0){
          md = Math.max(1, Math.round(md * 0.50));
          uiEphemeral.buffs.cloudTurns--;
        }
        S.player.hp -= md;
        c.clog.unshift(`${c.monster.name} revida ${md} em você.`);
        if(S.player.hp <= 0){ faint(); return; }
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
  notify(`Você desmaiou na poeira e perdeu ${fmt(lost)} poeiras (20%). A fase foi reiniciada.`, 'red');
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
    notify('Não dá para descansar no meio da luta! Recue ou enfrente até o fim.');
    return;
  }
  if(S.player.hp >= S.player.maxHp){ notify('HP cheio. Descansar mais seria hibernação.'); return; }
  S.player.hp = S.player.maxHp;
  sfx('unlock');
  notify('Você deitou no chão e chamou de "terapia de poeira". HP restaurado!', 'amber');
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
  const t = [];
  t.push({id:'quarto', label:'[ Quarto ]'});
  if(S.unlocks.outOfRoom) t.push({id:'hall', label:'[ Hall ]'});
  if(S.unlocks.outOfRoom) t.push({id:'inventario', label:'[ Inventário ]'});
  if(S.unlocks.hasMap) t.push({id:'mapa', label:'[ Mapa ]'});
  if(S.unlocks.outOfRoom) t.push({id:'aventura', label:'[ Aventura ]'});
  if(S.unlocks.hasCompendium) t.push({id:'compendio', label:'[ Compêndio ]'});
  return t;
}

function paintStats(){
  document.getElementById('stat-dust').textContent = fmt(Math.floor(S.resources.dust));
  document.getElementById('stat-max').textContent = S.intro.done ? `/${fmt(S.resources.maxDust)}` : '';
  document.getElementById('stat-magic').textContent = S.resources.magicDust;
  document.getElementById('stat-ps').textContent = S.resources.dustPerSecond.toFixed(2);
  document.getElementById('stat-hp').textContent = `${Math.max(0,Math.ceil(S.player.hp))}/${S.player.maxHp}`;
  document.getElementById('hp-fill').style.width = Math.max(0, (S.player.hp/S.player.maxHp*100)) + '%';
  document.getElementById('stat-atk').textContent = S.player.attack;

  const show = (id, v)=>{ const el = document.getElementById(id); if(el) el.style.display = v ? '' : 'none'; };
  const step = S.intro.done ? 3 : (S.intro.cleans || 0);
  show('s-magic', S.resources.magicDust > 0 || S.unlocks.candyLooted || S.unlocks.puzzleSolved || S.unlocks.windLooted);
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
    if(S.ui.tab === tb.id) b.className = 'active';
    b.onclick = ()=>{ sfx('click'); go(tb.id); };
    nav.appendChild(b);
  });

  const c = document.getElementById('content');
  if(S.unlocks.victory) { c.innerHTML = viewVictory(); return; }
  if(S.ui.tab==='quarto') c.innerHTML = viewQuarto();
  else if(S.ui.tab==='hall') c.innerHTML = S.ui.subview ? viewSub(S.ui.subview) : viewHall();
  else if(S.ui.tab==='inventario') c.innerHTML = viewInventario();
  else if(S.ui.tab==='mapa') c.innerHTML = S.ui.subview ? viewSub(S.ui.subview) : viewMapa();
  else if(S.ui.tab==='aventura') c.innerHTML = viewAventura();
  else if(S.ui.tab==='compendio') c.innerHTML = viewCompendio();
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
      btn.disabled = cd > 0;
      btn.textContent = cd > 0 ? `[${sk.key}] ${sk.name} (${Math.ceil(cd)}s)` : `[${sk.key}] ${sk.name}`;
    });
  }
}

function renderIntro(){
  document.getElementById('tabs').innerHTML = '';
  const c = document.getElementById('content');
  const d = Math.floor(S.resources.dust);
  const n = S.intro.cleans;
  uiEphemeral.lastIntroReady = d >= 20;

  const T = {
    0: [
      'Você acorda no escuro, sem cama e sem lar,',
      'num quarto esquecido que ninguém quis limpar.',
      'Só cai poeira do teto, num lento bailar:',
      'um grão por segundo... e você põe-se a contar.'
    ],
    1: [
      'Você bate na roupa e sacode a poeira,',
      'mas ela retorna de forma certeira.',
      'Grão sobre grão, num compasso profundo —',
      'agora você vê o seu ritmo no mundo.'
    ],
    2: [
      'Mais uma faxina, e o ciclo insiste:',
      'quanto mais você limpa, mais sujeira existe.',
      'Seu pulso desperta, o corpo responde —',
      'há vida na tela... mas o perigo se esconde.'
    ]
  };
  const BT = {
    0: 'Limpar a poeira da roupa',
    1: 'Jogar a poeira no chão',
    2: 'Sacudir os ombros uma última vez'
  };
  if(n >= 3){ S.intro.done = true; render(); return; }
  let h = `<div class="stage intro-text"><pre>${esc(T[n].join('\n'))}</pre>`;
  h += d >= 20
    ? `<div class="actions"><button class="cmd" onclick="Game.cleanBody()">${BT[n]}</button></div>`
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
  if(S.intro.cleans === 1) showToast('Contador de ritmo (P/s) desbloqueado.');
  if(S.intro.cleans === 2) showToast('Barra de vida (HP) desbloqueada.');
  if(S.intro.cleans >= 3){
    S.intro.done = true;
    document.body.classList.remove('intro');
    showToast('O quarto se revela — interface básica desbloqueada.');
  }
  save(); render();
}

function viewQuarto(){
  const seenRat = S.intro.done && (S.resources.dust >= 20 || S.flags.rat);
  uiEphemeral.lastRatVisible = seenRat;
  let h = `<div class="stage"><div class="scene-title">— O Quarto Inicial —</div>`;
  if(!seenRat){
    h += `<div class="scene-text">A barra no alto pisca números sozinha.<br>O quarto continua escuro, mas agora você sabe:<br><br><b>. . . P O E I R A . . .</b><br><br>Ela cai. Você conta. É assim que funciona aqui.</div>`;
    h += `<div class="muted">o silêncio pesa na penumbra...</div>`;
  } else {
    if(!S.flags.rat){
      S.flags.rat = true;
      showToast('Um Rato Filósofo surgiu da penumbra!');
    }
    const speech = uiEphemeral.npcSpeech.rat ||
      '"O tempo passa, a poeira acumula.\nVocê está estático... mas a sujeira jamais para."';
    h += speechBubble(speech, 42);
    h += `<pre class="ascii-art npc-idle" style="cursor:pointer" onclick="Game.pokeRat()">${esc(ART.rat)}</pre>`;
    h += `<div class="muted">Rato Filósofo — provavelmente formado em algo inútil</div>`;
    h += renderNpcTalkControls('rat');
    h += `<div class="box">`;
    if(!S.unlocks.outOfRoom){
      h += `<div class="scene-text">A porta range. As dobradiças pedem <b>100 Poeiras</b> de lubrificante.</div>
      <div class="actions">
        <button class="cmd" data-cost="100" onclick="Game.lubricate()" ${S.resources.dust<100?'disabled':''}>Lubrificar dobradiças (100 poeira)</button>
      </div>
      <div class="muted">você tem <span id="dyn-dust">${fmt(Math.floor(S.resources.dust))}</span> poeira</div>`;
    } else {
      h += `<div class="muted">A porta está aberta. Lá fora: responsabilidade e um castelo.</div>
      <div class="actions">
        <button class="cmd" onclick="Game.go('hall')">Ir ao Hall Principal -&gt;</button>
        <button class="cmd" onclick="Game.rest()" ${S.combat.active?'disabled':''}>Deitar no chão (curar HP)</button>
      </div>
      <div class="muted">HP: <span id="dyn-hp">${Math.ceil(S.player.hp)}/${S.player.maxHp}</span></div>`;
    }
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

function viewHall(){
  const speech = uiEphemeral.npcSpeech.moth ||
    '"Nham... poeira de excelente qualidade! Tudo no mundo real que fica parado acaba caindo aqui dentro do Castelo da Poeira Eterna."';
  let h = `<div class="stage"><div class="scene-title">— Hall Principal — A Traça Gigante —</div>`;
  h += speechBubble(speech, 46);
  h += `<pre class="ascii-art npc-idle">${esc(ART.moth)}</pre>`;
  h += renderNpcTalkControls('moth');

  h += `<div class="box"><span class="box-title">— LOJA DA TRAÇA —</span>`;
  const has = (x)=> S.inventory.items.includes(x) || (x in WEAPONS && hasWeaponTier(x)) || hasTool(x);
  const item = (id, name, price, desc)=>{
    const owned = has(id);
    return `<div class="shop-item"><b>${name}</b> ${owned?'<span class="muted">[adquirido]</span>':`— <b>${price} poeira</b>`}<br><span class="muted">${desc}</span><br>
    ${owned?'':`<button class="cmd" data-cost="${price}" onclick="Game.buyItem('${id}')" ${S.resources.dust<price?'disabled':''}>Comprar</button>`}</div>`;
  };
  h += item('mapa_castelo','Mapa do Castelo',150,'Desbloqueia a aba [ Mapa ] e revela as asas do castelo.');
  h += item('vassoura_quebrada','Vassoura Quebrada',100,'+2 ATK. Melhor do que enfrentar poeira de mãos vazias.');
  h += item('lanterna','Lanterna',300,'Ilumina lugares escuros demais para entrar no breu.');
  h += item('pedra_peso','Pedra de Peso',500,'Pesada o bastante para encarar correntes de ar.');
  h += item('pa_lixo', TOOLS.pa_lixo.name, TOOLS.pa_lixo.price, `${TOOLS.pa_lixo.effect}. ${TOOLS.pa_lixo.desc}`);
  const cha = POTIONS.cha_poeira;
  const chaQty = (S.inventory.potions && S.inventory.potions.cha_poeira) || 0;
  h += `<div class="shop-item"><b>${cha.name}</b> <span class="muted">(você tem x${chaQty})</span> — <b>${cha.price} poeira</b><br><span class="muted">${cha.effect}. ${cha.desc}</span><br><button class="cmd" data-cost="${cha.price}" onclick="Game.buyPotion('cha_poeira')" ${S.resources.dust<cha.price?'disabled':''}>Comprar</button></div>`;
  h += `</div>`;

  h += `<div class="box"><span class="box-title">— MELHORIAS DO CASTELO —</span><div class="muted">compre sujeira para atrair mais sujeira. Economia circular.</div>`;
  for(const k in ACCELS){
    const a = ACCELS[k], owned = S.accelerators[k]||0, cost = accelCost(k);
    h += `<div class="shop-item"><b>${a.name}</b> x${owned}<br><span class="muted">${a.desc} (+${a.bonus} P/s cada)</span><br>
    <button class="cmd" data-cost="${cost}" onclick="Game.buyAccel('${k}')" ${S.resources.dust<cost?'disabled':''}>Comprar (${fmt(cost)} poeira)</button></div>`;
  }
  h += `</div>`;

  h += `<div class="actions">`;
  if(S.unlocks.hasMap) h += `<button class="cmd" onclick="Game.go('mapa')">Abrir Mapa do Castelo -&gt;</button>`;
  h += `<button class="cmd" onclick="Game.go('aventura')">Corredores de Batalha -&gt;</button></div></div>`;
  return h;
}

function viewInventario(){
  const w = WEAPONS[S.inventory.weapon];
  const a = ARMORS[S.inventory.armor];
  const b = BAGS[S.inventory.bag];
  const secBonusPct = Math.round((secretDpsMult() - 1) * 100);
  const totalAch = Object.keys(ACHIEVEMENT_INFO).length;

  let h = `<div class="stage"><div class="scene-title">— Inventário —</div><div class="inv-grid">`;

  h += `<div class="inv-card"><div class="inv-card-title">Equipamento</div>
    <div class="inv-row"><span>Arma</span><b>${w?w.name:'(desarmado)'}</b></div>
    <div class="muted" style="font-size:12px;margin-bottom:6px">${w ? `+${w.atk} ATK · ${w.passive}` : '+0 ATK'}</div>
    <div class="inv-row"><span>Armadura</span><b>${a?a.name:'—'}</b></div>
    <div class="muted" style="font-size:12px;margin-bottom:6px">HP máx ${a?a.maxHp:'?'}</div>
    <div class="inv-row"><span>Recipiente</span><b>${b?b.name:'—'}</b></div>
    <div class="muted" style="font-size:12px">Cap. efetiva: ${fmt(S.resources.maxDust)}</div>
  </div>`;

  h += `<div class="inv-card"><div class="inv-card-title">Produção & Chave</div>
    <div class="inv-row"><span>Base</span><b>${baseDps().toFixed(2)} P/s</b></div>
    <div class="inv-row"><span>Bônus de Segredos</span><b>+${secBonusPct}%</b></div>
    <div class="inv-row"><span>Total Atual</span><b class="amber">${S.resources.dustPerSecond.toFixed(2)} P/s</b></div>
    <div class="inv-row"><span>Poeira Mágica</span><b>${S.resources.magicDust}</b></div>
    <div class="inv-row"><span>Grande Chave</span><b>${S.key.complete ? 'PRONTA' : `${S.key.fragments}/3`}</b></div>
  </div>`;

  h += `<div class="inv-card"><div class="inv-card-title">Ferramentas (${S.inventory.tools.length}/${Object.keys(TOOLS).length})</div>`;
  if(!S.inventory.tools.length){
    h += `<div class="muted">Nenhuma ferramenta equipada ainda.</div>`;
  } else {
    h += S.inventory.tools.map(id => {
      const t = TOOLS[id];
      return t ? `<div style="margin:4px 0"><b>${t.name}</b><br><span class="muted">${t.effect}</span></div>` : '';
    }).join('');
  }
  h += `</div>`;

  h += `<div class="inv-card"><div class="inv-card-title">Itens & Poções</div>`;
  if(!S.inventory.items.length){
    h += `<div class="muted">Nenhum item-chave ainda.</div>`;
  } else {
    h += S.inventory.items.map(i => `<span class="inv-tag">${esc(ITEM_LABELS[i]||i)}</span>`).join('');
  }
  const chaQ = (S.inventory.potions && S.inventory.potions.cha_poeira) || 0;
  const tonQ = (S.inventory.potions && S.inventory.potions.tonico_cafeina) || 0;
  if(chaQ > 0 || tonQ > 0){
    h += `<div style="margin-top:8px;border-top:1px dotted var(--line);padding-top:6px">`;
    if(chaQ > 0) h += `<span class="inv-tag">Chá de Poeira x${chaQ}</span>`;
    if(tonQ > 0) h += `<span class="inv-tag">Tônico Cafeína x${tonQ}</span>`;
    h += `</div>`;
  }
  h += `</div></div>`;

  h += `<div class="box"><span class="box-title">— CONQUISTAS (${S.achievements.length}/${totalAch}) —</span>`;
  if(S.achievements.length){
    h += S.achievements.map(id=>{
      const info = ACHIEVEMENT_INFO[id];
      return info
        ? `<div style="margin:4px 0">★ <b>${esc(info.name)}</b> <span class="muted">— ${esc(info.desc)}</span></div>`
        : `<div>★ ${esc(id)}</div>`;
    }).join('');
  } else {
    h += `<span class="muted">Nenhuma ainda.</span>`;
  }
  h += `</div></div>`;
  return h;
}

function mapBtn(label, sub, hint, locked){
  const safeHint = esc(hint).replace(/'/g, '&#39;');
  if(locked){
    return `<button class="map-node" disabled onmouseenter="Game.setMapHint('${safeHint}')" title="${safeHint}">${label}</button>`;
  }
  return `<button class="map-node" onclick="Game.go('mapa','${sub}')" onmouseenter="Game.setMapHint('${safeHint}')" onfocus="Game.setMapHint('${safeHint}')">${label}</button>`;
}

function viewMapa(){
  const bHall    = mapBtn('[Hall]',       'hall',    'Hall Principal — Traça Gigante');
  const bOeste   = mapBtn('[Oeste]',      'oeste',   'Asa Oeste — Aranha Alfaiate');
  const bLeste   = mapBtn('[Leste]',      'leste',   'Asa Leste — Cupim Marceneiro');
  const bGaleria = mapBtn('[Galeria]',    'galeria', 'Galeria dos Esquecidos — portas e câmaras ocultas');
  const bAvent   = `<button class="map-node" onclick="Game.go('aventura')" onmouseenter="Game.setMapHint('Corredores — expedições de combate')" onfocus="Game.setMapHint('Corredores — expedições de combate')">[Corredores]</button>`;
  const bQuarto  = `<button class="map-node" onclick="Game.go('quarto')" onmouseenter="Game.setMapHint('O Quarto Inicial — Rato Filósofo')" onfocus="Game.setMapHint('O Quarto Inicial — Rato Filósofo')">[Quarto]</button>`;
  const bPortao  = mapBtn('[Portão]',     'portao',  S.key.complete ? 'O Portão Principal — você tem a Grande Chave!' : 'O Portão Principal — trancado');
  const bPorao   = mapBtn(S.unlocks.hasLantern ? '[Porão]' : '[Porão?]', 'porao',
    S.unlocks.hasLantern ? 'Porão Obscuro — Besouro Rola-Poeira' : 'Porão Obscuro — escuro demais para enxergar',
    !S.unlocks.hasLantern);

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
    `                (    ${bPorao}   )`,
    `                 ' ~ . .. . ~ '`
  ].join('\n');

  let h = `<div class="stage"><div class="scene-title">— Castelo da Poeira Eterna —</div>`;
  h += `<pre class="map-ascii">${castle}</pre>`;
  h += `<div id="map-hint" class="map-hint">passe o mouse sobre o castelo para explorar</div>`;
  h += `</div>`;
  return h;
}

function viewGaleria(){
  const bPuz    = mapBtn('[Câmara Escura]',   'puzzles', 'Uma sala no breu com três alavancas quebradas');
  const bCandy  = mapBtn('[Nicho Esquecido]', 'candy',   'Uma pequena caixa abandonada na parede');
  const bVento  = mapBtn('[Túnel do Vento]',  'vento',   'Um corredor barulhento com vento forte');
  const bEstante= mapBtn('[Estante Antiga]',  'estante', 'Três volumes empoeirados numa prateleira rangente');

  const submap = [
    `           _______________________________`,
    `         .'    GALERIA DOS ESQUECIDOS     '.`,
    `        /                                   \\`,
    `       |   ${bPuz}     ${bCandy}  |`,
    `       |         \\                   /       |`,
    `       |          \\_______   _______/        |`,
    `       |                  | |                |`,
    `       |          .-------' '-------.        |`,
    `       |         /                   \\       |`,
    `       |   ${bVento}      ${bEstante}   |`,
    `        \\___________________________________/`
  ].join('\n');

  let h = `<div class="stage"><div class="actions"><button class="cmd subtle" onclick="Game.go('mapa')">&lt;- Voltar ao Castelo</button></div>`;
  h += `<div class="scene-title">— Galeria dos Esquecidos —</div>`;
  h += `<pre class="map-ascii">${submap}</pre>`;
  h += `<div id="map-hint" class="map-hint">escolha uma porta da galeria</div></div>`;
  return h;
}

function viewSub(sub){
  if(sub==='galeria') return viewGaleria();
  const backTarget = ['puzzles','candy','vento','estante'].includes(sub) ? "Game.go('mapa','galeria')" : "Game.go('mapa')";
  const backLabel  = ['puzzles','candy','vento','estante'].includes(sub) ? '&lt;- Voltar à Galeria' : '&lt;- Voltar ao Castelo';
  let h = `<div class="stage"><div class="actions"><button class="cmd subtle" onclick="${backTarget}">${backLabel}</button></div>`;
  if(sub==='hall') return h + `</div>` + viewHall();

  if(sub==='leste'){
    const speech = uiEphemeral.npcSpeech.termite ||
      '"Trago restos de móveis velhos e uno com poeira. Sustentável, artesanal e rangente."';
    h += `<div class="scene-title">— Asa Leste — O Cupim Marceneiro —</div>`;
    h += speechBubble(speech, 44);
    h += `<pre class="ascii-art npc-idle" style="cursor:pointer" onclick="Game.pokeTermite()">${esc(ART.termite)}</pre>`;
    h += renderNpcTalkControls('termite');
    h += `<div class="box"><span class="box-title">— FORJA —</span>`;
    const wrow = (id)=>{
      const w = WEAPONS[id];
      const equipped = S.inventory.weapon===id;
      const owned = hasWeaponTier(id);
      const okReq = !w.req || hasWeaponTier(w.req);
      const badge = equipped ? '<span class="muted">[equipado]</span>' : owned ? '<span class="muted">[adquirido]</span>' : `— <b>${fmt(w.price)} poeira</b>`;
      return `<div class="shop-item"><b>${w.name}</b> ${badge}<br><span class="muted">${w.desc}${w.passive!=='Nenhuma' ? ' · ' + w.passive : ''}</span><br>${(!owned)?`<button class="cmd" data-cost="${w.price}" data-req-ok="${okReq?1:0}" onclick="Game.buyItem('${id}')" ${(S.resources.dust<w.price||!okReq)?'disabled':''}>Forjar</button>${!okReq?`<div class="muted">requer ${WEAPONS[w.req].name}</div>`:''}`:''}</div>`;
    };
    ['vassoura_quebrada','espanador_pena','rodo_combate','cabo_hdmi','aspirador_entupido'].forEach(id => { h += wrow(id); });
    const fl = TOOLS.flanela_microfibra;
    const hasFl = hasTool('flanela_microfibra');
    h += `<div class="shop-item"><b>${fl.name}</b> ${hasFl?'<span class="muted">[adquirido]</span>':`— <b>${fmt(fl.price)} poeira</b>`}<br><span class="muted">${fl.effect}. ${fl.desc}</span><br>${!hasFl?`<button class="cmd" data-cost="${fl.price}" onclick="Game.buyItem('flanela_microfibra')" ${S.resources.dust<fl.price?'disabled':''}>Adquirir</button>`:''}</div>`;
    h += `</div><div class="actions"><button class="cmd" onclick="Game.go('aventura')">Ir aos Corredores -&gt;</button></div></div>`;
    return h;
  }

  if(sub==='oeste'){
    const speech = uiEphemeral.npcSpeech.spider ||
      '"Teço vestimentas com teia e poeira compactada. Coleção Outono/Inverno 1987."';
    h += `<div class="scene-title">— Asa Oeste — A Aranha Alfaiate —</div>`;
    h += speechBubble(speech, 44, hasSecret('pano_vo') ? null : 'teia', 'Game.pokeSpiderWord()');
    h += `<pre class="ascii-art npc-idle">${esc(ART.spider)}</pre>`;
    h += renderNpcTalkControls('spider');
    h += `<div class="box"><span class="box-title">— ATELIÊ —</span>`;
    const arow = (id, kind)=>{
      const table = kind==='armor' ? ARMORS : BAGS;
      const item = table[id];
      const equipped = kind==='armor' ? (S.inventory.armor===id) : (S.inventory.bag===id);
      const owned = kind==='armor' ? hasArmorTier(id) : hasBagTier(id);
      const reqOk = !item.req || (kind==='armor' ? hasArmorTier(item.req) : hasBagTier(item.req));
      const reqName = item.req ? table[item.req].name : '';
      const badge = equipped ? '<span class="muted">[equipado]</span>' : owned ? '<span class="muted">[adquirido]</span>' : `— <b>${fmt(item.price)} poeira</b>`;
      return `<div class="shop-item"><b>${item.name}</b> ${badge}<br><span class="muted">${item.desc}</span><br>${!owned?`<button class="cmd" data-cost="${item.price}" data-req-ok="${reqOk?1:0}" onclick="Game.buyItem('${id}')" ${(S.resources.dust<item.price||!reqOk)?'disabled':''}>Adquirir</button>${!reqOk?`<div class="muted">requer ${reqName}</div>`:''}`:''}</div>`;
    };
    ['saco_teia','saco_compactado','mala_sotao','bau_sem_fundo'].forEach(id => { h += arow(id,'bag'); });
    ['casaco_pano_mofado','mascara_antipoeira','capa_teia','armadura_papelao'].forEach(id => { h += arow(id,'armor'); });
    const lv = TOOLS.luva_borracha;
    const hasLv = hasTool('luva_borracha');
    h += `<div class="shop-item"><b>${lv.name}</b> ${hasLv?'<span class="muted">[adquirido]</span>':`— <b>${fmt(lv.price)} poeira</b>`}<br><span class="muted">${lv.effect}. ${lv.desc}</span><br>${!hasLv?`<button class="cmd" data-cost="${lv.price}" onclick="Game.buyItem('luva_borracha')" ${S.resources.dust<lv.price?'disabled':''}>Adquirir</button>`:''}</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='porao'){
    if(!S.unlocks.hasLantern){
      return h + `<div class="box"><span class="red">Escuro demais. Volte com alguma fonte de luz.</span></div></div>`;
    }
    const speech = uiEphemeral.npcSpeech.beetle ||
      '"Compacto volumes astronômicos em brilho. Dieta balanceada: 99% poeira."';
    h += `<div class="scene-title">— Porão Obscuro — O Besouro Rola-Poeira —</div>`;
    h += speechBubble(speech, 44);
    h += `<pre class="ascii-art npc-idle">${esc(ART.beetle)}</pre>`;
    h += renderNpcTalkControls('beetle');
    h += `<div class="box"><span class="box-title">— TRANSMUTAÇÃO —</span><div class="muted">10.000 Poeiras -&gt; 1 Poeira Mágica</div>
    <div class="actions"><button class="cmd" data-cost="10000" onclick="Game.transmute()" ${S.resources.dust<10000?'disabled':''}>Compactar (10.000 poeira -&gt; 1 mágica)</button></div></div>`;
    const ton = POTIONS.tonico_cafeina;
    const tonQty = (S.inventory.potions && S.inventory.potions.tonico_cafeina) || 0;
    h += `<div class="box"><span class="box-title">— POÇÕES DE POEIRA —</span><div class="shop-item"><b>${ton.name}</b> <span class="muted">(você tem x${tonQty})</span> — <b>${fmt(ton.price)} poeira</b><br><span class="muted">${ton.effect}. ${ton.desc}</span><br><button class="cmd" data-cost="${ton.price}" onclick="Game.buyPotion('tonico_cafeina')" ${S.resources.dust<ton.price?'disabled':''}>Preparar</button></div></div>`;
    h += `<div class="box"><span class="box-title">— GRANDE CHAVE DO PORTÃO —</span><div class="muted">Cada fragmento: 2 Mágicas + 5.000 poeiras — Precisa de 3.<br>Fragmentos atuais: <b>${S.key.fragments}/3</b></div>
    <div class="actions">
      <button class="cmd" data-cost="5000" data-magic-cost="2" data-req-ok="${S.key.fragments<3?1:0}" onclick="Game.craftFragment()" ${(S.resources.magicDust<2||S.resources.dust<5000||S.key.fragments>=3)?'disabled':''}>Forjar fragmento</button>
      <button class="cmd" data-cost="0" data-req-ok="${(S.key.fragments>=3 && !S.key.complete)?1:0}" onclick="Game.fuseKey()" ${(S.key.fragments<3||S.key.complete)?'disabled':''}>Fundir a Grande Chave</button>
    </div></div></div>`;
    return h;
  }

  if(sub==='puzzles'){
    ensurePuzzle();
    h += `<div class="scene-title">— Câmara Escura —</div>`;
    h += `<div class="box"><span class="box-title">— ALAVANCAS QUEBRADAS —</span><div class="muted">Três alavancas enferrujadas na parede ( | / \\ ).</div><br><div class="row">`;
    S.puzzle.current.forEach((v,i)=>{
      h += `<div>Alavanca ${i+1}<br><b class="amber" style="font-size:22px">${LEVERS[v]}</b><br><button class="cmd" onclick="Game.cycleLever(${i})">puxar</button></div>`;
    });
    h += `</div><div class="actions"><button class="cmd" onclick="Game.testLevers()">Testar combinação</button></div>`;
    h += `<div class="muted">tentativas: ${S.puzzle.attempts}</div>`;
    if(S.unlocks.puzzleSolved) h += `<div class="amber" style="margin-top:8px">As luzes estão acesas.</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='candy'){
    h += `<div class="scene-title">— Nicho Esquecido —</div>`;
    h += `<pre class="ascii-art">${esc(ART.candy)}</pre>`;
    h += `<div class="scene-text">"Uma caixa de doces? Que coisa inútil... Faz sentido estar coberta de poeira."</div>`;
    h += `<div class="actions"><button class="cmd" onclick="Game.searchCandy()" ${S.unlocks.candyLooted?'disabled':''}>${S.unlocks.candyLooted?'Caixa já revirada':'Mexer no fundo da caixa'}</button></div></div>`;
    return h;
  }

  if(sub==='vento'){
    h += `<div class="scene-title">— Túnel do Vento —</div>`;
    h += `<div class="box"><div class="scene-text">Um ventilador industrial esquecido no máximo no fundo do corredor. O vento arrasta tudo que é leve.</div>
    <div class="actions"><button class="cmd danger" onclick="Game.enterWind()">Entrar no corredor</button></div></div></div>`;
    return h;
  }

  if(sub==='estante'){
    h += `<div class="scene-title">— Estante Antiga —</div>`;
    h += `<pre class="ascii-art">${esc(ART.shelf)}</pre>`;
    h += `<div class="box"><div class="scene-text">Três livros sobrevivem sob uma crosta grossa de poeira. Um deles parece fora do lugar.</div>
    <div class="actions">
      <button class="cmd" onclick="Game.pullBook(1)">[I] Tratado da Limpeza Perfeita</button>
      <button class="cmd" onclick="Game.pullBook(2)">[II] Manual para Fazer Depois</button>
      <button class="cmd" onclick="Game.pullBook(3)">[III] Inventário do Que Ficou Parado</button>
    </div>`;
    if(S.unlocks.hasCompendium) h += `<div class="amber" style="margin-top:8px">O Compêndio da Poeira já está com você.</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='portao'){
    h += `<div class="scene-title">— O Portão Principal —</div>`;
    h += `<pre class="ascii-art">${esc(ART.gate)}</pre>`;
    h += `<div class="box"><div class="muted">Atrás dele: ar puro. Na frente dele: você, questionando suas escolhas.</div><br>`;
    if(S.key.complete){
      h += `<div class="actions"><button class="cmd" onclick="Game.openGate()">Abrir o Portão com a Grande Chave</button></div>`;
    } else {
      h += `<div class="red">Trancado. Requer a Grande Chave do Portão.</div><div class="muted">Fragmentos: ${S.key.fragments}/3</div>`;
    }
    h += `</div></div>`;
    return h;
  }

  return h + `<div class="muted">Sala desconhecida. Até o mapa espirrou.</div></div>`;
}

function viewAventura(){
  const c = S.combat;
  const zone = COMBAT_ZONES[c.zone] || COMBAT_ZONES[0];
  const loop = (c.zoneLoops && c.zoneLoops[c.zone]) || 1;
  const w = WEAPONS[S.inventory.weapon];

  let h = `<div class="stage"><div class="scene-title">— ${esc(zone.name)} —</div>`;
  h += `<div class="zone-tabs">`;
  COMBAT_ZONES.forEach((z, idx) => {
    const unlocked = idx < c.unlockedZones;
    const activeCls = idx === c.zone ? ' active' : '';
    h += `<button class="zone-btn${activeCls}" onclick="Game.selectZone(${idx})" ${(c.active || !unlocked) ? 'disabled' : ''}>${unlocked ? esc(z.short) : `Fase ${idx+1} [trancada]`}</button>`;
  });
  h += `</div>`;

  h += `<div class="muted">Arma: <b>${w?w.name:'(desarmado)'}</b> (ATK ${S.player.attack}) — Abates: ${c.kills} — Loop ${loop}</div>`;
  h += `<div class="actions">`;
  if(!c.active){
    h += `<button class="cmd" onclick="Game.startExpedition()">Iniciar Expedição -&gt;</button>`;
    h += `<button class="cmd" onclick="Game.rest()">Curar (descansar)</button>`;
  } else {
    h += `<button class="cmd danger" onclick="Game.retreatExpedition()">Recuar (reinicia a fase)</button>`;
  }
  h += `</div>`;

  if(c.active && c.monster){
    const mmax = c.mmax || c.monster.hp || 1;
    const pct = Math.max(0, Math.min(100, c.mhp/mmax*100));
    const steps = Math.floor(pct/10);
    const buffs = [];
    if(uiEphemeral.buffs.tonicSec > 0) buffs.push(`Tônico +50% ATK (${Math.ceil(uiEphemeral.buffs.tonicSec)}s)`);
    if(uiEphemeral.buffs.cloudTurns > 0) buffs.push(`Inimigo cego (${uiEphemeral.buffs.cloudTurns}t)`);
    if(uiEphemeral.buffs.stunTurns > 0) buffs.push(`Atordoado`);

    h += `<div class="box">`;
    h += `<div class="muted" style="margin-bottom:4px">Encontro ${c.idx + 1}/${zone.monsters.length}</div>`;
    h += `<pre class="ascii-art monster-art" onclick="Game.pokeMonster()">${esc(c.monster.art||'')}</pre>`;
    h += `<div><b>${esc(c.monster.name)}</b> ${c.monster.boss?'<b class="red">[CHEFE]</b>':''} — HP ${Math.max(0,Math.ceil(c.mhp))}/${mmax} [${'#'.repeat(steps)}${'.'.repeat(10-steps)}]</div>`;
    h += `<pre class="corridor-track">${esc(renderCorridorTrack())}</pre>`;
    h += `<div class="buff-bar">${buffs.join(' · ')}</div>`;

    h += `<div class="skill-bar">`;
    for(const sid in SKILLS){
      if(!hasSkillUnlocked(sid)) continue;
      const sk = SKILLS[sid];
      const cd = uiEphemeral.skillCd[sid] || 0;
      const lbl = cd > 0 ? `[${sk.key}] ${sk.name} (${Math.ceil(cd)}s)` : `[${sk.key}] ${sk.name}`;
      h += `<button class="skill-btn" data-skill="${sid}" title="${esc(sk.desc)}" onclick="Game.useSkill('${sid}')" ${cd>0?'disabled':''}>${esc(lbl)}</button>`;
    }
    const chaQty = (S.inventory.potions && S.inventory.potions.cha_poeira) || 0;
    const tonQty = (S.inventory.potions && S.inventory.potions.tonico_cafeina) || 0;
    if(chaQty > 0) h += `<button class="skill-btn" onclick="Game.usePotion('cha_poeira')" title="${esc(POTIONS.cha_poeira.effect)}">[R] Chá x${chaQty}</button>`;
    if(tonQty > 0) h += `<button class="skill-btn" onclick="Game.usePotion('tonico_cafeina')" title="${esc(POTIONS.tonico_cafeina.effect)}">[T] Tônico x${tonQty}</button>`;
    h += `</div>`;

    h += `<div class="combat-log">${c.clog.map(l=>`<div>${esc(l)}</div>`).join('')}</div></div>`;
  } else {
    h += `<div class="box muted">${esc(zone.desc)}<br>Entre preparado — não há pausa no meio do caminho.</div>`;
  }
  h += `</div>`;
  return h;
}

function viewCompendio(){
  const ct = S.ui.compTab || 'equip';
  let h = `<div class="stage"><div class="scene-title">— Compêndio da Poeira —</div>`;
  h += `<div class="comp-tabs">
    <button class="zone-btn${ct==='equip'?' active':''}" onclick="Game.setCompTab('equip')">Equipamentos</button>
    <button class="zone-btn${ct==='bestiario'?' active':''}" onclick="Game.setCompTab('bestiario')">Bestiário</button>
    <button class="zone-btn${ct==='segredos'?' active':''}" onclick="Game.setCompTab('segredos')">Segredos (${S.secrets.length}/${Object.keys(SECRETS).length})</button>
  </div>`;

  if(ct === 'equip'){
    const renderEntry = (unlocked, title, stat, desc, hint) => unlocked
      ? `<div class="comp-entry"><div class="comp-head"><b>${esc(title)}</b><span class="muted">${esc(stat)}</span></div><div class="muted">${esc(desc)}</div></div>`
      : `<div class="comp-entry locked"><div class="comp-head"><b>???</b><span class="muted">bloqueado</span></div><div class="muted">${esc(hint)}</div></div>`;

    h += `<div class="box"><span class="box-title">— ARMAS —</span>`;
    for(const id in WEAPONS){
      const w = WEAPONS[id];
      h += renderEntry(hasWeaponTier(id), w.name, `+${w.atk} ATK · ${w.passive}`, w.desc, w.hint);
    }
    h += `</div><div class="box"><span class="box-title">— ARMADURAS & SACOS —</span>`;
    for(const id in ARMORS){
      const a = ARMORS[id];
      h += renderEntry(hasArmorTier(id), a.name, `HP máx ${a.maxHp}`, a.desc, a.hint);
    }
    for(const id in BAGS){
      const b = BAGS[id];
      h += renderEntry(hasBagTier(id), b.name, `Base ${fmt(b.max)}`, b.desc, b.hint);
    }
    h += `</div><div class="box"><span class="box-title">— FERRAMENTAS —</span>`;
    for(const id in TOOLS){
      const t = TOOLS[id];
      h += renderEntry(hasTool(id), t.name, t.effect, t.desc, t.hint);
    }
    h += `</div><div class="box"><span class="box-title">— HABILIDADES DE COMBATE —</span>`;
    for(const sid in SKILLS){
      const sk = SKILLS[sid];
      h += renderEntry(hasSkillUnlocked(sid), `[${sk.key}] ${sk.name}`, `Cooldown ${sk.cd}s`, sk.desc, sk.hint);
    }
    h += `</div>`;
  } else if(ct === 'bestiario'){
    const seenCount = Object.keys(S.discoveredMonsters).length;
    h += `<div class="muted" style="margin-bottom:8px">Criaturas catalogadas: ${seenCount}/${ALL_MONSTERS.length}</div>`;
    COMBAT_ZONES.forEach(z => {
      h += `<div class="box"><span class="box-title">— ${esc(z.short)} —</span>`;
      z.monsters.forEach(m => {
        const seen = m.id in S.discoveredMonsters;
        const kills = S.discoveredMonsters[m.id] || 0;
        if(seen){
          h += `<div class="comp-entry"><div class="comp-head"><b>${esc(m.name)} ${m.boss?'[CHEFE]':''}</b><span class="muted">HP ${m.hp} · ATK ${m.atk} · Abates: ${kills}</span></div>
          <pre class="ascii-art" style="font-size:12px;margin:4px 0">${esc(m.art)}</pre>
          <div class="muted">${esc(m.desc)}</div></div>`;
        } else {
          h += `<div class="comp-entry locked"><div class="comp-head"><b>??? ${m.boss?'[CHEFE]':''}</b><span class="muted">não avistado</span></div><div class="muted">Habita a ${esc(z.short)}.</div></div>`;
        }
      });
      h += `</div>`;
    });
  } else if(ct === 'segredos'){
    h += `<div class="box"><span class="box-title">— SEGREDOS DO CASTELO —</span>`;
    for(const id in SECRETS){
      const sc = SECRETS[id];
      if(hasSecret(id)){
        h += `<div class="comp-entry"><div class="comp-head"><b>✦ ${esc(sc.name)}</b><span class="amber">${esc(sc.bonusText)}</span></div><div class="muted">${esc(sc.desc)}</div></div>`;
      } else {
        h += `<div class="comp-entry locked"><div class="comp-head"><b>???</b><span class="muted">oculto</span></div><div class="muted">${esc(sc.hint)}</div></div>`;
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
    title.textContent = 'EXPORTAR SAVE';
    desc.textContent = 'Copie o código abaixo para guardar ou transferir seu progresso:';
    text.readOnly = true;
    text.value = encodeSave(S);
    btnConfirm.style.display = 'none';
    btnCopy.style.display = '';
  } else {
    title.textContent = 'IMPORTAR SAVE';
    desc.textContent = 'Cole abaixo um código de save exportado (Base64 ou JSON):';
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
  const done = ()=>{ sfx('buy'); notify('Código de save copiado para a área de transferência.', 'amber'); };
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
      throw new Error('Estrutura de save inválida.');
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    load();
    recalc();
    save();
    render();
    closeModal();
    sfx('unlock');
    showToast('Save importado! A poeira antiga voltou para casa.');
  } catch(e){
    sfx('error');
    notify('Falha ao importar save: código inválido ou corrompido.', 'red');
    alert('Código de save inválido. Verifique se copiou tudo corretamente.');
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
      once('full', 'Seu recipiente está cheio.');
    } else {
      S.resources.dust += gain;
      S.resources.totalEarned += gain;
    }
  }
  if(!S.combat.active && S.player.hp < S.player.maxHp){
    const regenRate = hasTool('flanela_microfibra') ? 2.0 : 1.0;
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + dt * regenRate);
  }

  if(S.intro.done && !hasSecret('estatua_viva')){
    uiEphemeral.idleSeconds += dt;
    if(uiEphemeral.idleSeconds >= 60){
      unlockSecret('estatua_viva');
    }
  }

  if(S.intro.done && !S.unlocks.victory){
    uiEphemeral.moteTimer -= dt;
    if(uiEphemeral.moteTimer <= 0){
      uiEphemeral.moteTimer = 90 + Math.floor(Math.random()*90);
      spawnGoldenMote();
    }
  }

  if(S.resources.totalEarned >= 1000) once('m1', '1.000 poeiras acumuladas! Sua alergia evoluiu para orgulho.');

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
  applyTheme();
  applySoundLabel();
  const had = load();
  recalc();
  if(had){
    const away = Math.min(12*3600, (Date.now() - (S.lastSeen||Date.now()))/1000);
    if(away > 60){
      const g = Math.min(S.resources.dustPerSecond * away, Math.max(0, S.resources.maxDust - S.resources.dust));
      S.resources.dust += g; S.resources.totalEarned += g;
      setTimeout(()=>showToast(`Enquanto você estava fora (${Math.floor(away/60)}min), acumularam ${fmt(Math.floor(g))} poeiras.`), 300);
    }
  }
  const bind = (id, fn)=>{ const el = document.getElementById(id); if(el) el.onclick = fn; };
  bind('btn-save', ()=>{ save(); sfx('click'); notify('Jogo salvo. A poeira agora é canônica.'); });
  bind('btn-export', ()=>{ sfx('click'); openModal('export'); });
  bind('btn-import', ()=>{ sfx('click'); openModal('import'); });
  bind('btn-theme', cycleTheme);
  bind('btn-sound', toggleSound);
  bind('btn-reset', ()=>{ if(confirm('Resetar todo o progresso e voltar ao escuro?')) Game.reset(); });
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
    }
  });

  render();
  startLoop();
}

window.Game = {
  buyAccel, lubricate, cleanBody, buyItem, buyPotion, usePotion, transmute, craftFragment, fuseKey, openGate,
  cycleLever, testLevers, searchCandy, enterWind, pullBook,
  selectZone, startExpedition, retreatExpedition, useSkill, rest,
  talkNpc, chooseDialogue,
  pokeRat, pokeSpiderWord, pokeTermite, pokeMonster,
  go, setCompTab, setMapHint,
  reset(){ window.__dustboxSkipSave = true; localStorage.removeItem(SAVE_KEY); location.reload(); },
  debug: Debug,
  get state(){ return S; }
};

document.addEventListener('DOMContentLoaded', boot);
})();
