/**
 * Returns the line number of the given index in the content (1-based).
 */
export function getLineByStart(content: string, idx: number): number {
  return content.slice(0, idx).split("\n").length;
}
