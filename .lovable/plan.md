## Caloteiros — Controle Financeiro para Casais

App MicroSaaS minimalista em PT-BR (BRL) para um casal registrar gastos e ver automaticamente quem deve para quem.

### Stack
- TanStack Start (React 19) + Tailwind v4 + shadcn/ui
- Lovable Cloud (Supabase) para auth e dados
- Fonte: Inter (sem serifa, estética fintech flat)

### 1. Backend (Lovable Cloud)

**Ativar Lovable Cloud** e criar schema:

- `couples` — espaço compartilhado do casal
  - `id uuid pk`, `name text`, `created_at`
- `couple_members` — vincula 2 usuários a um casal
  - `couple_id uuid fk`, `user_id uuid fk auth.users`, `display_name text`, `joined_at`
  - unique(user_id) — um user só pertence a um casal
- `expenses`
  - `id uuid pk`, `couple_id uuid fk`, `description text`, `amount numeric(12,2)`,
    `paid_by uuid fk auth.users` (quem pagou),
    `split_type text check in ('split','transfer')` — split = 50/50, transfer = 100% pro outro
  - `created_at timestamptz`
- `invites` (código curto) — para o segundo parceiro entrar no casal existente

**RLS**: usuários só leem/escrevem linhas onde pertencem ao `couple_id`. Função `security definer` `get_user_couple_id(uid)` para evitar recursão.

### 2. Auth & Onboarding
- Login email/senha + Google
- Após signup: tela "Criar casal" (gera código de convite) ou "Entrar com código"
- Pede nome de exibição (Fulano / Ciclana)
- Rota `_authenticated` protege o app

### 3. Dashboard (rota `/`)

**Componente Veredito** (hero card no topo):
- Calcula saldo iterando expenses:
  - `split`: devedor = o que NÃO pagou; valor = amount/2
  - `transfer`: devedor = o que NÃO pagou; valor = amount inteiro
- Exibe: `Fulano deve R$ 123,45 para Ciclana` ou `Vocês estão quites ✓`
- Tipografia grande, peso médio, muito whitespace

**Lista de lançamentos** abaixo:
- Cards sutis (border 1px, sem sombra pesada)
- Mostra: descrição, valor BRL, quem pagou, badge do tipo (Dividido / Repasse), data relativa
- Swipe/menu para deletar (apenas autor)

### 4. Formulário de Inserção Rápida
- Botão flutuante `+ Novo gasto` → Sheet/Dialog
- Campos:
  - Descrição (text)
  - Valor (input com máscara R$)
  - Quem pagou (toggle entre os 2 nomes)
  - Tipo: toggle `Dividir 50/50` | `Repasse 100%`
- Validação Zod, salva e fecha; lista atualiza via TanStack Query

### 5. Design System (styles.css)
- Paleta flat: off-white background, ink quase-preto, accent verde-menta sutil para positivo / coral para negativo
- Tokens oklch: `--background`, `--foreground`, `--muted`, `--border`, `--accent`, `--positive`, `--negative`
- Sem gradientes, sem neumorphism; bordas 1px, radius médio, espaçamento generoso

### Estrutura de arquivos
```text
src/routes/
  __root.tsx
  index.tsx              → redireciona para /app ou /login
  login.tsx
  onboarding.tsx         → criar/entrar em casal
  _authenticated.tsx     → guard
  _authenticated/
    app.tsx              → dashboard (veredito + lista)
src/components/
  Verdict.tsx
  ExpenseList.tsx
  ExpenseFormSheet.tsx
  ExpenseCard.tsx
src/lib/
  expenses.functions.ts  → server fns (list/create/delete)
  couple.functions.ts    → onboarding (criar casal, aceitar convite)
  balance.ts             → cálculo puro do veredito
  format.ts              → BRL formatter
```

### Detalhes técnicos
- Cálculo do veredito feito client-side a partir das expenses já carregadas (rápido, reativo)
- TanStack Query com `ensureQueryData` no loader; `defaultPreloadStaleTime: 0` já está setado
- Server functions usam `requireSupabaseAuth` para respeitar RLS
- BRL: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`

### Perguntas antes de implementar
1. Login: email/senha + Google, ou só email/senha?
2. Permitir editar gasto, ou só criar/excluir?
3. Quero adicionar uma ação "Quitar saldo" (registra um repasse que zera o veredito)?

Posso ajustar conforme suas respostas e seguir para a implementação.