"use client";

import { useEffect, useState } from "react";
import LumusMascot from "./lumus-mascot";

const LOADING_PHRASES = [
  "Buscando tu película perfecta...",
  "Leyendo el ambiente de la sala...",
  "Descartando opciones que no van con tu mood...",
  "Calibrando manta, sillón y nivel de drama...",
  "Consultando la biblioteca secreta de LUMA...",
  "Casi lo tengo, un segundo más...",
] as const;

const PHRASE_INTERVAL_MS = 2800;

export default function SearchLoading() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % LOADING_PHRASES.length);
    }, PHRASE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-8 py-16"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative">
        <LumusMascot size={128} className="animate-pulse" />
        <span
          className="absolute right-2 bottom-2 size-3.5 rounded-full border-2 border-[#FDF6ED] bg-green-500"
          aria-hidden
        />
      </div>
      <p
        key={phraseIndex}
        className="search-loading-phrase max-w-sm px-4 text-center text-lg font-semibold text-[#4A3F35]"
      >
        {LOADING_PHRASES[phraseIndex]}
      </p>
    </div>
  );
}
