# Landing page do caloteiros

Criar uma landing page pública em `/` (substituindo a tela atual de auth/dashboard como rota raiz) que segue a identidade visual do app, com dark mode completo e seções estruturadas conforme briefing.

## Rota e estrutura

- Mover a tela atual de `/` (que decide entre auth/onboarding/dashboard) para `/app`, criando `src/routes/app.tsx`.
- Substituir `src/routes/index.tsx` por uma landing page pública (SSR-friendly, sem checagem de sessão).
- Header da landing tem CTA "Entrar" / "Começar grátis" que levam a `/app`.
- `head()` da rota com title, description, og:title, og:description em português, focado em "finanças compartilhadas para casais".

## Design system (ajustes em `src/styles.css`)

- Light mode base: `--background: #F9F7F4` (bege quente), `--foreground` em marrom-escuro suave.
- Dark mode base: `--background: #1C1A18`, `--card: #2A2825`, `--foreground: #F0EDE8`.
- Acento: verde-sage discreto (`oklch` equivalente a ~#7A9B76), funcional nos dois modos.
- Bordas suaves: confirmar `--radius` generoso (1rem+).
- Adicionar `transition-colors duration-300` na raiz para suavizar troca de tema.
- Tipografia: manter sans-serif atual, sem serifa, com tracking confortável.

## Dark mode

- Já existe `src/hooks/use-theme.ts` e `ThemeToggle.tsx` — reutilizar.
- Garantir que o hook:
  - Lê `localStorage` primeiro, fallback para `prefers-color-scheme`.
  - Aplica classe `dark` no `<html>` antes do primeiro paint (script inline em `__root.tsx` head para evitar flash).
- Toggle (ícone sol/lua) no canto direito da navbar da landing.

## Seções da landing (componentes em `src/components/landing/`)

1. **Navbar** — logo `caloteiros` (lowercase, sem o componente `<Logo />` com imagem — texto puro com tracking) + `ThemeToggle` + botão "Entrar".
2. **Hero** — headline, subheadline, CTA primário (verde-sage) "Começar grátis" → `/app`, CTA secundário "Ver como funciona ↓" com scroll suave para `#como-funciona`. Mockup ilustrativo lateral (card simulando UI do app com saldo/divisão — feito em puro JSX/Tailwind, sem foto stock).
3. **Problema** (`#problema`) — título "Você vive isso?" + 3 cards com as dores listadas.
4. **Como funciona** (`#como-funciona`) — título "Simples assim" + 3 passos com ícones lucide (Users, Receipt, Scale).
5. **Features** (`#features`) — grid 2x2 com os 4 diferenciais (divisão proporcional, histórico, sem julgamento, qualquer modelo de conta).
6. **CTA final** — fundo `bg-muted` (light: bege mais escuro; dark: `#252320` via token), título e botão "Criar conta grátis".
7. **Footer** — `caloteiros` + tagline + link privacidade (placeholder `/privacidade` ou `#`).

## Animações

- Fade-in sutil ao entrar no viewport via `IntersectionObserver` em um hook leve `useInView`, aplicando classe `animate-fade-in` existente. Sem libs adicionais.
- Scroll suave: `html { scroll-behavior: smooth }` em `styles.css`.

## Mockup do app (sem foto stock)

- Card arredondado mostrando: "Junho 2026", linha "Ana deve a João", valor destacado em verde-sage, mini lista de despesas. Pura UI Tailwind, responde ao tema.

## Responsividade

- Mobile-first; hero em coluna no mobile, 2 colunas a partir de `md:`.
- Navbar colapsa para apenas logo + toggle + CTA no mobile.

## Detalhes técnicos

- Tailwind v4 já configurado — usar `@theme inline` existente, adicionar tokens novos se necessário em `src/styles.css`.
- Sem `tailwind.config.js` (projeto é v4) — o briefing menciona `darkMode: 'class'`, mas isso é v3; em v4 usamos `@custom-variant dark` (já presente no template).
- Persistência de tema e anti-flash via script inline no `<head>` do `__root.tsx`.
- Nenhum backend novo; apenas frontend.

## Arquivos a criar/editar

- Editar: `src/routes/index.tsx` (vira landing).
- Criar: `src/routes/app.tsx` (move conteúdo atual de index).
- Criar: `src/components/landing/Navbar.tsx`, `Hero.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `Features.tsx`, `FinalCTA.tsx`, `Footer.tsx`, `AppMockup.tsx`.
- Criar: `src/hooks/use-in-view.ts`.
- Editar: `src/styles.css` (tokens dark warm, transição global).
- Editar: `src/routes/__root.tsx` (script anti-flash de tema + meta tags da landing).
