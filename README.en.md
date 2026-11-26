<div align="center">

<pre>
 ____  _   _ ____ _____   ____   _____  __ 
|  _ \| | | / ___|_   _| | __ ) / _ \ \/ / 
| | | | | | \___ \ | |   |  _ \| | | \  /  
| |_| | |_| |___) || |   | |_) | |_| /  \  
|____/ \___/|____/ |_|   |____/ \___/_/\_\ 
        ~ Castle of Eternal Dust ~         
</pre>

<p>
  <a href="./README.md"><img src="https://img.shields.io/badge/Portugu%C3%AAs-2b2b2b?style=for-the-badge" alt="Português"></a>
  <a href="./README.en.md"><img src="https://img.shields.io/badge/English-e8e8e8?style=for-the-badge" alt="English"></a>
  <a href="./README.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-2b2b2b?style=for-the-badge" alt="Español"></a>
</p>

<p>
  <a href="https://lucas-baumann.github.io/dust-box/"><img src="https://img.shields.io/badge/PLAY_IN_BROWSER-111111?style=for-the-badge" alt="Play in browser"></a>
</p>

</div>

> **Status: Work in Progress (WIP)**  
> A few walls are still being plastered with fresh dust. New secrets, tweaks, and surprises keep rolling in.

---

### What is this?

**DUST BOX** is a text-based incremental / *idle RPG* with a monochrome ASCII terminal aesthetic.

There is no tutorial. There is no map at the start. You just open the page, exist for a few seconds, and watch what happens when dust starts to pile up.

Inspired by the progressive-discovery philosophy of **Candy Box 2**, the game hides almost everything on purpose — so this README won't spoil your surprises either.

---

### How to play

Play online via the link above, or run it locally with zero setup:

```bash
git clone https://github.com/Lucas-Baumann/dust-box.git
cd dust-box
```

Then simply open `index.html` in your favorite browser.

- **Local autosave:** progress saves automatically to `localStorage` (with Export/Import save codes).
- **Languages & `hover trans`:** play in **Português**, **English**, or **Español**, and toggle **`hover trans`** in the footer to display a floating translation bubble above texts on hover *(great for language learning too!)*.
- **Themes & sound:** switch between terminal color themes (including CRT scanlines) and toggle synthesized retro sound effects in the footer.
- **Shortcuts:** number keys switch unlocked tabs and `Esc` closes modals.

---

### How to contribute a translation (Community Hover Packs)

Want to add your language to the **`hover trans`** bubble (without ever breaking ASCII art alignment)? It is 100% static and takes 3 steps:

1. **Copy the template:** duplicate [`lang/community/_template.json`](./lang/community/_template.json) to `lang/community/<code>.json` (e.g. `fr.json`, `de.json`, `ja.json`).
2. **Translate the values:** keep the keys (left side) and placeholders like `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` intact. Partial translations already work!
3. **Register it in [`lang/community/index.json`](./lang/community/index.json) and open a Pull Request:**
   ```json
   [
     {
       "code": "fr",
       "name": "Français",
       "author": "your-handle",
       "file": "fr.json"
     }
   ]
   ```

See [`TRANSLATING.en.md`](./TRANSLATING.en.md) for details. Once your PR is merged into `main`, GitHub Pages publishes it automatically!

---

### How it was built

No frameworks, no build step, no external dependencies — just pure vanilla web tech:

- **HTML5** (`index.html`) — minimalist interface structure
- **CSS3** (`css/style.css`) — CSS-variable themes, CRT effect, hover translation bubble, and lightweight animations
- **Modular Vanilla JavaScript** (`js/i18n.js`, `js/lang/`, `js/data.js`, `js/art.js`, `js/dialogues.js`, `js/puzzles.js`, `js/game.js`) — engine, ASCII art, persistence, and retro audio synthesized via the **Web Audio API**
- **GitHub Pages** — automatic deployment on every push to `main`

---

> *"Time passes, dust gathers. You remain still... yet the grime never stops."*  
> — Philosopher Rat
