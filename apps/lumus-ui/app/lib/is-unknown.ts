import { UNKNOWN } from "../types/movie-result";

export function isUnknown(
  value: string | string[] | null | undefined,
): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) {
    return value.length === 0 || value.every((v) => v === UNKNOWN || !v.trim());
  }
  const trimmed = value.trim();
  return trimmed === "" || trimmed === UNKNOWN;
}

export function unknownOr<T extends string>(
  value: T | null | undefined,
): T | typeof UNKNOWN {
  if (value == null || value.trim() === "") return UNKNOWN;
  return value;
}
