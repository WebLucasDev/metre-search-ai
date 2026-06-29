# Sprint 04 — Comando /metre + resposta adiada + RAG

**Objetivo:** a feature principal funcionando — o colaborador usa `/metre pergunta:"..."` e
recebe a resposta do RAG.

**Pré-requisitos:** Sprint 02 (instância de AI Search) e Sprint 03 (Worker validado).

> **Divisão:** o **Claude Code escreve todo o código (Parte A)**; **você roda e testa
> (Parte B)**, porque registrar comandos usa o bot token e o teste acontece dentro do Discord.
> Ordem de execução: Parte A antes da Parte B.

## Parte A — Claude Code (código)

### Camada de RAG
- [x] `src/rag.ts`: interface `RagProvider { perguntar(pergunta: string): Promise<string> }`
- [x] Implementar `AiSearchProvider` usando `env.AI.autorag('metre-search-ai-rag').aiSearch({ query, system_prompt })` — modelo (`glm-4.7-flash`) fica nas Settings; a API não aceita override de `model`, e a `env.AI.aiSearch()` não está autorizada nesta conta
- [x] Definir um system prompt curto (parâmetro `system_prompt` do `aiSearch`) pedindo respostas objetivas
- [x] `createRagProvider(env)` retornando a implementação (factory)
- [x] Tratar resposta vazia com um fallback amigável

### Comando e fluxo adiado
- [x] `scripts/register-commands.ts`: registrar `/metre` com a opção `pergunta` (STRING, required) como **guild command**
- [x] No handler, tratar `InteractionType.APPLICATION_COMMAND` e extrair a `pergunta`
- [x] Responder **imediatamente** com `DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE` (type 5)
- [x] Processar o RAG dentro de `c.executionCtx.waitUntil(...)`
- [x] Fazer `PATCH` em `.../webhooks/{APP_ID}/{token}/messages/@original` com a resposta (≤ 2000 chars)

## Parte B — Você (rodar + testar)
- [x] `npm run register` para registrar o comando (o Claude Code pode rodar se o bot token estiver no ambiente)
- [x] (Se o código mudou) `npm run deploy`
- [x] Confirmar o `/metre` aparecendo no servidor (Discord)
- [x] Usar `/metre` e ver o "pensando..." virar a resposta
- [x] Testar uma pergunta fora da base (deve cair no fallback)

## Definition of Done
- `/metre` responde com conteúdo da base interna sem estourar os 3s.
- A regra do `waitUntil` está respeitada: nenhuma chamada lenta antes do defer.
- Resposta longa é truncada ou dividida corretamente.

## Notas / armadilhas
- **IMPORTANTE:** nunca chame o AI Search antes de responder o type 5 — senão estoura o limite de 3s.
- Use `guild command` (não global): propaga na hora, ideal para um servidor interno.
- O token da interação vale ~15 minutos para o follow-up via `PATCH`.
- `aiSearch()` faz busca + geração e devolve a resposta; `search()` devolve só os trechos.
- Modelo de geração: `@cf/zai-org/glm-4.7-flash`. Confirme que a resposta vem limpa e ajuste o system prompt se necessário.
