# Sprint 03 — Worker base (verificação + handshake)

**Objetivo:** ter o endpoint `/interactions` no ar, validando a assinatura e respondendo ao
PING, a ponto de o Discord aceitar a Interactions Endpoint URL. Ainda sem comando real.

**Pré-requisitos:** Sprint 01.

> **Divisão:** o **Claude Code escreve o código (Parte A)**; **você faz o deploy e a
> configuração (Parte B)**, porque envolvem sua conta, seus segredos e o portal do Discord.
> Ordem de execução: Parte A antes da Parte B.

## Parte A — Claude Code (código)
- [x] `src/index.ts`: app Hono com `Bindings` tipado
- [x] Middleware em `/interactions` que lê os headers `x-signature-ed25519` e `x-signature-timestamp` e o corpo cru
- [x] Validar com `verifyKey(body, signature, timestamp, PUBLIC_KEY)`; responder 401 se inválido
- [x] Repassar a interação já parseada ao handler (não ler o corpo duas vezes)
- [x] Handler: responder ao `InteractionType.PING` com `{ type: InteractionResponseType.PONG }`
- [x] Tratar tipo desconhecido com 400

## Parte B — Você (deploy + navegador)
- [x] (Se ainda não fez) `wrangler login` para autorizar a CLI
- [x] `npm run deploy` e anotar a URL do Worker (o Claude Code pode rodar o comando, mas a conta é sua)
- [x] Configurar os secrets de produção digitando os valores: `wrangler secret put DISCORD_PUBLIC_KEY` (e os demais) — os valores são segredos, só você os tem
- [x] Colar a URL `.../interactions` no campo "Interactions Endpoint URL" do app no Discord (navegador)
- [x] Confirmar que o Discord salva a URL

## Definition of Done
- O Discord aceita e salva a Interactions Endpoint URL.
- Assinatura inválida resulta em 401 (testar alterando bytes do corpo localmente).
- `npm run typecheck` passa.

## Notas / armadilhas
- Defina os secrets **antes** de colar a URL no Discord: ao salvar, o Discord faz um PING e envia assinaturas inválidas de propósito; sem o `DISCORD_PUBLIC_KEY` a verificação não passa.
- **IMPORTANTE:** a verificação precisa do corpo **cru** (texto). Não deixe outro middleware parsear o body antes da verificação.
- Para desenvolver localmente, use um túnel (`cloudflared tunnel` ou ngrok) apontando a URL pública para o `wrangler dev`, e coloque essa URL temporária no Discord.
