import { glob } from "npm:glob";
import { Octokit } from "npm:octokit";
import { parsersByExtension } from "./parse/index.ts";
import { Commit, FetchedRefsMap, FileRefs, RefsMap } from "./types.ts";
import { parseConfig } from "./config.ts";
import { getCrawlerFileCommit } from "./crawler.ts";
import { getIssueBody } from "./issue.ts";

async function main() {
  const cfg = parseConfig();
  const [owner, repo] = cfg.REPO.split("/");
  const gh = new Octokit({ auth: cfg.GH_TOKEN });

  console.info(`Collecting refs from files ("${cfg.PATTERN}")...`);
  const {
    errors = [],
    warnings = [],
    refs,
  } = await collectRefs(cfg.PATTERN, { cwd: Deno.cwd() });

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }

  for (const error of errors) {
    console.error(`Error: ${error}`);
  }

  if (errors.length > 0) {
    console.error(
      `Failed to collect refs. ${errors.length} error(s) occurred. Exiting...`,
    );
    Deno.exit(1);
  }

  const totalRefs = refs.reduce((acc, { refs }) => acc + refs.length, 0);
  console.info(`Found ${totalRefs} ref(s) in ${refs.length} file(s).`);

  const refsMap = normalizeRefs(refs);

  console.info(`Fetching commits info for referenced pages...`);
  const now = new Date();
  const fetchedRefsMap = await fetchRefs(refsMap, gh);

  console.info(`Updating tracking issue (#${cfg.TRACKING_ISSUE_NO})...`);
  await gh.rest.issues.update({
    owner,
    repo,
    issue_number: cfg.TRACKING_ISSUE_NO,
    body: getIssueBody({
      repo: cfg.REPO,
      updatedAt: now,
      errorCount: errors.length,
      warningCount: warnings.length,
      refsMap: fetchedRefsMap,
    }),
  });
}

/**
 * Collects and returns refs from files matching the glob pattern.
 */
async function collectRefs(
  pattern: string,
  { cwd }: { cwd: string },
): Promise<{
  errors?: string[];
  warnings?: string[];
  refs: FileRefs[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const refs: FileRefs[] = [];

  const paths = await glob(pattern, {
    withFileTypes: true,
    cwd,
  });

  for (const path of paths) {
    if (!path.isFile()) {
      warnings.push(`Skipping ${path.name}: not a file`);
      continue;
    }

    const ext = path.name.split(".").pop();
    if (!ext) {
      warnings.push(`Skipping ${path.name}: no file extension`);
      continue;
    }

    const parser = parsersByExtension[ext];
    if (!parser) {
      warnings.push(`Skipping ${path.name}: unsupported extension`);
      continue;
    }

    try {
      const content = await Deno.readTextFile(path.fullpath());
      const { refs: validRefs, invalidRefs } = parser(content);

      for (const invalidRef of invalidRefs) {
        warnings.push(
          `Invalid ref in ${path.fullpath()}:${invalidRef.line} "${invalidRef.content}"`,
        );
      }

      if (validRefs.length > 0) {
        refs.push({ filepath: path.relative(), refs: validRefs });
      }
    } catch (e) {
      errors.push(`Error parsing refs for file "${path.name}": ${e}`);
    }
  }

  return { errors, warnings, refs };
}

function normalizeRefs(refs: FileRefs[]): RefsMap {
  const map: RefsMap = new Map();

  for (const { filepath, refs: fileRefs } of refs) {
    for (const ref of fileRefs) {
      const url = ref.url.toString();
      const timestamp = ref.timestamp;

      if (!map.has(url)) {
        map.set(url, []);
      }

      map.get(url)!.push({
        filepath,
        line: ref.line,
        timestamp,
      });
    }
  }

  return map;
}

async function fetchRefs(
  refsMap: RefsMap,
  gh: Octokit,
): Promise<FetchedRefsMap> {
  const result: FetchedRefsMap = new Map();
  const commitsCache: Map<string, Commit> = new Map();

  for (const [urlStr, refs] of refsMap.entries()) {
    const url = new URL(urlStr);
    const latestCommit = await getCrawlerFileCommit(gh, url, "latest");

    for (const ref of refs) {
      const cacheKey = `${ref.timestamp.toISOString()}${ref.filepath}`;
      const commit = commitsCache.get(cacheKey) ?? await getCrawlerFileCommit(
        gh,
        url,
        ref.timestamp,
      );
      commitsCache.set(cacheKey, commit);

      if (!result.has(urlStr)) {
        result.set(urlStr, {
          latestCommit,
          refs: [],
        });
      }

      result.get(urlStr)!.refs.push({ ...ref, commit });
    }
  }

  return result;
}

main();
