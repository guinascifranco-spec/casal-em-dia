## Nova paleta de cores

Substituir a paleta atual (preto/rosê/dourado) por uma identidade clara e natural, com fundo creme como base padrão.

### Mapeamento estratégico

| Cor | Hex | Uso |
|---|---|---|
| Creme | `#F9F7F4` | Fundo principal (`--background`) — base de toda a interface |
| Azul-petróleo | `#1A2F3B` | Texto principal, títulos, sidebar, valores monetários grandes (`--foreground`, `--card-foreground`, sidebar) |
| Terracota | `#D9745B` | Cor primária / CTA / acentos de destaque, gradiente luxe, anel de foco (`--primary`, `--gold` reaproveitado como acento quente, botões principais, veredito) |
| Sage | `#87A987` | Cor positiva (quitado / saldo a receber), badges de sucesso (`--positive`, `--rose` reaproveitado como acento frio secundário) |

Distribuição:
- **Fundo `#F9F7F4`**: app inteiro, inclusive sidebar com leve variação (off-white levemente mais escuro para separar).
- **Cards**: branco puro `#FFFFFF` sobre o creme, com borda sutil `#1A2F3B` a 8% para definir.
- **Texto**: `#1A2F3B` para títulos/valores, com versão a 60% para texto secundário.
- **Terracota `#D9745B`**: botão principal "Adicionar", gradiente do card de Veredito, valor do débito, código de convite, ícones Lucide principais, anel de foco.
- **Sage `#87A987`**: estado "Vocês estão quites", saldo positivo (credor), confirmações (toast success).
- **Destrutivo**: manter um vermelho derivado do terracota mais saturado para erros reais (excluir).

### Tema escuro

Como o app já tem toggle dark/light, vou:
- Tornar o **modo claro o padrão** (já que o pedido foca no fundo creme).
- Manter o modo escuro funcional: fundo `#1A2F3B` (o azul-petróleo), cards levemente mais claros, mesmos acentos terracota/sage. Texto creme `#F9F7F4`.
- Atualizar a meta tag `theme-color` e o manifesto PWA para `#F9F7F4`.

### Arquivos alterados

- `src/styles.css` — reescrever blocos `:root` e `.light` (inverter: `:root` = claro, `.dark` = escuro), atualizar `--gradient-luxe`, sombras mais suaves, scrollbar terracota.
- `src/hooks/use-theme.ts` — default `"light"` em vez de `"dark"`; atualizar cores do `theme-color`.
- `src/routes/__root.tsx` — script inline anti-flicker passa a aplicar `light` por padrão; `<meta name="theme-color">` inicial = `#F9F7F4`.
- `public/manifest.webmanifest` — `theme_color` e `background_color` para `#F9F7F4`.
- `src/components/Verdict.tsx` — gradiente do blur ambient ajustado para terracota→sage; classes de cor positivo/negativo usam novos tokens (já são tokens, só recebem novos valores).
- `src/components/Dashboard.tsx` — bordas do header/sidebar passam de `rgba(255,255,255,0.06)` para token `--border` (para funcionar nos dois temas).
- `src/components/ui/button.tsx` — variante `outline` usa `--border` em vez de `rgba(255,255,255,0.1)` hardcoded.
- `src/components/ui/input.tsx` — borda usa token `--border` em vez de `#2E2E40` hardcoded.

Nenhuma lógica de negócio é alterada — apenas tokens visuais e remoção de cores hardcoded que quebrariam no tema claro.
