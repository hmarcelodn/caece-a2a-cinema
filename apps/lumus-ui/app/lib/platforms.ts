export type PlatformEntry = {
  id: string;
  label: string;
  icon: string;
  aliases: string[];
};

export const PLATFORMS: readonly PlatformEntry[] = [
  {
    id: "netflix",
    label: "Netflix",
    icon: "/platforms/netflix.svg",
    aliases: ["netflix"],
  },
  {
    id: "amazon-prime",
    label: "Amazon Prime",
    icon: "/platforms/amazon-prime.svg",
    aliases: [
      "amazon prime",
      "prime video",
      "amazon prime video",
      "prime",
    ],
  },
  {
    id: "disney-plus",
    label: "Disney+",
    icon: "/platforms/disney-plus.svg",
    aliases: ["disney", "disney plus", "disney+"],
  },
  {
    id: "hbo-max",
    label: "HBO Max",
    icon: "/platforms/hbo-max.svg",
    aliases: ["hbo max", "hbo", "max"],
  },
  {
    id: "apple-tv-plus",
    label: "Apple TV+",
    icon: "/platforms/apple-tv-plus.svg",
    aliases: ["apple tv", "apple tv plus", "appletv"],
  },
  {
    id: "star-plus",
    label: "Star+",
    icon: "/platforms/star-plus.svg",
    aliases: ["star", "star plus", "star+"],
  },
  {
    id: "paramount-plus",
    label: "Paramount+",
    icon: "/platforms/paramount-plus.svg",
    aliases: ["paramount", "paramount plus", "paramount+"],
  },
] as const;

function normalizePlatformKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function resolvePlatform(name: string): PlatformEntry | null {
  const key = normalizePlatformKey(name);
  if (!key) return null;

  for (const platform of PLATFORMS) {
    const candidates = [
      platform.id.replace(/-/g, " "),
      normalizePlatformKey(platform.label),
      ...platform.aliases.map(normalizePlatformKey),
    ];

    if (candidates.some((candidate) => candidate === key || key.includes(candidate) || candidate.includes(key))) {
      return platform;
    }
  }

  return null;
}
