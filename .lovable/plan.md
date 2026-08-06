# Redesign visual completo — Caloteiros

Nova identidade "Neon Mint": grafite azulado profundo, verde menta vivo como cor primária autoral, tipografia Sora (títulos e valores) + Manrope (texto). Apenas a camada visual muda — rotas, lógica, Supabase e Stripe permanecem intactos.

## Design system

- Paleta base: `#0d1b2a` (grafite azulado), `#1b4332` (verde profundo), `#2dd4a8` (menta primária), `#73ffb8` (menta clara / glow).
- Neutros com temperatura fria consistente (nada de cinza puro), derivados do grafite.
- Light mode: fundo off-white levemente frio, texto grafite, menta como acento sólido.
- Dark mode: fundo grafite real com camadas de superfície distintas (não inversão), menta como luz.
- Semânticos: positivo = menta, negativo = coral quente (contraponto legível nas duas versões).
- Tipografia: Sora para headings e valores monetários (tabular-nums, tracking apertado, peso alto); Manrope para corpo e captions. Escala clara heading / body / caption.
- Tokens novos para sombras suaves, glow de menta, raios e bordas sutis.

## Landing page

- Hero split: copy e CTA à esquerda, mockup do app à direita, com halo de menta ao fundo.
- Seções: problema, como funciona, features (cards com ícones em menta), **pricing novo** (Free vs Pro R$ 9,99/mês, card Pro em destaque com borda menta e selo), CTA final, footer.
- Navbar e footer repaginados, com toggle claro/escuro consistente.
- Animações de entrada mantidas (Reveal), com timing mais suave.

## Dashboard interno

- Navegação passa a **top bar enxuta** (logo, seletor de grupo, seletor de período, tema, conta), conteúdo centrado em coluna de largura confortável — a sidebar atual é substituída visualmente, sem mudar as ações disponíveis.
- **Veredito (quem deve a quem)**: elemento mais impactante da tela — bloco grande com gradiente/glow de menta, avatares/iniciais dos dois, seta direcional e valor em Sora display gigante.
- **Cards de lançamento**: hierarquia clara — descrição em destaque, pagador e data em caption, valor alinhado à direita em tabular, chip de tipo (Dividido / Repasse) discreto, ação de excluir revelada no hover.
- **Empty states** elegantes: ilustração/marca em traço leve, título curto e CTA direto.
- **Formulários e sheets** (novo gasto, criar grupo, criar período): inputs com borda sutil, foco em anel menta, botões com microinterações (leve escala e sombra).
- **Paywall / upgrade Pro**: modal em tom de convite — benefícios listados, preço em destaque, sem linguagem de bloqueio.
- Telas de auth e onboarding alinhadas à mesma identidade.

## Detalhes técnicos

- `src/styles.css`: substituição completa dos tokens em `:root` e `.dark` (oklch), novos utilitários (`card-luxe`, gradientes, glow, superfícies) mantendo os nomes de classes já usados para não quebrar componentes.
- `src/routes/__root.tsx`: trocar os `<link>` de fontes para Sora + Manrope; manter o script anti-flash de tema.
- Componentes tocados apenas na camada de apresentação: `Verdict`, `Dashboard`, `ExpenseList`, `ExpenseFormSheet`, `CreateGroupSheet`, `CreatePeriodSheet`, `GroupSwitcher`, `PeriodSwitcher`, `UpgradeModal`, `AuthScreen`, `OnboardingScreen`, `InstallPrompt`, `Logo`, `ThemeToggle`, `ui/button`, `ui/input`, e todos em `src/components/landing/` (incluindo um novo `Pricing.tsx`).
- Props, nomes de componentes, hooks, server functions e rotas permanecem como estão.
