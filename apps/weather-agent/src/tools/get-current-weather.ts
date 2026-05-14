import { z } from 'zod';
import { tool } from 'langchain';
import { readingsSchema } from '../schemas';

/** 1 nudo internacional = 1852 m / 3600 s */
const MS_PER_KNOT = 1852 / 3600;

const OPEN_METEO_FORECAST =
    'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,visibility,weather_code&wind_speed_unit=ms';

type OpenMeteoCurrent = {
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    precipitation?: number | null;
    wind_speed_10m?: number | null;
    visibility?: number | null;
    weather_code?: number | null;
};

export const fetchReadingsFromOpenMeteo = async(
    latitude: number,
    longitude: number,
): Promise<{ ok: true; readings: z.infer<typeof readingsSchema> } | { ok: false; error: string }> => {
    const url = OPEN_METEO_FORECAST.replace('{lat}', String(latitude)).replace('{lon}', String(longitude));
    let res: Response;
    try {
        console.log(`Fetching weather data from ${url}`);
        res = await fetch(url);
        console.log(`Weather data fetched from ${url}`);
    } catch (e) {
        console.error(`Error fetching weather data from ${url}: ${e}`);
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, error: `Red: ${msg}` };
    }
    if (!res.ok) {
        return { ok: false, error: `Open-Meteo HTTP ${res.status}` };
    }
    let body: unknown;
    try {
        body = (await res.json()) as unknown;
    } catch {
        return { ok: false, error: 'Open-Meteo devolvió JSON inválido.' };
    }
    if (!body || typeof body !== 'object' || !('current' in body)) {
        return { ok: false, error: 'Respuesta Open-Meteo sin campo current.' };
    }
    const current = (body as { current?: OpenMeteoCurrent }).current;
    if (!current || typeof current !== 'object') {
        return { ok: false, error: 'Open-Meteo: current vacío o inválido.' };
    }

    const temperatureC = current.temperature_2m;
    const humidityPercent = current.relative_humidity_2m;
    const precipitationMm = current.precipitation;
    const windSpeedMs = current.wind_speed_10m;
    const visibilityM = current.visibility;
    const weatherCodeRaw = current.weather_code;

    if (temperatureC == null || Number.isNaN(temperatureC)) {
        return { ok: false, error: 'Open-Meteo: falta temperature_2m.' };
    }
    if (humidityPercent == null || Number.isNaN(humidityPercent)) {
        return { ok: false, error: 'Open-Meteo: falta relative_humidity_2m.' };
    }
    if (precipitationMm == null || Number.isNaN(precipitationMm)) {
        return { ok: false, error: 'Open-Meteo: falta precipitation.' };
    }
    if (windSpeedMs == null || Number.isNaN(windSpeedMs)) {
        return { ok: false, error: 'Open-Meteo: falta wind_speed_10m.' };
    }
    if (visibilityM == null || Number.isNaN(visibilityM)) {
        return { ok: false, error: 'Open-Meteo: falta visibility (null o no numérico).' };
    }
    if (weatherCodeRaw == null || Number.isNaN(weatherCodeRaw)) {
        return { ok: false, error: 'Open-Meteo: falta weather_code.' };
    }
    const weatherCode = Math.round(weatherCodeRaw);

    const windSpeedKnots = windSpeedMs / MS_PER_KNOT;

    const readings = {
        windSpeedMs,
        windSpeedKnots,
        temperatureC,
        humidityPercent,
        visibilityM,
        precipitationMm,
        weatherCode,
    };
    const parsed = readingsSchema.safeParse(readings);
    if (!parsed.success) {
        return { ok: false, error: `Mediciones inválidas: ${parsed.error.message}` };
    }
    return { ok: true, readings: parsed.data };
}

/** API pública Open-Meteo (sin API key). Devuelve JSON string: readings o `{ "error": "..." }`. */
export const getCurrentWeatherTool = tool(
    async ({ latitude, longitude }) => {
        const result = await fetchReadingsFromOpenMeteo(latitude, longitude);
        if (!result.ok) {
            return JSON.stringify({ error: result.error });
        }
        return JSON.stringify(result.readings);
    },
    {
        name: 'get_current_weather',
        description:
            'Obtiene mediciones meteorológicas actuales (viento m/s y nudos, °C, humedad %, visibilidad m, precipitación mm en la hora anterior, código WMO weather_code) desde Open-Meteo para una latitud y longitud.',
        schema: z.object({
            latitude: z.number().describe('Latitud en grados decimales (-90 a 90).'),
            longitude: z.number().describe('Longitud en grados decimales (-180 a 180).'),
        }),
    },
);
