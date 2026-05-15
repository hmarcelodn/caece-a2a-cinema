import { z } from 'zod';
import { tool } from 'langchain';
import { resolveGenreIds } from './tmdb-genres';
import type { Movie } from '../schemas';

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_DISCOVER_URL = 'https://api.themoviedb.org/3/discover/movie';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

type TmdbDiscoverResult = {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    vote_average: number;
    overview: string;
    genre_ids: number[];
    poster_path: string | null;
};

type TmdbDiscoverResponse = {
    page: number;
    results: TmdbDiscoverResult[];
    total_results: number;
    total_pages: number;
};

/** Genre ID → name reverse map, built lazily from the same cache as resolveGenreIds. */
import { loadGenreMap } from './tmdb-genres';

let reverseGenreMap: Map<number, string> | null = null;

const getReverseGenreMap = async (): Promise<Map<number, string>> => {
    if (reverseGenreMap) return reverseGenreMap;
    const forward = await loadGenreMap();
    reverseGenreMap = new Map<number, string>();
    for (const [name, id] of forward) {
        reverseGenreMap.set(id, name);
    }
    return reverseGenreMap;
};

export type DiscoverFilters = {
    genres?: string[];
    minVoteAverage?: number;
    yearFrom?: number;
    yearTo?: number;
    originalLanguage?: string;
    sortBy?: 'popularity' | 'rating';
    limit?: number;
};

export const tmdbDiscover = async (filters: DiscoverFilters): Promise<Movie[]> => {
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        include_adult: 'false',
        language: 'en-US',
        page: '1',
    });

    if (filters.genres && filters.genres.length > 0) {
        const { ids } = await resolveGenreIds(filters.genres);
        if (ids.length > 0) {
            params.set('with_genres', ids.join(','));
        }
    }

    if (filters.minVoteAverage != null) {
        params.set('vote_average.gte', String(filters.minVoteAverage));
    }
    if (filters.yearFrom != null) {
        params.set('primary_release_date.gte', `${filters.yearFrom}-01-01`);
    }
    if (filters.yearTo != null) {
        params.set('primary_release_date.lte', `${filters.yearTo}-12-31`);
    }
    if (filters.originalLanguage) {
        params.set('with_original_language', filters.originalLanguage);
    }

    if (filters.sortBy === 'rating') {
        params.set('sort_by', 'vote_average.desc');
        params.set('vote_count.gte', '200');
    } else {
        params.set('sort_by', 'popularity.desc');
    }

    const url = `${TMDB_DISCOVER_URL}?${params.toString()}`;
    console.log(`Scout agent: discovering movies from ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`TMDB discover HTTP ${res.status}`);
    }

    const body = (await res.json()) as TmdbDiscoverResponse;
    const limit = Math.min(filters.limit ?? 5, 20);
    const reverse = await getReverseGenreMap();

    return body.results.slice(0, limit).map((r): Movie => ({
        id: r.id,
        title: r.title,
        originalTitle: r.original_title,
        releaseDate: r.release_date ?? '',
        voteAverage: r.vote_average,
        overview: r.overview,
        genres: r.genre_ids.map((gid) => reverse.get(gid) ?? String(gid)),
        posterUrl: r.poster_path ? `${POSTER_BASE}${r.poster_path}` : undefined,
    }));
};

/** LangChain tool wrapper around tmdbDiscover. Returns JSON string with Movie[] or { error }. */
export const tmdbDiscoverMoviesTool = tool(
    async ({
        genres,
        minVoteAverage,
        yearFrom,
        yearTo,
        originalLanguage,
        sortBy,
        limit,
    }: DiscoverFilters) => {
        try {
            const movies = await tmdbDiscover({
                genres,
                minVoteAverage,
                yearFrom,
                yearTo,
                originalLanguage,
                sortBy,
                limit,
            });
            return JSON.stringify(movies);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ error: msg });
        }
    },
    {
        name: 'tmdb_discover_movies',
        description:
            'Busca películas en TMDB por género, rating mínimo, rango de años, idioma original y criterio de orden. ' +
            'Devuelve un JSON array con id, título, fecha, rating, sinopsis, géneros y poster.',
        schema: z.object({
            genres: z.array(z.string()).optional().describe('Nombres de géneros en inglés (e.g. "thriller", "comedy").'),
            minVoteAverage: z.number().min(0).max(10).optional().describe('Rating mínimo TMDB (0-10).'),
            yearFrom: z.number().int().optional().describe('Año mínimo de estreno.'),
            yearTo: z.number().int().optional().describe('Año máximo de estreno.'),
            originalLanguage: z.string().length(2).optional().describe('Código ISO 639-1 (e.g. "en", "es").'),
            sortBy: z.enum(['popularity', 'rating']).optional().describe('"popularity" (default) o "rating".'),
            limit: z.number().int().min(1).max(20).optional().describe('Cantidad máxima de resultados (default 5, máx 20).'),
        }),
    },
);
