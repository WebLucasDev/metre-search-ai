/**
 * Logs estruturados em JSON, fáceis de filtrar no `wrangler tail`. Logue apenas o
 * necessário para diagnosticar — nunca tokens, assinaturas ou outros segredos.
 */
type Fields = Record<string, unknown>

export function logEvent(event: string, fields: Fields = {}): void {
  console.log(JSON.stringify({ event, ...fields }))
}

export function logError(
  event: string,
  error: unknown,
  fields: Fields = {},
): void {
  console.error(
    JSON.stringify({
      event,
      level: 'error',
      message: String(error),
      ...fields,
    }),
  )
}
