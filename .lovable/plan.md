## Objetivo
Exibir o logo fantasma com fundo escuro (imagem enviada) quando o app estiver no tema noturno, e manter o logo atual no tema claro.

## Plano

1. **Copiar o logo escuro** para `public/logo-dark.png` usando o arquivo enviado.

2. **Atualizar o componente `src/components/Logo.tsx`** para detectar o tema ativo via o hook `useTheme` existente e alternar entre:
   - `/logo.png` no modo claro
   - `/logo-dark.png` no modo escuro

3. **Manter o comportamento atual** do componente (tamanhos `sm`/`md`/`lg`, label "CALOTEIROS" em gold, proporções intactas).

### Detalhes técnicos
- O app já possui o hook `useTheme` (`src/hooks/use-theme.ts`) que gerencia a classe `.dark` no `<html>`.
- O componente `<Logo />` será atualizado para consumir esse hook e selecionar a `src` da imagem dinamicamente.
- A transição entre logos será instantânea, acompanhando a troca de tema do app.