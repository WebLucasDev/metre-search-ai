const DISCORD_API_BASE = 'https://discord.com/api/v10'

/** Limite rígido de caracteres de uma mensagem do Discord. */
export const MESSAGE_LIMIT = 2000

/**
 * Garante que o conteúdo cabe no limite do Discord. A Sprint 05 troca isto por
 * divisão em follow-ups; por enquanto, trunca com reticências.
 */
export function truncateMessage(text: string, limit = MESSAGE_LIMIT): string {
  if (text.length <= limit) return text
  return text.slice(0, limit - 1).trimEnd() + '…'
}

/**
 * Edita a mensagem original (o "pensando...") da interação adiada com o conteúdo
 * final. Usa o token da interação como autorização — não precisa do bot token.
 */
export async function editOriginalResponse(
  applicationId: string,
  interactionToken: string,
  content: string,
): Promise<void> {
  const url = `${DISCORD_API_BASE}/webhooks/${applicationId}/${interactionToken}/messages/@original`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: truncateMessage(content) }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Falha ao editar a resposta no Discord (${response.status}): ${detail}`)
  }
}
