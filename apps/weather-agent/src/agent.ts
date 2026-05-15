import 'dotenv/config';
import { createAgent } from 'langchain';
import { WEATHER_SYSTEM_PROMPT } from './prompts';
import { agentResponseSchema } from './schemas';
import { getCurrentWeatherTool } from './tools/get-current-weather';

const DEFAULT_MODEL = 'claude-haiku-4-5';

export const weatherAgent = createAgent({
    model: DEFAULT_MODEL,
    tools: [getCurrentWeatherTool],
    systemPrompt: WEATHER_SYSTEM_PROMPT,
    responseFormat: agentResponseSchema,
});
