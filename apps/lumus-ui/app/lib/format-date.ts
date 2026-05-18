export function formatReleaseDate(isoDate: string): string {
  if (!isoDate || isoDate === "<UNKNOWN>") return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
