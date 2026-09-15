# Implantação do FireGuard na Vercel

## Framework identificado

O FireGuard usa **React 19 + TypeScript + Vite 7 + Tailwind CSS 4**, com roteamento em `wouter`. O repositório também contém um backend **Express 4 + tRPC 11 + Drizzle/MySQL + Manus OAuth**.

## O que está preparado

O projeto agora possui um script `build:vercel` que executa somente o build do frontend Vite. O arquivo `vercel.json` informa à Vercel o framework, o comando de instalação, o comando de build, a pasta de saída `dist/public`, encaminha `/api/*` ao backend atual e aplica o fallback para as rotas SPA. O cliente usa `VITE_API_BASE_URL` para compor a URL tRPC e mantém o fallback local quando a variável não existe. O arquivo `.vercelignore` reduz o contexto enviado excluindo dependências, logs e artefatos locais.

## Limite importante da implantação

A configuração atual prepara uma implantação **frontend-first** na Vercel. O processo `build:vercel` não publica o servidor Express. Portanto, autenticação Manus, `/api/trpc`, `/api/oauth/callback`, banco MySQL/Drizzle, uploads e storage continuam dependendo do backend já hospedado no ambiente atual.

> Não use o comando `build` como comando da Vercel: ele também empacota o servidor Express em `dist/index.js`, mas esse processo não é uma função Vercel. Use exatamente `pnpm build:vercel`.

Para uma implantação funcional com dados e login, o `vercel.json` já encaminha `/api/*` para `https://fireguard-udkrxr4l.manus.space`. Se o domínio do backend mudar, substitua essa URL no arquivo antes de importar o projeto. A alternativa de longo prazo é migrar as rotas Express para Vercel Functions. A migração completa não é feita por este arquivo porque exigiria adaptar contexto de sessão, OAuth, tRPC, uploads e conexão de banco para o runtime serverless da Vercel.

## Arquivos e pastas que devem ser enviados

Envie o repositório inteiro, preservando a estrutura abaixo. A Vercel deve receber o `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `vercel.json`, a pasta `client/`, a pasta `shared/` e os arquivos de configuração TypeScript. Se o backend permanecer fora da Vercel, `server/` e `drizzle/` não são necessários para o build frontend, mas mantê-los no repositório é recomendado para preservar a aplicação completa e permitir uma migração posterior.

| Caminho | Necessário para build frontend | Observação |
|---|---:|---|
| `package.json` | Sim | Inclui `build:vercel`. |
| `pnpm-lock.yaml` | Sim | Permite instalação reprodutível. |
| `vercel.json` | Sim | Configura build, saída e fallback SPA. |
| `vite.config.ts` | Sim | Define a raiz `client/` e saída `dist/public`. |
| `client/` | Sim | Página inicial, rotas, componentes e estilos. |
| `shared/` | Sim | Tipos e constantes importados pelo cliente. |
| `tsconfig.json` | Recomendado | Configuração de TypeScript e aliases. |
| `components.json` | Recomendado | Configuração dos componentes UI. |
| `server/` | Não para frontend-only | Necessário se o backend também for migrado. |
| `drizzle/` | Não para frontend-only | Necessário para schema/migrações do backend. |
| `storage/` | Não para frontend-only | Necessário para o backend de arquivos. |
| `SUPABASE_SETUP.md` | Não | Documentação da integração futura. |
| `AUTH_ONBOARDING.md` | Não | Documentação funcional. |
| `MAP_FALLBACK.md` | Não | Documentação do mapa territorial do MVP. |

Não envie `node_modules/`, `.git/`, `.manus-logs/`, arquivos `.env`, chaves, logs ou artefatos temporários. O `.vercelignore` já exclui os principais itens.

## Configuração na Vercel

Na criação do projeto, importe o repositório e mantenha a raiz na pasta do projeto. Use `pnpm install --frozen-lockfile` como Install Command, `pnpm build:vercel` como Build Command e `dist/public` como Output Directory. O framework pode ser detectado como Vite; o `vercel.json` já declara essa configuração.

As variáveis públicas `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `VITE_FRONTEND_FORGE_API_URL` e `VITE_FRONTEND_FORGE_API_KEY` devem ser cadastradas no ambiente de build caso a página dependa delas. O cliente também aceita `VITE_API_BASE_URL`: deixe-a vazia para usar o rewrite `/api/*` do `vercel.json`, ou defina-a com a origem pública de um backend compatível quando houver CORS e cookies configurados para esse domínio. Não coloque `DATABASE_URL`, `JWT_SECRET`, `BUILT_IN_FORGE_API_KEY` ou qualquer segredo de servidor nas variáveis expostas ao cliente.

## Validação local

Para validar apenas a versão Vercel, execute:

```bash
pnpm install --frozen-lockfile
pnpm build:vercel
```

O resultado deve estar em `dist/public/`, contendo `index.html` e os assets gerados. Para validar a aplicação full-stack atual, use `pnpm build`, que mantém o build do frontend e empacota o servidor Express separadamente.
