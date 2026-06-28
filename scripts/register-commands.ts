/**
 * Registra os slash commands como GUILD command (propaga na hora, ideal para um
 * servidor interno). Rodar sob demanda: `npm run register` (carrega o .dev.vars).
 * NÃO faz parte do deploy.
 */
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type RESTPutAPIApplicationGuildCommandsJSONBody,
} from 'discord-api-types/v10'

/** Shim mínimo para o typechecker — `process` real é provido pelo Node em runtime. */
declare const process: {
  env: Record<string, string | undefined>
  exit(code?: number): never
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Variável de ambiente ausente: ${name}. Defina no .dev.vars.`)
    process.exit(1)
  }
  return value
}

const token = requireEnv('DISCORD_BOT_TOKEN')
const appId = requireEnv('DISCORD_APPLICATION_ID')
const guildId = requireEnv('DISCORD_GUILD_ID')

const commands: RESTPutAPIApplicationGuildCommandsJSONBody = [
  {
    name: 'metre',
    description: 'Tire dúvidas sobre produtos e processos da Metre Sistemas.',
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'pergunta',
        description: 'O que você quer saber?',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
]

const url = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
const response = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(commands),
})

if (!response.ok) {
  console.error(`Falha ao registrar (${response.status}):`, await response.text())
  process.exit(1)
}

console.log(`Comando /metre registrado no guild ${guildId}.`)
