# CLAUDE.md — Metre Bot

Bot do Discord que responde dúvidas de novos colaboradores da Metre Sistemas sobre
produtos e processos internos, usando RAG. Roda 100% na Cloudflare (serverless).

## Stack

- Runtime: Cloudflare Workers
- Framework: Hono (TypeScript)
- RAG: Cloudflare AI Search (ex-AutoRAG), via binding `AI`
- Modelo de geração: `@cf/zai-org/glm-4.7-flash` (GLM 4.7 Flash), definido nas **Settings → Generation** da instância de AI Search. O `gemma-4` do plano original não existe no catálogo desta conta. O código usa `env.AI.autorag('metre-search-ai-rag').aiSearch({ query, system_prompt })` — a API nova de namespace (`env.AI.aiSearch()`) retorna `Account not authorized` nesta conta, e a `autorag().aiSearch()` **não** aceita override de `model`, então o modelo fica nas Settings. Peça respostas objetivas via `system_prompt`.
- Discord: Interactions API (webhook HTTP, slash commands)
- Verificação de assinatura: `discord-interactions` (`verifyKey`)
- Tipos: `discord-api-types`
- CLI/deploy: Wrangler
- Linguagem: TypeScript em modo strict

## Arquitetura em uma frase

O Discord faz `POST` em `/interactions` → o Worker valida a assinatura → responde
`DEFERRED` (type 5) em menos de 3s → processa o RAG em segundo plano com
`c.executionCtx.waitUntil(...)` → dá `PATCH` na mensagem original com a resposta.

## REGRA CRÍTICA (não viole)

**IMPORTANTE:** o Discord exige resposta em até **3 segundos**. Qualquer operação lenta
(RAG, LLM, `fetch`) DEVE rodar dentro de `c.executionCtx.waitUntil(...)` **depois** de já
ter respondido com `DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE` (type 5).
NUNCA chame o AI Search antes de responder a interação. A resposta final vai por
`PATCH .../webhooks/{APP_ID}/{token}/messages/@original`.

## Estrutura do repositório

- `src/index.ts` — app Hono: rota `/interactions`, middleware de verificação,
  handshake PING/PONG, roteamento de comandos. O handler só orquestra — sem regra de negócio aqui.
- `src/rag.ts` — interface `RagProvider` + implementação `AiSearchProvider`.
  A regra de negócio depende da interface, não da implementação (Dependency Inversion).
- `src/discord.ts` — helpers e tipos do Discord (follow-up, constantes).
- `scripts/register-commands.ts` — registra os slash commands. Rodar sob demanda, não no deploy.
- `specs/` — checklists de sprint. Comece sempre por `specs/ROADMAP.md`.
- `docs/reference/` — docs externas em markdown para consulta. Índice em `docs/reference/SOURCES.md`.

## Comandos

- `npm run dev` — `wrangler dev` (servidor local)
- `npm run deploy` — `wrangler deploy`
- `npm run register` — registra os comandos no Discord (guild command)
- `npm run typecheck` — `tsc --noEmit`

**IMPORTANTE:** este projeto usa npm + Wrangler. Não assuma Vite, Jest ou outro toolchain
sem confirmar no `package.json`.

## Convenções de código

- TypeScript strict; sem `any` implícito. Tipe o payload da interação com `discord-api-types`.
- Aplicar SOLID e Clean Code. Em especial Dependency Inversion: dependa de abstrações
  (ex.: `RagProvider`), nunca de uma implementação concreta no handler.
- Funções pequenas e com nome descritivo. Nada de lógica de negócio dentro do handler HTTP.
- Segredos sempre via `wrangler secret` / `.dev.vars`. Nunca commitar tokens. Bindings tipados em `Bindings`.
- Mensagens do Discord têm limite de 2000 caracteres — sempre truncar ou dividir.
- Erros viram uma resposta amigável ao usuário no `PATCH`, nunca falha silenciosa.

## Fluxo de trabalho

- Antes de iniciar uma tarefa, abra o spec da sprint atual em `specs/` e siga o checklist,
  marcando os itens conforme conclui.
- Use plan mode antes de mudanças grandes: deploy, troca do provider de RAG, ou mudança no
  contrato de verificação de assinatura.
- Não altere bindings de produção em `wrangler.jsonc` sem confirmar.

## Não commitar / sensível

- Todos os commits serão realizados pelo desenvolvedor manualmente.
- `.dev.vars` e qualquer token (`DISCORD_BOT_TOKEN`, `DISCORD_PUBLIC_KEY`) em texto.
- `docs/reference/*` são cópias de docs externas: consultar, não editar.

## Docs de referência (ler sob demanda)

Os arquivos em `docs/reference/` são grandes. Leia o relevante quando a tarefa pedir, em vez
de carregar tudo. Não os importe com `@` no CLAUDE.md (inflaria o contexto de toda sessão).
Índice e instruções de download em `docs/reference/SOURCES.md`.
