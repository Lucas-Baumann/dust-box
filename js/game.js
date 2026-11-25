/* DUST BOX v1.1.0 — Castelo da Poeira Eterna */
(function(){
"use strict";
const SAVE_KEY = 'dustbox_save_v1';
const PREFS_KEY = 'dustbox_prefs_v1';

const THEMES = [
  { id: 'mono', label: 'mono', classes: [] },
  { id: 'green', label: 'verde', classes: ['theme-green'] },
  { id: 'amber', label: 'âmbar', classes: ['theme-amber'] },
  { id: 'green-crt', label: 'crt verde', classes: ['theme-green', 'crt'] },
  { id: 'amber-crt', label: 'crt âmbar', classes: ['theme-amber', 'crt'] }
];

const WEAPON_ORDER = ['none', 'vassoura_quebrada', 'espanador_pena', 'rodo_combate'];
const ARMOR_ORDER  = ['roupa_mofada', 'casaco_pano_mofado', 'mascara_antipoeira'];
const BAG_ORDER    = ['bolso_furado', 'saco_teia', 'saco_compactado'];

const ACCELS = {
  window: { name: 'Janela Entreaberta', desc: 'Deixa a brisa da rua entrar trazendo poeira.', base: 50, bonus: 0.5 },
  cat:    { name: 'Gato Preguiçoso', desc: 'Não limpa nada e troca de pelo duas vezes ao dia.', base: 200, bonus: 2.0 },
  carpet: { name: 'Carpete de 1980', desc: 'Retém sujeira de quatro décadas diferentes.', base: 1000, bonus: 10.0 },
  fan:    { name: 'Ventilador Troncho', desc: 'Gira devagar e espalha a poeira pelo recinto.', base: 5000, bonus: 45.0 }
};

const WEAPONS = {
  vassoura_quebrada: { name: 'Vassoura Quebrada', atk: 2, price: 100, desc: '+2 Dano. Quebra mais do que varre.' },
  espanador_pena:    { name: 'Espanador de Pena', atk: 8, price: 800, req: 'vassoura_quebrada', desc: '+8 Dano. Pena de pombo ancestral.' },
  rodo_combate:      { name: 'Rodo de Combate', atk: 25, price: 3000, req: 'espanador_pena', desc: '+25 Dano. A arma suprema do zelador.' }
};
const ARMORS = {
  roupa_mofada:        { name: 'Roupa Mofada', maxHp: 100, price: 0, desc: 'Cheira a guarda-roupa fechado.' },
  casaco_pano_mofado:  { name: 'Casaco de Pano Mofado', maxHp: 130, price: 600, desc: '+30 HP máx. Quentinho e questionável.' },
  mascara_antipoeira:  { name: 'Máscara Anti-Poeira', maxHp: 160, price: 1200, req: 'casaco_pano_mofado', desc: '+60 HP máx. Respire com estilo.' }
};
const BAGS = {
  bolso_furado:    { name: 'Bolso Furado', max: 1000, price: 0 },
  saco_teia:       { name: 'Saco de Teia', max: 5000, price: 1500, desc: 'Tecelagem aracnídea premium.' },
  saco_compactado: { name: 'Saco Compactado', max: 25000, price: 4000, req: 'saco_teia', desc: 'Poeira prensada cabe em qualquer lugar.' }
};

const ITEM_LABELS = {
  mapa_castelo: 'Mapa do Castelo',
  lanterna: 'Lanterna (pilhas vazando)',
  pedra_peso: 'Pedra de Peso',
  grande_chave: 'Grande Chave do Portão'
};

const ACHIEVEMENT_INFO = {
  chave:        { name: 'Chaveiro do Apocalipse Higiênico', desc: 'Fundiu a Grande Chave do Portão.' },
  fuga:         { name: 'Ar Puro (alegadamente)', desc: 'Abriu o Portão Principal.' },
  eletricista:  { name: 'Eletricista de Ruína', desc: 'Acendeu a Sala dos Puzzles.' },
  dieta:        { name: 'Caixa de Doces Vazia', desc: 'Revirou o easter egg e achou 1 Poeira Mágica.' },
  vento:        { name: 'Perdeu Tudo no Vento', desc: 'Entrou na Sala do Vento Forte sem a Pedra de Peso.' },
  mofo:         { name: 'Assassino de Mofo Real', desc: 'Derrotou o REI MOFO.' },
  exterminador: { name: 'Exterminador de Sujeira', desc: '10 abates nos Corredores.' }
};

const MONSTERS = [
  { id:'acaro', name:'Ácaro Sábio', hp:15, atk:1, reward:30,
    art:'   \\ /\n  (o_o)\n /|___|\\\n  "   "' },
  { id:'bola', name:'Bola de Poeira Rolante', hp:35, atk:3, reward:80,
    art:'   .---.\n ~( @ @ )~\n   \'---\'' },
  { id:'barata', name:'Barata Tonta', hp:80, atk:6, reward:200,
    art:'  \\     /\n ==(o.O)==\n  /|###|\\\n  / | | \\' },
  { id:'traca_selv', name:'Traça Selvagem', hp:150, atk:10, reward:400, magicChance:0.15,
    art:' .--.   .--.\n( o  \\ /  o )\n \'--(o.o)--\'\n    /---\\' },
  { id:'rei_mofo', name:'REI MOFO', hp:400, atk:15, reward:1000, magic:1, boss:true,
    art:'     .  *  .\n    _|_/|\\_|_\n   /  MOFO   \\\n  | (O)   (O) |\n  |   .===.   |\n /| ######### |\\\n/ |  #######  | \\\n  \'._|#####|_.\'\n    ~ ~ ~ ~ ~' }
];

const ART = {
  rat: [
    '       (\\_/)',
    '       ( o.o)  ~?',
    '      />[___]',
    '    ._/_____\\_..::..'
  ].join('\n'),

  moth: [
    '  .---.           .---.',
    ' / .-. \\   \\ /   / .-. \\',
    '| ( o ) \\_(o.o)_/ ( o ) |',
    ' \\ \'-\'  / (   ) \\  \'-\' /',
    '  \'----\'  /===\\  \'----\'',
    '~~~~~~~~~|LOJA |~~~~~~~~~',
    '| [===]  |_____|  [===] |',
    '+-----------------------+'
  ].join('\n'),

  termite: [
    '        \\   /',
    '       .-(o.o)-.     ___',
    '      (  \\===/  )   |   |',
    '       \'-/   \\-\'====|###|',
    '        /  |  \\     |___|',
    '     __/__/ \\__\\__',
    '    |   BIGORNA   |',
    '    |  DE MADEIRA |',
    '    +-------------+'
  ].join('\n'),

  spider: [
    '           |',
    '           |',
    '       \\  _|_  /',
    '     ---\\(. .)/---',
    '     ---/( _ )\\---',
    '       /  / \\  \\',
    '      (o)     (o)  [teia]'
  ].join('\n'),

  beetle: [
    '           .---.',
    '         .\'  *  \'.',
    '        /  * . *  \\',
    '       |  .  *  .  |',
    '        \\  *   *  /',
    '   \\ /   \'.__.__.\'',
    '  (o_o)===//  \\\\',
    ' /[###]\\ //',
    '  /   \\'
  ].join('\n'),

  gate: [
    '      ____  ____  ____  _____  ____  ____',
    '     ||P ||||O ||||R ||||T ||||Ã ||||O ||',
    '     ||__||||__||||__||||__||||__||||__||',
    '     |/__\\||/__\\||/__\\||/__\\||/__\\||/__\\|',
    '    ======================================',
    '     ||   ||   ||    ()    ||   ||   ||',
    '     ||___||___||__________||___||___||'
  ].join('\n'),

  candy: [
    '      +-------------------+',
    '      |  [ CANDY BOX ]    |',
    '      |                   |',
    '      |  (Está vazia...)  |',
    '      +-------------------+'
  ].join('\n')
};

const LEVERS = ['|','/','\\'];

function defaultState(){
  return {
    version: "1.1.0",
    resources: { dust: 0, magicDust: 0, dustPerSecond: 1, maxDust: 1000, totalEarned: 0 },
    unlocks: { outOfRoom:false, metMoth:false, hasMap:false, hasLantern:false, candyLooted:false, windLooted:false, puzzleSolved:false, victory:false },
    accelerators: { window:0, cat:0, carpet:0, fan:0 },
    inventory: { weapon:'none', armor:'roupa_mofada', bag:'bolso_furado', items:[] },
    player: { hp:100, maxHp:100, attack:2 },
    puzzle: { solution:null, current:[0,0,0], attempts:0 },
    key: { fragments:0, complete:false },
    achievements: [],
    combat: { active:false, idx:0, distance:0, monster:null, mhp:0, mmax:1, clog:[], kills:0, loop:1 },
    flags: {},
    ui: { tab:'quarto', subview:null },
    intro: { cleans: 0, done: false },
    lastSeen: Date.now()
  };
}

let S = defaultState();

// estado efemero de UI (nao precisa ir pro save)
const uiEphemeral = {
  npcSpeech: {},
  feedbackTimer: null,
  toastTimer: null,
  lastIntroReady: false,
  lastRatVisible: false
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
    S = Object.assign(defaultState(), d);
    S.resources = Object.assign(defaultState().resources, d.resources||{});
    S.unlocks = Object.assign(defaultState().unlocks, d.unlocks||{});
    S.accelerators = Object.assign(defaultState().accelerators, d.accelerators||{});
    S.inventory = Object.assign(defaultState().inventory, d.inventory||{});
    S.player = Object.assign(defaultState().player, d.player||{});
    S.puzzle = Object.assign(defaultState().puzzle, d.puzzle||{});
    S.key = Object.assign(defaultState().key, d.key||{});
    S.combat = Object.assign(defaultState().combat, d.combat||{});
    S.ui = { tab:'quarto', subview:null };
    S.intro = (d.intro && typeof d.intro.cleans === 'number') ? { cleans: d.intro.cleans, done: !!d.intro.done } : { cleans: 3, done: true };
    S.flags = d.flags||{};
    S.achievements = d.achievements||[];
    if(S.combat.monster && !S.combat.mmax) S.combat.mmax = S.combat.monster.hp || 1;
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
  return Math.floor(ACCELS[k].base * Math.pow(1.65, owned));
}
function recalc(){
  let dps = 1;
  for(const k in ACCELS) dps += ACCELS[k].bonus * (S.accelerators[k]||0);
  S.resources.dustPerSecond = Math.round(dps*100)/100;
  const w = WEAPONS[S.inventory.weapon];
  S.player.attack = 2 + (w ? w.atk : 0);
  const a = ARMORS[S.inventory.armor];
  if(a){
    S.player.maxHp = a.maxHp;
    if(S.player.hp > S.player.maxHp) S.player.hp = S.player.maxHp;
  }
  const b = BAGS[S.inventory.bag];
  if(b) S.resources.maxDust = b.max;
}

/* ---------- feedback limpo (Opcao A: sem terminal #log) ---------- */
function notify(msg, cls){
  const el = document.getElementById('feedback');
  if(!el) return;
  el.className = 'feedback visible' + (cls ? ' ' + cls : '');
  el.textContent = msg;
  if(uiEphemeral.feedbackTimer) clearTimeout(uiEphemeral.feedbackTimer);
  uiEphemeral.feedbackTimer = setTimeout(()=>{
    el.classList.remove('visible');
  }, 5000);
}
function showToast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  if(uiEphemeral.toastTimer) clearTimeout(uiEphemeral.toastTimer);
  uiEphemeral.toastTimer = setTimeout(()=>{
    el.classList.add('hidden');
  }, 4500);
}
function npcSay(npcId, text){
  uiEphemeral.npcSpeech[npcId] = text;
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

function speechBubble(text, maxWidth){
  const lines = wrapLines(text, maxWidth || 44);
  const w = Math.max(12, ...lines.map(l => l.length));
  const top = ' .' + '-'.repeat(w + 2) + '.';
  const body = lines.map(l => ' | ' + l + ' '.repeat(w - l.length) + ' |');
  const leftDash = Math.floor((w - 2) / 2);
  const rightDash = w - 2 - leftDash;
  const bot = " '" + '-'.repeat(leftDash) + '.  .' + '-'.repeat(rightDash) + "'";
  const tail = ' '.repeat(leftDash + 3) + '\\/';
  return `<pre class="speech-bubble">${esc([top, ...body, bot, tail].join('\n'))}</pre>`;
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
      npcSay('moth', '"Ela ilumina o Porão... mas revela coisas que você preferia não ver."');
      notify('Lanterna adquirida! O Porão agora pode ser explorado.', 'amber'); break;
    case 'pedra_peso':
      if(inv.includes('pedra_peso')) return;
      if(!need(500, 'moth')) return;
      inv.push('pedra_peso');
      sfx('buy');
      npcSay('moth', '"Sim, é só uma pedra. Tecnologia ancestral: gravidade."');
      notify('Pedra de Peso adquirida!', 'amber'); break;
    case 'vassoura_quebrada':
      if(hasWeaponTier('vassoura_quebrada')) return;
      if(!need(WEAPONS.vassoura_quebrada.price, S.ui.subview==='leste' ? 'termite' : 'moth')) return;
      S.inventory.weapon = 'vassoura_quebrada';
      sfx('buy');
      npcSay(S.ui.subview==='leste' ? 'termite' : 'moth', '"Vassoura Quebrada equipada! O cabo range perigosamente, mas resolve."');
      notify('Vassoura Quebrada equipada (+2 ATK).', 'amber'); break;
    case 'espanador_pena':
      if(hasWeaponTier('espanador_pena') || !hasWeaponTier('vassoura_quebrada')) return;
      if(!need(WEAPONS.espanador_pena.price, 'termite')) return;
      S.inventory.weapon = 'espanador_pena';
      sfx('buy');
      npcSay('termite', '"Espanador de Pena forjado! Cócegas letais de pombo ancestral."');
      notify('Espanador de Pena equipado (+8 ATK).', 'amber'); break;
    case 'rodo_combate':
      if(hasWeaponTier('rodo_combate') || !hasWeaponTier('espanador_pena')) return;
      if(!need(WEAPONS.rodo_combate.price, 'termite')) return;
      S.inventory.weapon = 'rodo_combate';
      sfx('buy');
      npcSay('termite', '"O Rodo de Combate! O chão inteiro teme você agora."');
      notify('Rodo de Combate empunhado (+25 ATK).', 'amber'); break;
    case 'casaco_pano_mofado':
      if(hasArmorTier('casaco_pano_mofado')) return;
      if(!need(ARMORS.casaco_pano_mofado.price, 'spider')) return;
      S.inventory.armor = 'casaco_pano_mofado';
      sfx('buy');
      npcSay('spider', '"Caimento impecável! Estiloso, quentinho e levemente alérgico."');
      notify('Casaco de Pano Mofado vestido (HP máx 130).', 'amber'); break;
    case 'mascara_antipoeira':
      if(hasArmorTier('mascara_antipoeira') || !hasArmorTier('casaco_pano_mofado')) return;
      if(!need(ARMORS.mascara_antipoeira.price, 'spider')) return;
      S.inventory.armor = 'mascara_antipoeira';
      sfx('buy');
      npcSay('spider', '"Alta costura de sótão. Você agora respira 40% menos história."');
      notify('Máscara Anti-Poeira equipada (HP máx 160).', 'amber'); break;
    case 'saco_teia':
      if(hasBagTier('saco_teia')) return;
      if(!need(BAGS.saco_teia.price, 'spider')) return;
      S.inventory.bag = 'saco_teia';
      sfx('buy');
      npcSay('spider', '"Fibra de aranha 100% orgânica. Cabe 5.000 grãos sem rasgar."');
      notify('Saco de Teia equipado (máx 5.000 poeira).', 'amber'); break;
    case 'saco_compactado':
      if(hasBagTier('saco_compactado') || !hasBagTier('saco_teia')) return;
      if(!need(BAGS.saco_compactado.price, 'spider')) return;
      S.inventory.bag = 'saco_compactado';
      sfx('buy');
      npcSay('spider', '"Poeira prensada a vácuo. Leve sua sujeira para qualquer lugar."');
      notify('Saco Compactado equipado (máx 25.000 poeira).', 'amber'); break;
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

/* puzzles */
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
      S.resources.magicDust += 2;
      sfx('unlock');
      achievement('eletricista', 'Eletricista de Ruína', 'Acendeu a Sala dos Puzzles');
      notify('CLICK-CLACK-BZZZ! As luzes acendem! Um baú cospe 2 Poeiras Mágicas e um recibo de 1987.', 'amber');
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
  achievement('dieta', 'Caixa de Doces Vazia', 'Revirou o easter egg e achou 1 Poeira Mágica');
  notify('Você encontra 1 Poeira Mágica esquecida no fundo da caixa!', 'amber');
  save(); render();
}

function enterWind(){
  const has = S.inventory.items.includes('pedra_peso');
  if(!has){
    const lost = Math.floor(S.resources.dust);
    S.resources.dust = 0;
    sfx('error');
    achievement('vento', 'Perdeu Tudo no Vento', 'Entrou na Sala do Vento Forte sem a Pedra de Peso');
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

/* combate */
function spawnMonster(){
  const c = S.combat;
  const base = MONSTERS[c.idx % MONSTERS.length];
  const mult = 1 + (c.loop-1)*0.6 + Math.floor(c.idx / MONSTERS.length)*0.15;
  c.monster = base;
  c.mhp = Math.round(base.hp * mult);
  c.mmax = c.mhp;
}
function startExpedition(){
  if(S.inventory.weapon === 'none'){
    sfx('error');
    notify('Sem arma, sua estratégia é espirrar nos inimigos. Compre a Vassoura Quebrada no Hall.');
    return;
  }
  if(S.combat.active) return;
  S.combat.active = true;
  S.combat.clog = ['O guerreiro @ entra no corredor empunhando ' + (WEAPONS[S.inventory.weapon]?WEAPONS[S.inventory.weapon].name:'as mãos') + '...'];
  if(!S.combat.monster) spawnMonster();
  sfx('click');
  notify('Expedição iniciada! O @ anda para a direita.');
  save(); render();
}
function stopExpedition(){
  S.combat.active = false;
  sfx('click');
  notify('Expedição pausada. O @ senta na poeira e finge que foi planejado.');
  save(); render();
}
function combatRound(){
  const c = S.combat;
  if(!c.active || !c.monster) return;
  if(S.player.hp <= 0) return;
  const variance = Math.floor(Math.random()*3);
  const dmg = S.player.attack + variance;
  c.mhp -= dmg;
  sfx('hit');
  c.clog.unshift(`@ bate ${dmg} em ${c.monster.name} (${Math.max(0,c.mhp)}/${c.mmax||c.monster.hp})`);
  if(c.mhp <= 0){
    const rw = Math.round(c.monster.reward * (1+(c.loop-1)*0.5));
    S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + rw);
    let extra = '';
    if(c.monster.magic){ S.resources.magicDust += c.monster.magic; extra = ` +${c.monster.magic} MÁGICA`; }
    else if(c.monster.magicChance && Math.random() < c.monster.magicChance){ S.resources.magicDust += 1; extra = ' +1 MÁGICA (a traça tossiu brilho)'; }
    c.clog.unshift(`${c.monster.name} virou poeira! +${rw} poeiras${extra}.`);
    c.kills++;
    if(c.monster.boss){
      achievement('mofo', 'Assassino de Mofo Real', 'Derrotou o REI MOFO');
      c.clog.unshift('O REI MOFO se dissolve em nostalgia e esporos. O castelo inteiro espirra.');
    }
    c.idx++;
    c.distance = 0;
    if(c.idx % MONSTERS.length === 0){ c.loop++; c.clog.unshift(`O corredor escurece... volta ${c.loop}x mais empoeirada (loop ${c.loop}).`); }
    spawnMonster();
    if(c.kills === 1) once('k1', 'Primeiro abate! A poeira agora tem medo de você.');
    if(c.kills === 10) achievement('exterminador', 'Exterminador de Sujeira', '10 abates nos Corredores');
  } else {
    const md = Math.max(1, c.monster.atk + Math.floor(Math.random()*3) - 1);
    S.player.hp -= md;
    c.clog.unshift(`${c.monster.name} revida ${md} em você.`);
    if(S.player.hp <= 0){ faint(); return; }
  }
  c.clog = c.clog.slice(0, 6);
  c.distance++;
}
function faint(){
  const lost = Math.floor(S.resources.dust * 0.2);
  S.resources.dust -= lost;
  S.player.hp = S.player.maxHp;
  S.combat.active = false;
  S.combat.monster = null;
  S.combat.mhp = 0;
  sfx('error');
  notify(`Você desmaiou na poeira e perdeu ${fmt(lost)} poeiras (20%). O Rato escreveu um haicai sobre isso.`, 'red');
}
function rest(){
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

  // se o rato acabou de aparecer no Quarto, re-renderiza uma vez
  if(S.ui.tab === 'quarto' && !S.unlocks.victory){
    const ratNow = S.resources.dust >= 20 || !!S.flags.rat;
    if(ratNow !== uiEphemeral.lastRatVisible){
      uiEphemeral.lastRatVisible = ratNow;
      render();
      return;
    }
  }

  // atualiza botoes com data-cost / data-magic-cost / data-req-ok sem destruir o DOM
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
}

function renderIntro(){
  document.getElementById('tabs').innerHTML = '';
  const c = document.getElementById('content');
  const d = Math.floor(S.resources.dust);
  const n = S.intro.cleans;
  uiEphemeral.lastIntroReady = d >= 20;

  // Proposta 1: poetico + ironico com acentuacao pt-BR
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
  if(S.intro.cleans === 1){
    showToast('Contador de ritmo (P/s) desbloqueado.');
  }
  if(S.intro.cleans === 2){
    showToast('Barra de vida (HP) desbloqueada.');
  }
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
    h += `<div class="muted">continue observando... algo vai se mexer aos 20 de poeira.<br>(dica: deixe a aba aberta e vá beber água)</div>`;
  } else {
    if(!S.flags.rat){
      S.flags.rat = true;
      showToast('Um Rato Filósofo surgiu da penumbra!');
    }
    const speech = uiEphemeral.npcSpeech.rat ||
      '"O tempo passa, a poeira acumula.\nVocê está estático... mas a sujeira jamais para."';
    h += speechBubble(speech, 42);
    h += `<pre class="ascii-art npc-idle">${esc(ART.rat)}</pre>`;
    h += `<div class="muted">Rato Filósofo — provavelmente formado em algo inútil</div>`;
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
        <button class="cmd" onclick="Game.rest()">Deitar no chão (curar HP)</button>
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

  h += `<div class="box"><span class="box-title">— LOJA DA TRAÇA —</span>`;
  const has = (x)=> S.inventory.items.includes(x) || (x in WEAPONS && hasWeaponTier(x));
  const item = (id, name, price, desc)=>{
    const owned = has(id);
    return `<div class="shop-item"><b>${name}</b> ${owned?'<span class="muted">[adquirido]</span>':`— <b>${price} poeira</b>`}<br><span class="muted">${desc}</span><br>
    ${owned?'':`<button class="cmd" data-cost="${price}" onclick="Game.buyItem('${id}')" ${S.resources.dust<price?'disabled':''}>Comprar</button>`}</div>`;
  };
  h += item('mapa_castelo','Mapa do Castelo',150,'Desbloqueia a aba [ Mapa ] e revela as asas. Rabiscado com poeira.');
  h += item('vassoura_quebrada','Vassoura Quebrada',100,'+2 ATK. Pré-requisito para não apanhar de ácaros.');
  h += item('lanterna','Lanterna',300,'Permite entrar no Porão Obscuro. Pilhas incluídas (vazando).');
  h += item('pedra_peso','Pedra de Peso',500,'Segura você na Sala do Vento Forte. Tecnologia ancestral: peso.');
  h += `</div>`;

  h += `<div class="box"><span class="box-title">— MELHORIAS DO CASTELO —</span><div class="muted">compre sujeira para atrair mais sujeira. Economia circular.</div>`;
  for(const k in ACCELS){
    const a = ACCELS[k], owned = S.accelerators[k]||0, cost = accelCost(k);
    h += `<div class="shop-item"><b>${a.name}</b> x${owned}<br><span class="muted">${a.desc} (+${a.bonus} P/s cada)</span><br>
    <button class="cmd" data-cost="${cost}" onclick="Game.buyAccel('${k}')" ${S.resources.dust<cost?'disabled':''}>Comprar (${cost} poeira)</button></div>`;
  }
  h += `</div>`;

  h += `<div class="muted">Fragmentos da Grande Chave: <b>${S.key.fragments}/3</b> ${S.key.complete?'— CHAVE PRONTA':''}</div>`;
  h += `<div class="actions">`;
  if(S.unlocks.hasMap) h += `<button class="cmd" onclick="Game.go('mapa')">Abrir Mapa do Castelo -&gt;</button>`;
  h += `<button class="cmd" onclick="Game.go('aventura')">Corredores de Batalha -&gt;</button></div></div>`;
  return h;
}

function viewInventario(){
  const w = WEAPONS[S.inventory.weapon];
  const a = ARMORS[S.inventory.armor];
  const b = BAGS[S.inventory.bag];
  let h = `<div class="stage"><div class="scene-title">— Inventário & Conquistas —</div>`;
  h += `<div class="box"><span class="box-title">— EQUIPAMENTO —</span>
  Arma: <b>${w?w.name:'(punhos + espirros)'}</b> ${w?`(+${w.atk} ATK)`:'(+0)'}<br>
  Armadura: <b>${a?a.name:'—'}</b> (HP máx ${a?a.maxHp:'?'})<br>
  Recipiente: <b>${b?b.name:'—'}</b> (máx ${b?fmt(b.max):'?'})<br>
  Fragmentos da Chave: <b>${S.key.fragments}/3</b> ${S.key.complete?'— GRANDE CHAVE PRONTA':''}<br>
  Poeira Mágica: <b class="amber">${S.resources.magicDust}</b></div>`;

  h += `<div class="box"><span class="box-title">— ITENS —</span>`;
  if(S.inventory.items.length===0){
    h += `<span class="muted">Nada. Seus bolsos têm apenas poeira e arrependimento.</span>`;
  } else {
    h += S.inventory.items.map(i=>`<div>• ${esc(ITEM_LABELS[i]||i)}</div>`).join('');
  }
  h += `</div>`;

  h += `<div class="box"><span class="box-title">— CONQUISTAS (${S.achievements.length}) —</span>`;
  if(S.achievements.length){
    h += S.achievements.map(id=>{
      const info = ACHIEVEMENT_INFO[id];
      return info
        ? `<div>★ <b>${esc(info.name)}</b> <span class="muted">— ${esc(info.desc)}</span></div>`
        : `<div>★ ${esc(id)}</div>`;
    }).join('');
  } else {
    h += `<span class="muted">Nenhuma. Até a poeira conquistou mais que você.</span>`;
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
  const bHall   = mapBtn('[Hall]',       'hall',    'Hall Principal — Traça Gigante (loja e melhorias)');
  const bOeste  = mapBtn('[Oeste]',      'oeste',   'Asa Oeste — Aranha Alfaiate (armaduras e sacos)');
  const bLeste  = mapBtn('[Leste]',      'leste',   'Asa Leste — Cupim Marceneiro (forja de armas)');
  const bPuz    = mapBtn('[Puzzles]',    'puzzles', 'Sala dos Puzzles — alavancas quebradas no escuro');
  const bCandy  = mapBtn('[Doces]',      'candy',   'Sala da Caixa de Doces — uma relíquia empoeirada');
  const bVento  = mapBtn('[Vento]',      'vento',   'Sala do Vento Forte — cuidado sem a Pedra de Peso');
  const bAvent  = `<button class="map-node" onclick="Game.go('aventura')" onmouseenter="Game.setMapHint('Corredores de Batalha — enfrente as criaturas da poeira')" onfocus="Game.setMapHint('Corredores de Batalha — enfrente as criaturas da poeira')">[Corredores]</button>`;
  const bQuarto = `<button class="map-node" onclick="Game.go('quarto')" onmouseenter="Game.setMapHint('O Quarto Inicial — Rato Filósofo e descanso')" onfocus="Game.setMapHint('O Quarto Inicial — Rato Filósofo e descanso')">[Quarto]</button>`;
  const bPortao = mapBtn('[Portão]',     'portao',  S.key.complete ? 'O Portão Principal — você tem a Grande Chave!' : 'O Portão Principal — trancado (requer a Grande Chave)');
  const bPorao  = mapBtn(S.unlocks.hasLantern ? '[Porão]' : '[Porão?]', 'porao',
    S.unlocks.hasLantern ? 'Porão Obscuro — Besouro Rola-Poeira (alquimia e chave)' : 'Porão Obscuro — escuro demais (compre a Lanterna no Hall)',
    !S.unlocks.hasLantern);

  const castle = [
    `                       /\\`,
    `                      /  \\`,
    `            /\\       /____\\       /\\`,
    `           /  \\     |  ::  |     /  \\`,
    `          /____\\====|${bHall}|====/____\\`,
    `         |${bOeste}|  |  ||  |  |${bLeste}|`,
    `         | (Teia)|  |  ||  |  |(Forja)|`,
    `          \\__  _/   |  ||  |   \\_  __/`,
    `             ||     |  ||  |     ||`,
    `      .------''-.   |  ||  |   .-''---------.`,
    `     ( ${bPuz} )  |  ||  |  ( ${bAvent} )`,
    `     ( ${bCandy}   )  |  ||  |  (   Batalha    )`,
    `     ( ${bVento}   )  |  ||  |   '------------'`,
    `      '---------'   |  ||  |`,
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

  let h = `<div class="stage"><div class="scene-title">— Mapa do Castelo da Poeira Eterna —</div>`;
  h += `<pre class="map-ascii">${castle}</pre>`;
  h += `<div id="map-hint" class="map-hint">clique diretamente em qualquer sala do castelo</div>`;
  h += `</div>`;
  return h;
}

function viewSub(sub){
  let h = `<div class="stage"><div class="actions"><button class="cmd subtle" onclick="Game.go('mapa')">&lt;- Voltar ao Mapa</button></div>`;
  if(sub==='hall') return h + `</div>` + viewHall();

  if(sub==='leste'){
    const speech = uiEphemeral.npcSpeech.termite ||
      '"Trago restos de móveis velhos e uno com poeira. Sustentável, artesanal e rangente."';
    h += `<div class="scene-title">— Asa Leste — O Cupim Marceneiro —</div>`;
    h += speechBubble(speech, 44);
    h += `<pre class="ascii-art npc-idle">${esc(ART.termite)}</pre>`;
    h += `<div class="box"><span class="box-title">— FORJA —</span>`;
    const wrow = (id)=>{
      const w = WEAPONS[id];
      const equipped = S.inventory.weapon===id;
      const owned = hasWeaponTier(id);
      const okReq = !w.req || hasWeaponTier(w.req);
      const badge = equipped ? '<span class="muted">[equipado]</span>' : owned ? '<span class="muted">[adquirido]</span>' : `— <b>${w.price} poeira</b>`;
      return `<div class="shop-item"><b>${w.name}</b> ${badge}<br><span class="muted">${w.desc}</span><br>${(!owned)?`<button class="cmd" data-cost="${w.price}" data-req-ok="${okReq?1:0}" onclick="Game.buyItem('${id}')" ${(S.resources.dust<w.price||!okReq)?'disabled':''}>Forjar</button>${!okReq?`<div class="muted">requer ${WEAPONS[w.req].name}</div>`:''}`:''}</div>`;
    };
    h += wrow('vassoura_quebrada') + wrow('espanador_pena') + wrow('rodo_combate');
    h += `</div><div class="actions"><button class="cmd" onclick="Game.go('aventura')">Testar arma nos Corredores -&gt;</button></div></div>`;
    return h;
  }

  if(sub==='oeste'){
    const speech = uiEphemeral.npcSpeech.spider ||
      '"Teço vestimentas com teia e poeira compactada. Coleção Outono/Inverno 1987."';
    h += `<div class="scene-title">— Asa Oeste — A Aranha Alfaiate —</div>`;
    h += speechBubble(speech, 44);
    h += `<pre class="ascii-art npc-idle">${esc(ART.spider)}</pre>`;
    h += `<div class="box"><span class="box-title">— ATELIÊ —</span>`;
    const arow = (id, kind)=>{
      const table = kind==='armor' ? ARMORS : BAGS;
      const item = table[id];
      const equipped = kind==='armor' ? (S.inventory.armor===id) : (S.inventory.bag===id);
      const owned = kind==='armor' ? hasArmorTier(id) : hasBagTier(id);
      const reqOk = !item.req || (kind==='armor' ? hasArmorTier(item.req) : hasBagTier(item.req));
      const reqName = item.req ? table[item.req].name : '';
      const badge = equipped ? '<span class="muted">[equipado]</span>' : owned ? '<span class="muted">[adquirido]</span>' : `— <b>${item.price} poeira</b>`;
      return `<div class="shop-item"><b>${item.name}</b> ${badge}<br><span class="muted">${item.desc}</span><br>${!owned?`<button class="cmd" data-cost="${item.price}" data-req-ok="${reqOk?1:0}" onclick="Game.buyItem('${id}')" ${(S.resources.dust<item.price||!reqOk)?'disabled':''}>Adquirir</button>${!reqOk?`<div class="muted">requer ${reqName}</div>`:''}`:''}</div>`;
    };
    h += arow('saco_teia','bag') + arow('saco_compactado','bag');
    h += arow('casaco_pano_mofado','armor') + arow('mascara_antipoeira','armor');
    h += `</div></div>`;
    return h;
  }

  if(sub==='porao'){
    if(!S.unlocks.hasLantern){
      return h + `<div class="box"><span class="red">Escuro demais. Volte com uma lanterna e coragem (a lanterna é mais importante).</span></div></div>`;
    }
    const speech = uiEphemeral.npcSpeech.beetle ||
      '"Compacto volumes astronômicos em brilho. Dieta balanceada: 99% poeira."';
    h += `<div class="scene-title">— Porão Obscuro — O Besouro Rola-Poeira —</div>`;
    h += speechBubble(speech, 44);
    h += `<pre class="ascii-art npc-idle">${esc(ART.beetle)}</pre>`;
    h += `<div class="box"><span class="box-title">— TRANSMUTAÇÃO —</span><div class="muted">10.000 Poeiras -&gt; 1 Poeira Mágica</div>
    <div class="actions"><button class="cmd" data-cost="10000" onclick="Game.transmute()" ${S.resources.dust<10000?'disabled':''}>Compactar (10.000 poeira -&gt; 1 mágica)</button></div></div>`;
    h += `<div class="box"><span class="box-title">— GRANDE CHAVE DO PORTÃO —</span><div class="muted">Cada fragmento: 2 Mágicas + 5.000 poeiras — Precisa de 3.<br>Fragmentos atuais: <b>${S.key.fragments}/3</b></div>
    <div class="actions">
      <button class="cmd" data-cost="5000" data-magic-cost="2" data-req-ok="${S.key.fragments<3?1:0}" onclick="Game.craftFragment()" ${(S.resources.magicDust<2||S.resources.dust<5000||S.key.fragments>=3)?'disabled':''}>Forjar fragmento</button>
      <button class="cmd" data-cost="0" data-req-ok="${(S.key.fragments>=3 && !S.key.complete)?1:0}" onclick="Game.fuseKey()" ${(S.key.fragments<3||S.key.complete)?'disabled':''}>Fundir a Grande Chave</button>
    </div></div></div>`;
    return h;
  }

  if(sub==='puzzles'){
    ensurePuzzle();
    h += `<div class="scene-title">— Sala dos Puzzles —</div>`;
    h += `<div class="box"><span class="box-title">— ALAVANCAS QUEBRADAS —</span><div class="muted">Uma câmara no escuro com 3 alavancas ( | / \\ ). Descubra a combinação para acender as luzes.</div><br><div class="row">`;
    S.puzzle.current.forEach((v,i)=>{
      h += `<div>Alavanca ${i+1}<br><b class="amber" style="font-size:22px">${LEVERS[v]}</b><br><button class="cmd" onclick="Game.cycleLever(${i})">puxar</button></div>`;
    });
    h += `</div><div class="actions"><button class="cmd" onclick="Game.testLevers()">Testar combinação</button></div>`;
    h += `<div class="muted">erro: +10 poeira, -2 HP — tentativas: ${S.puzzle.attempts}</div>`;
    if(S.unlocks.puzzleSolved) h += `<div class="amber" style="margin-top:8px">Luzes acesas. A sala agora parece apenas moderadamente assustadora.</div>`;
    h += `</div></div>`;
    return h;
  }

  if(sub==='candy'){
    h += `<div class="scene-title">— Sala Esquecida —</div>`;
    h += `<pre class="ascii-art">${esc(ART.candy)}</pre>`;
    h += `<div class="scene-text">"Uma caixa de doces? Que coisa inútil... Faz sentido estar coberta de poeira."</div>`;
    h += `<div class="actions"><button class="cmd" onclick="Game.searchCandy()" ${S.unlocks.candyLooted?'disabled':''}>${S.unlocks.candyLooted?'Caixa já revirada':'Mexer no fundo da caixa'}</button></div></div>`;
    return h;
  }

  if(sub==='vento'){
    h += `<div class="scene-title">— Sala do Vento Forte —</div>`;
    h += `<div class="box"><div class="scene-text">Um ventilador industrial esquecido no máximo no fundo do corredor.<br><span class="muted">Se entrar sem a <b>Pedra de Peso</b>, toda a poeira da mão voa para o nada.</span></div>
    <div class="actions"><button class="cmd danger" onclick="Game.enterWind()">Entrar no corredor</button></div></div></div>`;
    return h;
  }

  if(sub==='portao'){
    h += `<div class="scene-title">— O Portão Principal —</div>`;
    h += `<pre class="ascii-art">${esc(ART.gate)}</pre>`;
    h += `<div class="box"><div class="muted">Atrás dele: ar puro. Na frente dele: você, questionando suas escolhas.</div><br>`;
    if(S.key.complete){
      h += `<div class="actions"><button class="cmd" onclick="Game.openGate()">Abrir o Portão com a Grande Chave</button></div>`;
    } else {
      h += `<div class="red">Trancado. Requer a Grande Chave do Portão (3 fragmentos — ver Porão).</div><div class="muted">Fragmentos: ${S.key.fragments}/3</div>`;
    }
    h += `</div></div>`;
    return h;
  }

  return h + `<div class="muted">Sala desconhecida. Até o mapa espirrou.</div></div>`;
}

function viewAventura(){
  const c = S.combat;
  let h = `<div class="stage"><div class="scene-title">— Corredores de Batalha —</div>`;
  h += `<div class="muted">Arma: <b>${WEAPONS[S.inventory.weapon]?WEAPONS[S.inventory.weapon].name:'(desarmado)'}</b> (ATK ${S.player.attack}) — Abates: ${c.kills} — Loop ${c.loop}</div>`;
  h += `<div class="actions">`;
  if(!c.active && !c.monster){
    h += `<button class="cmd" onclick="Game.startExpedition()">Iniciar Expedição -&gt;</button>`;
  } else if(!c.active && c.monster){
    h += `<button class="cmd" onclick="Game.startExpedition()">Retomar Expedição -&gt;</button>`;
  } else {
    h += `<button class="cmd" onclick="Game.stopExpedition()">Pausar Expedição</button>`;
  }
  h += `<button class="cmd" onclick="Game.rest()">Curar (descansar)</button></div>`;

  if(c.monster){
    const mmax = c.mmax || c.monster.hp || 1;
    const pct = Math.max(0, Math.min(100, c.mhp/mmax*100));
    const steps = Math.floor(pct/10);
    h += `<div class="box">`;
    h += `<pre class="ascii-art">${esc(c.monster.art||'')}</pre>`;
    h += `<div><b>${esc(c.monster.name)}</b> ${c.monster.boss?'<b class="red">[CHEFE]</b>':''} — HP ${Math.max(0,Math.ceil(c.mhp))}/${mmax}</div>`;
    h += `<pre style="margin:6px auto">${c.active?'<span class="blink">@-&gt;</span>':'@'}  [${'#'.repeat(steps)}${'.'.repeat(10-steps)}]</pre>`;
    h += `<div class="combat-log">${c.clog.map(l=>`<div>${esc(l)}</div>`).join('')}</div></div>`;
  } else {
    h += `<div class="box muted">Nenhum monstro à vista. Suspeito. A poeira está tramando algo.</div>`;
  }
  h += `<div class="muted">dica: deixe rodando. Farmar poeira aqui paga a forja do Cupim e a transmutação do Besouro.</div></div>`;
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
Conquistas: ${S.achievements.length}</pre><br>
  <div class="amber">FIM DO ATO I — O Castelo da Poeira Eterna será lembrado (e varrido, talvez).</div>
  <div class="muted" style="margin-top:6px">O Rato acena com o lenço. A Traça chora poeira. O Cupim já vende souvenirs da sua vitória.</div>
  <div class="actions" style="margin-top:14px"><button class="cmd" onclick="Game.reset()">Recomeçar (virar poeira de novo)</button></div></div></div>`;
}

/* ---------- debug (uso livre pelo console ou pelo botao Ctrl+Shift+D) ---------- */
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
    S.ui.tab = 'hall';
    notify('[DEBUG] Mundo aberto.');
    save(); render();
  },
  giveAll(){
    S.inventory.weapon = 'rodo_combate';
    S.inventory.armor = 'mascara_antipoeira';
    S.inventory.bag = 'saco_compactado';
    ['mapa_castelo','lanterna','pedra_peso'].forEach(i=>{ if(!S.inventory.items.includes(i)) S.inventory.items.push(i); });
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
      once('full', 'Seu recipiente está cheio! A Aranha Alfaiate vende sacos maiores na Asa Oeste.');
    } else {
      S.resources.dust += gain;
      S.resources.totalEarned += gain;
    }
  }
  if(!S.combat.active && S.player.hp < S.player.maxHp){
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + dt*1.0);
  }
  if(S.intro.done && S.resources.dust >= 20 && !S.flags.rat) once('rat2', 'Algo se mexe no Quarto...');
  if(S.resources.totalEarned >= 100 && !S.unlocks.outOfRoom && S.intro.done) once('dica', 'Dica: 100 poeiras lubrificam a porta do quarto.');
  if(S.resources.totalEarned >= 1000) once('m1', '1.000 poeiras acumuladas! Sua alergia evoluiu para orgulho.');
  if(S.resources.totalEarned >= 10000) once('m2', '10.000 poeiras! O Besouro no Porão adoraria compactar isso.');

  if(S.combat.active){
    combatAcc += dt;
    if(combatAcc >= 0.8){ combatAcc = 0; combatRound(); render(); }
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
    const away = Math.min(8*3600, (Date.now() - (S.lastSeen||Date.now()))/1000);
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
  const modal = document.getElementById('modal');
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e)=>{
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
    }
  });

  render();
  startLoop();
}

window.Game = {
  buyAccel, lubricate, cleanBody, buyItem, transmute, craftFragment, fuseKey, openGate,
  cycleLever, testLevers, searchCandy, enterWind, startExpedition, stopExpedition, rest,
  go, setMapHint,
  reset(){ window.__dustboxSkipSave = true; localStorage.removeItem(SAVE_KEY); location.reload(); },
  debug: Debug,
  get state(){ return S; }
};

document.addEventListener('DOMContentLoaded', boot);
})();
