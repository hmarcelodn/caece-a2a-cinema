"use client";

import Image from "next/image";
import { useState } from "react";
import { isUnknown } from "../lib/is-unknown";

function PosterPlaceholder() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-[#E8DDD0] text-[#A38E7E]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-10 opacity-70"
        aria-hidden
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9v6l5-3-5-3z" />
      </svg>
      <span className="text-sm">Sin póster</span>
    </div>
  );
}

export default function MoviePoster({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = isUnknown(src) || failed;

  return (
    <div
      className={`relative flex aspect-[2/3] w-full shrink-0 items-center justify-center overflow-hidden bg-[#E8DDD0] sm:w-44 ${className}`}
    >
      {showPlaceholder ? (
        <PosterPlaceholder />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 176px"
          unoptimized
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
