/* DUST BOX v1.0.0 - Castelo da Poeira Eterna */
(function(){
"use strict";
const SAVE_KEY = 'dustbox_save_v1';
const PREFS_KEY = 'dustbox_prefs_v1';

const THEMES = [
  { id: 'mono', label: 'mono', classes: [] },
  { id: 'green', label: 'verde', classes: ['theme-green'] },
  { id: 'amber', label: 'ambar', classes: ['theme-amber'] },
  { id: 'green-crt', label: 'crt verde', classes: ['theme-green', 'crt'] },
  { id: 'amber-crt', label: 'crt ambar', classes: ['theme-amber', 'crt'] }
];

const WEAPON_ORDER = ['none', 'vassoura_quebrada', 'espanador_pena', 'rodo_combate'];
const ARMOR_ORDER  = ['roupa_mofada', 'casaco_pano_mofado', 'mascara_antipoeira'];
const BAG_ORDER    = ['bolso_furado', 'saco_teia', 'saco_compactado'];

const ACCELS = {
  window: { name: 'Janela Entreaberta', desc: 'Deixa a brisa da rua entrar trazendo poeira.', base: 50, bonus: 0.5 },
  cat:    { name: 'Gato Preguicoso', desc: 'Nao limpa nada e troca de pelo duas vezes ao dia.', base: 200, bonus: 2.0 },
  carpet: { name: 'Carpete de 1980', desc: 'Retem sujeira de quatro decadas diferentes.', base: 1000, bonus: 10.0 },
  fan:    { name: 'Ventilador Troncho', desc: 'Gira devagar e espalha a poeira pelo recinto.', base: 5000, bonus: 45.0 }
};

const WEAPONS = {
  vassoura_quebrada: { name: 'Vassoura Quebrada', atk: 2, price: 100, desc: '+2 Dano. Quebra mais do que varre.' },
  espanador_pena:    { name: 'Espanador de Pena', atk: 8, price: 800, req: 'vassoura_quebrada', desc: '+8 Dano. Pena de pombo ancestral.' },
  rodo_combate:      { name: 'Rodo de Combate', atk: 25, price: 3000, req: 'espanador_pena', desc: '+25 Dano. A arma suprema do zelador.' }
};
const ARMORS = {
  roupa_mofada:        { name: 'Roupa Mofada', maxHp: 100, price: 0, desc: 'Cheira a guarda-roupa fechado.' },
  casaco_pano_mofado:  { name: 'Casaco de Pano Mofado', maxHp: 130, price: 600, desc: '+30 HP max. Quentinho e questionavel.' },
  mascara_antipoeira:  { name: 'Mascara Anti-Poeira', maxHp: 160, price: 1200, req: 'casaco_pano_mofado', desc: '+60 HP max. Respire com estilo.' }
};
const BAGS = {
  bolso_furado:    { name: 'Bolso Furado', max: 1000, price: 0 },
  saco_teia:       { name: 'Saco de Teia', max: 5000, price: 1500, desc: 'Tecelagem aracnidea premium.' },
  saco_compactado: { name: 'Saco Compactado', max: 25000, price: 4000, req: 'saco_teia', desc: 'Poeira prensada cabe em qualquer lugar.' }
};

const MONSTERS = [
  { id:'acaro', name:'Acaro Sabio', hp:15, atk:1, reward:30, art:'(o_o)' },
  { id:'bola', name:'Bola de Poeira Rolante', hp:35, atk:3, reward:80, art:'@(   )~' },
  { id:'barata', name:'Barata Tonta', hp:80, atk:6, reward:200, art:'<==(oO)==>' },
  { id:'traca_selv', name:'Traca Selvagem', hp:150, atk:10, reward:400, magicChance:0.15, art:'\\  /\n (o.o)\n/ -- \\' },
  { id:'rei_mofo', name:'REI MOFO', hp:400, atk:15, reward:1000, magic:1, boss:true, art:' [MOFO]\n(#####)\n |###|' }
];

const RAT_ART = "  (\\_/)\n  ( o_o)\n  />[__]";
const MOTH_ART = "   \\  /\n  ( o.o )  \n  / -- \\";
const LEVERS = ['|','/','\\'];

function defaultState(){
  return {
    version: "1.0.0",
    resources: { dust: 0, magicDust: 0, dustPerSecond: 1, maxDust: 1000, totalEarned: 0 },
    unlocks: { outOfRoom:false, metMoth:false, hasMap:false, hasLantern:false, candyLooted:false, windLooted:false, puzzleSolved:false, victory:false },
    accelerators: { window:0, cat:0, carpet:0, fan:0 },
    inventory: { weapon:'none', armor:'roupa_mofada', bag:'bolso_furado', items:[] },
    player: { hp:100, maxHp:100, attack:2 },
    puzzle: { solution:null, current:[0,0,0], attempts:0 },
    key: { fragments:0, complete:false },
    achievements: [],
    combat: { active:false, idx:0, distance:0, monster:null, mhp:0, clog:[], kills:0, loop:1 },
    flags: {},
    ui: { tab:'quarto', subview:null },
    intro: { cleans: 0, done: false },
    lastSeen: Date.now()
  };
}

let S = defaultState();

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

/* ---------- log ---------- */
const logEl = () => document.getElementById('log');
function log(msg, cls){
  const L = logEl();
  if(!L) return;
  const el = document.createElement('div');
  if(cls) el.className = cls;
  const t = new Date().toLocaleTimeString('pt-BR',{hour12:false});
  el.textContent = `[${t}] ${msg}`;
  L.prepend(el);
  while(L.children.length > 60) L.removeChild(L.lastChild);
}
function once(key, msg, cls){
  if(S.flags[key]) return;
  S.flags[key] = true;
  log(msg, cls||'');
}
function achievement(id, name, desc){
  if(S.achievements.includes(id)) return;
  S.achievements.push(id);
  log(`* Conquista desbloqueada: ${name} - ${desc}`, 'amber');
}

/* ---------- acoes ---------- */
function fmt(n){
  if(n >= 1000000) return (n/1000000).toFixed(2)+'M';
  if(n >= 10000) return (n/1000).toFixed(1)+'k';
  if(Math.floor(n) !== n) return n.toFixed(1);
  return Math.floor(n).toString();
}

function buyAccel(k){
  const c = accelCost(k);
  if(S.resources.dust < c) { sfx('error'); log('Poeira insuficiente. A pobreza tambem acumula.'); return; }
  S.resources.dust -= c;
  S.accelerators[k]++;
  sfx('buy');
  recalc(); save(); render();
  log(`${ACCELS[k].name} adquirido! (+${ACCELS[k].bonus} P/s). Seu quarto esta objetivamente pior.`);
}
function lubricate(){
  if(S.resources.dust < 100){ sfx('error'); log('Faltam poeiras para lubrificar. A porta range em julgamento.'); return; }
  S.resources.dust -= 100;
  S.unlocks.outOfRoom = true;
  S.unlocks.metMoth = true;
  S.ui.tab = 'hall';
  sfx('unlock');
  recalc(); save(); render();
  log('Voce lubrificou as dobradicas com 100 de poeira. Engenharia reversa da faxina.', 'amber');
  log('TRACA: "Olha so... mais uma pessoa! Passa tempo demais no computador, ne?"', 'npc');
}

function buyItem(id){
  const R = S.resources;
  const inv = S.inventory.items;
  const has = (x)=> inv.includes(x) || hasWeaponTier(x) || hasArmorTier(x) || hasBagTier(x);
  const need = (cost)=>{
    if(R.dust < cost){ sfx('error'); log('Poeira insuficiente. A traca finge que nao te julgou.'); return false; }
    R.dust -= cost; return true;
  };
  switch(id){
    case 'mapa_castelo':
      if(inv.includes('mapa_castelo')) return;
      if(!need(150)) return;
      inv.push('mapa_castelo'); S.unlocks.hasMap = true;
      sfx('unlock');
      log('MAPA DO CASTELO adquirido! Spoiler: e tudo sujo.', 'amber'); break;
    case 'lanterna':
      if(inv.includes('lanterna')) return;
      if(!need(300)) return;
      inv.push('lanterna'); S.unlocks.hasLantern = true;
      sfx('unlock');
      log('LANTERNA adquirida! Ela ilumina, mas revela coisas que voce preferia nao ver.'); break;
    case 'pedra_peso':
      if(inv.includes('pedra_peso')) return;
      if(!need(500)) return;
      inv.push('pedra_peso');
      sfx('buy');
      log('PEDRA DE PESO adquirida! Sim, e so uma pedra. Nao questione.'); break;
    case 'vassoura_quebrada':
      if(hasWeaponTier('vassoura_quebrada')) return;
      if(!need(WEAPONS.vassoura_quebrada.price)) return;
      S.inventory.weapon = 'vassoura_quebrada';
      sfx('buy');
      log('VASSOURA QUEBRADA equipada! +2 ATK. O cabo range perigosamente.'); break;
    case 'espanador_pena':
      if(hasWeaponTier('espanador_pena') || !hasWeaponTier('vassoura_quebrada')) return;
      if(!need(WEAPONS.espanador_pena.price)) return;
      S.inventory.weapon = 'espanador_pena';
      sfx('buy');
      log('ESPANADOR DE PENA forjado pelo Cupim! +8 ATK. Cocegas letais.'); break;
    case 'rodo_combate':
      if(hasWeaponTier('rodo_combate') || !hasWeaponTier('espanador_pena')) return;
      if(!need(WEAPONS.rodo_combate.price)) return;
      S.inventory.weapon = 'rodo_combate';
      sfx('buy');
      log('RODO DE COMBATE empunhado! +25 ATK. O chao teme voce agora.'); break;
    case 'casaco_pano_mofado':
      if(hasArmorTier('casaco_pano_mofado')) return;
      if(!need(ARMORS.casaco_pano_mofado.price)) return;
      S.inventory.armor = 'casaco_pano_mofado';
      sfx('buy');
      log('CASACO DE PANO MOFADO vestido! HP max 130. Estiloso e alergico.'); break;
    case 'mascara_antipoeira':
      if(hasArmorTier('mascara_antipoeira') || !hasArmorTier('casaco_pano_mofado')) return;
      if(!need(ARMORS.mascara_antipoeira.price)) return;
      S.inventory.armor = 'mascara_antipoeira';
      sfx('buy');
      log('MASCARA ANTI-POEIRA equipada! HP max 160. Voce agora respira 40% menos historia.'); break;
    case 'saco_teia':
      if(hasBagTier('saco_teia')) return;
      if(!need(BAGS.saco_teia.price)) return;
      S.inventory.bag = 'saco_teia';
      sfx('buy');
      log('SACO DE TEIA equipado! Estoque max 5.000. Fibra de aranha, cheiro de sotao.'); break;
    case 'saco_compactado':
      if(hasBagTier('saco_compactado') || !hasBagTier('saco_teia')) return;
      if(!need(BAGS.saco_compactado.price)) return;
      S.inventory.bag = 'saco_compactado';
      sfx('buy');
      log('SACO COMPACTADO equipado! Estoque max 25.000. Leve sua sujeira para todo lugar.'); break;
    default:
      void has;
      return;
  }
  recalc(); save(); render();
}

function transmute(){
  if(S.resources.dust < 10000){ sfx('error'); log('O Besouro fareja seu bolso: "Isso aqui mal da pra umedecer uma asa. Traga 10.000."'); return; }
  S.resources.dust -= 10000;
  S.resources.magicDust += 1;
  sfx('unlock');
  save(); render();
  log('*CRONCH* 10.000 poeiras viraram 1 POEIRA MAGICA. Alquimia ou digestao? Nunca saberemos.', 'amber');
}
function craftFragment(){
  if(S.key.complete){ log('A chave ja esta pronta. Ansiedade e poeira da alma.'); return; }
  if(S.key.fragments >= 3){ log('Voce ja tem os 3 fragmentos! Use "Fundir a Grande Chave".'); return; }
  if(S.resources.magicDust < 2){ sfx('error'); log('Faltam Poeiras Magicas (precisa de 2 por fragmento). O Besouro ri com a boca cheia.'); return; }
  if(S.resources.dust < 5000){ sfx('error'); log('Faltam 5.000 poeiras comuns para liga metalica.'); return; }
  S.resources.magicDust -= 2;
  S.resources.dust -= 5000;
  S.key.fragments++;
  sfx('unlock');
  log(`Fragmento ${S.key.fragments}/3 da Grande Chave forjado! Brilha como arrependimento.`, 'amber');
  if(S.key.fragments === 3) log('Os 3 fragmentos zumem juntos. Esta na hora de FUNDIR.');
  save(); render();
}
function fuseKey(){
  if(S.key.fragments < 3){ sfx('error'); log('Sem os 3 fragmentos, fundir e so derreter esperanca.'); return; }
  S.key.complete = true;
  if(!S.inventory.items.includes('grande_chave')) S.inventory.items.push('grande_chave');
  sfx('victory');
  achievement('chave', 'Chaveiro do Apocalipse Higienico', 'fundiu a Grande Chave do Portao');
  log('[CHAVE] A GRANDE CHAVE DO PORTAO foi fundida em Poeira Magica Comprimida! Pesa 3 desculpas.', 'amber');
  save(); render();
}
function openGate(){
  if(!S.key.complete){ sfx('error'); log('O Portao nem range. Ele sabe que voce nao tem a chave. Portas sentem essas coisas.'); return; }
  S.unlocks.victory = true;
  sfx('victory');
  achievement('fuga', 'Ar Puro (alegadamente)', 'abriu o Portao Principal');
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
      achievement('eletricista', 'Eletricista de Ruina', 'acendeu a Sala dos Puzzles');
      log('CLICK-CLACK-BZZZ! As luzes acendem! Um bau cospe 2 POEIRAS MAGICAS e um recibo de 1987.', 'amber');
    } else {
      S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + 200);
      sfx('buy');
      log('As luzes ja estao acesas. O bau, com pena, cospe 200 poeiras de troco.');
    }
  } else {
    S.player.hp -= 2;
    S.resources.dust = Math.min(S.resources.dust + 10, S.resources.maxDust);
    S.puzzle.attempts++;
    sfx('error');
    log('A lampada pisca, solta faiscas e derruba poeira no seu olho! (+10 Poeiras, -2 HP). A sala ri.', 'red');
    if(S.player.hp <= 0) faint();
  }
  save(); render();
}
function searchCandy(){
  if(S.unlocks.candyLooted){ log('A caixa continua vazia. Como seus planos de limpar o quarto.'); return; }
  S.unlocks.candyLooted = true;
  S.resources.magicDust += 1;
  sfx('unlock');
  achievement('dieta', 'Caixa de Doces Vazia', 'revirou o easter egg e achou 1 Poeira Magica');
  log('"Uma caixa de doces? Que coisa inutil... Faz sentido estar coberta de poeira." - voce encontra 1 POEIRA MAGICA no fundo!', 'amber');
  save(); render();
}
function enterWind(){
  const has = S.inventory.items.includes('pedra_peso');
  if(!has){
    const lost = Math.floor(S.resources.dust);
    S.resources.dust = 0;
    sfx('error');
    achievement('vento', 'Perdeu Tudo no Vento', 'entrou na Sala do Vento Forte sem a Pedra de Peso');
    log(`VUUUSH! O ventilador industrial sopra ${fmt(lost)} poeiras da sua mao direto pro infinito. Conquista desbloqueada, dignidade perdida.`, 'red');
  } else {
    if(!S.unlocks.windLooted){
      S.unlocks.windLooted = true;
      S.resources.magicDust += 1;
      sfx('unlock');
      log('Agarrado a Pedra de Peso, voce atravessa o vendaval como uma estatua determinada. No fundo: 1 POEIRA MAGICA!', 'amber');
    } else {
      S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + 300);
      sfx('buy');
      log('Travessia tranquila com sua pedra emocional. +300 poeiras que o vento deixou pra tras.');
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
  if(S.inventory.weapon === 'none'){ log('Sem arma, sua estrategia e espirrar nos inimigos. Compre a Vassoura Quebrada no Hall.'); return; }
  if(S.combat.active){ log('A expedicao ja esta em andamento. O @ nao tem sindicato, mas tem limite.'); return; }
  S.combat.active = true;
  S.combat.clog = ['O guerreiro @ entra no corredor empunhando ' + (WEAPONS[S.inventory.weapon]?WEAPONS[S.inventory.weapon].name:'as maos') + '...'];
  if(!S.combat.monster) { spawnMonster(); }
  log('Expedicao iniciada! O @ anda para a direita. Como na vida: sem volta.', 'amber');
  save(); render();
}
function stopExpedition(){
  S.combat.active = false;
  log('Expedicao pausada. O @ senta na poeira e finge que isso foi planejado.');
  save(); render();
}
function combatRound(){
  const c = S.combat;
  if(!c.active || !c.monster) return;
  if(S.player.hp <= 0) return;
  // jogador ataca
  const variance = Math.floor(Math.random()*3);
  const dmg = S.player.attack + variance;
  c.mhp -= dmg;
  sfx('hit');
  c.clog.unshift(`@ bate ${dmg} em ${c.monster.name} (${Math.max(0,c.mhp)}/${c.mmax||c.monster.hp})`);
  if(c.mhp <= 0){
    const rw = Math.round(c.monster.reward * (1+(c.loop-1)*0.5));
    S.resources.dust = Math.min(S.resources.maxDust, S.resources.dust + rw);
    let extra = '';
    if(c.monster.magic){ S.resources.magicDust += c.monster.magic; extra = ` +${c.monster.magic} MAGICA`; }
    else if(c.monster.magicChance && Math.random() < c.monster.magicChance){ S.resources.magicDust += 1; extra = ' +1 MAGICA (a traca selvagem tossiu brilho)'; }
    c.clog.unshift(`${c.monster.name} virou poeira! +${rw} poeiras${extra}.`);
    c.kills++;
    if(c.monster.boss){
      achievement('mofo', 'Assassino de Mofo Real', 'derrotou o REI MOFO');
      c.clog.unshift('O REI MOFO se dissolve em nostalgia e esporos. O castelo inteiro espirra.');
    }
    c.idx++;
    c.distance = 0;
    if(c.idx % MONSTERS.length === 0){ c.loop++; c.clog.unshift(`O corredor escurece... volta ${c.loop}x mais empoeirada. (loop ${c.loop})`); }
    spawnMonster();
    if(c.kills === 1) once('k1', 'Primeira morte! A poeira agora tem medo de voce. Progresso moral questionavel.');
    if(c.kills === 10) achievement('exterminador', 'Exterminador de Sujeira', '10 abates nos Corredores');
  } else {
    // monstro ataca
    const md = Math.max(1, c.monster.atk + Math.floor(Math.random()*3) - 1);
    S.player.hp -= md;
    c.clog.unshift(`${c.monster.name} revida ${md} em voce.`);
    if(S.player.hp <= 0){ faint(); return; }
  }
  c.clog = c.clog.slice(0, 9);
  c.distance++;
}
function faint(){
  const lost = Math.floor(S.resources.dust * 0.2);
  S.resources.dust -= lost;
  S.player.hp = S.player.maxHp;
  S.combat.active = false;
  S.combat.monster = null;
  S.combat.mhp = 0;
  log(`X Voce desmaiou na poeira e perdeu ${fmt(lost)} poeiras (20%). O Rato escreveu um haicai sobre isso.`, 'red');
}
function rest(){
  if(S.player.hp >= S.player.maxHp){ log('HP cheio. Descansar mais seria hibernacao.'); return; }
  S.player.hp = S.player.maxHp;
  log('Voce deitou no chao e fingiu que e "terapia de poeira". HP restaurado!');
  save(); render();
}

/* ---------- navegacao ---------- */
function go(tab, subview){
  S.ui.tab = tab;
  S.ui.subview = (subview===undefined? null : subview);
  save(); render();
}

/* ---------- render ---------- */
function tabs(){
  const t = [];
  t.push({id:'quarto', label:'[ Quarto ]'});
  if(S.unlocks.outOfRoom) t.push({id:'hall', label:'[ Hall ]'});
  if(S.unlocks.outOfRoom) t.push({id:'inventario', label:'[ Inventario ]'});
  if(S.unlocks.hasMap) t.push({id:'mapa', label:'[ Mapa ]'});
  if(S.unlocks.outOfRoom) t.push({id:'aventura', label:'[ Aventura ]'});
  return t;
}

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function paintStats(){
  document.getElementById('stat-dust').textContent = fmt(Math.floor(S.resources.dust));
  // o maximo do saco so aparece quando o HUD desbloqueia
  document.getElementById('stat-max').textContent = S.intro.done ? `/${fmt(S.resources.maxDust)}` : '';
  document.getElementById('stat-magic').textContent = S.resources.magicDust;
  document.getElementById('stat-ps').textContent = S.resources.dustPerSecond.toFixed(2);
  document.getElementById('stat-hp').textContent = `${Math.max(0,Math.ceil(S.player.hp))}/${S.player.maxHp}`;
  document.getElementById('hp-fill').style.width = Math.max(0, (S.player.hp/S.player.maxHp*100)) + '%';
  document.getElementById('stat-atk').textContent = S.player.attack;
  // revelacao progressiva: cada etapa da intro revela um pedaco do HUD
  const show = (id, v)=>{ document.getElementById(id).style.display = v ? '' : 'none'; };
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

function renderIntro(){
  document.getElementById('tabs').innerHTML = '';
  const c = document.getElementById('content');
  const d = Math.floor(S.resources.dust);
  const n = S.intro.cleans;
  // dialogos substitutivos: cada etapa apaga a anterior, tudo em rima
  const T = {
    0: [
      'Voce acorda no escuro, sem cama e sem lar,',
      'num quarto esquecido que ninguem quis limpar.',
      'So ha poeira aqui, caindo devagar:',
      'uma por segundo... e voce comeca a contar.'
    ],
    1: [
      'Voce sacode a roupa, limpa o corpo com a mao -',
      'mas a poeira da sala insiste em voltar do chao.',
      'Ela cai devagar, grao a grao, segundo a segundo:',
      'e a barra agora mostra o seu ritmo no mundo.'
    ],
    2: [
      'Faz de novo a faxina, e o ciclo acontece:',
      'quem adota a sujeira essa rotina nao esquece.',
      'Seu corpo agora mostra o limite da vida:',
      'HP na tela, barra cheia... e talvez ferida.'
    ],
    3: []
  };
  const BT = { 0:'Limpar a poeira do corpo', 1:'Jogar a poeira no chao', 2:'Sacudir a roupa uma ultima vez' };
  if(n >= 3){ renderPostIntroRoom(); return; }
  let h = `<div class="intro-text"><pre>${T[n].join('\n')}</pre>`;
  h += d >= 20
    ? `<br><button class="cmd" onclick="Game.cleanBody()">${BT[n]}</button>`
    : `<pre class="muted">\n[${d}/20]</pre>`;
  h += `</div>`;
  c.innerHTML = h;
}

function cleanBody(){
  if(S.intro.done || S.resources.dust < 20) return;
  S.resources.dust = 0;
  S.intro.cleans++;
  sfx('unlock');
  if(S.intro.cleans === 1){
    log('A barra agora mostra o ritmo: P/s 1.00', 'amber');
    log('[ CONTADOR DE RITMO (P/s) DESBLOQUEADO ]', 'amber');
  }
  if(S.intro.cleans === 2){
    log('Aparece no alto a sua barra de vida: 100/100', 'amber');
    log('[ HP E FORCA (ATK) DESBLOQUEADOS ]', 'amber');
  }
  if(S.intro.cleans >= 3){
    S.intro.done = true;
    document.body.classList.remove('intro');
    log('Sacudindo o corpo mais uma vez, seu ombro esbarra em algo no alto.', 'amber');
    log('E uma barra com numeros... e ela se multiplica em abas.', 'amber');
    log('[ HUD BASICO DESBLOQUEADO ]', 'amber');
  }
  save(); render();
}

function renderPostIntroRoom(){
  // primeira "pagina" pos-intro: o quarto agora com HUD visivel
  S.ui.tab = 'quarto';
  document.getElementById('content').innerHTML = viewQuarto();
}

function viewQuarto(){
  // o rato so surge depois do HUD pronto, quando a poeira acumula 20 de novo
  const seenRat = S.intro.done && (S.resources.dust >= 20 || S.flags.rat);
  let h = `<pre>A barra no alto pisca numeros sozinha.\nO quarto continua escuro, mas agora voce sabe:\n\n   . . . P O E I R A . . .\n\nEla cai. Voce conta. E assim que funciona aqui.</pre>`;
  if(!seenRat){
    h += `<pre class="muted">continue observando... algo vai se mexer num canto aos 20 de poeira.\n(dica: deixe a aba aberta e va beber agua)</pre>`;
  } else {
    once('rat', 'Um RATO se mexeu no canto embaixo do quarto! Ele parece julgar e acolher ao mesmo tempo.');
    h += `<pre class="rat-line">Do canto, uma voz pequena:\n\n   "O tempo passa, a poeira acumula.\n    Voce esta estatico... mas a sujeira jamais para."\n\n   - Rato Filosofo, provavelmente formado em algo inutil</pre>`;
    if(!S.unlocks.outOfRoom){
      h += `<div style="margin-top:8px">A porta range. As dobradicas pedem <b>100 Poeiras</b> de lubrificante.<br>
      <button class="cmd" onclick="Game.lubricate()" ${S.resources.dust<100?'disabled':''}>Lubrificar dobradicas (100 poeira)</button>
      <span class="muted">voce tem ${fmt(Math.floor(S.resources.dust))}</span></div>`;
    } else {
      h += `<div class="muted">A porta esta aberta. La fora: responsabilidade e um castelo.</div>
      <button class="cmd" onclick="Game.go('hall')">Ir ao Hall Principal -></button>`;
    }
  }
  if(S.unlocks.outOfRoom){
    h += `<button class="cmd" onclick="Game.rest()">Deitar no chao (curar HP)</button> <span class="muted">HP: ${Math.ceil(S.player.hp)}/${S.player.maxHp}</span>`;
  }
  if(seenRat){
    h += `<div class="rat-corner"><pre>(\\_/)\n( o_o)\n/>[__]</pre></div>`;
  }
  return h;
}

function viewHall(){
  let h = `<pre class="npc">${esc(MOTH_ART)}\n  "Nham... Nham... Poeira de excelente qualidade!"</pre>`;
  h += `<div class="box"><b class="amber">- A TRACA GIGANTE - mercadora central -</b><br>
  <span class="white">"Olha so... mais uma pessoa! Deixa eu adivinhar: voce passa tempo demais no computador, ne?<br>
  Por isso veio parar aqui. Tudo no mundo real que acumula poeira por ficar parado acaba caindo dentro do Dust Box.<br>
  Alias, voce nao esta numa caixa qualquer... este lugar E o <b>Castelo da Poeira Eterna</b>."</span></div>`;
  h += `<div class="box"><b>- LOJA DA TRACA -</b>`;
  const has = (x)=> S.inventory.items.includes(x) || (x in WEAPONS && hasWeaponTier(x));
  const item = (id, name, price, desc)=>{
    const owned = has(id);
    return `<div class="shop-item"><b>${name}</b> ${owned?'<span class="muted">[adquirido]</span>':`<b>${price} poeira</b>`} <span class="muted">- ${desc}</span><br>
    ${owned?'':`<button class="cmd" onclick="Game.buyItem('${id}')" ${S.resources.dust<price?'disabled':''}>Comprar</button>`}</div>`;
  };
  h += item('mapa_castelo','Mapa do Castelo',150,'Desbloqueia a aba [ Mapa ] e revela as asas. Rabiscado com poeira.');
  h += item('vassoura_quebrada','Vassoura Quebrada',100,'+2 ATK. Pre-requisito para nao apanhar de acaros.');
  h += item('lanterna','Lanterna',300,'Permite entrar no Porao Obscuro. Pilhas incluidas (vazando).');
  h += item('pedra_peso','Pedra de Peso',500,'Segura voce na Sala do Vento Forte. Tecnologia ancestral: peso.');
  h += `</div>`;
  h += `<div class="box"><b>- MELHORIAS DO CASTELO -</b><div class="muted">compre sujeira para atrair mais sujeira. Economia circular.</div>`;
  for(const k in ACCELS){
    const a = ACCELS[k], owned = S.accelerators[k]||0, cost = accelCost(k);
    h += `<div class="shop-item"><b>${a.name}</b> x${owned} <span class="muted">- ${a.desc}</span><br>
    <span>+${a.bonus} P/s cada - proximo: <b>${cost}</b> poeira</span><br>
    <button class="cmd" onclick="Game.buyAccel('${k}')" ${S.resources.dust<cost?'disabled':''}>Comprar (${cost})</button></div>`;
  }
  h += `</div>`;
  h += `<div class="muted">Fragmentos da Grande Chave: <b>${S.key.fragments}/3</b> ${S.key.complete?'[CHAVE] PRONTA':''}</div>`;
  if(S.unlocks.hasMap) h += `<button class="cmd" onclick="Game.go('mapa')">Abrir Mapa do Castelo -></button> `;
  h += `<button class="cmd" onclick="Game.go('aventura')">Corredores de Batalha -></button>`;
  return h;
}

function viewInventario(){
  const w = WEAPONS[S.inventory.weapon];
  const a = ARMORS[S.inventory.armor];
  const b = BAGS[S.inventory.bag];
  let h = `<div class="box"><b>- EQUIPAMENTO -</b><br>
  Arma: <b>${w?w.name:'(punhos + espirros)'}</b> ${w?`(+${w.atk} ATK)`:'(+0)'}<br>
  Armadura: <b>${a?a.name:'-'}</b> (HP max ${a?a.maxHp:'?'})<br>
  Recipiente: <b>${b?b.name:'-'}</b> (max ${b?fmt(b.max):'?'})<br>
  [CHAVE] Fragmentos da Chave: <b>${S.key.fragments}/3</b> ${S.key.complete?'- GRANDE CHAVE PRONTA':''}<br>
  Poeira magica: <b class="amber">${S.resources.magicDust}</b></div>`;
  h += `<div class="box"><b>- ITENS -</b><br>`;
  if(S.inventory.items.length===0) h += `<span class="muted">Nada. Seus bolsos tem apenas poeira e arrependimento.</span>`;
  else h += S.inventory.items.map(i=>`<span>- ${esc(i)}</span>`).join('<br>');
  h += `</div>`;
  h += `<div class="box"><b>- CONQUISTAS (${S.achievements.length}) -</b><br>`;
  h += S.achievements.length? S.achievements.map(x=>`* ${esc(x)}`).join('<br>') : `<span class="muted">Nenhuma. Ate a poeira conquistou mais que voce.</span>`;
  h += `</div>`;
  return h;
}

function viewMapa(){
  let h = `<pre class="map-ascii">                        [ Porao do Besouro ]
                                 |
[ Sala dos Puzzles ] &lt;--- [ Hall Principal ] ---&gt; [ Corredores de Batalha ]
  (Aranha Alfaiate)       (Traca Gigante)             (Cupim Marceneiro)
                                 |
                        [ O Quarto Inicial ]
                           (Rato Filosofo)
                                 |
                    [ O Portao Principal ] (Fim)</pre>`;
  h += `<div class="box"><b>- NAVEGACAO -</b><br>`;
  const btn = (label, sub)=>`<button class="cmd" onclick="Game.go('mapa','${sub}')">${label}</button>`;
  h += btn('Hall Principal','hall');
  h += btn('Asa Leste (Cupim Ferreiro)','leste');
  h += btn('Asa Oeste (Aranha Alfaiate)','oeste');
  h += S.unlocks.hasLantern ? btn('Porao Obscuro (Besouro)','porao') : `<button class="cmd" disabled title="Precisa da Lanterna">Porao (trancado - precisa de luz)</button>`;
  h += btn('Sala dos Puzzles','puzzles');
  h += btn('Sala da Caixa de Doces','candy');
  h += btn('Sala do Vento Forte','vento');
  h += btn('Portao Principal','portao');
  h += `</div>`;
  return h;
}

function viewSub(sub){
  let h = `<button class="cmd" onclick="Game.go('mapa')"><- Voltar ao Mapa</button><br><br>`;
  if(sub==='hall') return h + viewHall();
  if(sub==='leste'){
    h += `<div class="box"><b>O CUPIM MARCENEIRO - ferreiro da Asa Leste</b><br><span class="white">"Trago restos de moveis velhos e uno com poeira. Sustentavel e rangente."</span></div><div class="box"><b>- FORJA -</b>`;
    const wrow = (id)=>{
      const w = WEAPONS[id];
      const equipped = S.inventory.weapon===id;
      const owned = hasWeaponTier(id);
      const okReq = !w.req || hasWeaponTier(w.req);
      const badge = equipped ? '<span class="muted">[equipado]</span>' : owned ? '<span class="muted">[adquirido]</span>' : `<b>${w.price} poeira</b>`;
      return `<div class="shop-item"><b>${w.name}</b> ${badge} <span class="muted">- ${w.desc}</span><br>${(!owned)?`<button class="cmd" onclick="Game.buyItem('${id}')" ${(S.resources.dust<w.price||!okReq)?'disabled':''}>Forjar</button>${!okReq?` <span class="muted">requer ${WEAPONS[w.req].name}</span>`:''}`:''}</div>`;
    };
    h += wrow('vassoura_quebrada') + wrow('espanador_pena') + wrow('rodo_combate');
    h += `</div>`;
    h += `<button class="cmd" onclick="Game.go('aventura')">Testar arma nos Corredores -></button>`;
    return h;
  }
  if(sub==='oeste'){
    h += `<div class="box"><b>A ARANHA ALFAIATE - armadeira da Asa Oeste</b><br><span class="white">"Teco vestimentas com teia e poeira compactada. Outono/Inverno 1987."</span></div><div class="box"><b>- ATELIE -</b>`;
    const arow = (id, kind)=>{
      const table = kind==='armor' ? ARMORS : BAGS;
      const item = table[id];
      const equipped = kind==='armor' ? (S.inventory.armor===id) : (S.inventory.bag===id);
      const owned = kind==='armor' ? hasArmorTier(id) : hasBagTier(id);
      const reqOk = !item.req || (kind==='armor' ? hasArmorTier(item.req) : hasBagTier(item.req));
      const reqName = item.req ? table[item.req].name : '';
      const badge = equipped ? '<span class="muted">[equipado]</span>' : owned ? '<span class="muted">[adquirido]</span>' : `<b>${item.price} poeira</b>`;
      return `<div class="shop-item"><b>${item.name}</b> ${badge} <span class="muted">- ${item.desc}</span><br>${!owned?`<button class="cmd" onclick="Game.buyItem('${id}')" ${(S.resources.dust<item.price||!reqOk)?'disabled':''}>Adquirir</button>${!reqOk?` <span class="muted">requer ${reqName}</span>`:''}`:''}</div>`;
    };
    h += arow('saco_teia','bag') + arow('saco_compactado','bag');
    h += arow('casaco_pano_mofado','armor') + arow('mascara_antipoeira','armor');
    h += `</div>`;
    return h;
  }
  if(sub==='porao'){
    if(!S.unlocks.hasLantern) return h + `<span class="red">Escuro demais. Volte com uma lanterna e coragem (a lanterna e mais importante).</span>`;
    h += `<div class="box"><b>O BESOURO ROLA-POEIRA - alquimista do Porao</b><br><span class="white">"Compacto volumes astronomicos em brilho. Dieta balanceada: 99% poeira."</span></div>`;
    h += `<div class="box"><b>- TRANSMUTACAO -</b><br>10.000 Poeiras -> 1 poeira magica<br><button class="cmd" onclick="Game.transmute()" ${S.resources.dust<10000?'disabled':''}>Compactar (10.000 poeira -> 1 magica)</button></div>`;
    h += `<div class="box"><b>- GRANDE CHAVE DO PORTAO -</b><br>Cada fragmento: 2 magica + 5.000 poeira - Precisa de 3.<br>Fragmentos: <b>${S.key.fragments}/3</b><br>
    <button class="cmd" onclick="Game.craftFragment()" ${(S.resources.magicDust<2||S.resources.dust<5000||S.key.fragments>=3)?'disabled':''}>Forjar fragmento</button>
    <button class="cmd" onclick="Game.fuseKey()" ${S.key.fragments<3||S.key.complete?'disabled':''}>Fundir a Grande Chave</button></div>`;
    return h;
  }
  if(sub==='puzzles'){
    ensurePuzzle();
    h += `<div class="box"><b>PUZZLE DAS ALAVANCAS QUEBRADAS</b><br><span class="muted">Uma camara no escuro. 3 alavancas: | / \\ . Descubra a combinacao para acender as luzes.</span><br><br>`;
    S.puzzle.current.forEach((v,i)=>{
      h += `<span>Alavanca ${i+1}: <b class="amber" style="font-size:20px">${LEVERS[v]}</b> <button class="cmd" onclick="Game.cycleLever(${i})">puxar</button> &nbsp;</span>`;
    });
    h += `<br><br><button class="cmd" onclick="Game.testLevers()">Testar combinacao</button> <span class="muted">erro: +10 poeira, -2 HP - tentativas: ${S.puzzle.attempts}</span>`;
    h += S.unlocks.puzzleSolved ? `<br><span class="amber">OK Luzes acesas. A sala agora parece apenas moderadamente assustadora.</span>` : ``;
    h += `</div>`;
    return h;
  }
  if(sub==='candy'){
    h += `<div class="box"><pre>+-------------------+
|  [ CANDY BOX ]    |
|                   |
|  (Esta vazia...)  |
+-------------------+</pre>
    <div class="white">"Uma caixa de doces? Que coisa inutil... Faz sentido estar coberta de poeira."</div><br>
    <button class="cmd" onclick="Game.searchCandy()" ${S.unlocks.candyLooted?'disabled':''}>Mexer no fundo da caixa</button></div>`;
    return h;
  }
  if(sub==='vento'){
    h += `<div class="box"><b>SALA DO VENTO FORTE</b><br><span class="muted">Um ventilador industrial esquecido no maximo no fundo do corredor. Se entrar sem a <b>Pedra de Peso</b>, toda a poeira da mao volta a zero.</span><br><br>
    <button class="cmd danger" onclick="Game.enterWind()">Entrar no corredor</button></div>`;
    return h;
  }
  if(sub==='portao'){
    h += `<div class="box"><pre>   ____  ____  ____  _____  ____  ____
  ||P ||||O ||||R ||||T ||||A ||||O ||
  ||__||||__||||__||||__||||__||||__||
  |/__\\||/__\\||/__\\||/__\\||/__\\||/__\\|</pre>
    <b>O PORTAO PRINCIPAL</b><br><span class="muted">Atras dele: ar puro. Na frente dele: voce, questionando suas escolhas.</span><br><br>
    ${S.key.complete
      ? `<button class="cmd" onclick="Game.openGate()">Abrir o Portao com a Grande Chave</button>`
      : `<span class="red">Trancado. Requer a Grande Chave do Portao (3 fragmentos de Poeira Magica Comprimida - ver Porao).</span><br><span class="muted">Fragmentos: ${S.key.fragments}/3</span>`}
    </div>`;
    return h;
  }
  return h + `<span class="muted">Sala desconhecida. Ate o mapa espirrou.</span>`;
}

function viewAventura(){
  const c = S.combat;
  let h = `<pre>O guerreiro @ anda para a direita. Os monstros vem da poeira.\nArma: <b>${WEAPONS[S.inventory.weapon]?WEAPONS[S.inventory.weapon].name:'(desarmado)'}</b> (ATK ${S.player.attack}) - Abates: ${c.kills} - Loop ${c.loop}</pre>`;
  if(!c.active && !c.monster){
    h += `<button class="cmd" onclick="Game.startExpedition()">Iniciar Expedicao -></button> <span class="muted">automatico, como procrastinacao</span>`;
  } else if(!c.active && c.monster){
    h += `<button class="cmd" onclick="Game.startExpedition()">Retomar Expedicao -></button>`;
  } else {
    h += `<button class="cmd" onclick="Game.stopExpedition()">Pausar Expedicao</button>`;
  }
  h += ` <button class="cmd" onclick="Game.rest()">Curar (descansar)</button>`;
  if(c.monster){
    const mmax = c.mmax || c.monster.hp || 1;
    const pct = Math.max(0, Math.min(100, c.mhp/mmax*100));
    const steps = Math.floor(pct/10);
    h += `<div class="box"><pre>${esc(c.monster.art||'')}   ${c.active?'<span class="blink">@-></span>':'@ (pausado)'}\n<b>${esc(c.monster.name)}</b> ${c.monster.boss?'<b class="red">[CHEFE]</b>':''} - HP ${Math.max(0,Math.ceil(c.mhp))}/${mmax}\n[${'#'.repeat(steps)}${'.'.repeat(10-steps)}]</pre>`;
    h += `<div class="muted">${c.clog.map(l=>esc(l)).join('<br>')||'...'}</div></div>`;
  } else {
    h += `<div class="box muted">Nenhum monstro a vista. Suspeito. A poeira esta tramando algo.</div>`;
  }
  h += `<div class="muted">dica: deixe rodando. Farmar poeira aqui paga a forja do Cupim e a transmutacao do Besouro.</div>`;
  return h;
}

function viewVictory(){
  return `<div class="box"><pre>   O PORTAO RANGE... E SE ABRE.\n
   *** AR PURO ***\n
  Voce respira fundo. Tosse por 40 segundos.\n  Valeu a pena.\n
  Poeira total acumulada: ${fmt(Math.floor(S.resources.totalEarned))}\n  Abates: ${S.combat.kills} - Magicas: ${S.resources.magicDust}\n  Conquistas: ${S.achievements.length}</pre>
  <b class="amber">FIM - O Castelo da Poeira Eterna sera lembrado (e varrido, talvez).</b><br>
  <span class="muted">O Rato acena com o lenco. A Traca chora poeira. O Cupim ja vende souvenirs da sua vitoria.</span><br><br>
  <button class="cmd" onclick="Game.reset()">Recomecar (virar poeira de novo)</button></div>`;
}

/* ---------- debug (uso livre pelo console ou pelo botao fixo) ---------- */
const Debug = {
  addDust(){ S.resources.dust += 1000; log('[DEBUG] +1000 poeira.'); save(); render(); },
  addMagic(){ S.resources.magicDust += 10; log('[DEBUG] +10 magica.'); save(); render(); },
  toggleInf(){
    S.flags.dustInf = !S.flags.dustInf;
    if(!S.flags.dustInf){
      // ao desligar, o bolso volta ao valor maximo real; sem rastro de 10M
      S.resources.dust = Math.min(S.resources.dust, S.resources.maxDust);
    }
    log(S.flags.dustInf ? '[DEBUG] POEIRA/MAGICA INFINITAS ligadas. A economia chora.' : '[DEBUG] modo infinito desligado. Bolso cheio (max), sem residuo.');
    save(); render();
  },
  skipIntro(){
    S.intro = { cleans: 3, done: true };
    log('[DEBUG] intro pulada. O rato chega aos 20 de poeira.');
    save(); render();
  },
  openWorld(){
    S.unlocks.outOfRoom = true; S.unlocks.metMoth = true;
    S.unlocks.hasMap = true; S.unlocks.hasLantern = true;
    S.ui.tab = 'hall';
    log('[DEBUG] porta, hall, porao e mapa abertos.');
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
    log('[DEBUG] TUDO entregue: Rodo, Mascara, Saco 25k, 3 itens, chave pronta, +50 magicas.');
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
  if(!trimmed) throw new Error('Codigo vazio.');
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
    desc.textContent = 'Copie o codigo abaixo para guardar ou transferir seu progresso:';
    text.readOnly = true;
    text.value = encodeSave(S);
    btnConfirm.style.display = 'none';
    btnCopy.style.display = '';
  } else {
    title.textContent = 'IMPORTAR SAVE';
    desc.textContent = 'Cole abaixo um codigo de save exportado (Base64 ou JSON):';
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
  const done = ()=>{ sfx('buy'); log('Codigo de save copiado para a area de transferencia.', 'amber'); };
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
      throw new Error('Estrutura de save invalida.');
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    load();
    recalc();
    save();
    render();
    closeModal();
    sfx('unlock');
    log('Save importado com sucesso! A poeira antiga voltou para casa.', 'amber');
  } catch(e){
    sfx('error');
    log('Falha ao importar save: codigo invalido ou corrompido.', 'red');
    alert('Codigo de save invalido. Verifique se copiou tudo corretamente.');
  }
}

/* ---------- loop ---------- */
let combatAcc = 0, saveAcc = 0, renderAcc = 0;
function tick(dt){
  // debug: modo folga infinita
  if(S.flags.dustInf){
    S.resources.dust = 9999999;
    if(S.resources.magicDust < 999) S.resources.magicDust = 999;
  } else {
    // geracao passiva
    const gain = S.resources.dustPerSecond * dt;
    if(S.resources.dust + gain >= S.resources.maxDust){
      const room = S.resources.maxDust - S.resources.dust;
      if(room > 0){ S.resources.dust = S.resources.maxDust; S.resources.totalEarned += room; }
      once('full', 'Seu recipiente esta CHEIO! A Aranha Alfaiate vende sacos maiores na Asa Oeste. Capitalismo aracnideo.');
    } else {
      S.resources.dust += gain;
      S.resources.totalEarned += gain;
    }
  }
  // regen
  if(!S.combat.active && S.player.hp < S.player.maxHp){
    S.player.hp = Math.min(S.player.maxHp, S.player.hp + dt*1.0);
  }
  // marcos ironicos
  if(S.intro.done && S.resources.dust >= 20 && !S.flags.rat) once('rat2', 'Algo se mexe no canto... (olhe o Quarto)');
  if(S.resources.totalEarned >= 100 && !S.unlocks.outOfRoom) once('dica', 'Dica: 100 poeiras lubrificam a porta do quarto. WD-40 de pobre.');
  if(S.resources.totalEarned >= 1000) once('m1', '1.000 poeiras acumuladas! Sua alergia evoluiu para orgulho.');
  if(S.resources.totalEarned >= 10000) once('m2', '10.000 poeiras! O Besouro no Porao adoraria compactar isso. Se voce tivesse lanterna...');
  // combate
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
    renderAcc += dt; saveAcc += dt;
    if(renderAcc >= 1.0){ renderAcc = 0; render(); }
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
      setTimeout(()=>log(`Enquanto voce fingia trabalhar por ${Math.floor(away/60)}min, acumularam ${fmt(Math.floor(g))} poeiras. O castelo sentiu sua falta (e sua falta de faxina).`), 300);
    }
    setTimeout(()=>log('Save carregado. A poeira esperou por voce. Ela sempre espera.', 'muted'), 100);
  } else {
    setTimeout(()=>{
      log('Bem-vindo ao DUST BOX. Nao ha tutorial. Ha apenas poeira.', 'amber');
      log('Dica: nao clique. Apenas exista. A poeira faz o resto.', 'muted');
    }, 200);
  }
  const bind = (id, fn)=>{ const el = document.getElementById(id); if(el) el.onclick = fn; };
  bind('btn-save', ()=>{ save(); sfx('click'); log('Jogo salvo. A poeira agora e canonica.'); });
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

  // antes: beforeunload regravava o save durante o reload e ressuscitava o estado antigo.
  // agora autosave a cada 5s cobre isso; save() tambem respeita o guard __dustboxSkipSave.
  render();
  startLoop();
}

window.Game = { buyAccel, lubricate, cleanBody, buyItem, transmute, craftFragment, fuseKey, openGate, cycleLever, testLevers, searchCandy, enterWind, startExpedition, stopExpedition, rest, go, reset(){ window.__dustboxSkipSave = true; localStorage.removeItem(SAVE_KEY); location.reload(); }, debug: Debug, get state(){ return S; } };

document.addEventListener('DOMContentLoaded', boot);
})();
