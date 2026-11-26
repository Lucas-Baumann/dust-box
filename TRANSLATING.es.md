<div align="center">

# Traduciendo DUST BOX

<p>
  <a href="./TRANSLATING.md"><img src="https://img.shields.io/badge/Portugu%C3%AAs-2b2b2b?style=for-the-badge" alt="Português"></a>
  <a href="./TRANSLATING.en.md"><img src="https://img.shields.io/badge/English-2b2b2b?style=for-the-badge" alt="English"></a>
  <a href="./TRANSLATING.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-e8e8e8?style=for-the-badge" alt="Español"></a>
</p>

</div>

**DUST BOX** soporta idiomas nativos (**Português**, **English**, **Español**) y **traducciones de la comunidad en globo flotante al pasar el cursor** (inspirado en *Candy Box 2*).

Al activar **`trad. hover`** en el pie de página del juego, pasar el ratón sobre cualquier texto traducido muestra un globo flotante con la traducción justo encima del texto original — ¡sin romper nunca el arte ASCII!

---

## Cómo contribuir con una traducción de la comunidad (3 pasos)

1. **Copia el archivo plantilla:**
   Duplica [`lang/community/_template.json`](./lang/community/_template.json) a `lang/community/<codigo>.json` (ej.: `fr.json`, `de.json`, `ja.json`).
2. **Traduce los valores:**
   Mantén intactas las claves (izquierda) y traduce solo los textos de la derecha.
   - Conserva marcadores como `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` sin modificar.
   - No necesitas traducir el 100% de una vez — ¡las traducciones parciales ya funcionan!
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

En cuanto se apruebe el PR en `main`, GitHub Pages publicará automáticamente tu traducción para todos los jugadores en el selector **`trad. hover`**.

---

[← Volver al README](./README.es.md)
