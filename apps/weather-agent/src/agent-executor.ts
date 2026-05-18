import { randomUUID } from 'node:crypto';
import type { Message } from '@a2a-js/sdk';
import type { AgentExecutor, ExecutionEventBus, RequestContext } from '@a2a-js/sdk/server';
import { extractTextFromMessage, logA2aIncomingTask } from '@caece-so2/a2a-message-text';
import { parseClimateRequest, type AgentResponse } from './schemas';
import { fetchReadingsFromOpenMeteo } from './tools/get-current-weather';

const agentTextMessage = (text: string, ctx: Pick<RequestContext, 'taskId' | 'contextId'>): Message => ({
    kind: 'message',
    role: 'agent',
    messageId: randomUUID(),
    parts: [{ kind: 'text', text }],
    taskId: ctx.taskId,
    contextId: ctx.contextId,
});

const jsonReply = (requestContext: RequestContext, payload: AgentResponse): Message =>
    agentTextMessage(JSON.stringify(payload, null, 2), requestContext);

export const createWeatherAgentExecutor = (): AgentExecutor => ({
    execute: async (requestContext: RequestContext, eventBus: ExecutionEventBus) => {
        const raw = extractTextFromMessage(requestContext.userMessage).trim();
        logA2aIncomingTask('weather-agent', raw);
        if (!raw) {
            const resp: AgentResponse = {
                mode: 'weather',
                ok: false,
                message: 'Mensaje vacío: se espera JSON con location.',
            };
            eventBus.publish(jsonReply(requestContext, resp));
            return;
        }

        const parsed = parseClimateRequest(raw);
        if (parsed.ok === false) {
            const resp: AgentResponse = { mode: 'weather', ok: false, message: parsed.error };
            eventBus.publish(jsonReply(requestContext, resp));
            return;
        }

        const { latitude, longitude } = parsed.data.location;

        const readingsResult = await fetchReadingsFromOpenMeteo(latitude, longitude);
        if (!readingsResult.ok) {
            const resp: AgentResponse = { mode: 'weather', ok: false, message: readingsResult.error };
            eventBus.publish(jsonReply(requestContext, resp));
            return;
        }

        const readings = readingsResult.readings;
        const summary = `Temp ${readings.temperatureC}°C, viento ${readings.windSpeedKnots.toFixed(1)} kt, precip ${readings.precipitationMm} mm, visibilidad ${readings.visibilityM} m, código WMO ${readings.weatherCode}.`;
        const resp: AgentResponse = { mode: 'weather', ok: true, readings, summary };
        eventBus.publish(jsonReply(requestContext, resp));
    },

    cancelTask: async (taskId: string, eventBus: ExecutionEventBus) => {
        void eventBus;
    },
});
