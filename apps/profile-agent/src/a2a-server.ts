import 'dotenv/config';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { createProfileAgentExecutor } from './agent-executor';
import { profileAgentCard } from './agent-card';
import { PORT } from './constants';
import { ProfileA2aApp } from './app';

const requestHandler = new DefaultRequestHandler(
    profileAgentCard,
    new InMemoryTaskStore(),
    createProfileAgentExecutor(),
);

new ProfileA2aApp(PORT, requestHandler).listen();
