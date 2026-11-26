<div align="center">

<pre>
 ____  _   _ ____ _____   ____   _____  __ 
|  _ \| | | / ___|_   _| | __ ) / _ \ \/ / 
| | | | | | \___ \ | |   |  _ \| | | \  /  
| |_| | |_| |___) || |   | |_) | |_| /  \  
|____/ \___/|____/ |_|   |____/ \___/_/\_\ 
       ~ Castelo da Poeira Eterna ~        
</pre>

<p>
  <a href="./README.md"><img src="https://img.shields.io/badge/Portugu%C3%AAs-e8e8e8?style=for-the-badge" alt="Português"></a>
  <a href="./README.en.md"><img src="https://img.shields.io/badge/English-2b2b2b?style=for-the-badge" alt="English"></a>
  <a href="./README.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-2b2b2b?style=for-the-badge" alt="Español"></a>
</p>

<p>
  <a href="https://lucas-baumann.github.io/dust-box/"><img src="https://img.shields.io/badge/JOGAR_NO_NAVEGADOR-111111?style=for-the-badge" alt="Jogar no navegador"></a>
</p>

</div>

> **Status: Em desenvolvimento ativo (WIP)**  
> Algumas paredes ainda estão sendo rebocadas com poeira fresca. Novos segredos, áreas e melhorias continuam chegando.

---

### O que é isso?

**DUST BOX** é um jogo incremental / *idle RPG* textual com estética de terminal ASCII.

Não existe tutorial. Não existe mapa logo de cara. Você só precisa abrir a página, existir por alguns segundos e observar o que acontece quando a poeira começa a se acumular.

Inspirado na filosofia de descoberta progressiva de **Candy Box 2**, o jogo esconde quase tudo de propósito — então este README também não vai estragar suas surpresas.

---

### Como jogar

Jogue online pelo link acima ou rode localmente sem instalar nada:

```bash
git clone https://github.com/Lucas-Baumann/dust-box.git
cd dust-box
```

Depois, basta abrir `index.html` no seu navegador favorito.

- **Autosave local:** progresso salvo automaticamente no `localStorage` (com opção de exportar/importar código de save).
- **Idiomas & `trad. hover`:** jogue em **Português**, **English** ou **Español**, e ative **`trad. hover`** no rodapé para ver a tradução em um balão flutuante ao passar o mouse sobre os textos *(ótimo também para praticar outro idioma!)*.
- **Temas e som:** escolha entre estilos de terminal (incluindo efeito CRT) e ligue/desligue os efeitos sonoros retrô no rodapé.
- **Atalhos:** teclas numéricas trocam abas desbloqueadas e `Esc` fecha janelas.

---

### Como traduzir (Traduções da Comunidade)

Quer adicionar seu idioma no balão flutuante **`trad. hover`** (sem quebrar nenhuma arte ASCII)? É 100% estático e leva 3 passos:

1. **Copie o modelo:** duplique [`lang/community/_template.json`](./lang/community/_template.json) para `lang/community/<codigo>.json` (ex.: `fr.json`, `de.json`, `ja.json`).
2. **Traduza os textos:** mantenha as chaves (esquerda) e marcadores como `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` intactos. Traduções parciais já funcionam!
3. **Registre em [`lang/community/index.json`](./lang/community/index.json) e abra um Pull Request:**
   ```json
   [
     {
       "code": "fr",
       "name": "Français",
       "author": "seu-usuario",
       "file": "fr.json"
     }
   ]
   ```

Mais detalhes em [`TRANSLATING.md`](./TRANSLATING.md). Assim que o PR for aprovado na `main`, o GitHub Pages publica sua tradução automaticamente!

---

### Como foi feito

Sem frameworks, sem build, sem dependências externas — só a boa e velha tríade da web em estado puro:

- **HTML5** (`index.html`) — estrutura minimalista e acessível
- **CSS3** (`css/style.css`) — temas por variáveis CSS, efeito CRT, balão de tradução e animações leves
- **JavaScript Vanilla modular** (`js/i18n.js`, `js/lang/`, `js/data.js`, `js/art.js`, `js/dialogues.js`, `js/puzzles.js`, `js/game.js`) — engine, arte ASCII, persistência e áudio retrô sintetizado via **Web Audio API**
- **GitHub Pages** — deploy automático a cada push na branch `main`

---

> *"O tempo passa, a poeira acumula. Você está estático... mas a sujeira jamais para."*  
> — Rato Filósofo
