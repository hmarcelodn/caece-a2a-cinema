import Link from "next/link";
import { formatReleaseDate } from "../lib/format-date";
import { isUnknown } from "../lib/is-unknown";
import { toVideoEmbedUrl } from "../lib/to-video-embed-url";
import type { MovieResult } from "../types/movie-result";
import LumusMascot from "./lumus-mascot";
import MoviePoster from "./movie-poster";
import PlatformList from "./platform-list";

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[#A38E7E] uppercase">
      {children}
    </h2>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  const display = Array.isArray(value) ? value.join(", ") : value;
  const hidden = Array.isArray(value)
    ? value.every((v) => isUnknown(v))
    : isUnknown(value);

  if (hidden) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-bold tracking-wider text-[#A38E7E] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#4A3F35]">{display}</p>
    </div>
  );
}

export default function MovieResultView({ movie }: { movie: MovieResult }) {
  const releaseLabel = formatReleaseDate(movie.movie_release_date);
  const hasTrailer =
    !isUnknown(movie.movie_trailer_url) &&
    movie.movie_trailer_url.startsWith("http");
  const trailerEmbed = hasTrailer
    ? toVideoEmbedUrl(movie.movie_trailer_url)
    : null;
  const visibleGenres = movie.movie_genres.filter((g) => !isUnknown(g));
  const visiblePlatforms = movie.movie_platforms.filter((p) => !isUnknown(p));
  const visibleCast = movie.movie_cast.filter((c) => !isUnknown(c));
  const visibleSubtitles = movie.movie_subtitles.filter((s) => !isUnknown(s));

  return (
    <div className="space-y-8">
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
            {movie.movie_reason_to_watch}
          </p>
        </div>
      </div>

      <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <MoviePoster src={movie.movie_picture_url} alt={movie.movie_title} />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5">
            <h1 className="text-2xl font-bold leading-tight text-[#4A3F35]">
              {movie.movie_title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#C17A64] px-3 py-1 text-sm font-semibold text-white">
                ★ {movie.movie_rating.toFixed(1)}
              </span>
              {releaseLabel && (
                <span className="text-sm text-[#A38E7E]">{releaseLabel}</span>
              )}
            </div>
            {visibleGenres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visibleGenres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-2xl bg-[#F3EDE4] px-3 py-1 text-sm font-medium text-[#4A3F35]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      {!isUnknown(movie.movie_overview) && (
        <section>
          <SectionLabel>Sinopsis</SectionLabel>
          <p className="rounded-3xl bg-white p-5 text-base leading-relaxed text-[#4A3F35] shadow-sm">
            {movie.movie_overview}
          </p>
        </section>
      )}

      {visiblePlatforms.length > 0 && (
        <section>
          <SectionLabel>Dónde verla</SectionLabel>
          <PlatformList platforms={visiblePlatforms} />
        </section>
      )}

      <section className="space-y-3">
        <SectionLabel>Detalles</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Director" value={movie.movie_director} />
          {visibleCast.length > 0 && (
            <DetailRow label="Elenco" value={visibleCast} />
          )}
          <DetailRow label="Idioma" value={movie.movie_languages} />
          {visibleSubtitles.length > 0 && (
            <DetailRow label="Subtítulos" value={visibleSubtitles} />
          )}
        </div>
      </section>

      {hasTrailer && (
        <section>
          <SectionLabel>Trailer</SectionLabel>
          {trailerEmbed ? (
            <div className="aspect-video overflow-hidden rounded-3xl bg-black shadow-sm">
              <iframe
                src={trailerEmbed.embedUrl}
                title={`Trailer de ${movie.movie_title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full border-0"
              />
            </div>
          ) : (
            <a
              href={movie.movie_trailer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C17A64] py-4 font-semibold text-white shadow-sm transition-colors hover:bg-[#B06E59]"
            >
              Ver trailer
            </a>
          )}
        </section>
      )}

      <Link
        href="/"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#C17A64] bg-white py-4 font-semibold text-[#C17A64] shadow-sm transition-colors hover:bg-[#F5EBE0]"
      >
        Buscar otra película
      </Link>
    </div>
  );
}
