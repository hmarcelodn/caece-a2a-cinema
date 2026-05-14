import { z } from 'zod';
import { tool } from 'langchain';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY!;
const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

type TavilySearchResult = {
    title: string;
    url: string;
    content: string;
    score: number;
};

type TavilySearchResponse = {
    results: TavilySearchResult[];
    answer?: string;
};

export const tavilySearchTool = tool(
    async ({ query, maxResults }) => {
        try {
            const res = await fetch(TAVILY_SEARCH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: TAVILY_API_KEY,
                    query,
                    max_results: maxResults ?? 5,
                    include_answer: true,
                    search_depth: 'advanced',
                    include_domains: [
                        'imdb.com',
                        'rottentomatoes.com',
                        'letterboxd.com',
                        'themoviedb.org',
                        'filmaffinity.com',
                        'sensacine.com',
                        'reddit.com',
                    ],
                }),
            });

            if (!res.ok) {
                throw new Error(`Tavily search HTTP ${res.status}`);
            }

            const body = (await res.json()) as TavilySearchResponse;

            const output = {
                answer: body.answer ?? null,
                results: body.results.map((r) => ({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                })),
            };

            return JSON.stringify(output);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ error: msg });
        }
    },
    {
        name: 'tavily_search',
        description:
            'Busca en internet información sobre películas: recomendaciones, reviews, listas temáticas, curiosidades. ' +
            'Usa esta herramienta para investigar qué películas son ideales según el contexto del usuario ' +
            '(clima, estado de ánimo, día, intereses). Devuelve resultados resumidos de sitios de cine.',
        schema: z.object({
            query: z.string().describe(
                'Consulta de búsqueda web en español o inglés. Sé específico, ej: ' +
                '"best thriller movies for a rainy night", "películas reconfortantes para ver en familia".',
            ),
            maxResults: z
                .number()
                .int()
                .min(1)
                .max(10)
                .optional()
                .describe('Cantidad máxima de resultados web (default 5, máx 10).'),
        }),
    },
);
