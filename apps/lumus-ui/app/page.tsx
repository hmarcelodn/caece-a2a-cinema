"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LumusMascot from "./components/lumus-mascot";
import PlatformQuestion from "./components/platform-question";
import Question from "./components/question";
import SearchLoading from "./components/search-loading";
import { MOVIE_RESULT_STORAGE_KEY } from "./types/movie-result";

export default function Home() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (question: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleSearch = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        movie?: unknown;
        message?: string;
      };

      if (!res.ok || !data.ok || !data.movie) {
        setError(data.message ?? "No se pudo obtener una recomendación.");
        return;
      }

      sessionStorage.setItem(
        MOVIE_RESULT_STORAGE_KEY,
        JSON.stringify(data.movie),
      );
      router.push("/movie");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#FDF6ED] text-[#4A3F35]">
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {!loading && (
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <LumusMascot />
              <span
                className="absolute right-1 bottom-1 size-3 rounded-full border-2 border-[#FDF6ED] bg-green-500"
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-[#C17A64] uppercase">
                LUMA
              </p>
              <p className="mt-2 text-base leading-relaxed text-[#4A3F35]">
                Primero lo primero — necesito leer el ambiente. ¿Cómo está el
                clima afuera y cómo llegaron al día de hoy?
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <SearchLoading />
        ) : (
        <div className="space-y-10">
          <ul className="list-none space-y-10 p-0">
            <li>
              <Question
                question="¿Qué hacemos esta noche?"
                options={[
                  "Buscar una película",
                  "Me recomiendas una película",
                  "Otro",
                ]}
                onSelect={(answer) => handleAnswer("¿Qué hacemos esta noche?", answer)}
              />
            </li>
            <li>
              <Question
                question="¿Como esta el clima?"
                columns={2}
                options={[
                  "Frio y lluvioso",
                  "Fresco y nublado",
                  "Templado",
                  "Caluroso",
                ]}
                onSelect={(answer) => handleAnswer("¿Como esta el clima?", answer)}
              />
            </li>
            <li>
              <Question
                question="¿Como fue el día?"
                columns={3}
                options={[
                  "Pesimo",
                  "Agotador",
                  "Normal",
                  "Bueno",
                  "Genial",
                  "Ansioso",
                ]}
                onSelect={(answer) => handleAnswer("¿Como fue el día?", answer)}
              />
            </li>
            <li>
              <Question
                question="¿Cuantas personas van a ver la película?"
                options={["Solo yo", "Con mi pareja", "Grupo"]}
                onSelect={(answer) => handleAnswer("¿Cuantas personas van a ver la película?", answer)}
              />
            </li>
            <li>
              <Question
                question="¿Tipo de sesión?"
                options={[
                  "Una película",
                  "De fondo",
                  "Algo corto",
                  "Documental",
                  "Maratón",
                ]}
                onSelect={(answer) => handleAnswer("¿Tipo de sesión?", answer)}
              />
            </li>
            <li>
              <Question
                question="¿Que genero de película te gusta?"
                options={["Thriller"]}
                onSelect={(answer) => handleAnswer("¿Que genero de película te gusta?", answer)}
              />
            </li>
            <li>
              <PlatformQuestion
                question="¿Qué plataformas preferis?"
                onSelect={(selected) =>
                  handleAnswer("¿Qué plataformas preferis?", selected.join(", "))
                }
              />
            </li>
          </ul>
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#C17A64] py-4 font-semibold text-white shadow-sm transition-colors hover:bg-[#B06E59] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSearch}
          >
            <span aria-hidden>→</span>
            Buscar mi película
          </button>
        </div>
        )}
      </main>
    </div>
  );
}
