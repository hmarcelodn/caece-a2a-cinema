import type { AgentCard } from '@a2a-js/sdk';
import { BASE_URL } from './constants';

export const weatherAgentCard: AgentCard = {
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
