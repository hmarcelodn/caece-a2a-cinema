import { z } from 'zod';

/** Mediciones actuales (unidades fijas según el nombre del campo). */
export const readingsSchema = z.object({
    windSpeedMs: z.number(),
    /** Derivado: viento en nudos (1 kt = 1852/3600 m/s). */
    windSpeedKnots: z.number(),
    temperatureC: z.number(),
    humidityPercent: z.number(),
    visibilityM: z.number(),
    precipitationMm: z.number(),
    /** Código WMO (Open-Meteo). */
    weatherCode: z.number().int(),
});

export const locationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

/** Cuerpo del mensaje: ubicación obligatoria. Sin claves extra. */
export const climateRequestSchema = z
    .object({
        location: locationSchema,
    })
    .strict();

export type ClimateRequest = z.infer<typeof climateRequestSchema>;

const weatherOkResponseSchema = z.object({
    mode: z.literal('weather'),
    ok: z.literal(true),
    readings: readingsSchema,
    summary: z.string(),
});

const weatherFailResponseSchema = z.object({
    mode: z.literal('weather'),
    ok: z.literal(false),
    message: z.string(),
});

/** Salida estructurada del agente. */
export const agentResponseSchema = z.union([
    weatherOkResponseSchema,
    weatherFailResponseSchema,
]);

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export const parseClimateRequest = (raw: string):
    | { ok: true; data: ClimateRequest }
    | { ok: false; error: string } => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        return { ok: false, error: 'El cuerpo del mensaje no es JSON válido.' };
    }
    const result = climateRequestSchema.safeParse(parsed);
    if (!result.success) {
        const msg = result.error.issues
            .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('; ');
        return { ok: false, error: `Payload inválido: ${msg}` };
    }
    return { ok: true, data: result.data };
}
