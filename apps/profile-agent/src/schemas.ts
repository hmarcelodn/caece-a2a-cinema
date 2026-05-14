import { z } from 'zod';

export const profileRequestSchema = z
    .object({
        query: z.string().optional(),
    })
    .strict();

export type ProfileRequest = z.infer<typeof profileRequestSchema>;

const watchHistoryEntrySchema = z.object({
    title: z.string(),
    rating: z.number().min(0).max(10).optional(),
});

const cinemaPrefsSchema = z.object({
    favoriteGenres: z.array(z.string()).optional(),
    avoidGenres: z.array(z.string()).optional(),
    minRating: z.number().min(0).max(10).optional(),
    preferredLanguages: z.array(z.string()).optional(),
    streamingPlatforms: z.array(z.string()).optional(),
    preferredEra: z.object({ from: z.number().int().nullable(), to: z.number().int().nullable() }).optional(),
    sortBy: z.enum(['popularity', 'rating']).optional(),
});

export const profileSchema = z.object({
    name: z.string(),
    location: z.object({ city: z.string(), country: z.string() }).optional(),
    language: z.string().optional(),
    cinema: cinemaPrefsSchema.optional(),
    watchHistory: z.array(watchHistoryEntrySchema).optional(),
    general: z.record(z.unknown()).optional(),
});

export type Profile = z.infer<typeof profileSchema>;

const profileOkResponseSchema = z.object({
    mode: z.literal('profile'),
    ok: z.literal(true),
    preferences: profileSchema,
    answer: z.string(),
});

const profileFailResponseSchema = z.object({
    mode: z.literal('profile'),
    ok: z.literal(false),
    message: z.string(),
});

export const agentResponseSchema = z.union([
    profileOkResponseSchema,
    profileFailResponseSchema,
]);

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export const parseProfileRequest = (raw: string):
    | { ok: true; data: ProfileRequest }
    | { ok: false; error: string } => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        return { ok: true, data: { query: raw } };
    }
    const result = profileRequestSchema.safeParse(parsed);
    if (!result.success) {
        const msg = result.error.issues
            .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('; ');
        return { ok: false, error: `Payload inválido: ${msg}` };
    }
    return { ok: true, data: result.data };
};
