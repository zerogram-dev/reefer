import oxc from "npm:oxc-parser@0.38.0";

import { ParseResult } from "./index.ts";
import { Parser } from "./index.ts";
import { parseRefs } from "./ref.ts";
import { RefWithLine } from "../types.ts";
import { getLineByStart } from "../utils.ts";

export function parserByExt(ext: string): Parser {
  // Need to parse filename with correct extension to help oxc determine a dialect.
  switch (ext) {
    case "js":
    case "cjs":
    case "mjs":
      return (src) => parser(src, "_.js");
    case "jsx":
      return (src) => parser(src, "_.jsx");
    case "ts":
      return (src) => parser(src, "_.ts");
    case "tsx":
      return (src) => parser(src, "_.tsx");
  }
  throw new Error(`Unsupported JS extension: ${ext}`);
}

const parser = (src: string, filename: string): ParseResult => {
  const result = oxc.parseSync(src, { sourceFilename: filename });

  const refs: RefWithLine[] = [];
  const invalidRefs: { line: number; content: string }[] = [];

  for (const comment of result.comments) {
    const firstLineNo = getLineByStart(src, comment.start);

    // @todo Here we iterate over each line in order to remember the line
    //  number. We assume that a ref spans over a single line in the comments.
    //  It's better to use a more sophisticated approach to handle multiline comments.

    const lines = src.slice(comment.start, comment.end).split("\n");
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
