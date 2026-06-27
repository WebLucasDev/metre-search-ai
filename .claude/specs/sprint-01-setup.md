# Sprint 01 — Setup e fundação

**Objetivo:** ter contas, credenciais e o esqueleto do projeto rodando localmente, ainda sem
lógica de bot.

**Pré-requisitos:** nenhum.

## Checklist

- [x] `tsconfig.json` em modo strict
- [x] `wrangler.jsonc` com `name`, `main`, `compatibility_date` recente e binding `ai`
- [x] Criar o **molde** do `.dev.vars` com as chaves `DISCORD_PUBLIC_KEY`, `DISCORD_APPLICATION_ID`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID` (valores preenchidos por mim desenvolvedor)
- [x] Adicionar `.dev.vars` ao `.gitignore`
- [x] Scripts no `package.json`: `dev`, `deploy`, `register`, `typecheck`

## Definition of Done
- `npm run dev` sobe o Worker localmente sem erro.
- `npm run typecheck` passa.
- Os quatro segredos estão no `.dev.vars` (local) e o arquivo está fora do versionamento.

## Notas / armadilhas
- A conta Cloudflare não precisa de nenhum app criado manualmente: o Worker nasce no `wrangler deploy`. O AI Search (Sprint 02) fica na seção **IA** do painel.
- O **Public Key** não é segredo (serve para verificar assinaturas); o **Bot Token** é segredo — nunca exponha em código, logs ou chat.
- Sem Privileged Intents: o bot responde a slash commands via HTTP, não escuta eventos do Gateway.
- A Interactions Endpoint URL (em General Information) só é preenchida na Sprint 03, depois do Worker no ar.
- Use um `compatibility_date` recente para garantir WebCrypto e os bindings de IA.
- O `Guild ID` também aparece na URL ao abrir um canal: `discord.com/channels/{GUILD_ID}/...`.