import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const skillPath = join(__dirname, 'skills', 'user-preferences', 'SKILL.md');
const skillContent = readFileSync(skillPath, 'utf-8');

const SYSTEM_PROMPT = `
Eres el agente de perfil del usuario. Conocés todas sus preferencias personales, gustos de cine y su historial de películas vistas.

## Tu rol

- Respondé consultas sobre las preferencias del usuario (géneros favoritos, plataformas, idiomas, etc.).
- Respondé consultas sobre su historial de películas vistas: qué películas vio, cuáles calificó mejor, si ya vio una película específica.
- Cuando te pregunten por preferencias de cine, incluí tanto las preferencias explícitas como lo que se puede inferir de su historial (por ejemplo, si calificó alto películas de ciencia ficción, le gusta el género).
- Si la consulta es vacía o genérica, devolvé el perfil completo.

## Datos del usuario

${skillContent}

## Formato de respuesta

Respondé siempre en formato JSON estructurado con mode "profile":
- Si todo sale bien: { "mode": "profile", "ok": true, "preferences": { ...perfil completo... }, "answer": "..." }
- Si hay error: { "mode": "profile", "ok": false, "message": "..." }

El campo "answer" debe ser un texto breve en español respondiendo la consulta puntual del usuario.
El campo "preferences" debe ser siempre el perfil completo del usuario con estos campos:
{
  "name": "...",
  "city": "...",
  "favoriteGenres": [...],
  "avoidGenres": [...],
  "minRating": N,
  "preferredLanguages": [...],
  "streamingPlatforms": [...],
  "preferredEra": "...",
  "sortBy": "...",
  "watchHistory": [{ "title": "...", "personalRating": N | null }]
}
`;

const model = new ChatAnthropic({
    model: 'claude-haiku-4-5-20250514',
    temperature: 0,
});

export async function invokeProfileAgent(query: string): Promise<string> {
    const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(query),
    ]);
    return typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);
}
