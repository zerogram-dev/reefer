import { Ref } from "../types.ts";

/**
 * Returns all refs in the string that match the format:
 * `@ref{<URL>}(<timestamp>)`
 *
 * @example
 *
 * ```
 * parseRefs('@ref{https://telegram.org}(2024-11-28)')
 * // [{ url: new URL('https://telegram.org'), timestamp: new Date('2024-11-28') }]
 * ```
 */
export function parseRefs(s: string): { valid: Ref[]; invalid: string[] } {
  return Array
    .from(s.matchAll(/@ref{([^}]+)}\(([^)]+)\)/g))
    .reduce(
      (acc, [match, rawUrl, rawTimestamp]) => {
        try {
          const url = new URL(rawUrl);
          const timestamp = new Date(rawTimestamp);
          if (isNaN(timestamp.getTime())) {
            throw new Error(`Invalid timestamp: ${rawTimestamp}`);
          }
          acc.valid.push({ url, timestamp });
        } catch (_) {
          acc.invalid.push(match);
        }
        return acc;
      },
      { valid: [] as Ref[], invalid: [] as string[] },
    );
}
