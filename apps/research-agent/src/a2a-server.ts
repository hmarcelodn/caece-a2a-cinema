import 'dotenv/config';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { moviesResearchAgentCard } from './agent-card';
import { createMoviesResearchAgentExecutor } from './agent-executor';
import { PORT } from './constants';
import { ResearchA2aApp } from './app';

const requestHandler = new DefaultRequestHandler(
    moviesResearchAgentCard,
    new InMemoryTaskStore(),
    createMoviesResearchAgentExecutor(),
);

new ResearchA2aApp(PORT, requestHandler).listen();
