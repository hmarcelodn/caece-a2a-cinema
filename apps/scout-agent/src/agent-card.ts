import type { AgentCard } from '@a2a-js/sdk';
import { BASE_URL } from './constants';

export const scoutAgentCard: AgentCard = {
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
