const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const GENRE_LIST_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;

let cachedGenreMap: Map<string, number> | null = null;

/** Lazy-loads the TMDB genre map (lowercase name → id). Cached after first call. */
export const loadGenreMap = async (): Promise<Map<string, number>> => {
    if (cachedGenreMap) return cachedGenreMap;

    const res = await fetch(GENRE_LIST_URL);
    if (!res.ok) {
        throw new Error(`TMDB genre list HTTP ${res.status}`);
    }
    const body = (await res.json()) as { genres?: { id: number; name: string }[] };
    if (!body.genres || !Array.isArray(body.genres)) {
        throw new Error('TMDB genre list: respuesta sin campo genres.');
    }

    cachedGenreMap = new Map<string, number>();
    for (const g of body.genres) {
        cachedGenreMap.set(g.name.toLowerCase(), g.id);
    }
    return cachedGenreMap;
};

/** Resolves genre names (case-insensitive) to TMDB IDs. Returns resolved IDs and any unknown names. */
export const resolveGenreIds = async (
    names: string[],
): Promise<{ ids: number[]; unknown: string[] }> => {
    const map = await loadGenreMap();
    const ids: number[] = [];
    const unknown: string[] = [];
    for (const name of names) {
        const id = map.get(name.toLowerCase());
        if (id != null) {
            ids.push(id);
        } else {
            unknown.push(name);
        }
    }
    return { ids, unknown };
};
