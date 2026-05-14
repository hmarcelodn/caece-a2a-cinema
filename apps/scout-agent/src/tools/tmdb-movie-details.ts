import { z } from 'zod';
import { tool } from 'langchain';

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_MOVIE_URL = 'https://api.themoviedb.org/3/movie';

type TmdbMovieDetail = {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    overview: string;
    runtime: number | null;
    genres: { id: number; name: string }[];
    poster_path: string | null;
    tagline: string;
    budget: number;
    revenue: number;
    status: string;
    original_language: string;
};

/** Fetches full movie details from TMDB by movie ID. */
export const fetchMovieDetails = async (movieId: number): Promise<TmdbMovieDetail> => {
    const url = `${TMDB_MOVIE_URL}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`TMDB movie detail HTTP ${res.status}`);
    }
    return (await res.json()) as TmdbMovieDetail;
};

/** LangChain tool: get full TMDB movie details by ID. Returns JSON string. */
export const tmdbMovieDetailsTool = tool(
    async ({ movieId }) => {
        try {
            const detail = await fetchMovieDetails(movieId);
            return JSON.stringify({
                id: detail.id,
                title: detail.title,
                originalTitle: detail.original_title,
                releaseDate: detail.release_date,
                voteAverage: detail.vote_average,
                voteCount: detail.vote_count,
                overview: detail.overview,
                runtime: detail.runtime,
                genres: detail.genres.map((g) => g.name),
                tagline: detail.tagline,
                originalLanguage: detail.original_language,
                posterUrl: detail.poster_path
                    ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
                    : null,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ error: msg });
        }
    },
    {
        name: 'tmdb_movie_details',
        description:
            'Obtiene detalles completos de una película de TMDB por su ID numérico: ' +
            'sinopsis, duración, rating, votos, tagline, géneros, idioma original y poster.',
        schema: z.object({
            movieId: z.number().int().describe('ID numérico de la película en TMDB.'),
        }),
    },
);
