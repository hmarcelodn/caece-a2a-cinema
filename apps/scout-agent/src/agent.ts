import 'dotenv/config';
import { createAgent } from 'langchain';
import { SCOUT_SYSTEM_PROMPT } from './prompts';
import { agentResponseSchema } from './schemas';
import { tmdbDiscoverMoviesTool } from './tools/tmdb-discover';
import { tmdbMovieDetailsTool } from './tools/tmdb-movie-details';
import { tmdbWatchProvidersTool } from './tools/tmdb-watch-providers';

const DEFAULT_MODEL = 'claude-haiku-4-5';

export const scoutAgent = createAgent({
    model: DEFAULT_MODEL,
    tools: [tmdbDiscoverMoviesTool, tmdbMovieDetailsTool, tmdbWatchProvidersTool],
    systemPrompt: SCOUT_SYSTEM_PROMPT,
    responseFormat: agentResponseSchema,
});
