# Metre Bot

Bot do Discord que responde dúvidas de novos colaboradores sobre produtos e processos internos. Usa **RAG** (busca na base de conhecimento, e gera as respostas por LLM) e roda **100% serverless** na Cloudflare.

> O colaborador digita `/metre pergunta:"como faço X?"` no Discord e recebe uma resposta
> objetiva, com as fontes (arquivos da base) citadas no rodapé.

## Como funciona

```
Discord  ──POST /interactions──▶  Cloudflare Worker
                                       │  valida a assinatura (ed25519)
                                       │  responde DEFERRED em < 3s  ("pensando...")
                                       │
                                       ├─ waitUntil ─▶  AI Search (RAG)
                                       │                 busca + geração
                                       │
                                       └──PATCH na mensagem──▶  resposta final + fontes
```

O Discord exige resposta em até **3 segundos**. O Worker responde na hora com um
placeholder e processa o RAG em segundo plano com
`executionCtx.waitUntil(...)`, editando a mensagem original quando a resposta fica pronta.

## Stack

| Camada            | Tecnologia                                               |
| ----------------- | ---------------------------------------------------------|
| Runtime           | Cloudflare Workers (serverless)                          |
| Framework HTTP    | Hono                                                     |
| RAG               | Cloudflare AI Search, modelo `@cf/zai-org/glm-4.7-flash` |
| Integração        | Discord Interactions API                                 |
| Linguagem         | TypeScript (strict)                                      |
| Qualidade         | Vitest · ESLint · Prettier · GitHub Actions (CI/CD)      |

## Destaques de engenharia

- **SOLID:** o handler depende da abstração `RagProvider`, não
  da implementação concreta — trocar o provedor de RAG não toca na regra de negócio.
- **Resposta dentro do limite de 3s** do Discord, com processamento assíncrono via
  `waitUntil`.
- **Robustez:** todo o fluxo é protegido por `try/catch`; em caso de falha o usuário sempre
  recebe uma mensagem amigável — nada de "pensando..." eterno.
- **Mensagens longas** (> 2000 caracteres) são divididas em múltiplos envios, sem truncar.
- **Fontes citadas:** a resposta inclui um rodapé com os arquivos da base usados.
- **Observabilidade:** logs estruturados em JSON, sem vazar segredos.
- **CI/CD:** typecheck, lint, format e testes a cada push; deploy automático na `main`.

## Estrutura

```
src/
  index.ts     Rota /interactions: verificação, handshake e roteamento
  rag.ts       RagProvider e AiSearchProvider
  discord.ts   Entrega no Discord: divisão de mensagens e envio via webhook
  logger.ts    Logs estruturados em JSON
scripts/
  register-commands.ts   Registra o slash command /metre
test/          Testes (verificação de assinatura e roteamento)
```

## Rodando localmente

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/WebLucasDev/metre-search-ai.git
cd metre-search-ai
npm install
```

### 2. Configure os segredos

Crie um arquivo `.dev.vars` na raiz do projeto (ele é ignorado pelo Git — nunca
commite segredos):

```bash
# .dev.vars
DISCORD_PUBLIC_KEY=...
DISCORD_APPLICATION_ID=...
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
```

Onde encontrar cada valor no [Discord Developer Portal](https://discord.com/developers/applications)
(selecione a sua aplicação):

- **`DISCORD_PUBLIC_KEY`** e **`DISCORD_APPLICATION_ID`** — aba **General Information**
  (campos _Public Key_ e _Application ID_).
- **`DISCORD_BOT_TOKEN`** — aba **Bot** → botão **Reset Token** (o token só aparece uma vez;
  copie e guarde).
- **`DISCORD_GUILD_ID`** — é o ID do servidor onde o bot vai rodar. No próprio Discord, ative
  **Configurações → Avançado → Modo de Desenvolvedor**, clique com o botão direito no ícone
  do servidor e escolha **Copiar ID do servidor**.

### 3. Suba o servidor local

```bash
npm run dev        # wrangler dev (servidor local)
```

### Scripts úteis

```bash
npm run register   # registra o comando /metre no servidor do Discord
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm test           # Vitest
npm run deploy     # wrangler deploy
```

## Licença

Projeto interno da Metre Sistemas.
