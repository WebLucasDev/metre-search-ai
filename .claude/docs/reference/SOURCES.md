# Fontes de documentação (referência local)

Este diretório guarda cópias em markdown de docs externas para o Claude Code consultar sob
demanda. Não edite o conteúdo; só atualize quando necessário.

> **Dica de contexto:** NÃO use `@import` para esses arquivos no `CLAUDE.md`. Eles são
> grandes e carregariam em toda sessão, consumindo o contexto. Deixe o Claude Code lê-los
> quando a tarefa pedir.

## Como pegar a versão markdown

### Cloudflare (Workers, Wrangler, AI Search, R2, etc.)
Toda página de docs da Cloudflare tem versão markdown:
- Acrescente `index.md` ao fim da URL.
  Ex.: `https://developers.cloudflare.com/ai-search/usage/workers-binding/index.md`
- Índice por produto (lista todas as páginas): ex. `https://developers.cloudflare.com/workers/llms.txt`
- Índice geral de todos os produtos: `https://developers.cloudflare.com/llms.txt`

### Discord
O fonte das docs é markdown (`.mdx`) no GitHub `discord/discord-api-docs`, pasta `docs/`.
Pegue o raw, por exemplo:
- `https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/interactions/receiving-and-responding.mdx`
- `https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/interactions/application-commands.mdx`

### Hono
A doc é markdown no repositório `honojs/website`. Pegue a página relevante de lá, ou salve o
conteúdo das páginas de `https://hono.dev/docs/...`.

### Pacotes npm
README em markdown no GitHub do projeto. Ex.: `discord/discord-interactions-js`.

## O que baixar — prioridade alta

1. AI Search — Workers binding: `.../ai-search/usage/workers-binding/index.md`
2. AI Search — visão geral e metadata filtering: `.../ai-search/index.md`
3. Workers — índice e binding de IA: `.../workers/llms.txt` (e as páginas que ele indexar)
4. Hono — getting started (Cloudflare Workers), routing, middleware, context (`c.req`, `c.executionCtx`)
5. Discord — Interactions: Receiving and Responding (`receiving-and-responding.mdx`)
6. Discord — Application Commands (`application-commands.mdx`)
7. discord-interactions — README (assinatura do `verifyKey`)
8. Wrangler — configuração: `.../workers/wrangler/configuration/index.md`

## O que baixar — sob demanda

- R2 — se a fonte dos docs do AI Search for um bucket.
- AI Gateway — se for usar Claude/OpenAI na etapa de geração.
- Vectorize / Workers AI — se um dia migrar para um RAG manual.

## Sugestão de organização

```
docs/reference/
  cloudflare/
    ai-search-workers-binding.md
    ai-search-overview.md
    wrangler-configuration.md
  discord/
    interactions-receiving-and-responding.md
    interactions-application-commands.md
  hono/
    getting-started-cloudflare-workers.md
    middleware.md
  npm/
    discord-interactions-readme.md
```
