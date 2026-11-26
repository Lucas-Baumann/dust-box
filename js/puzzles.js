/* DUST BOX — Puzzles extras (Cofre, Rádio, Labirinto, Engrenagens) e Eventos Relâmpago */
(function(global){
"use strict";

const MAZE_MAP = [
  '#######',
  '#..#..#',
  '##.#.##',
  '#.....#',
  '#.###.#',
  '#...#$#',
  '#######'
];
// Caminho valido: (1,1)->(2,1)->(2,2)->(2,3)->(3,3)->(4,3)->(5,3)->(5,4)->(5,5)$

function ensureSafe(S){
  if(!S.safe || !Array.isArray(S.safe.code)){
    const pool = [0,1,2,3,4,5,6,7,8,9];
    const code = [];
    for(let i = 0; i < 3; i++){
      const idx = Math.floor(Math.random() * pool.length);
      code.push(pool.splice(idx, 1)[0]);
    }
    S.safe = { code, guess:[0,0,0], history:[], solved:false };
  }
}

function evalSafe(guess, code){
  let exact = 0, partial = 0;
  for(let i = 0; i < 3; i++){
    if(guess[i] === code[i]) exact++;
    else if(code.includes(guess[i])) partial++;
  }
  return { exact, partial };
}

function ensureRadio(S){
  if(!S.radio || !S.radio.targetFreq){
    const freqs = [90, 92, 94, 96, 98, 100, 102, 104, 106];
    S.radio = {
      band: 'AM',
      freq: 88,
      targetBand: Math.random() < 0.5 ? 'FM' : 'AM',
      targetFreq: freqs[Math.floor(Math.random() * freqs.length)],
      solved: false
    };
  }
}

function radioSignal(radio){
  const t = (k) => global.DustI18n ? global.DustI18n.t(k) : k;
  const bandOk = radio.band === radio.targetBand;
  const diff = Math.abs(radio.freq - radio.targetFreq);
  if(bandOk && diff === 0){
    return { locked: true, waveKey: 'radio.locked.wave', msgKey: 'radio.locked.msg', wave: t('radio.locked.wave'), msg: t('radio.locked.msg') };
  }
  if(!bandOk){
    return { locked: false, waveKey: 'radio.wrong_band.wave', msgKey: 'radio.wrong_band.msg', wave: t('radio.wrong_band.wave'), msg: t('radio.wrong_band.msg') };
  }
  if(diff <= 2){
    return { locked: false, waveKey: 'radio.close.wave', msgKey: 'radio.close.msg', wave: t('radio.close.wave'), msg: t('radio.close.msg') };
  }
  if(diff <= 6){
    return { locked: false, waveKey: 'radio.warm.wave', msgKey: 'radio.warm.msg', wave: t('radio.warm.wave'), msg: t('radio.warm.msg') };
  }
  return { locked: false, waveKey: 'radio.far.wave', msgKey: 'radio.far.msg', wave: t('radio.far.wave'), msg: t('radio.far.msg') };
}

function ensureMaze(S){
  if(!S.maze || typeof S.maze.x !== 'number'){
    S.maze = { x:1, y:1, visited:['1,1'], solved:false };
  }
}

function renderMaze(maze){
  const vis = new Set(maze.visited || ['1,1']);
  const rows = [];
  for(let y = 0; y < MAZE_MAP.length; y++){
    let row = '';
    for(let x = 0; x < MAZE_MAP[y].length; x++){
      const dist = Math.abs(x - maze.x) + Math.abs(y - maze.y);
      const key = `${x},${y}`;
      if(x === maze.x && y === maze.y){
        row += '@';
      } else if(dist <= 1 || vis.has(key) || maze.solved){
        row += MAZE_MAP[y][x];
      } else {
        row += '?';
      }
    }
    rows.push(row);
  }
  return rows.join('\n');
}

function moveMaze(maze, dx, dy){
  const nx = maze.x + dx;
  const ny = maze.y + dy;
  if(ny < 0 || ny >= MAZE_MAP.length || nx < 0 || nx >= MAZE_MAP[0].length) return 'wall';
  const ch = MAZE_MAP[ny][nx];
  if(ch === '#') return 'wall';
  maze.x = nx;
  maze.y = ny;
  const key = `${nx},${ny}`;
  if(!maze.visited.includes(key)) maze.visited.push(key);
  if(ch === '$') return 'goal';
  return 'ok';
}

function ensureClockDial(S){
  if(!S.clockDial || !Array.isArray(S.clockDial.vals)){
    // [6, 9, 6] -> girar 0 (+3->9,12,6), girar 2 (+3->9,3,9)... solucao limpa em poucos cliques
    S.clockDial = { vals: [9, 6, 9], solved: false };
  }
}

function turnClockDial(dial, idx){
  const step = (v) => v >= 12 ? 3 : v + 3;
  if(idx === 0){ dial.vals[0] = step(dial.vals[0]); dial.vals[1] = step(dial.vals[1]); }
  else if(idx === 1){ dial.vals[0] = step(dial.vals[0]); dial.vals[1] = step(dial.vals[1]); dial.vals[2] = step(dial.vals[2]); }
  else if(idx === 2){ dial.vals[1] = step(dial.vals[1]); dial.vals[2] = step(dial.vals[2]); }
  return dial.vals[0] === 12 && dial.vals[1] === 12 && dial.vals[2] === 12;
}

const FLASH_EVENTS = [
  {
    id: 'caramelo_visit',
    textKey: 'ev.caramelo_visit.text',
    choices: [
      { labelKey: 'ev.caramelo_visit.c0', msgKey: 'ev.caramelo_visit.m0', reward: 'dust', multSec: 90 },
      { labelKey: 'ev.caramelo_visit.c1', msgKey: 'ev.caramelo_visit.m1', reward: 'sockOrDust' }
    ]
  },
  {
    id: 'boleto_voador',
    textKey: 'ev.boleto_voador.text',
    choices: [
      { labelKey: 'ev.boleto_voador.c0', msgKey: 'ev.boleto_voador.m0', reward: 'dust', multSec: 120 },
      { labelKey: 'ev.boleto_voador.c1', msgKey: 'ev.boleto_voador.m1', reward: 'magic' }
    ]
  },
  {
    id: 'panfleto_academia',
    textKey: 'ev.panfleto_academia.text',
    choices: [
      { labelKey: 'ev.panfleto_academia.c0', msgKey: 'ev.panfleto_academia.m0', reward: 'dust', multSec: 100 },
      { labelKey: 'ev.panfleto_academia.c1', msgKey: 'ev.panfleto_academia.m1', reward: 'tea' }
    ]
  }
];

global.DustPuzzles = {
  MAZE_MAP, ensureSafe, evalSafe,
  ensureRadio, radioSignal,
  ensureMaze, renderMaze, moveMaze,
  ensureClockDial, turnClockDial,
  FLASH_EVENTS
};
})(window);
