import { z } from 'zod';
import { tool } from 'langchain';
import { loadGenreMap } from './tmdb-genres';

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

type TmdbSearchResult = {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    vote_average: number;
    overview: string;
    genre_ids: number[];
    poster_path: string | null;
};

type TmdbSearchResponse = {
    page: number;
    results: TmdbSearchResult[];
    total_results: number;
    total_pages: number;
};

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

export const tmdbSearchMoviesTool = tool(
    async ({ query, year, limit }: { query: string; year?: number; limit?: number }) => {
        try {
            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                query,
                include_adult: 'false',
                language: 'en-US',
                page: '1',
            });
            if (year != null) {
                params.set('year', String(year));
            }

            const url = `${TMDB_SEARCH_URL}?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`TMDB search HTTP ${res.status}`);
            }

            const body = (await res.json()) as TmdbSearchResponse;
            const max = Math.min(limit ?? 10, 20);
            const reverse = await getReverseGenreMap();

            const movies = body.results.slice(0, max).map((r) => ({
                id: r.id,
                title: r.title,
                originalTitle: r.original_title,
                releaseDate: r.release_date ?? '',
                voteAverage: r.vote_average,
                overview: r.overview,
                genres: r.genre_ids.map((gid) => reverse.get(gid) ?? String(gid)),
                posterUrl: r.poster_path ? `${POSTER_BASE}${r.poster_path}` : undefined,
            }));

            return JSON.stringify(movies);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ error: msg });
        }
    },
    {
        name: 'tmdb_search_movies',
        description:
            'Busca películas en TMDB por título o palabras clave. ' +
            'Devuelve un JSON array con id, título, fecha, rating, sinopsis, géneros y poster.',
        schema: z.object({
            query: z.string().describe('Texto de búsqueda (título o palabras clave).'),
            year: z.number().int().optional().describe('Filtrar por año de estreno.'),
            limit: z.number().int().min(1).max(20).optional().describe('Cantidad máxima de resultados (default 10, máx 20).'),
        }),
    },
);
