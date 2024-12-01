import { RefWithLine } from "../types.ts";
import { parserByExt as jsParserForExt } from "./js.ts";
import { parser as mdParser } from "./md.ts";

export type ParseResult = {
  refs: RefWithLine[];
  invalidRefs: { line: number; content: string }[];
};

export type Parser = (src: string) => ParseResult;

export const parsersByExtension: { [ext in string]?: Parser } = {
  "js": jsParserForExt("js"),
  "jsx": jsParserForExt("jsx"),
  "ts": jsParserForExt("ts"),
  "tsx": jsParserForExt("tsx"),
  "cjs": jsParserForExt("cjs"),
  "mjs": jsParserForExt("mjs"),

  "md": mdParser,
};
