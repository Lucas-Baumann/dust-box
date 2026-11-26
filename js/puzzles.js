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
  const bandOk = radio.band === radio.targetBand;
  const diff = Math.abs(radio.freq - radio.targetFreq);
  if(bandOk && diff === 0){
    return {
      locked: true,
      wave: '=== [ SINAL LIMPO — TRANSMISSÃO CAPTADA ] ===',
      msg: '"...atenção, aqui é da rádio 1999: se você esqueceu a toalha molhada em cima da cama, ela acabou de virar poeira..."'
    };
  }
  if(!bandOk){
    return { locked: false, wave: '~~~ kshhh ... chiado pesado ... kshhh ~~~', msg: 'Banda errada — só estática.' };
  }
  if(diff <= 2){
    return { locked: false, wave: '~=~ quase lá... uma voz distante... ~=~', msg: 'Sinal muito próximo!' };
  }
  if(diff <= 6){
    return { locked: false, wave: '~~. chiado diminuindo aos poucos .~~', msg: 'Você está esquentando na sintonia.' };
  }
  return { locked: false, wave: '~~~ kshhh ~~~~~~~ kshhh ~~~', msg: 'Longe da frequência.' };
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
    text: 'Um Vira-Lata Caramelo entrou pelo corredor abanando o rabo e deixou algo brilhando no chão.',
    choices: [
      { label: 'Fazer carinho', reward: 'dust', multSec: 90, msg: 'O Caramelo aprovou! Ele se sacode e deixa poeira dourada.' },
      { label: 'Trocar por biscoito imaginário', reward: 'sockOrDust', msg: 'Ele entrega uma Meia Solitária (ou um punhado generoso de poeira)!' }
    ]
  },
  {
    id: 'boleto_voador',
    text: 'Um Boleto Voador de 2019 cruzou a sala fazendo barulho de vento!',
    choices: [
      { label: 'Fingir que não viu', reward: 'dust', multSec: 120, msg: 'Procrastinação pura convertida diretamente em poeira!' },
      { label: 'Amassar no ar', reward: 'magic', msg: 'Você amassou o boleto com estilo e extraiu +1 Poeira Mágica!' }
    ]
  },
  {
    id: 'panfleto_academia',
    text: 'Um panfleto de "Promoção de Janeiro — Comece Hoje!" deslizou por baixo da porta.',
    choices: [
      { label: 'Guardar para segunda', reward: 'dust', multSec: 100, msg: 'Empilhado junto com os outros 47 panfletos. +poeira!' },
      { label: 'Fazer chá com a calma', reward: 'tea', msg: 'Você ganhou +1 Chá de Poeira de graça!' }
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
