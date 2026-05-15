import { randomUUID } from 'node:crypto';
import type { Message } from '@a2a-js/sdk';
import type { AgentExecutor, ExecutionEventBus, RequestContext } from '@a2a-js/sdk/server';
import { extractTextFromMessage } from '@caece-so2/a2a-message-text';
import { invokeProfileAgent } from './agent';
import { parseProfileRequest } from './schemas';

const agentTextMessage = (text: string, ctx: Pick<RequestContext, 'taskId' | 'contextId'>): Message => ({
    kind: 'message',
    role: 'agent',
    messageId: randomUUID(),
    parts: [{ kind: 'text', text }],
    taskId: ctx.taskId,
    contextId: ctx.contextId,
});

export const createProfileAgentExecutor = (): AgentExecutor => ({
    execute: async (requestContext: RequestContext, eventBus: ExecutionEventBus) => {
        const raw = extractTextFromMessage(requestContext.userMessage);
        const parsed = parseProfileRequest(raw);
        if (parsed.ok === false) {
            eventBus.publish(agentTextMessage(parsed.error, requestContext));
            return;
        }

        const userContent = parsed.data.query ?? 'Devolvé el perfil completo del usuario.';
        try {
            const textOut = await invokeProfileAgent(userContent);
            eventBus.publish(agentTextMessage(textOut, requestContext));
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            eventBus.publish(
                agentTextMessage(`Error al ejecutar el agente: ${msg}`, requestContext),
            );
        }
    },

    cancelTask: async (taskId: string, eventBus: ExecutionEventBus) => {
        void eventBus;
    },
});
