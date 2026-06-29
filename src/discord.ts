const DISCORD_API_BASE = 'https://discord.com/api/v10'

/** Limite rígido de caracteres de uma mensagem do Discord. */
export const MESSAGE_LIMIT = 2000

/**
 * Quebra um texto em pedaços de até `limit` caracteres, preferindo cortar em quebras
 * de linha ou espaços para não partir palavras no meio.
 */
export function splitMessage(text: string, limit = MESSAGE_LIMIT): string[] {
  if (text.length <= limit) return [text]

  const chunks: string[] = []
  let rest = text
  while (rest.length > limit) {
    let cut = rest.lastIndexOf('\n', limit)
    if (cut <= 0) cut = rest.lastIndexOf(' ', limit)
    if (cut <= 0) cut = limit
    chunks.push(rest.slice(0, cut).trimEnd())
    rest = rest.slice(cut).trimStart()
  }
  if (rest) chunks.push(rest)
  return chunks
}

/**
 * Entrega a resposta na interação adiada: edita a mensagem original com o primeiro
 * pedaço e envia os demais como follow-ups. Usa o token da interação como autorização
 * — não precisa do bot token.
 */
export async function deliverAnswer(
  applicationId: string,
  interactionToken: string,
  content: string,
): Promise<void> {
  const parts = splitMessage(content)
  await editOriginalResponse(applicationId, interactionToken, parts[0])
  for (const part of parts.slice(1)) {
    await createFollowup(applicationId, interactionToken, part)
  }
}

/** Edita a mensagem original (o "pensando...") da interação adiada. */
export async function editOriginalResponse(
  applicationId: string,
  interactionToken: string,
  content: string,
): Promise<void> {
  const url = `${DISCORD_API_BASE}/webhooks/${applicationId}/${interactionToken}/messages/@original`
  await send(url, 'PATCH', content)
}

/** Envia uma mensagem adicional (follow-up) na mesma interação. */
async function createFollowup(
  applicationId: string,
  interactionToken: string,
  content: string,
): Promise<void> {
  const url = `${DISCORD_API_BASE}/webhooks/${applicationId}/${interactionToken}`
  await send(url, 'POST', content)
}

async function send(
  url: string,
  method: 'PATCH' | 'POST',
  content: string,
): Promise<void> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      `Falha ao enviar mensagem ao Discord (${response.status}): ${detail}`,
    )
  }
}
