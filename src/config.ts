import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export type Config = z.infer<typeof Config>;
export const Config = z.object({
  PATTERN: z.string().default("./**/*.{js,ts,jsx,tsx,cjs,mjs,md}"),
  GH_TOKEN: z.string().min(1),
  REPO: z.string().min(1),
  TRACKING_ISSUE_NO: z.coerce.number().int().positive(),
});

export function parseConfig() {
  return Config.parse(Deno.env.toObject());
}
