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
import { moviesResearchAgent } from './agent';

const PORT = 3006;
const BASE_URL = `http://localhost:${PORT}`;

const moviesResearchAgentCard: AgentCard = {
    name: 'Movies Research Agent',
    description:
        'Investiga y recomienda películas basándose en el contexto del usuario: clima, día, estado de ánimo, preferencias, ' +
        'historial de películas vistas y compañía. Acepta consultas en lenguaje natural y busca en internet (Tavily) ' +
        'y TMDB para curar recomendaciones personalizadas con explicación de por qué cada película es ideal.',
    protocolVersion: '1.0.0',
    version: '1.0.0',
    url: `${BASE_URL}/a2a/json-rpc`,
    preferredTransport: 'JSONRPC',
    skills: [
        {
            id: 'movie-research',
            name: 'Investigación de películas por contexto',
            description:
                'Recibe una consulta en lenguaje natural describiendo el contexto del usuario (clima, ánimo, día, ' +
                'preferencias, películas ya vistas) y devuelve recomendaciones personalizadas investigadas en la web y TMDB. ' +
                'Ejemplo: "Está lloviendo, ya vi Inception y Interstellar, quiero algo de suspenso para ver con mi pareja".',
            examples: [
                'Está lloviendo y estoy aburrido, quiero algo de suspenso',
                'Es viernes a la noche, estoy con amigos, queremos algo divertido. Ya vimos Superbad y The Hangover',
                'Día nublado, quiero una película reconfortante para ver solo. Me gustan las de Wes Anderson',
                'Hace calor, busco una aventura épica. Me gustan las de ciencia ficción de los 80s',
            ],
            tags: ['movies', 'research', 'recommendations', 'context', 'tavily', 'tmdb'],
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

class MoviesResearchExecutor implements AgentExecutor {
    execute: (requestContext: RequestContext, eventBus: ExecutionEventBus) => Promise<void> = async (
        requestContext: RequestContext,
        eventBus: ExecutionEventBus,
    ) => {
        const raw = extractTextFromMessage(requestContext.userMessage);
        if (!raw) {
            const errReply: Message = {
                kind: 'message',
                role: 'agent',
                messageId: randomUUID(),
                parts: [{ kind: 'text', text: JSON.stringify({ mode: 'research', ok: false, message: 'Mensaje vacío.' }) }],
                taskId: requestContext.taskId,
                contextId: requestContext.contextId,
            };
            eventBus.publish(errReply);
            return;
        }

        try {
            console.log('Movies Research agent execute:', raw);
            const result = await moviesResearchAgent.invoke({
                messages: [{ role: 'user', content: raw }],
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
                parts: [{ kind: 'text', text: JSON.stringify({ mode: 'research', ok: false, message: `Error al ejecutar el agente: ${msg}` }) }],
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
        console.log('Movies Research agent cancelTask', taskId);
        void eventBus;
        return Promise.resolve();
    };
}

const moviesResearchExecutor = new MoviesResearchExecutor();
const requestHandler = new DefaultRequestHandler(
    moviesResearchAgentCard,
    new InMemoryTaskStore(),
    moviesResearchExecutor,
);

const app = express();

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use(`/a2a/json-rpc`, jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use(`/a2a/rest`, restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

app.listen(PORT, () => {
    console.log(`Movies Research agent A2A server on port ${PORT} (${BASE_URL})`);
});
