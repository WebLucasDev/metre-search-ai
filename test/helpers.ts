import type { Bindings } from '../src/index'

const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export interface TestKeys {
  privateKey: CryptoKey
  publicKey: string
}

/** Gera um par ed25519 de teste e devolve a public key em hex (formato do Discord). */
export async function generateKeys(): Promise<TestKeys> {
  const pair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair
  const raw = (await crypto.subtle.exportKey(
    'raw',
    pair.publicKey,
  )) as ArrayBuffer
  return { privateKey: pair.privateKey, publicKey: toHex(raw) }
}

/** Assina `timestamp + rawBody` como o Discord faz e monta os headers da requisição. */
export async function signHeaders(
  privateKey: CryptoKey,
  rawBody: string,
  timestamp = String(Math.floor(Date.now() / 1000)),
): Promise<Record<string, string>> {
  const signature = toHex(
    await crypto.subtle.sign(
      'Ed25519',
      privateKey,
      encoder.encode(timestamp + rawBody),
    ),
  )
  return {
    'x-signature-ed25519': signature,
    'x-signature-timestamp': timestamp,
    'content-type': 'application/json',
  }
}

export function interactionsRequest(
  rawBody: string,
  headers: Record<string, string>,
): Request {
  return new Request('http://localhost/interactions', {
    method: 'POST',
    headers,
    body: rawBody,
  })
}

type AiSearchResult = { response: string; data: { filename: string }[] }
type AiSearchFn = () => Promise<AiSearchResult>

/** Ambiente fake do Worker: public key real de teste + AI Search stubado. */
export function fakeEnv(publicKey: string, aiSearch?: AiSearchFn): Bindings {
  const defaultSearch: AiSearchFn = async () => ({
    response: 'Resposta de teste.',
    data: [{ filename: 'faq.md' }],
  })
  return {
    DISCORD_PUBLIC_KEY: publicKey,
    DISCORD_APPLICATION_ID: 'app-id',
    DISCORD_BOT_TOKEN: 'bot-token',
    DISCORD_GUILD_ID: 'guild-id',
    AI: {
      autorag: () => ({ aiSearch: aiSearch ?? defaultSearch }),
    },
  } as unknown as Bindings
}

export interface FakeContext {
  ctx: ExecutionContext
  settle(): Promise<void>
}

/** ExecutionContext fake que coleta os `waitUntil` para o teste poder aguardá-los. */
export function fakeExecutionContext(): FakeContext {
  const pending: Promise<unknown>[] = []
  const ctx = {
    waitUntil(promise: Promise<unknown>) {
      pending.push(promise)
    },
    passThroughOnException() {},
  }
  return {
    ctx: ctx as unknown as ExecutionContext,
    settle: async () => {
      await Promise.allSettled(pending)
    },
  }
}
