"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MovieResultView from "../components/movie-result-view";
import {
  MOCK_MOVIE_RESULT,
  MOVIE_RESULT_STORAGE_KEY,
  type MovieResult,
} from "../types/movie-result";

export default function MoviePage() {
  const [movie, setMovie] = useState<MovieResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_MOVIE === "true") {
      setMovie(MOCK_MOVIE_RESULT);
      setReady(true);
      return;
    }

    try {
      const raw = sessionStorage.getItem(MOVIE_RESULT_STORAGE_KEY);
      if (raw) {
        setMovie(JSON.parse(raw) as MovieResult);
      }
    } catch {
      setMovie(null);
    }
    setReady(true);
  }, []);

  return (
    <div className="min-h-full bg-[#FDF6ED] text-[#4A3F35]">
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {!ready ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-24 animate-pulse rounded-3xl bg-[#E8DDD0]" />
            <div className="h-48 animate-pulse rounded-3xl bg-[#E8DDD0]" />
            <div className="h-32 animate-pulse rounded-3xl bg-[#E8DDD0]" />
          </div>
        ) : movie ? (
          <MovieResultView movie={movie} />
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#4A3F35]">
              Todavía no hay una película para mostrar
            </p>
            <p className="mt-2 text-sm text-[#A38E7E]">
              Completá el wizard en la página principal y buscá tu película.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#C17A64] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B06E59]"
            >
              Ir al inicio
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
