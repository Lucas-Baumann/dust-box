<div align="center">

# Traduzindo o DUST BOX

<p>
  <a href="./TRANSLATING.md"><img src="https://img.shields.io/badge/Portugu%C3%AAs-e8e8e8?style=for-the-badge" alt="Português"></a>
  <a href="./TRANSLATING.en.md"><img src="https://img.shields.io/badge/English-2b2b2b?style=for-the-badge" alt="English"></a>
  <a href="./TRANSLATING.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-2b2b2b?style=for-the-badge" alt="Español"></a>
</p>

</div>

O **DUST BOX** suporta idiomas nativos (**Português**, **English**, **Español**) e **traduções da comunidade em balão flutuante no hover** (inspirado em *Candy Box 2*).

Ao ativar **`trad. hover`** no rodapé do jogo, passar o mouse sobre qualquer texto traduzido mostra um balão flutuante com a tradução logo acima do texto original — sem nunca quebrar a arte ASCII!

---

## Como contribuir uma tradução da comunidade (3 passos)

1. **Copie o arquivo modelo:**
   Duplique [`lang/community/_template.json`](./lang/community/_template.json) para `lang/community/<codigo>.json` (ex.: `fr.json`, `de.json`, `ja.json`).
2. **Traduza os valores:**
   Mantenha as chaves (à esquerda) intactas e traduza apenas os textos à direita.
   - Mantenha marcadores como `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` intactos.
   - Você não precisa traduzir 100% de uma vez — traduções parciais já funcionam!
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

Assim que o PR for aceito na `main`, o GitHub Pages publica automaticamente sua tradução para todos os jogadores no seletor **`trad. hover`**!

---

[← Voltar ao README](./README.md)
