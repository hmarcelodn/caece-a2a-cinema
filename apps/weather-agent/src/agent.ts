import 'dotenv/config';
import { createAgent } from 'langchain';
import { agentResponseSchema } from './schemas';
import { getCurrentWeatherTool } from './tools/get-current-weather';

const DEFAULT_MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `
Eres un asistente meteorológico.
Tu misión es obtener las condiciones meteorológicas actuales para una ubicación dada usando la herramienta get_current_weather.
Devolvé temperatura, viento, precipitación, humedad, visibilidad y código WMO.
`;

const model = DEFAULT_MODEL;

export const weatherAgent = createAgent({
    model,
    tools: [getCurrentWeatherTool],
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: agentResponseSchema,
});
