## Objetivo
Usar o componente `Logo` existente (imagem do fantasma + texto CALOTEIROS, com suporte light/dark) na landing page.

## Mudanças
1. **Navbar** — Substituir o texto plano "caloteiros" pelo componente `<Logo size="sm" />` (sem redirecionar, mantendo o link para `/`).
2. **Footer** — Substituir o texto plano "caloteiros" pelo componente `<Logo size="sm" />` (com label opcional, conforme melhor encaixe visual).
3. **Ajuste opcional no Hero** — Avaliar se um logo maior no Hero reforça a marca; manter apenas se não poluir visualmente.

## Detalhes técnicos
- Importar `Logo` de `@/components/Logo` em `Navbar.tsx` e `Footer.tsx`.
- O componente `Logo` já lida com troca automática de `/logo.png` ↔ `/logo-dark.png` via classes `dark:` do Tailwind.
- Nenhuma alteração no componente `Logo` em si.

## Arquivos afetados
- `src/components/landing/Navbar.tsx`
- `src/components/landing/Footer.tsx`
- (opcional) `src/components/landing/Hero.tsx`