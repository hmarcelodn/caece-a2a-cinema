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
import { scoutAgent } from './agent';
import { parseScoutRequest } from './schemas';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const scoutAgentCard: AgentCard = {
    name: 'Scout agent',
    description:
        'Recomienda películas para un viernes a la noche basándose en preferencias estructuradas (géneros, rating mínimo, rango de años, idioma, criterio de orden). ' +
        'El mensaje de entrada debe ser JSON: {"preferences":{"genres":["thriller"],"minVoteAverage":6.5,...},"limit":5}. ' +
        'Usa TMDB para descubrir películas y devuelve una lista curada.',
    protocolVersion: '1.0.0',
    version: '1.0.0',
    url: `${BASE_URL}/a2a/json-rpc`,
    preferredTransport: 'JSONRPC',
    skills: [
        {
            id: 'friday-night-picks',
            name: 'Películas para viernes a la noche',
            description:
                'Recomienda películas ideales para un viernes a la noche según preferencias. ' +
                'Enviar JSON: {"preferences":{"genres":["comedy","thriller"],"minVoteAverage":7,"yearFrom":2000},"limit":5}',
            examples: [
                '{"preferences":{"genres":["comedy"],"minVoteAverage":7},"limit":5}',
                '{"preferences":{"genres":["thriller","action"],"yearFrom":1990,"yearTo":2005,"originalLanguage":"en","sortBy":"rating"},"limit":10}',
            ],
            tags: ['movies', 'tmdb', 'recommendations', 'friday-night'],
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

class ScoutAgentExecutor implements AgentExecutor {
    execute: (requestContext: RequestContext, eventBus: ExecutionEventBus) => Promise<void> = async (
        requestContext: RequestContext,
        eventBus: ExecutionEventBus,
    ) => {
        const raw = extractTextFromMessage(requestContext.userMessage);
        const parsed = parseScoutRequest(raw);
        if (!parsed.ok) {
            const errReply: Message = {
                kind: 'message',
                role: 'agent',
                messageId: randomUUID(),
                parts: [{ kind: 'text', text: parsed.error }],
                taskId: requestContext.taskId,
                contextId: requestContext.contextId,
            };
            eventBus.publish(errReply);
            return;
        }

        const userContent = JSON.stringify(parsed.data, null, 2);
        try {
            console.log('Scout agent execute', userContent);
            const result = await scoutAgent.invoke({
                messages: [{ role: 'user', content: userContent }],
            });
            const structured = result.structuredResponse;
            const textOut = JSON.stringify(structured, null, 2);
            const reply: Message = {
                kind: 'message',
                role: 'agent',
                messageId: randomUUID(),
                parts: [{ kind: 'text', text: textOut }],
                taskId: requestContext.taskId,
                contextId: requestContext.contextId,
            };
            eventBus.publish(reply);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            const reply: Message = {
                kind: 'message',
                role: 'agent',
                messageId: randomUUID(),
                parts: [{ kind: 'text', text: `Error al ejecutar el agente: ${msg}` }],
                taskId: requestContext.taskId,
                contextId: requestContext.contextId,
            };
            eventBus.publish(reply);
        }
    };

    cancelTask: (taskId: string, eventBus: ExecutionEventBus) => Promise<void> = async (
        taskId: string,
        eventBus: ExecutionEventBus,
    ) => {
        console.log('Scout agent cancelTask', taskId);
        void eventBus;
        return Promise.resolve();
    };
}

const scoutAgentExecutor = new ScoutAgentExecutor();
const requestHandler = new DefaultRequestHandler(
    scoutAgentCard,
    new InMemoryTaskStore(),
    scoutAgentExecutor,
);

const app = express();

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use(`/a2a/json-rpc`, jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use(`/a2a/rest`, restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

app.listen(PORT, () => {
    console.log(`Scout agent A2A server on port ${PORT} (${BASE_URL})`);
});
