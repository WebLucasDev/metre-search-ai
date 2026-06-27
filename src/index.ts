import { Hono } from 'hono'

export type Bindings = CloudflareBindings & {
  DISCORD_PUBLIC_KEY: string
  DISCORD_APPLICATION_ID: string
  DISCORD_BOT_TOKEN: string
  DISCORD_GUILD_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Metre Search AI — online')
})

export default app
