# Traduzindo o DUST BOX / Translating DUST BOX

O **DUST BOX** suporta idiomas nativos (**Português**, **English**, **Español**) e **traduções da comunidade em balãozinho de hover** (inspirado em *Candy Box 2*).

Ao ativar **`trad. hover`** no rodapé do jogo, passar o mouse sobre qualquer texto traduzido mostra um balão flutuante com a tradução logo acima do texto original — sem nunca quebrar a arte ASCII!

---

## Como contribuir uma tradução da comunidade (3 passos)

1. **Copie o arquivo modelo:**
   Duplique `lang/community/_template.json` para `lang/community/<codigo>.json` (ex.: `fr.json`, `de.json`, `ja.json`).
2. **Traduza os valores:**
   Mantenha as chaves (à esquerda) intactas e traduza apenas os textos à direita.
   - Mantenha marcadores como `{v}`, `{n}`, `{cur}`, `{tot}`, `{name}` intactos.
   - Você não precisa traduzir 100% de uma vez — traduções parciais já funcionam!
3. **Registre em `lang/community/index.json` e abra um Pull Request:**
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
