```text
 ____  _   _ ____ _____   ____   _____  __
|  _ \| | | / ___|_   _| | __ ) / _ \ \/ /
| | | | | | \___ \ | |   |  _ \| | | \  / 
| |_| | |_| |___) || |   | |_) | |_| /  \ 
|____/ \___/|____/ |_|   |____/ \___/_/\_\
       ~ Castelo da Poeira Eterna ~
```

> **Status: Em desenvolvimento ativo (WIP)**  
> Algumas paredes ainda estão sendo rebocadas com poeira fresca. Novos segredos, áreas e capítulos chegam aos poucos.
>
> **Jogue direto no navegador:** https://lucas-baumann.github.io/dust-box/

---

### O que é isso?

**DUST BOX** é um jogo incremental / *idle RPG* textual em português com estética de terminal ASCII.

Não existe tutorial. Não existe mapa logo de cara. Você só precisa abrir a página, existir por alguns segundos e observar o que acontece quando a poeira começa a se acumular.

Inspirado na filosofia de descoberta progressiva de **Candy Box 2**, o jogo esconde quase tudo de propósito — então este README também não vai estragar suas surpresas.

---

### Como jogar

Você pode jogar online pelo link acima ou rodar localmente sem instalar absolutamente nada:

```bash
git clone https://github.com/Lucas-Baumann/dust-box.git
cd dust-box
```

Depois, basta abrir o arquivo `index.html` no seu navegador favorito.

- **Autosave local:** seu progresso fica salvo automaticamente no `localStorage` (com opção de exportar e importar o código de save quando quiser).
- **Temas e som:** escolha entre estilos de terminal (incluindo efeito CRT) e ligue/desligue os efeitos sonoros retrô no rodapé.
- **Atalhos:** teclas numéricas alternam abas desbloqueadas e `Esc` fecha janelas.

---

### Como foi feito

Sem frameworks, sem build, sem dependências externas — só a boa e velha tríade da web em estado puro:

- **HTML5** (`index.html`) — estrutura minimalista da interface
- **CSS3** (`css/style.css`) — temas por variáveis CSS, efeito CRT e animações leves
- **JavaScript Vanilla** (`js/game.js`) — engine do jogo, arte ASCII, persistência e áudio retrô sintetizado direto na **Web Audio API**
- **GitHub Pages** — deploy automático a cada push na branch `main`

---

> *"O tempo passa, a poeira acumula. Você está estático... mas a sujeira jamais para."*  
> — Rato Filósofo
