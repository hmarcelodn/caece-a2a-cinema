import type { AgentCard } from '@a2a-js/sdk';
import { BASE_URL } from './constants';

export const profileAgentCard: AgentCard = {
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
