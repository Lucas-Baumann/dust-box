<div align="center">

# Translating DUST BOX

<p>
  <a href="./TRANSLATING.md"><img src="https://img.shields.io/badge/Portugu%C3%AAs-2b2b2b?style=for-the-badge" alt="Português"></a>
  <a href="./TRANSLATING.en.md"><img src="https://img.shields.io/badge/English-e8e8e8?style=for-the-badge" alt="English"></a>
  <a href="./TRANSLATING.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-2b2b2b?style=for-the-badge" alt="Español"></a>
</p>

</div>

**DUST BOX** supports native languages (**Português**, **English**, **Español**) as well as **community hover-bubble translations** (inspired by *Candy Box 2*).

When you enable **`hover trans`** in the game footer, hovering over any translated text displays a floating bubble with the translation right above the original text — without ever breaking ASCII art alignment!

---

## How to contribute a community translation (3 steps)

1. **Copy the template file:**
   Duplicate [`lang/community/_template.json`](./lang/community/_template.json) to `lang/community/<code>.json` (e.g. `fr.json`, `de.json`, `ja.json`).
2. **Translate the values:**
   Keep the keys (left side) untouched and translate only the strings on the right.
   - Keep placeholders like `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` intact.
   - You don't need to translate 100% at once — partial translations already work!
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

Once your PR is merged into `main`, GitHub Pages automatically publishes your translation to all players in the **`hover trans`** selector!

---

[← Back to README](./README.en.md)
