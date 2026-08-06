# Corrigir retorno do login com Google para a landing page

## Problema

Na tela de login (`/app`), o botão Google inicia o OAuth com `redirect_uri: window.location.origin`, ou seja, a raiz do site. Depois de autenticar, o Google devolve o usuário para `/`, que é a landing page — parece que "nada aconteceu", mesmo com a sessão criada.

## Solução

1. Em `src/components/AuthScreen.tsx`, usar `redirect_uri: ${window.location.origin}/app` na chamada `lovable.auth.signInWithOAuth("google", ...)`, para o usuário voltar direto ao app.
2. No caso em que o fluxo termina em popup (sem redirect de página inteira), navegar explicitamente para `/app` após a sessão ser definida, em vez de deixar a tela parada.
3. Na landing page (`src/routes/index.tsx` / `Navbar` / `FinalCTA`): se o usuário já tiver sessão ativa, o botão "Entrar" continua indo para `/app`, onde o `Dashboard` é renderizado — sem mudanças necessárias além do item 1.

## Detalhes técnicos

- `redirect_uri` continua sendo uma URL same-origin pública; `/app` não é uma rota protegida por loader, ela apenas renderiza `AuthScreen` ou `Dashboard` conforme a sessão, então é seguro como destino de retorno.
- Manter o tratamento de erro atual com `toast.error` e o `result.redirected` early-return.

Nenhuma mudança de backend, schema ou visual.
