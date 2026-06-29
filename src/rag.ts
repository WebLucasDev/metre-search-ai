import type { Bindings } from './index'

/** Resposta do RAG: o texto gerado e os arquivos da base que a embasaram. */
export interface RagAnswer {
  text: string
  sources: string[]
}

/**
 * Abstração de RAG da qual o handler depende (Dependency Inversion): o fluxo do bot
 * conhece apenas esta interface, nunca a implementação concreta de AI Search.
 */
export interface RagProvider {
  ask(question: string): Promise<RagAnswer>
}

const INSTANCE_NAME = 'metre-search-ai-rag'

/** Orienta o modelo a responder curto e sem inventar — a base é a fonte da verdade. */
const SYSTEM_PROMPT = [
  'Você é o assistente interno da Metre Sistemas, ajudando novos colaboradores.',
  'Responda em português do Brasil, de forma objetiva e curta, usando apenas o contexto recuperado.',
  'Se a informação não estiver no contexto, diga que não encontrou e sugira falar com um colega responsável.',
  'Nunca invente dados, números ou links.',
].join(' ')

const FALLBACK =
  'Não encontrei essa informação na base interna. Tente reformular a pergunta ou fale com seu líder/colega responsável.'

/** Implementação de `RagProvider` sobre o Cloudflare AI Search (binding `AI`). */
class AiSearchProvider implements RagProvider {
  constructor(private readonly ai: Ai) {}

  async ask(question: string): Promise<RagAnswer> {
    const result = await this.ai.autorag(INSTANCE_NAME).aiSearch({
      query: question,
      system_prompt: SYSTEM_PROMPT,
    })

    const text = result.response?.trim()
    if (!text) return { text: FALLBACK, sources: [] }

    return { text, sources: uniqueSources(result.data) }
  }
}

/** Nomes de arquivo distintos dos trechos recuperados, preservando a ordem por relevância. */
function uniqueSources(data: { filename: string }[]): string[] {
  const seen = new Set<string>()
  for (const chunk of data) {
    if (chunk.filename) seen.add(chunk.filename)
  }
  return [...seen]
}

/** Factory: devolve a implementação concreta a partir do ambiente do Worker. */
export function createRagProvider(env: Bindings): RagProvider {
  return new AiSearchProvider(env.AI)
}
