import { getCrawlerRepoPathUrl, REPO } from "./crawler.ts";
import { getGithubDiffUrl, getGithubFileUrl } from "./github.ts";
import { FetchedRefsMap } from "./types.ts";
import { sliceHash } from "./utils.ts";

export function getIssueBody({
  repo,
  updatedAt,
  errorCount,
  warningCount,
  refsMap,
}: {
  repo: string;
  updatedAt: Date;
  errorCount: number;
  warningCount: number;
  refsMap: FetchedRefsMap;
}) {
  let refsCount = 0;
  const files = new Set<string>();
  const lines = [];
  for (const [urlStr, info] of refsMap) {
    if (info.refs.length === 0) continue;

    const url = new URL(urlStr);
    // deno-fmt-ignore
    lines.push(`**[${url.host}${url.pathname}](${url}) • [${info.latestCommit.date.toUTCString()}](${getCrawlerRepoPathUrl(url)})**`);
    lines.push("");

    for (const ref of info.refs) {
      const fileGhUrl = getGithubFileUrl(
        repo,
        "main",
        ref.filepath,
        ref.line,
      );

      const filepathContent = `[${ref.filepath}:${ref.line}](${fileGhUrl})`;
      if (ref.commit.hash !== info.latestCommit.hash) {
        // deno-fmt-ignore
        const diffText = `${sliceHash(ref.commit.hash)}...${sliceHash(info.latestCommit.hash)}`;
        const diffGhUrl = getGithubDiffUrl(
          REPO,
          ref.commit.hash,
          info.latestCommit.hash,
        );
        lines.push(`- [ ] ${filepathContent} • [${diffText}](${diffGhUrl})`);
      } else {
        lines.push(`- [x] ${filepathContent}`);
      }

      files.add(ref.filepath);
      refsCount++;
    }

    lines.push("");
  }

  const urlCount = refsMap.size;
  const fileCount = files.size;

  const warningsErrors = [
    warningCount > 0 ? `${warningCount} warnings` : "",
    errorCount > 0 ? `${errorCount} errors` : "",
  ].filter(Boolean).join(", ");

  return [
    // deno-fmt-ignore
    `_Updated on ${updatedAt.toUTCString()}${warningsErrors ? ` (${warningsErrors})` : ""}_<br/>_${urlCount} URLs • ${fileCount} files • ${refsCount} refs_`,
    "",
    "### Referenced Pages",
    "",
    ...lines,
  ].join("\n");
}
