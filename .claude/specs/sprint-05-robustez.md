# Sprint 05 — Robustez e polimento

**Objetivo:** deixar o bot confiável para uso real pelos colaboradores.

**Pré-requisitos:** Sprint 04.

> **Divisão:** o **Claude Code faz código, testes e configs (Parte A)**; **você cuida do
> painel e da observação (Parte B)** — criar token de API, configurar secrets no GitHub e
> acompanhar logs e métricas.

## Parte A — Claude Code (código, testes, config)

### Erros e UX
- [x] Envolver o fluxo de RAG em try/catch; em erro, dar `PATCH` com mensagem amigável
- [x] Dividir respostas > 2000 chars em múltiplas mensagens (follow-up) em vez de truncar
- [x] ~~(Opcional) Respostas efêmeras~~ — decisão: respostas **públicas** no canal (vira histórico de conhecimento); só a mensagem de uso incorreto é efêmera
- [x] (Opcional) Incluir as fontes/links dos trechos usados na resposta — rodapé com os arquivos `.md`

### Observabilidade (código)
- [x] Logs estruturados (sem vazar dados sensíveis) — `src/logger.ts`, JSON via `console`

### Qualidade
- [x] Testes para a verificação de assinatura e para o roteamento de comandos — Vitest (`test/`)
- [x] Configurar lint/format (Biome ou ESLint + Prettier) — **ESLint + Prettier** (flat config)
- [x] Escrever o workflow de CI/CD (GitHub Actions) que faz deploy no push para `main` — `.github/workflows/ci.yml`

### Evolução (backlog)
- [ ] Refatorar o roteamento para um registry de comandos (padrão Command) ao adicionar o 2º comando
- [ ] Avaliar `discord-verify` (WebCrypto nativo) se a verificação virar gargalo
- [ ] Autocomplete de perguntas frequentes

## Parte B — Você (painel + observação)
- [ ] Criar um `CF_API_TOKEN` no painel da Cloudflare (Meu Perfil → Tokens de API) e pegar o `CF_ACCOUNT_ID`
- [ ] Adicionar `CF_API_TOKEN` e `CF_ACCOUNT_ID` como secrets no repositório do GitHub (Settings → Secrets and variables → Actions)
- [ ] Acompanhar os logs com `wrangler tail` quando algo falhar
- [ ] Acompanhar métricas (nº de perguntas, taxa de fallback) na aba Metrics da instância de AI Search

## Definition of Done
- Erros não derrubam a resposta: o usuário sempre recebe algo.
- O deploy é reproduzível via CI.
- Os logs permitem diagnosticar uma pergunta que falhou.

## Notas / armadilhas
- Mantenha o `CLAUDE.md` atualizado quando uma convenção nova se estabilizar.
- Resista a inflar o `CLAUDE.md`: o que for específico de uma área vai melhor em `.claude/rules/` com escopo por caminho.
