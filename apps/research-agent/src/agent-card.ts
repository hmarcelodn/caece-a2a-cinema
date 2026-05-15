import type { AgentCard } from '@a2a-js/sdk';
import { BASE_URL } from './constants';

export const moviesResearchAgentCard: AgentCard = {
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
