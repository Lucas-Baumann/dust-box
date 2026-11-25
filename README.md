```text
 ____  _   _ ____ _____   ____   _____  __
|  _ \| | | / ___|_   _| | __ ) / _ \ \/ /
| | | | | | \___ \ | |   |  _ \| | | \  / 
| |_| | |_| |___) || |   | |_) | |_| /  \ 
|____/ \___/|____/ |_|   |____/ \___/_/\_\
       ~ Castelo da Poeira Eterna ~
```

> **Status: Em desenvolvimento ativo (WIP)**  
> Este projeto está nos estágios iniciais — a base jogável já funciona de ponta a ponta, mas a história, os segredos, a exploração e novas mecânicas continuam sendo construídos e expandidos.

---

### Sobre o jogo

**DUST BOX** é um jogo incremental / *idle RPG* textual em português com estética de terminal ASCII retrô e humor irônico sobre procrastinação, acúmulo e falta de faxina.

Tudo no mundo real que acumula poeira por ficar parado acaba caindo dentro do **Dust Box** — e você acorda no escuro de um quarto esquecido, contando grãos de poeira um por segundo até descobrir que está preso no **Castelo da Poeira Eterna**.

O projeto nasce inspirado na filosofia de descoberta progressiva de **Candy Box / Candy Box 2** — onde a interface, o mapa e os sistemas se revelam aos poucos — mas com universo, narrativa, humor e mecânicas próprias.

---

### O que já está jogável (v1.0.0 base)

- **Introdução progressiva em rimas:** a tela começa quase vazia e desbloqueia o HUD passo a passo (`P/s` → `HP/ATK` → abas e log).
- **Habitantes do Castelo:**
  - **Rato Filósofo** no Quarto Inicial
  - **Traça Gigante** no Hall Principal (loja de itens-chave e melhorias passivas de `P/s`)
  - **Cupim Marceneiro** na Asa Leste (forja de armas)
  - **Aranha Alfaiate** na Asa Oeste (armaduras e sacos de maior capacidade)
  - **Besouro Rola-Poeira** no Porão Obscuro (alquimia de Poeira Mágica e forja da Grande Chave)
- **Salas especiais e segredos:** Sala dos Puzzles (alavancas `| / \`), Sala do Vento Forte e homenagem à *Candy Box*.
- **Corredores de Batalha:** combate automático em turnos contra criaturas empoeiradas até o chefe **REI MOFO** (com loops crescentes).
- **Qualidade de vida:**
  - Autosave em `localStorage` + progresso offline (até 8h)
  - Exportar e importar save via código Base64/JSON
  - 5 variações visuais de terminal (`mono`, `verde`, `ambar`, `crt verde`, `crt ambar`)
  - Efeitos sonoros retrô sintetizados via Web Audio API (sem arquivos externos)

---

### Como jogar

O jogo é **100% HTML, CSS e JavaScript puro** (zero dependências, zero build).

1. Clone o repositório:
   ```bash
   git clone https://github.com/Lucas-Baumann/dust-box.git
   cd dust-box
   ```
2. Abra o arquivo `index.html` diretamente no navegador (ou sirva localmente com qualquer servidor estático, como `npx serve .` ou `python -m http.server`).

#### Atalhos de teclado
- `1` a `5` — alterna entre as abas desbloqueadas
- `Esc` — fecha modais abertos
- `Ctrl + Shift + D` — mostra/oculta o botão de debug (`+1000` poeira)

---

### Roadmap (em andamento)

Algumas direções planejadas para a evolução do Dust Box:
- [ ] Mapa e exploração mais vivos e interativos em ASCII (no espírito de *Candy Box 2*)
- [ ] Mais diálogos, escolhas e interações com NPCs e objetos escondidos na interface
- [ ] Expansão da história principal e conteúdo pós-Portão Principal
- [ ] Novas áreas, puzzles, segredos clicáveis e conquistas
- [ ] Mais equipamentos, habilidades/consumíveis em combate e chefes únicos

---

### Estrutura do projeto

```text
Dust Box/
├── index.html      # Estrutura do terminal, HUD, rodapé e modal de save
├── css/
│   └── style.css   # Estética monocromática, temas, efeito CRT e animações
└── js/
    └── game.js     # Estado, loop, narrativa, combate, áudio e persistência
```

---

> *"O tempo passa, a poeira acumula. Você está estático... mas a sujeira jamais para."* — Rato Filósofo
