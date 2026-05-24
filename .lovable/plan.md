# Plano: 3 novas funcionalidades

## 1. Múltiplos grupos (ex: "Gastos Junho", "Gastos Julho")

Hoje cada usuário só pode estar em **um casal**. Para suportar vários grupos (mensais ou por tema), preciso mudar o modelo:

**Banco (migração):**
- Permitir múltiplas linhas em `couple_members` por `user_id` (já permite, mas várias funções usam `.maybeSingle()` assumindo 1).
- Remover/ajustar a policy `create couple if none` e a checagem "Você já está em um casal" em `createCouple` / `joinCouple`.
- Adicionar coluna `active_couple_id` em uma nova tabela `user_preferences` (ou usar `localStorage`) para lembrar qual grupo está selecionado.

**Server functions (`couple.functions.ts`, `expenses.functions.ts`):**
- Nova `listMyCouples()` → retorna todos os grupos do usuário.
- `getMyCoupleState`, `getMyInvite`, `listExpenses`, `createExpense` passam a aceitar `coupleId` como input (e validam que o usuário é membro).
- Nova `createCouple` aceita criar mesmo já tendo grupo.

**UI:**
- Seletor de grupo no topo da sidebar/header (dropdown com lista + botão "+ Novo grupo").
- Modal/sheet "Criar novo grupo" reaproveitando o fluxo de `OnboardingScreen` (nome do grupo + seu display name).
- Persistir grupo ativo em `localStorage`.

## 2. Modo noturno / diurno

- Adicionar variáveis de tema **claro** em `src/styles.css` dentro de `:root` (mantendo o atual como `.dark`). Paleta clara: fundo creme `#F0EDE8`, cartões brancos, mantendo rosê e dourado como acentos.
- Hook `useTheme()` lendo/escrevendo em `localStorage` e aplicando a classe `dark` no `<html>`.
- Botão toggle (ícone Sun/Moon do lucide) no header mobile e na sidebar desktop, ao lado do "Sair".
- Default: escuro (preserva visual atual).

## 3. Instalação PWA

⚠️ Aviso importante: PWA com service worker tem limitações no preview do Lovable (iframe). A instalação só funciona de verdade na URL publicada (`mepagacaloteira.lovable.app`).

Abordagem mínima e segura (sem `vite-plugin-pwa`, sem service worker, sem cache offline):
- Criar `public/manifest.webmanifest` com `name: "Caloteiros"`, `short_name`, `display: "standalone"`, cores do tema (`#0F0F14` / `#E8A0BF`), `start_url: "/"`.
- Gerar ícones 192px e 512px (rosê + dourado, "C" em Playfair) em `public/icons/`.
- Adicionar `<link rel="manifest">` e meta tags Apple touch icon / theme-color no `__root.tsx`.
- Componente `InstallPrompt` que escuta o evento `beforeinstallprompt` e mostra um botão discreto "Instalar app" no dashboard (oculto se já instalado ou se evento não disparar — ex: iOS, que só permite "Adicionar à tela de início" manualmente; nesse caso mostro instruções).

Sem service worker = sem offline, mas é instalável e estável dentro do editor.

---

## Arquivos afetados

- `supabase/migrations/...` (nova migração)
- `src/lib/couple.functions.ts`, `src/lib/expenses.functions.ts`
- `src/components/Dashboard.tsx`, `src/components/OnboardingScreen.tsx`, `src/components/ExpenseFormSheet.tsx`, `src/components/ExpenseList.tsx`, `src/components/Verdict.tsx`
- Novo: `src/components/GroupSwitcher.tsx`, `src/components/CreateGroupSheet.tsx`, `src/components/ThemeToggle.tsx`, `src/components/InstallPrompt.tsx`
- Novo: `src/hooks/use-theme.ts`, `src/hooks/use-active-couple.ts`
- `src/styles.css` (tema claro), `src/routes/__root.tsx` (manifest + meta)
- `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`

## Pontos a confirmar

1. Quer realmente PWA mínimo (instalável, sem offline) ou PWA completo com service worker (mais arriscado no preview)?
2. Ao trocar de grupo, lançamentos antigos ficam visíveis no grupo correspondente, certo? (Cada grupo tem seus próprios `expenses` — nada é migrado.)
