import { randomUUID } from 'node:crypto';
import type { Message } from '@a2a-js/sdk';
import type { AgentExecutor, ExecutionEventBus, RequestContext } from '@a2a-js/sdk/server';
import { extractTextFromMessage, logA2aIncomingTask } from '@caece-so2/a2a-message-text';
import { moviesResearchAgent } from './agent';

const agentTextMessage = (text: string, ctx: Pick<RequestContext, 'taskId' | 'contextId'>): Message => ({
    kind: 'message',
    role: 'agent',
    messageId: randomUUID(),
    parts: [{ kind: 'text', text }],
    taskId: ctx.taskId,
    contextId: ctx.contextId,
});

export const createMoviesResearchAgentExecutor = (): AgentExecutor => ({
    execute: async (requestContext: RequestContext, eventBus: ExecutionEventBus) => {
        const raw = extractTextFromMessage(requestContext.userMessage);
        logA2aIncomingTask('movies-research-agent', raw);
        if (!raw) {
            eventBus.publish(
                agentTextMessage(
                    JSON.stringify({ mode: 'research', ok: false, message: 'Mensaje vacío.' }),
                    requestContext,
                ),
            );
            return;
        }

        try {
            const result = await moviesResearchAgent.invoke({
                messages: [{ role: 'user', content: raw }],
            });
            const structured = result.structuredResponse;
            const textOut = JSON.stringify(structured, null, 2);
            eventBus.publish(agentTextMessage(textOut, requestContext));
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            eventBus.publish(
                agentTextMessage(
                    JSON.stringify({
                        mode: 'research',
                        ok: false,
                        message: `Error al ejecutar el agente: ${msg}`,
                    }),
                    requestContext,
                ),
            );
        }
    },

    cancelTask: async (taskId: string, eventBus: ExecutionEventBus) => {
        void eventBus;
    },
});
