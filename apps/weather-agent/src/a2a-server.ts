import 'dotenv/config';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { weatherAgentCard } from './agent-card';
import { createWeatherAgentExecutor } from './agent-executor';
import { PORT } from './constants';
import { WeatherA2aApp } from './app';

const requestHandler = new DefaultRequestHandler(
    weatherAgentCard,
    new InMemoryTaskStore(),
    createWeatherAgentExecutor(),
);

new WeatherA2aApp(PORT, requestHandler).listen();
