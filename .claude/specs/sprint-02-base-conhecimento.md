# Sprint 02 — Base de conhecimento (AI Search)

**Objetivo:** ter uma instância de AI Search respondendo bem às perguntas típicas dos
colaboradores, validada no Playground, **antes** de integrar com o bot.

**Pré-requisitos:** Sprint 01 (conta Cloudflare).

> Esta sprint é quase toda **sua, no painel da Cloudflare** (navegador). Não há código para o
> Claude Code aqui: o Worker só conversa com o AI Search pelo binding `AI` e nunca acessa o R2
> diretamente. A ordem importa — bucket primeiro, instância depois.

## Parte A — Você (painel da Cloudflare)

### R2 — fonte dos dados
- [ ] Criar um bucket R2 (ex.: `metre-search-ai-r2`)
- [ ] Subir os arquivos `.md` no **bucket** (com R2 como fonte, o upload vai para o bucket, não "para a instância")

### AI Search — instância
- [ ] Criar a instância de AI Search na seção **IA** do painel (AI Search, antigo AutoRAG); anotar o nome (ex.: `metre-search-ai-rag`)
- [ ] Selecionar o bucket R2 (`metre-search-ai-r2`) como fonte de dados e disparar a indexação
- [ ] Definir o modelo de geração como `@cf/google/gemma-4-26b-a4b-it` (Gemma 4) e, se quiser, o reranking
- [ ] Se o modelo ainda não aparecer no dropdown, deixar o default e sobrescrever por requisição no código (ver Sprint 04)

### Validação
- [ ] Testar 10–15 perguntas reais no Playground
- [ ] Ajustar/expandir os `.md` no bucket onde a resposta vier fraca (reindexa sozinho)
- [ ] Confirmar que o nome da instância (`metre-search-ai-rag`) será o mesmo usado em `src/rag.ts`

## Definition of Done
- A instância responde corretamente à maioria das perguntas de teste no Playground.
- O nome da instância está documentado para uso em `src/rag.ts`.

## Notas / armadilhas
- **R2 e AI Search são criados por você no painel** (como na Sprint 01). O Claude Code não cria nem precisa deles no `wrangler.jsonc`; o único binding do Worker é o `AI`.
- O AI Search é gerenciado pelo painel (sem comando Wrangler para criar a instância). O bucket R2 dá para criar por CLI, mas pelo painel é mais direto.
- O modelo de **embedding** é definido na criação da instância e é fixo; o de **geração** pode ser trocado depois.
- A reindexação é contínua/automática: mudanças nos `.md` levam um tempo para refletir.
- Qualidade da resposta = qualidade da base. Comece pequeno (poucas FAQs boas) e expanda conforme as perguntas reais aparecerem.
- O Gemma 4 é um modelo de reasoning: oriente respostas curtas via system prompt para controlar verbosidade e custo de tokens de saída.
