import { z } from 'zod';

export const preferencesSchema = z.object({
    genres: z.array(z.string()).optional(),
    minVoteAverage: z.number().min(0).max(10).optional(),
    yearFrom: z.number().int().min(1888).optional(),
    yearTo: z.number().int().optional(),
    originalLanguage: z.string().length(2).optional(),
    sortBy: z.enum(['popularity', 'rating']).optional(),
    country: z.string().length(2).optional(),
});

/** Cuerpo del mensaje: preferencias estructuradas y límite de resultados. Sin claves extra. */
export const scoutRequestSchema = z
    .object({
        preferences: preferencesSchema.optional(),
        limit: z.number().int().min(1).max(20).optional(),
    })
    .strict();

export type ScoutRequest = z.infer<typeof scoutRequestSchema>;

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
});

export type Movie = z.infer<typeof movieSchema>;

const scoutOkResponseSchema = z.object({
    mode: z.literal('scout'),
    ok: z.literal(true),
    recommendations: z.array(movieSchema),
    summary: z.string(),
});

const scoutFailResponseSchema = z.object({
    mode: z.literal('scout'),
    ok: z.literal(false),
    message: z.string(),
});

/** Salida estructurada del agente (recomendaciones o error). */
export const agentResponseSchema = z.union([
    scoutOkResponseSchema,
    scoutFailResponseSchema,
]);

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export const parseScoutRequest = (raw: string):
    | { ok: true; data: ScoutRequest }
    | { ok: false; error: string } => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        return { ok: false, error: 'El cuerpo del mensaje no es JSON válido.' };
    }
    const result = scoutRequestSchema.safeParse(parsed);
    if (!result.success) {
        const msg = result.error.issues
            .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('; ');
        return { ok: false, error: `Payload inválido: ${msg}` };
    }
    return { ok: true, data: result.data };
};
