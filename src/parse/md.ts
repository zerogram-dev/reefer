import { RefWithLine } from "../types.ts";
import { getLineByStart } from "../utils.ts";
import { Parser } from "./index.ts";
import { parseRefs } from "./ref.ts";

export const parser: Parser = (src) => {
  const refs: RefWithLine[] = [];
  const invalidRefs: { line: number; content: string }[] = [];
  const commentMatches = Array.from(src.matchAll(/<!--([\s\S]*?)-->/g));

  for (const match of commentMatches) {
    const firstLineNo = getLineByStart(src, match.index);

    const lines = match[1].split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { valid, invalid } = parseRefs(line);

      valid.forEach((ref) => {
        refs.push({ ...ref, line: firstLineNo + i });
      });
      invalid.forEach((ref) => {
        invalidRefs.push({ line: firstLineNo + i, content: ref });
      });
    }
  }

  return { refs, invalidRefs };
};
