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
import { invokeProfileAgent } from './agent';
import { parseProfileRequest } from './schemas';

const PORT = 3007;
const BASE_URL = `http://localhost:${PORT}`;

const profileAgentCard: AgentCard = {
    name: 'Profile agent',
    description:
        'Conoce las preferencias del usuario (gustos de cine, géneros, plataformas, idioma) y su historial de películas vistas. ' +
        'Acepta consultas en texto libre o JSON: {"query":"¿qué películas vi?"}. ' +
        'Devuelve el perfil completo junto con una respuesta puntual a la consulta.',
    protocolVersion: '1.0.0',
    version: '1.0.0',
    url: `${BASE_URL}/a2a/json-rpc`,
    preferredTransport: 'JSONRPC',
    skills: [
        {
            id: 'user-preferences',
            name: 'Preferencias y perfil del usuario',
            description:
                'Devuelve las preferencias del usuario (géneros favoritos, plataformas de streaming, idioma, etc.) ' +
                'y su historial de películas vistas. Acepta una consulta opcional en texto libre.',
            examples: [
                '{"query":"¿qué géneros le gustan?"}',
                '{"query":"¿ya vio Inception?"}',
                '{}',
            ],
            tags: ['profile', 'preferences', 'watch-history', 'user'],
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

class ProfileAgentExecutor implements AgentExecutor {
    execute: (requestContext: RequestContext, eventBus: ExecutionEventBus) => Promise<void> = async (
        requestContext: RequestContext,
        eventBus: ExecutionEventBus,
    ) => {
        const raw = extractTextFromMessage(requestContext.userMessage);
        const parsed = parseProfileRequest(raw);
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

        const userContent = parsed.data.query ?? 'Devolvé el perfil completo del usuario.';
        try {
            console.log('Profile agent execute', userContent);
            const textOut = await invokeProfileAgent(userContent);

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
        console.log('Profile agent cancelTask', taskId);
        void eventBus;
        return Promise.resolve();
    };
}

const profileAgentExecutor = new ProfileAgentExecutor();
const requestHandler = new DefaultRequestHandler(
    profileAgentCard,
    new InMemoryTaskStore(),
    profileAgentExecutor,
);

const app = express();

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use(`/a2a/json-rpc`, jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use(`/a2a/rest`, restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

app.listen(PORT, () => {
    console.log(`Profile agent A2A server on port ${PORT} (${BASE_URL})`);
});
