import 'dotenv/config';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { scoutAgentCard } from './agent-card';
import { createScoutAgentExecutor } from './agent-executor';
import { PORT } from './constants';
import { ScoutA2aApp } from './app';

const requestHandler = new DefaultRequestHandler(
    scoutAgentCard,
    new InMemoryTaskStore(),
    createScoutAgentExecutor(),
);

new ScoutA2aApp(PORT, requestHandler).listen();
