import { Hono } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  type APIApplicationCommandInteraction,
  type APIInteraction,
} from 'discord-api-types/v10'
import { createRagProvider, type RagAnswer } from './rag'
import { deliverAnswer, editOriginalResponse } from './discord'
import { logError, logEvent } from './logger'

/**
 * Variáveis de ambiente do Worker: bindings do Cloudflare (AI Search) + segredos
 * do Discord. Os segredos vêm de `wrangler secret` (prod) ou `.dev.vars` (local).
 */
export type Bindings = CloudflareBindings & {
  DISCORD_PUBLIC_KEY: string
  DISCORD_APPLICATION_ID: string
  DISCORD_BOT_TOKEN: string
  DISCORD_GUILD_ID: string
}

type Variables = {
  interaction: APIInteraction
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.get('/', (c) => {
  return c.text('Metre Search AI — online')
})

/**
 * Verifica a assinatura ed25519 do Discord e, se válida, parseia a interação e a
 * disponibiliza no contexto. A verificação exige o corpo CRU (texto), então este
 * middleware lê o body uma única vez aqui — nenhum outro middleware deve parseá-lo antes.
 */
app.use('/interactions', async (c, next) => {
  const signature = c.req.header('x-signature-ed25519')
  const timestamp = c.req.header('x-signature-timestamp')
  const rawBody = await c.req.text()

  if (!signature || !timestamp) {
    return c.json({ error: 'Assinatura ausente' }, 401)
  }

  const isValid = await verifyKey(
    rawBody,
    signature,
    timestamp,
    c.env.DISCORD_PUBLIC_KEY,
  )
  if (!isValid) {
    return c.json({ error: 'Assinatura inválida' }, 401)
  }

  c.set('interaction', JSON.parse(rawBody) as APIInteraction)
  await next()
})

app.post('/interactions', (c) => {
  const interaction = c.get('interaction')

  switch (interaction.type) {
    case InteractionType.Ping:
      return c.json({ type: InteractionResponseType.Pong })

    case InteractionType.ApplicationCommand: {
      const question = extractQuestion(interaction)
      if (!question) {
        return c.json({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'Use o comando assim: `/metre pergunta:"sua dúvida"`.',
            flags: MessageFlags.Ephemeral,
          },
        })
      }

      c.executionCtx.waitUntil(
        answerWithRag(c.env, interaction.token, question),
      )
      return c.json({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      })
    }

    default:
      return c.json({ error: 'Tipo de interação não suportado' }, 400)
  }
})

/** Extrai a opção `pergunta` (STRING) de um slash command. */
function extractQuestion(
  interaction: APIApplicationCommandInteraction,
): string | undefined {
  if (interaction.data.type !== ApplicationCommandType.ChatInput)
    return undefined

  const option = interaction.data.options?.find((o) => o.name === 'pergunta')
  if (option?.type === ApplicationCommandOptionType.String) return option.value
  return undefined
}

/**
 * Consulta o RAG e edita a mensagem original com a resposta. Roda dentro de
 * `waitUntil`, depois do defer — qualquer erro vira uma mensagem amigável, nunca
 * uma falha silenciosa que deixaria o "pensando..." para sempre.
 */
async function answerWithRag(
  env: Bindings,
  interactionToken: string,
  question: string,
): Promise<void> {
  const start = Date.now()
  try {
    const rag = createRagProvider(env)
    const answer = await rag.ask(question)
    await deliverAnswer(
      env.DISCORD_APPLICATION_ID,
      interactionToken,
      formatAnswer(answer),
    )
    logEvent('command.metre', {
      question,
      sources: answer.sources.length,
      ms: Date.now() - start,
    })
  } catch (error) {
    logError('command.metre', error, { question, ms: Date.now() - start })
    await editOriginalResponse(
      env.DISCORD_APPLICATION_ID,
      interactionToken,
      'Tive um problema ao buscar a resposta agora. Pode tentar de novo em instantes?',
    ).catch(() => {})
  }
}

/** Monta o conteúdo final: texto do RAG + rodapé com as fontes, se houver. */
function formatAnswer(answer: RagAnswer): string {
  if (answer.sources.length === 0) return answer.text
  const sources = answer.sources.map((source) => `\`${source}\``).join(', ')
  return `${answer.text}\n\n_Fontes: ${sources}_`
}

export default app
