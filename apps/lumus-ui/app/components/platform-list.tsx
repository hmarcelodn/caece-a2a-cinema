import Image from "next/image";
import { resolvePlatform } from "../lib/platforms";

function PlatformChip({
  name,
  icon,
}: {
  name: string;
  icon?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
      {icon ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F3EDE4] p-1">
          <Image
            src={icon}
            alt=""
            width={24}
            height={24}
            className="size-6 object-contain"
            unoptimized
          />
        </span>
      ) : null}
      <span className="text-sm font-medium text-[#4A3F35]">{name}</span>
    </span>
  );
}

export default function PlatformList({ platforms }: { platforms: string[] }) {
  if (platforms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((name) => {
        const resolved = resolvePlatform(name);
        return (
          <PlatformChip
            key={name}
            name={resolved?.label ?? name}
            icon={resolved?.icon}
          />
        );
      })}
    </div>
  );
}
