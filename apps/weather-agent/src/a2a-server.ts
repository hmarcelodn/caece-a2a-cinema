import 'dotenv/config';
import express from 'express';
import { AgentCard, AGENT_CARD_PATH, type Message } from '@a2a-js/sdk';
import { randomUUID } from 'node:crypto';
import {
    AgentExecutor,
    RequestContext,
    ExecutionEventBus,
    DefaultRequestHandler,
    InMemoryTaskStore,
} from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { extractTextFromMessage } from '@caece-so2/a2a-message-text';
import { parseClimateRequest, type AgentResponse } from './schemas';
import { fetchReadingsFromOpenMeteo } from './tools/get-current-weather';

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;

const weatherAgentCard: AgentCard = {
    name: 'Weather agent',
    description:
        'Obtiene las condiciones meteorológicas actuales para una ubicación dada. ' +
        'El mensaje de entrada debe ser JSON: {"location":{"latitude":N,"longitude":N}}.',
    protocolVersion: '1.0.0',
    version: '1.0.0',
    url: `${BASE_URL}/a2a/json-rpc`,
    preferredTransport: 'JSONRPC',
    skills: [
        {
            id: 'climate-readings',
            name: 'Mediciones actuales',
            description: `Obtiene las condiciones meteorológicas actuales para una ubicación. Enviar JSON: {"location":{"latitude":N,"longitude":N}}`,
            examples: ['{"location":{"latitude":-34.61667,"longitude":-58.68333}}'],
            tags: ['climate', 'weather', 'open-meteo'],
        },
    ],
    capabilities: { streaming: true },
    defaultInputModes: ['text'],
    defaultOutputModes: ['text'],
    additionalInterfaces: [
        { transport: 'JSONRPC', url: `${BASE_URL}/a2a/json-rpc` },
        { transport: 'HTTP+JSON', url: `${BASE_URL}/a2a/rest` },
    ],
};

function makeReply(requestContext: RequestContext, text: string): Message {
    return {
        kind: 'message',
        role: 'agent',
        messageId: randomUUID(),
        parts: [{ kind: 'text', text }],
        taskId: requestContext.taskId,
        contextId: requestContext.contextId,
    };
}

class WeatherAgentExecutor implements AgentExecutor {
    execute: (requestContext: RequestContext, eventBus: ExecutionEventBus) => Promise<void> = async (
        requestContext: RequestContext,
        eventBus: ExecutionEventBus,
    ) => {
        const raw = extractTextFromMessage(requestContext.userMessage).trim();
        if (!raw) {
            const resp: AgentResponse = { mode: 'weather', ok: false, message: 'Mensaje vacío: se espera JSON con location.' };
            eventBus.publish(makeReply(requestContext, JSON.stringify(resp, null, 2)));
            return;
        }

        const parsed = parseClimateRequest(raw);
        if (!parsed.ok) {
            const resp: AgentResponse = { mode: 'weather', ok: false, message: parsed.error };
            eventBus.publish(makeReply(requestContext, JSON.stringify(resp, null, 2)));
            return;
        }

        const { latitude, longitude } = parsed.data.location;
        console.log(`Weather agent: fetching readings for ${latitude}, ${longitude}`);

        const readingsResult = await fetchReadingsFromOpenMeteo(latitude, longitude);
        if (!readingsResult.ok) {
            const resp: AgentResponse = { mode: 'weather', ok: false, message: readingsResult.error };
            eventBus.publish(makeReply(requestContext, JSON.stringify(resp, null, 2)));
            return;
        }

        const readings = readingsResult.readings;
        const summary = `Temp ${readings.temperatureC}°C, viento ${readings.windSpeedKnots.toFixed(1)} kt, precip ${readings.precipitationMm} mm, visibilidad ${readings.visibilityM} m, código WMO ${readings.weatherCode}.`;
        const resp: AgentResponse = { mode: 'weather', ok: true, readings, summary };
        eventBus.publish(makeReply(requestContext, JSON.stringify(resp, null, 2)));
    };

    cancelTask: (taskId: string, eventBus: ExecutionEventBus) => Promise<void> = async (
        taskId: string,
        eventBus: ExecutionEventBus,
    ) => {
        console.log('Weather agent cancelTask', taskId);
        void eventBus;
        return Promise.resolve();
    };
}

const weatherAgentExecutor = new WeatherAgentExecutor();
const requestHandler = new DefaultRequestHandler(
    weatherAgentCard,
    new InMemoryTaskStore(),
    weatherAgentExecutor,
);

const app = express();

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use(`/a2a/json-rpc`, jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use(`/a2a/rest`, restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

app.listen(PORT, () => {
    console.log(`Weather agent A2A server on port ${PORT} (${BASE_URL})`);
});
