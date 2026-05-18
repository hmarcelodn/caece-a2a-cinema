"use client";

import { useState } from "react";

const OPTION_ICONS: Record<string, string> = {
  "Frio y lluvioso": "🌧️",
  "Fresco y nublado": "☁️",
  Templado: "🌤️",
  Caluroso: "☀️",
  Pesimo: "😞",
  Agotador: "😓",
  Normal: "😐",
  Bueno: "🙂",
  Genial: "🎉",
  Ansioso: "😰",
  "Buscar una película": "🎬",
  "Me recomiendas una película": "✨",
  Otro: "💭",
  "Solo yo": "👤",
  "Con mi pareja": "💑",
  Grupo: "👥",
  "Una película": "🍿",
  "De fondo": "📺",
  "Algo corto": "⏱️",
  Documental: "📽️",
  "Maratón": "🎞️",
  Thriller: "🔪",
};

function getOptionIcon(option: string): string {
  return OPTION_ICONS[option] ?? option.charAt(0).toUpperCase();
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const icon = getOptionIcon(option);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "relative flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 text-left transition-all",
        selected
          ? "border border-[#C17A64] bg-[#F5EBE0]"
          : "border border-transparent bg-white shadow-sm",
      ].join(" ")}
    >
      {selected && (
        <span
          className="absolute top-3 right-3 size-2 rounded-full bg-[#C17A64]"
          aria-hidden
        />
      )}
      <span
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-lg",
          selected ? "bg-[#C17A64] text-white" : "bg-[#F3EDE4] text-[#4A3F35]",
        ].join(" ")}
        aria-hidden
      >
        {icon}
      </span>
      <span className="text-sm font-medium text-[#4A3F35]">{option}</span>
    </button>
  );
}

export default function Question({
  question,
  options,
  columns = 2,
  onSelect,
}: {
  question: string;
  options: string[];
  columns?: 2 | 3;
  onSelect: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const gridCols =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div role="group" aria-label={question}>
      <h2 className="mb-3 text-xs font-bold tracking-wider text-[#A38E7E] uppercase">
        {question}
      </h2>
      <div className={`grid gap-3 ${gridCols}`}>
        {options.map((option) => (
          <OptionCard
            key={option}
            option={option}
            selected={selected === option}
            onSelect={() => {
              setSelected(option);
              onSelect(option);
            }}
          />
        ))}
      </div>
    </div>
  );
}
