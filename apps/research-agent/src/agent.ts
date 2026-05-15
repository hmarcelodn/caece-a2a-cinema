import 'dotenv/config';
import { createAgent } from 'langchain';
import { MOVIES_RESEARCH_SYSTEM_PROMPT } from './prompts';
import { agentResponseSchema } from './schemas';
import { tmdbDiscoverMoviesTool } from './tools/tmdb-discover';
import { tmdbSearchMoviesTool } from './tools/tmdb-search';
import { tmdbMovieDetailsTool } from './tools/tmdb-movie-details';
import { tmdbWatchProvidersTool } from './tools/tmdb-watch-providers';
import { tavilySearchTool } from './tools/tavily-search';

const DEFAULT_MODEL = 'claude-haiku-4-5';

export const moviesResearchAgent = createAgent({
    model: DEFAULT_MODEL,
    tools: [
        tavilySearchTool,
        tmdbDiscoverMoviesTool,
        tmdbSearchMoviesTool,
        tmdbMovieDetailsTool,
        tmdbWatchProvidersTool,
    ],
    systemPrompt: MOVIES_RESEARCH_SYSTEM_PROMPT,
    responseFormat: agentResponseSchema,
});
