import { z } from 'zod';

const watchProviderSchema = z.object({
    name: z.string(),
    logoUrl: z.string().nullable(),
    type: z.enum(['subscription', 'rent', 'buy']),
});

export const movieSchema = z.object({
    id: z.number().int(),
    title: z.string(),
    originalTitle: z.string(),
    releaseDate: z.string(),
    voteAverage: z.number(),
    overview: z.string(),
    genres: z.array(z.string()),
    posterUrl: z.string().optional(),
    watchProviders: z.array(watchProviderSchema).optional(),
    watchLink: z.string().nullable().optional(),
    whyRecommended: z.string(),
});

export type Movie = z.infer<typeof movieSchema>;

const researchOkResponseSchema = z.object({
    mode: z.literal('research'),
    ok: z.literal(true),
    recommendations: z.array(movieSchema),
    summary: z.string(),
    /** Síntesis de opiniones / críticas / foros encontrados con tavily_search (especialmente modo PELICULA_ELEGIDA_TMDB_ID). */
    opinions_from_internet: z.string().optional(),
});

const researchFailResponseSchema = z.object({
    mode: z.literal('research'),
    ok: z.literal(false),
    message: z.string(),
});

/** Salida estructurada del agente (recomendaciones o error). */
export const agentResponseSchema = z.union([
    researchOkResponseSchema,
    researchFailResponseSchema,
]);

export type AgentResponse = z.infer<typeof agentResponseSchema>;
