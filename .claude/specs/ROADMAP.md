# Roadmap — Metre Bot

Visão geral das sprints. Cada sprint é um checklist: trabalhe de cima para baixo. Uma
sprint só "fecha" quando todos os itens e os critérios de aceite (DoD) estão satisfeitos.

## Convenções

- `- [ ]` tarefa pendente · `- [x]` concluída.
- **DoD** = _Definition of Done_, os critérios de aceite da sprint.
- Não pule sprints: a ordem reflete as dependências.

## Sprints

1. `sprint-01-setup.md` — fundação: contas, app do Discord, scaffold do projeto.
2. `sprint-02-base-conhecimento.md` — base de conhecimento + instância de AI Search.
3. `sprint-03-worker-base.md` — Worker com verificação + handshake (URL aceita pelo Discord).
4. `sprint-04-comando-rag.md` — slash command + resposta adiada + RAG (feature principal).
5. `sprint-05-robustez.md` — erros, limites, observabilidade e polimento.

## Dependências

- Sprint 03 depende da 01.
- Sprint 04 depende da 02 **e** da 03.
- As sprints 01 e 02 podem ser tocadas em paralelo (uma é credencial/projeto, a outra é conteúdo).
