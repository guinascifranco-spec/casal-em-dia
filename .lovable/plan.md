## Mudança de fonte para Inter

Substituir a fonte de corpo (body text) de **DM Sans** para **Inter**, mantendo **Playfair Display** para títulos e valores em destaque.

### Arquivos a alterar

- **`src/routes/__root.tsx`** — Atualizar o link do Google Fonts: trocar `family=DM+Sans:wght@400;500;600;700` por `family=Inter:wght@400;500;600;700`.
- **`src/styles.css`** — Trocar o valor da variável `--font-sans` de `"DM Sans"` para `"Inter"`.

Nenhuma outra alteração é necessária. Toda a lógica e funcionalidades existentes permanecem intactas.