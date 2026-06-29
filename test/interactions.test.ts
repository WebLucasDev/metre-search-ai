import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10'
import app from '../src/index'
import {
  fakeEnv,
  fakeExecutionContext,
  generateKeys,
  interactionsRequest,
  signHeaders,
} from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('verificação de assinatura', () => {
  it('responde PONG a um PING válido', async () => {
    const { privateKey, publicKey } = await generateKeys()
    const body = JSON.stringify({ type: InteractionType.Ping })
    const req = interactionsRequest(body, await signHeaders(privateKey, body))
    const { ctx } = fakeExecutionContext()

    const res = await app.fetch(req, fakeEnv(publicKey), ctx)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ type: InteractionResponseType.Pong })
  })

  it('rejeita com 401 quando o corpo é adulterado', async () => {
    const { privateKey, publicKey } = await generateKeys()
    const body = JSON.stringify({ type: InteractionType.Ping })
    const headers = await signHeaders(privateKey, body)
    const tampered = interactionsRequest(
      JSON.stringify({ type: 1, hacked: true }),
      headers,
    )
    const { ctx } = fakeExecutionContext()

    const res = await app.fetch(tampered, fakeEnv(publicKey), ctx)

    expect(res.status).toBe(401)
  })

  it('rejeita com 401 quando faltam os headers de assinatura', async () => {
    const { publicKey } = await generateKeys()
    const body = JSON.stringify({ type: InteractionType.Ping })
    const req = interactionsRequest(body, {
      'content-type': 'application/json',
    })
    const { ctx } = fakeExecutionContext()

    const res = await app.fetch(req, fakeEnv(publicKey), ctx)

    expect(res.status).toBe(401)
  })
})

describe('roteamento de comandos', () => {
  it('responde 400 a um tipo de interação desconhecido', async () => {
    const { privateKey, publicKey } = await generateKeys()
    const body = JSON.stringify({ type: 99 })
    const req = interactionsRequest(body, await signHeaders(privateKey, body))
    const { ctx } = fakeExecutionContext()

    const res = await app.fetch(req, fakeEnv(publicKey), ctx)

    expect(res.status).toBe(400)
  })

  it('adia a resposta (type 5) e processa o RAG em segundo plano', async () => {
    const { privateKey, publicKey } = await generateKeys()
    const aiSearch = vi.fn(async () => ({
      response: 'Para tirar férias, fale com o RH.',
      data: [{ filename: 'ferias.md' }],
    }))
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const body = JSON.stringify({
      type: InteractionType.ApplicationCommand,
      token: 'interaction-token',
      data: {
        type: ApplicationCommandType.ChatInput,
        name: 'metre',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'pergunta',
            value: 'Como tirar férias?',
          },
        ],
      },
    })
    const req = interactionsRequest(body, await signHeaders(privateKey, body))
    const { ctx, settle } = fakeExecutionContext()

    const res = await app.fetch(req, fakeEnv(publicKey, aiSearch), ctx)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      type: InteractionResponseType.DeferredChannelMessageWithSource,
    })

    await settle()
    expect(aiSearch).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalled()
  })

  it('pede a pergunta quando ela não vem', async () => {
    const { privateKey, publicKey } = await generateKeys()
    const body = JSON.stringify({
      type: InteractionType.ApplicationCommand,
      token: 'interaction-token',
      data: {
        type: ApplicationCommandType.ChatInput,
        name: 'metre',
        options: [],
      },
    })
    const req = interactionsRequest(body, await signHeaders(privateKey, body))
    const { ctx } = fakeExecutionContext()

    const res = await app.fetch(req, fakeEnv(publicKey), ctx)

    expect(res.status).toBe(200)
    const json = (await res.json()) as { type: number }
    expect(json.type).toBe(InteractionResponseType.ChannelMessageWithSource)
  })
})
