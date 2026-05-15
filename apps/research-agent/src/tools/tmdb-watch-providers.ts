import { z } from 'zod';
import { tool } from 'langchain';

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_MOVIE_URL = 'https://api.themoviedb.org/3/movie';
const LOGO_BASE = 'https://image.tmdb.org/t/p/original';

type TmdbProvider = {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
    display_priority: number;
};

type TmdbCountryProviders = {
    link?: string;
    flatrate?: TmdbProvider[];
    rent?: TmdbProvider[];
    buy?: TmdbProvider[];
};

type TmdbWatchProvidersResponse = {
    id: number;
    results: Record<string, TmdbCountryProviders>;
};

export type WatchProvider = {
    name: string;
    logoUrl: string | null;
    type: 'subscription' | 'rent' | 'buy';
};

export type WatchProvidersResult = {
    movieId: number;
    country: string;
    tmdbLink: string | null;
    providers: WatchProvider[];
};

const mapProviders = (list: TmdbProvider[] | undefined, type: WatchProvider['type']): WatchProvider[] =>
    (list ?? []).map((p) => ({
        name: p.provider_name,
        logoUrl: p.logo_path ? `${LOGO_BASE}${p.logo_path}` : null,
        type,
    }));

export const fetchWatchProviders = async (
    movieId: number,
    country: string,
): Promise<WatchProvidersResult> => {
    const url = `${TMDB_MOVIE_URL}/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`TMDB watch providers HTTP ${res.status}`);
    }
    const body = (await res.json()) as TmdbWatchProvidersResponse;
    const countryData = body.results[country.toUpperCase()];

    if (!countryData) {
        return { movieId, country, tmdbLink: null, providers: [] };
    }

    const providers: WatchProvider[] = [
        ...mapProviders(countryData.flatrate, 'subscription'),
        ...mapProviders(countryData.rent, 'rent'),
        ...mapProviders(countryData.buy, 'buy'),
    ];

    return {
        movieId,
        country: country.toUpperCase(),
        tmdbLink: countryData.link ?? null,
        providers,
    };
};

export const tmdbWatchProvidersTool = tool(
    async ({ movieId, country }: { movieId: number; country?: string }) => {
        try {
            const result = await fetchWatchProviders(movieId, country ?? 'AR');
            return JSON.stringify(result);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ error: msg });
        }
    },
    {
        name: 'tmdb_watch_providers',
        description:
            'Consulta dónde ver una película (streaming, alquiler, compra) por su ID de TMDB y país (ISO 3166-1, default "AR"). ' +
            'Datos provistos por JustWatch. Devuelve proveedores con nombre, logo y tipo (subscription/rent/buy).',
        schema: z.object({
            movieId: z.number().int().describe('ID numérico de la película en TMDB.'),
            country: z.string().length(2).optional().describe('Código ISO 3166-1 del país (e.g. "AR", "US", "ES"). Default: "AR".'),
        }),
    },
);
