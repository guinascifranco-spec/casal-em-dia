## Substituir o logo do app pela nova imagem (fantasminha)

### O que fazer

1. **Substituir os arquivos de logo/ícone**
   - Sobrescrever `public/logo.png` com a imagem enviada (Cópia de Logo.png).
   - Sobrescrever `public/icons/icon-512.png` (versão 512x512, mesma imagem) — usado no manifest do PWA (`any` e `maskable`).

2. **Adicionar o logo na tela de Login (`src/components/AuthScreen.tsx`)**
   - Inserir o logo acima do título "contas a dois", num contêiner circular/arredondado (ex.: `rounded-2xl` com fundo `bg-secondary` e borda sutil), tamanho ~80px, centralizado.

3. **Garantir cantos suaves nas exibições existentes**
   - `Dashboard.tsx` e `OnboardingScreen.tsx` já exibem o logo dentro de um wrapper `rounded-2xl` — mantém.
   - Confirmar `object-contain` para não distorcer.

### Arquivos alterados
- `public/logo.png` (substituído)
- `public/icons/icon-512.png` (substituído)
- `src/components/AuthScreen.tsx` (adicionar logo na tela de login)

Nenhuma mudança em lógica/rotas/backend.
