/* DUST BOX — Dados estáticos de itens, monstros, segredos e conquistas */
(function(global){
"use strict";

const THEMES = [
  { id: 'mono', label: 'mono', classes: [] },
  { id: 'green', label: 'verde', classes: ['theme-green'] },
  { id: 'amber', label: 'âmbar', classes: ['theme-amber'] },
  { id: 'green-crt', label: 'crt verde', classes: ['theme-green', 'crt'] },
  { id: 'amber-crt', label: 'crt âmbar', classes: ['theme-amber', 'crt'] }
];

const WEAPON_ORDER = ['none', 'vassoura_quebrada', 'espanador_pena', 'rodo_combate', 'cabo_hdmi', 'aspirador_entupido', 'vassoura_eletrica', 'ponteiro_12h'];
const ARMOR_ORDER  = ['roupa_mofada', 'casaco_pano_mofado', 'mascara_antipoeira', 'capa_teia', 'armadura_papelao', 'cobertor_pesado', 'manto_tempo'];
const BAG_ORDER    = ['bolso_furado', 'saco_teia', 'saco_compactado', 'mala_sotao', 'bau_sem_fundo'];

const ACCELS = {
  window: { name: 'Janela Entreaberta', desc: 'Deixa a brisa da rua entrar trazendo poeira.', base: 60, bonus: 0.5 },
  cat:    { name: 'Gato Preguiçoso', desc: 'Não limpa nada e troca de pelo duas vezes ao dia.', base: 350, bonus: 2.5 },
  carpet: { name: 'Carpete de 1980', desc: 'Retém sujeira de quatro décadas diferentes.', base: 2200, bonus: 12.0 },
  fan:    { name: 'Ventilador Troncho', desc: 'Gira devagar e espalha a poeira pelo recinto.', base: 14000, bonus: 55.0 }
};

const ACCELS_ACT2 = {
  pillow: { name: 'Almofada Esquecida', desc: 'Guarda migalhas de 2019 e moedas de 5 centavos.', base: 45000, bonus: 180 },
  box16:  { name: 'Caixa de Mudança 2016', desc: 'Nunca foi aberta desde a última mudança.', base: 220000, bonus: 900 },
  dvds:   { name: 'Estante de DVDs Piratas', desc: 'Coletânea 3 em 1 coberta de nostalgia cinzenta.', base: 1100000, bonus: 4200 }
};

const RELICS = {
  meia_sorte:     { name: 'Meia da Sorte', costSocks: 3, dpsBonus: 0.35, effect: '+35% P/s global', desc: 'Nunca encontrou o par, mas traz fortuna empoeirada.' },
  controle_univ:  { name: 'Controle Universal', costSocks: 5, atkBonus: 0.25, effect: '+25% ATK global', desc: 'Não liga a TV, mas aumenta sua força moral em combate.' },
  moeda_1998:     { name: 'Moeda de 1 Real (1998)', costSocks: 8, dpsBonus: 0.60, effect: '+60% P/s global', desc: 'Achada no fundo mais profundo do sofá.' }
};

const WEAPONS = {
  vassoura_quebrada:  { name: 'Vassoura Quebrada', atk: 2, price: 100, passive: 'Nenhuma', desc: '+2 ATK. Quebra mais do que varre.', hint: 'Vendida onde alguém come poeira no centro do castelo.' },
  espanador_pena:     { name: 'Espanador de Pena', atk: 8, price: 800, req: 'vassoura_quebrada', passive: '15% Crítico (1.5x dano)', desc: '+8 ATK. Pena de pombo ancestral.', hint: 'Forjado onde a madeira range a leste.' },
  rodo_combate:       { name: 'Rodo de Combate', atk: 25, price: 3000, req: 'espanador_pena', passive: '20% Empurrão (anula contra-ataque)', desc: '+25 ATK. A arma clássica do zelador.', hint: 'Forjado na Asa Leste após o Espanador.' },
  cabo_hdmi:          { name: 'Cabo HDMI de 5 Metros', atk: 55, price: 12000, req: 'rodo_combate', passive: '25% Chicote Duplo (+50% dano)', desc: '+55 ATK. Enrolado desde 2014, letal ao desenrolar.', hint: 'Uma relíquia de cabos forjada na Asa Leste.' },
  aspirador_entupido: { name: 'Aspirador Portátil Entupido', atk: 110, price: 38000, req: 'cabo_hdmi', passive: 'Drena 10% do dano como HP', desc: '+110 ATK. Faz mais barulho do que suga, mas impõe respeito.', hint: 'O ápice da forja da Asa Leste.' },
  vassoura_eletrica:  { name: 'Vassoura Elétrica Sem Fio', atk: 220, price: 180000, req: 'aspirador_entupido', passive: '30% Raio Estático (+80% dano)', desc: '+220 ATK. Bateria dura 4 minutos, mas eletriza tudo.', hint: 'Vendida além do Portão Principal, entre promessas antigas.' },
  ponteiro_12h:       { name: 'Ponteiro das 12h', atk: 360, price: 450000, req: 'vassoura_eletrica', passive: '35% Meio-Dia (2x dano + drena 5% HP)', desc: '+360 ATK. A lâmina dourada que faz o relógio voltar a andar.', hint: 'Forjado dentro da Torre do Relógio Parado.' }
};

const ARMORS = {
  roupa_mofada:       { name: 'Roupa Mofada', maxHp: 100, price: 0, desc: 'Cheira a guarda-roupa fechado.', hint: 'Você já acordou vestindo isso.' },
  casaco_pano_mofado: { name: 'Casaco de Pano Mofado', maxHp: 130, price: 600, desc: '+30 HP máx. Quentinho e questionável.', hint: 'Costurado em fios finos a oeste.' },
  mascara_antipoeira: { name: 'Máscara Anti-Poeira', maxHp: 160, price: 1200, req: 'casaco_pano_mofado', desc: '+60 HP máx. Respire com estilo.', hint: 'Encontrada no ateliê da Asa Oeste.' },
  capa_teia:          { name: 'Capa de Teia Reforçada', maxHp: 260, price: 9500, req: 'mascara_antipoeira', desc: '260 HP máx. Leve como seda, grudenta como culpa.', hint: 'Alta costura aracnídea avançada.' },
  armadura_papelao:   { name: 'Armadura de Papelão 1994', maxHp: 400, price: 28000, req: 'capa_teia', desc: '400 HP máx. Caixa de TV de tubo reforçada com fita.', hint: 'A defesa definitiva da Asa Oeste.' },
  cobertor_pesado:    { name: 'Cobertor de Microfibra Pesado', maxHp: 650, price: 140000, req: 'armadura_papelao', desc: '650 HP máx. Impossível sair de baixo dele num domingo.', hint: 'Encontrado além do Portão Principal.' },
  manto_tempo:        { name: 'Manto do Tempo Parado', maxHp: 950, price: 380000, req: 'cobertor_pesado', desc: '950 HP máx. Tecido com minutos esquecidos da Torre.', hint: 'Encontrado dentro da Torre do Relógio Parado.' }
};

const BAGS = {
  bolso_furado:    { name: 'Bolso Furado', max: 1000, price: 0, desc: 'Cabe pouca coisa, e metade vaza.', hint: 'Vem de fábrica.' },
  saco_teia:       { name: 'Saco de Teia', max: 5000, price: 1500, desc: 'Base 5.000 (+ mínimo de 2h de P/s). Tecelagem aracnídea.', hint: 'Tecido na Asa Oeste.' },
  saco_compactado: { name: 'Saco Compactado', max: 25000, price: 4000, req: 'saco_teia', desc: 'Base 25.000 (+ mínimo de 2h de P/s). Poeira prensada.', hint: 'Evolução de tecido na Asa Oeste.' },
  mala_sotao:      { name: 'Mala de Sótão', max: 150000, price: 16000, req: 'saco_compactado', desc: 'Base 150k (+ mínimo de 2h de P/s). Cheia de lembranças.', hint: 'Bagagem pesada da Asa Oeste.' },
  bau_sem_fundo:   { name: 'Baú Sem Fundo', max: 1000000, price: 75000, req: 'mala_sotao', desc: 'Base 1M (+ mínimo de 2h de P/s). Cabe um século de ócio.', hint: 'O maior recipiente do ateliê.' }
};

const TOOLS = {
  pa_lixo:            { name: 'Pá de Lixo', price: 1200, where: 'Hall', effect: '+20% poeira em combates', desc: 'Recolhe cada farelo deixado pelos monstros.', hint: 'À venda no coração do castelo.' },
  luva_borracha:      { name: 'Luva de Borracha Amarela', price: 2500, where: 'Asa Oeste', effect: '-15% dano recebido', desc: 'Proteção doméstica contra ameaças existenciais.', hint: 'Acessório no ateliê a oeste.' },
  flanela_microfibra: { name: 'Flanela de Microfibra', price: 3500, where: 'Asa Leste', effect: 'Regen de HP 2x fora de luta', desc: 'Um carinho nas feridas entre uma expedição e outra.', hint: 'Guardada na oficina a leste.' }
};

const POTIONS = {
  cha_poeira:     { name: 'Chá de Poeira', price: 400, key: 'R', effect: 'Cura 50% do HP em combate', desc: 'Quente, cinzento e surpreendentemente revigorante.', hint: 'Vendido no Hall Principal.' },
  tonico_cafeina: { name: 'Tônico de Cafeína Mofada', price: 1200, key: 'T', effect: '+50% ATK por 15s', desc: 'Destilado no Porão. Faz seu @ vibrar em alta frequência.', hint: 'Preparado no Porão Obscuro.' }
};

const SKILLS = {
  sweep:  { name: 'Varredura', key: 'Q', cd: 6,  reqWeapon: 'vassoura_quebrada', desc: 'Golpe pesado de 2.2x ATK.', hint: 'Desbloqueada ao empunhar sua primeira arma.' },
  cloud:  { name: 'Nuvem de Poeira', key: 'W', cd: 10, reqWeapon: 'espanador_pena', desc: 'Cega o inimigo (-50% dano por 3 turnos).', hint: 'Desbloqueada com penas ancestrais.' },
  sneeze: { name: 'Espirro Sônico', key: 'E', cd: 12, reqWeapon: 'rodo_combate', desc: 'Empurra o inimigo, causa 1.2x ATK e atordoa.', hint: 'Desbloqueada com a arma clássica do zelador.' }
};

const ITEM_LABELS = {
  mapa_castelo: 'Mapa do Castelo',
  lanterna: 'Lanterna (pilhas vazando)',
  pedra_peso: 'Pedra de Peso',
  compendio: 'Compêndio da Poeira',
  grande_chave: 'Grande Chave do Portão'
};

const SECRETS = {
  cursor_inquieto:  { name: 'Cursor Inquieto', bonusText: '+10% P/s', dpsBonus: 0.10, desc: 'Você cutucou o cursor do título até cair poeira dele.', hint: 'Há algo piscando lá no alto da página...' },
  estatua_viva:     { name: 'Estátua Viva', bonusText: '+15% P/s', dpsBonus: 0.15, desc: 'Ficou 60 segundos sem clicar em nada. A arte suprema do ócio.', hint: 'Às vezes, não fazer absolutamente nada é a resposta.' },
  caramelo:         { name: 'Vira-Lata Caramelo', bonusText: '+15% P/s', dpsBonus: 0.15, desc: 'Um caramelo invadiu o castelo após tantos gatos e se deitou no sol.', hint: 'Gatos demais atraem visitas inesperadas no Quarto...' },
  pano_vo:          { name: 'Pano de Prato da Vó', bonusText: '+10% capacidade do saco', bagBonus: 0.10, desc: 'Costura sagrada descoberta nas palavras da Aranha.', hint: 'Leia com atenção o que a alfaiate diz...' },
  chinelo_havaiana: { name: 'Chinelo Havaiana', bonusText: '+15% dano em insetos', insectBonus: 0.15, desc: 'Arma cultural brasileira despertada contra baratas.', hint: 'Alguns insetos nos Corredores merecem uns cliques extras.' },
  cafe_ontem:       { name: 'Café Passado de Ontem', bonusText: '+10% velocidade de ataque', atkSpeedBonus: 0.10, desc: 'Amargo, frio e funcional. O Cupim aprovou.', hint: 'Com luz na mão, converse de perto com quem trabalha madeira.' },
  grao_dourado:     { name: 'Observador do Brilho', bonusText: '+10% P/s', dpsBonus: 0.10, desc: 'Capturou um grão de poeira brilhante flutuando pela tela.', hint: 'Fique de olho: algo brilha na tela de tempos em tempos.' },
  tapa_controle:    { name: 'Tapa no Controle', bonusText: '+15% P/s', dpsBonus: 0.15, desc: 'Bateu na lateral do Controle Remoto e funcionou. Engenharia clássica.', hint: 'O que todo brasileiro faz quando a pilha do controle falha?' },
  acorde_desafinado:{ name: 'Acorde Desafinado', bonusText: '+15% ATK', atkBonus: 0.15, desc: 'Tocou os 3 primeiros segundos de Faroeste Caboclo e parou. Dano psicológico.', hint: 'Alguém no Sótão sente falta de ter as cordas tocadas...' },
  maldicao_do_3:    { name: 'A Maldição do 3', bonusText: '+10% P/s', dpsBonus: 0.10, desc: 'Insistiu na Caixa de Doces esperando o número 3 — junto com Half-Life e Portal.', hint: 'Algumas caixas famosas nunca receberam uma terceira parte...' }
};

const ACHIEVEMENT_INFO = {
  chave:        { name: 'Chaveiro do Apocalipse Higiênico', desc: 'Fundiu a Grande Chave do Portão.' },
  fuga:         { name: 'Ar Puro (alegadamente)', desc: 'Abriu o Portão Principal.' },
  eletricista:  { name: 'Eletricista de Ruína', desc: 'Acendeu a Câmara Escura.' },
  dieta:        { name: 'Caixa de Doces Vazia', desc: 'Revirou o nicho esquecido e achou 1 Poeira Mágica.' },
  vento:        { name: 'Perdeu Tudo no Vento', desc: 'Entrou no Túnel do Vento sem a Pedra de Peso.' },
  mofo:         { name: 'Assassino de Mofo Real', desc: 'Derrotou o REI MOFO.' },
  baratao:      { name: 'Pânico da Cozinha', desc: 'Derrotou o BARATÃO BLINDADO.' },
  ancestral:    { name: 'Senhor da Alergia', desc: 'Derrotou o LORDE ÁCARO ANCESTRAL.' },
  exterminador: { name: 'Exterminador de Sujeira', desc: '10 abates nas expedições.' },
  bibliotecario:{ name: 'Leitor de Poeira', desc: 'Encontrou o Compêndio na Estante Antiga.' },
  tagarela:     { name: 'Tagarela do Castelo', desc: 'Conversou com todos os 5 habitantes do Castelo.' },
  desvao:       { name: 'Além do Portão', desc: 'Entrou no Desvão do Mundo.' },
  cabos:        { name: 'Desembaraçador Profissional', desc: 'Organizou a Gaveta dos Cabos Emaranhados.' },
  promessa:       { name: 'Segunda-Feira Chegou', desc: 'Derrotou a PROMESSA DE SEGUNDA-FEIRA.' },
  colecionador:   { name: 'Colecionador de Meias', desc: 'Adquiriu todas as 3 Relíquias do Fundo do Sofá.' },
  senhor_tempo:   { name: 'O Relógio Voltou a Girar', desc: 'Derrotou O GRANDE ADIAMENTO no topo da Torre.' },
  final_aspirador:{ name: 'Faxina Cósmica', desc: 'Escolheu ligar o Grande Aspirador e retornar ao mundo real.' },
  final_trono:    { name: 'Monarca do Ócio', desc: 'Escolheu assumir o Trono da Poeira e preservar o Dust Box.' }
};

const COMBAT_ZONES = [
  {
    id: 0,
    name: 'Fase 1: Corredores Empoeirados',
    short: 'Fase 1',
    desc: 'Os primeiros corredores do castelo.',
    monsters: [
      { id:'acaro', name:'Ácaro Sábio', insect:true, hp:20, atk:1, reward:35,
        desc:'Pequeno, míope e cheio de certezas.',
        art:'   \\ /\n  (o_o)\n /|___|\\\n  "   "' },
      { id:'bola', name:'Bola de Poeira Rolante', hp:45, atk:3, reward:95,
        desc:'Rola pelos cantos desde o mês passado.',
        art:'   .---.\n ~( @ @ )~\n   \'---\'' },
      { id:'barata', name:'Barata Tonta', insect:true, hp:95, atk:5, reward:240,
        desc:'Não sabe para onde vai, mas vai rápido.',
        art:'  \\     /\n ==(o.O)==\n  /|###|\\\n  / | | \\' },
      { id:'traca_selv', name:'Traça Selvagem', insect:true, hp:170, atk:7, reward:520, magicChance:0.15,
        desc:'Prima distante da mercadora. Menos educada.',
        art:' .--.   .--.\n( o  \\ /  o )\n \'--(o.o)--\'\n    /---\\' },
      { id:'rei_mofo', name:'REI MOFO', hp:360, atk:9, reward:1500, magic:1, boss:true,
        desc:'Soberano úmido dos corredores. Solta esporos reais.',
        art:'     .  *  .\n    _|_/|\\_|_\n   /  MOFO   \\\n  | (O)   (O) |\n  |   .===.   |\n /| ######### |\\\n/ |  #######  | \\\n  \'._|#####|_.\'\n    ~ ~ ~ ~ ~' }
    ]
  },
  {
    id: 1,
    name: 'Fase 2: Depósito dos Esquecidos',
    short: 'Fase 2',
    desc: 'Onde caixas velhas ganham vontade própria.',
    monsters: [
      { id:'traca_bib', name:'Traça de Biblioteca', insect:true, hp:240, atk:10, reward:800,
        desc:'Devorou três enciclopédias e agora corrige sua gramática.',
        art:'  .---.   .---.\n / [A] \\_/ [Z] \\\n |  .---o---.  |\n  \\___/   \\___/' },
      { id:'meia_raivosa', name:'Meia Solitária Raivosa', hp:340, atk:13, reward:1200,
        desc:'Perdeu o par na lavanderia e quer descontar em você.',
        art:'    .----.\n    | >_<|\n    |    |\n   /    /\n  (____/' },
      { id:'ratoeira', name:'Ratoeira Enferrujada', hp:460, atk:16, reward:1800, magicChance:0.20,
        desc:'Range antes de morder. O Rato Filósofo evita este setor.',
        art:'  .===========.\n  | /---\\  o  |\n  | | X |===+ |\n  \'===========\'' },
      { id:'baratao', name:'BARATÃO BLINDADO', insect:true, hp:780, atk:20, reward:3500, magic:2, boss:true,
        desc:'Cascudo, voador nas horas vagas e imune a sustos.',
        art:'   \\       /\n  .-\\_____/-.\n /===(O_O)===\\\n| [#########] |\n \\| ####### |/\n  / / | | \\ \\' }
    ]
  },
  {
    id: 2,
    name: 'Fase 3: Sótão da Poeira Antiga',
    short: 'Fase 3',
    desc: 'Camadas geológicas de coisas deixadas para depois.',
    monsters: [
      { id:'cabo_vivo', name:'Cabo Emaranhado Vivo', hp:650, atk:22, reward:2800,
        desc:'Um nó de carregadores que ninguém tem coragem de desfazer.',
        art:'   .-~-.  .-~-.\n  ( (o) )( (o) )\n   \'~-_\\__/_-~ \'\n     _/ ~~ \\_' },
      { id:'esporo_fant', name:'Esporo Fantasma', hp:880, atk:26, reward:4200, magicChance:0.25,
        desc:'Flutua silenciosamente esperando alguém respirar fundo.',
        art:'     .-----.\n   .\' (o) (o)\'.\n  |     ___    |\n  |   /     \\  |\n   \'~^\'~^\'~^\'~^\'' },
      { id:'aspirador_pos', name:'Aspirador Possuído', hp:1150, atk:30, reward:6000,
        desc:'Quebrou em 2008 e voltou para se vingar de toda faxina.',
        art:'     .-------.\n    / [O   O] \\___\n   |  |=====|  ___)\n   \'--o-----o--\'' },
      { id:'lorde_acaro', name:'LORDE ÁCARO ANCESTRAL', insect:true, hp:1800, atk:35, reward:9500, magic:3, boss:true,
        desc:'O patriarca invisível de todo colchão esquecido.',
        art:'     \\   |   /\n    .-\\(O_O)/-.\n  _/ [#######] \\_\n / |  \\#####/  | \\\n   /  / / \\ \\  \\\n  "  " "   " "  "' }
    ]
  },
  {
    id: 3,
    name: 'Fase 4: Sótão das Promessas',
    short: 'Fase 4',
    desc: 'Metas de janeiro que viraram cabide.',
    act2: true,
    monsters: [
      { id:'halter_2kg', name:'Halter de 2kg Enferrujado', hp:1100, atk:14, reward:14000,
        desc:'Comprado com empolgação, usado como peso de porta.',
        art:'   .___.     .___.\n  |#####|===|#####|\n   \'---\'     \'---\'' },
      { id:'livro_auto', name:'Livro de Autoajuda Lacrado', hp:1600, atk:17, reward:22000, magicChance:0.30,
        desc:'"Acorde às 5h da Manhã" — ainda no plástico original.',
        art:'   .---------.\n  /  5AM!   /|\n +---------+ |\n |  LACRE  |/\n \'---------\'' },
      { id:'bike_cabide', name:'Bicicleta Ergométrica Cabide', hp:2300, atk:21, reward:35000,
        desc:'Sustenta 4 casacos e 2 mochilas com equilíbrio heroico.',
        art:'     _o/  [casaco]\n    / |___\n   (O)----(O)' },
      { id:'promessa_seg', name:'PROMESSA DE SEGUNDA-FEIRA', hp:3800, atk:26, reward:85000, magic:4, socks:3, boss:true,
        desc:'A entidade suprema de tudo que você disse que começaria na segunda.',
        art:'     .===SEG===.\n    /  (O) (O)  \\\n   |   .-----.   |\n   |  / AMANHÃ\\  |\n   \'._\\_______/._\'\n     ~ ~ ~ ~ ~ ~' }
    ]
  },
  {
    id: 4,
    name: 'Fase 5: Torre do Relógio Parado',
    short: 'Fase 5',
    desc: 'A escalada final até o relógio travado em 11:59.',
    act3: true,
    monsters: [
      { id:'pendulo', name:'Pêndulo Enferrujado', hp:2800, atk:28, reward:45000,
        desc:'Balança há décadas guardando a escada da torre.',
        art:'        |\n        |\n      .-+-.\n     ( 11h )\n      \'---\'' },
      { id:'relogio_1159', name:'RELÓGIO PARADO — 11:59', hp:4800, atk:34, reward:120000, magic:3, boss:true,
        desc:'Forma I do Guardião do Tempo. Recusa-se a virar para o meio-dia.',
        art:'     .-------.\n   .\'  11:59  \'.\n  |   \\  |  /   |\n  |    --o--    |\n   \'.  / | \\  .\'\n     \'-------\'' },
      { id:'grande_adiamento', name:'O GRANDE ADIAMENTO — 12:00', hp:7200, atk:42, reward:300000, magic:5, socks:5, boss:true, finalBoss:true,
        desc:'Forma Final. A soma de tudo que o mundo deixou para depois.',
        art:'      .  *  .  *  .\n     /=============\\\n    |  (O)  12:00 (O)|\n    |   \\  ===  /    |\n   /|  [#########]   |\\\n  / |   \\#######/    | \\\n     \'._|#######|_.\'\n       ~ ~ ~ ~ ~ ~' }
    ]
  }
];

const ALL_MONSTERS = COMBAT_ZONES.flatMap(z => z.monsters);
const LEVERS = ['|','/','\\'];

global.DustData = {
  THEMES, WEAPON_ORDER, ARMOR_ORDER, BAG_ORDER,
  ACCELS, ACCELS_ACT2, RELICS, WEAPONS, ARMORS, BAGS, TOOLS, POTIONS, SKILLS,
  ITEM_LABELS, SECRETS, ACHIEVEMENT_INFO,
  COMBAT_ZONES, ALL_MONSTERS, LEVERS
};
})(window);
