## Objetivo

Substituir o arquivo `public/logo.png` pela nova imagem do fantasma anexada e padronizar a apresentação visual: a imagem do logo **acima** e o texto **"CALOTEIROS"** logo **abaixo**, em todos os locais onde o logo aparece atualmente.

## Locais afetados

A imagem `/logo.png` já é usada nestes pontos — todos receberão o mesmo tratamento (imagem + texto abaixo):

1. `src/components/AuthScreen.tsx` — tela de login
2. `src/components/Dashboard.tsx` — sidebar desktop + header mobile
3. `src/components/OnboardingScreen.tsx` — header e bloco de boas-vindas
4. `public/logo.png` — arquivo binário substituído pela imagem anexada
5. `public/icons/icon-512.png` — substituído pela mesma imagem (usado como ícone PWA)

## Mudanças

### 1. Arquivo de imagem
- Copiar `user-uploads://Cópia_de_Logo_1.png` para `public/logo.png` e `public/icons/icon-512.png`, sobrescrevendo os atuais.
- A imagem tem fundo claro/transparente e funciona nos dois temas (claro/escuro) — sem necessidade de versão alternativa.

### 2. Componente `<Logo />` reutilizável
Criar `src/components/Logo.tsx` para padronizar o conjunto **imagem + texto "CALOTEIROS" abaixo**, com variantes de tamanho:

```text
┌──────────┐
│  [img]   │   ← logo do fantasma, bordas arredondadas
└──────────┘
 CALOTEIROS    ← texto em uppercase, tracking-widest, cor gold
```

Props:
- `size`: `"sm" | "md" | "lg"` (controla tamanho da imagem e da fonte)
- `showLabel`: `boolean` (default `true`) — para casos onde só queremos o ícone
- `className`: extensão opcional

### 3. Substituições por arquivo
- **AuthScreen**: o bloco atual `<div>img + p "caloteiros" + h1 "contas a dois"</div>` vira `<Logo size="lg" />` seguido do título "contas a dois" (mantido).
- **Dashboard sidebar (desktop)**: substituir `img + p "caloteiros"` por `<Logo size="md" />` ao lado do nome do casal.
- **Dashboard header (mobile)**: substituir por `<Logo size="sm" />`.
- **OnboardingScreen**: o pequeno header e o bloco de boas-vindas usam `<Logo size="sm" />` e `<Logo size="md" />`.

### 4. Tema claro / escuro
A imagem é colorida com contornos escuros sobre fundo claro. Para garantir legibilidade no dark mode, o container do logo manterá o fundo `bg-secondary` (já existente) e bordas arredondadas suaves — assim a imagem fica em um "cartão" claro mesmo no tema escuro. Proporção preservada via `object-contain`.

## Detalhes técnicos

- Sem mudança em rotas, estado, lógica de negócio ou queries.
- Sem novas dependências.
- O arquivo `public/logo.png` referenciado em `__root.tsx` (favicon, og:image, apple-touch-icon) é automaticamente atualizado pela substituição do binário.
