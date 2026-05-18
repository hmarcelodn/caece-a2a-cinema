import type { MovieResult } from "../types/movie-result";

const DEFAULT_CINEMA_MANAGER_URL = "http://localhost:3004";

export async function requestRecommendation(
  message: string,
): Promise<MovieResult> {
  const baseUrl =
    process.env.CINEMA_MANAGER_URL ?? DEFAULT_CINEMA_MANAGER_URL;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new Error(
      `No se pudo conectar con caece-cinema-manager en ${baseUrl}. ¿Está corriendo el servidor?`,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail
        ? `Cinema manager respondió HTTP ${res.status}: ${detail}`
        : `Cinema manager respondió HTTP ${res.status}`,
    );
  }

  const movie = (await res.json()) as MovieResult;

  if (!movie.movie_title?.trim()) {
    throw new Error("El cinema manager devolvió una respuesta inválida.");
  }

  return movie;
}
