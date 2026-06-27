import { Hono } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  InteractionResponseType,
  InteractionType,
  type APIInteraction,
} from 'discord-api-types/v10'

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
    default:
      return c.json({ error: 'Tipo de interação não suportado' }, 400)
  }
})

export default app
