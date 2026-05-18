"use client";

import Image from "next/image";
import { useState } from "react";
import { PLATFORMS } from "../lib/platforms";

function PlatformCard({
  label,
  icon,
  selected,
  onToggle,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
          "flex size-10 shrink-0 items-center justify-center rounded-lg p-1.5",
          selected ? "bg-[#C17A64]/10" : "bg-[#F3EDE4]",
        ].join(" ")}
      >
        <Image
          src={icon}
          alt={label}
          width={32}
          height={32}
          className="size-8 object-contain"
          unoptimized
        />
      </span>
      <span className="text-sm font-medium text-[#4A3F35]">{label}</span>
    </button>
  );
}

export default function PlatformQuestion({
  question,
  onChange,
  onSelect,
}: {
  question: string;
  onChange?: (selected: string[]) => void;
  onSelect: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    const selectedIds = Array.from(next);
    setSelected(next);
    onChange?.(selectedIds);
    onSelect(selectedIds);
  };

  return (
    <div role="group" aria-label={question}>
      <h2 className="mb-3 text-xs font-bold tracking-wider text-[#A38E7E] uppercase">
        {question}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <PlatformCard
            key={platform.id}
            label={platform.label}
            icon={platform.icon}
            selected={selected.has(platform.id)}
            onToggle={() => toggle(platform.id)}
          />
        ))}
      </div>
    </div>
  );
}
