<div align="center">

<h1>DUST BOX_</h1>
<p><em>~ Castillo del Polvo Eterno ~</em></p>

<p>
  <a href="./README.md"><img src="https://img.shields.io/badge/Portugu%C3%AAs-2b2b2b?style=for-the-badge" alt="Português"></a>
  <a href="./README.en.md"><img src="https://img.shields.io/badge/English-2b2b2b?style=for-the-badge" alt="English"></a>
  <a href="./README.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-e8e8e8?style=for-the-badge" alt="Español"></a>
</p>

<p>
  <a href="https://lucas-baumann.github.io/dust-box/"><img src="https://img.shields.io/badge/JUGAR_EN_EL_NAVEGADOR-111111?style=for-the-badge" alt="Jugar en el navegador"></a>
</p>

</div>

```text
 ____  _   _ ____ _____   ____   _____  __
|  _ \| | | / ___|_   _| | __ ) / _ \ \/ /
| | | | | | \___ \ | |   |  _ \| | | \  / 
| |_| | |_| |___) || |   | |_) | |_| /  \ 
|____/ \___/|____/ |_|   |____/ \___/_/\_\
       ~ Castillo del Polvo Eterno ~
```

> **Estado: En desarrollo activo (WIP)**  
> Algunas paredes todavía se están revocando con polvo fresco. Nuevos secretos y mejoras siguen llegando.

---

### ¿Qué es esto?

**DUST BOX** es un juego incremental / *idle RPG* textual con estética de terminal ASCII.

No hay tutorial. No hay mapa al principio. Solo tienes que abrir la página, existir durante unos segundos y observar qué ocurre cuando el polvo empieza a acumularse.

Inspirado en la filosofía de descubrimiento progresivo de **Candy Box 2**, el juego oculta casi todo a propósito — así que este README tampoco arruinará tus sorpresas.

---

### Cómo jugar

Juega en línea desde el enlace de arriba o ejecútalo localmente sin instalar nada:

```bash
git clone https://github.com/Lucas-Baumann/dust-box.git
cd dust-box
```

Luego simplemente abre `index.html` en tu navegador favorito.

- **Autoguardado local:** tu progreso se guarda automáticamente en `localStorage` (con opción de exportar/importar código de guardado).
- **Idiomas y `trad. hover`:** juega en **Português**, **English** o **Español**, y activa **`trad. hover`** en el pie de página para ver la traducción en un globo flotante al pasar el cursor sobre los textos *(¡genial también para practicar otro idioma!)*.
- **Temas y sonido:** elige entre varios estilos de terminal (incluyendo efecto CRT) y activa/desactiva los sonidos retro en el pie de página.
- **Atajos:** las teclas numéricas cambian de pestaña y `Esc` cierra ventanas.

---

### Cómo traducir (Traducciones de la Comunidad)

¿Quieres añadir tu idioma al globo flotante **`trad. hover`** (sin romper nunca el arte ASCII)? Es 100% estático y toma 3 pasos:

1. **Copia la plantilla:** duplica [`lang/community/_template.json`](./lang/community/_template.json) como `lang/community/<codigo>.json` (ej.: `fr.json`, `de.json`, `ja.json`).
2. **Traduce los textos:** mantén las claves (izquierda) y marcadores como `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` intactos. ¡Las traducciones parciales ya funcionan!
3. **Regístralo en [`lang/community/index.json`](./lang/community/index.json) y abre un Pull Request:**
   ```json
   [
     {
       "code": "fr",
       "name": "Français",
       "author": "tu-usuario",
       "file": "fr.json"
     }
   ]
   ```

Más detalles en [`TRANSLATING.md`](./TRANSLATING.md). En cuanto se apruebe el PR en `main`, GitHub Pages publicará tu traducción automáticamente.

---

### Cómo fue hecho

Sin frameworks, sin build, sin dependencias externas — solo la clásica tríada web en estado puro:

- **HTML5** (`index.html`) — estructura minimalista
- **CSS3** (`css/style.css`) — temas con variables CSS, efecto CRT, globo de traducción y animaciones ligeras
- **JavaScript Vanilla modular** (`js/i18n.js`, `js/lang/`, `js/data.js`, `js/art.js`, `js/dialogues.js`, `js/puzzles.js`, `js/game.js`) — motor, arte ASCII, persistencia y audio retro sintetizado con **Web Audio API**
- **GitHub Pages** — despliegue automático en cada push a `main`

---

> *"El tiempo pasa, el polvo se acumula. Tú estás quieto... pero la suciedad jamás para."*  
> — Ratón Filósofo
