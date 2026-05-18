export type VideoEmbed = {
  embedUrl: string;
  provider: "youtube" | "vimeo";
};

function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

function vimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

function parseYoutube(url: URL): VideoEmbed | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? { embedUrl: youtubeEmbedUrl(id), provider: "youtube" } : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.split("/")[2];
      return id ? { embedUrl: youtubeEmbedUrl(id), provider: "youtube" } : null;
    }

    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? { embedUrl: youtubeEmbedUrl(id), provider: "youtube" } : null;
    }

    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2];
      return id ? { embedUrl: youtubeEmbedUrl(id), provider: "youtube" } : null;
    }
  }

  return null;
}

function parseVimeo(url: URL): VideoEmbed | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id)
      ? { embedUrl: vimeoEmbedUrl(id), provider: "vimeo" }
      : null;
  }

  if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
    const id = url.pathname.split("/")[2];
    return id ? { embedUrl: vimeoEmbedUrl(id), provider: "vimeo" } : null;
  }

  return null;
}

export function toVideoEmbedUrl(rawUrl: string): VideoEmbed | null {
  try {
    const url = new URL(rawUrl);
    return parseYoutube(url) ?? parseVimeo(url);
  } catch {
    return null;
  }
}
