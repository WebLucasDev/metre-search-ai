# Sprint 04 — Comando /metre + resposta adiada + RAG

**Objetivo:** a feature principal funcionando — o colaborador usa `/metre pergunta:"..."` e
recebe a resposta do RAG.

**Pré-requisitos:** Sprint 02 (instância de AI Search) e Sprint 03 (Worker validado).

> **Divisão:** o **Claude Code escreve todo o código (Parte A)**; **você roda e testa
> (Parte B)**, porque registrar comandos usa o bot token e o teste acontece dentro do Discord.
> Ordem de execução: Parte A antes da Parte B.

## Parte A — Claude Code (código)

### Camada de RAG
- [ ] `src/rag.ts`: interface `RagProvider { perguntar(pergunta: string): Promise<string> }`
- [ ] Implementar `AiSearchProvider` usando `env.AI.autorag('metre-docs').aiSearch({ query, model: '@cf/google/gemma-4-26b-a4b-it' })` (omita `model` se já estiver definido nas Settings)
- [ ] Definir um system prompt curto (parâmetro do `aiSearch`) pedindo respostas objetivas — o Gemma 4 faz reasoning e pode ser verboso
- [ ] `createRagProvider(env)` retornando a implementação (factory)
- [ ] Tratar resposta vazia com um fallback amigável

### Comando e fluxo adiado
- [ ] `scripts/register-commands.ts`: registrar `/metre` com a opção `pergunta` (STRING, required) como **guild command**
- [ ] No handler, tratar `InteractionType.APPLICATION_COMMAND` e extrair a `pergunta`
- [ ] Responder **imediatamente** com `DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE` (type 5)
- [ ] Processar o RAG dentro de `c.executionCtx.waitUntil(...)`
- [ ] Fazer `PATCH` em `.../webhooks/{APP_ID}/{token}/messages/@original` com a resposta (≤ 2000 chars)

## Parte B — Você (rodar + testar)
- [ ] `npm run register` para registrar o comando (o Claude Code pode rodar se o bot token estiver no ambiente)
- [ ] (Se o código mudou) `npm run deploy`
- [ ] Confirmar o `/metre` aparecendo no servidor da Metre (Discord)
- [ ] Usar `/metre` e ver o "pensando..." virar a resposta
- [ ] Testar uma pergunta fora da base (deve cair no fallback)

## Definition of Done
- `/metre` responde com conteúdo da base interna sem estourar os 3s.
- A regra do `waitUntil` está respeitada: nenhuma chamada lenta antes do defer.
- Resposta longa é truncada ou dividida corretamente.

## Notas / armadilhas
- **IMPORTANTE:** nunca chame o AI Search antes de responder o type 5 — senão estoura o limite de 3s.
- Use `guild command` (não global): propaga na hora, ideal para um servidor interno.
- O token da interação vale ~15 minutos para o follow-up via `PATCH`.
- `aiSearch()` faz busca + geração e devolve a resposta; `search()` devolve só os trechos.
- Modelo de geração: `@cf/google/gemma-4-26b-a4b-it`. Por ser reasoning, confirme que a resposta vem limpa (sem o raciocínio exposto) e ajuste o system prompt se necessário.
