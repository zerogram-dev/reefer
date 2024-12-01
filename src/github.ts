import { Octokit } from "npm:octokit@4.0.2";
import { Commit } from "./types.ts";

export function getGithubFileUrl(
  repo: string,
  branch: string,
  filepath: string,
  line?: number,
): string {
  let url = `https://github.com/${repo}/blob/${branch}/${filepath}`;
  if (line !== undefined) {
    url += `#L${line}`;
  }
  return url;
}

export function getGithubDiffUrl(
  repo: string,
  base: string,
  head: string,
): string {
  return `https://github.com/${repo}/compare/${base}...${head}`;
}

export async function getFileCommit({
  gh,
  owner,
  repo,
  branch,
  path,
  date,
}: {
  gh: Octokit;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  date: Date | "latest";
}): Promise<Commit> {
  const { data } = await gh.rest.repos.listCommits({
    owner,
    repo,
    sha: branch,
    path,
    until: date === "latest" ? undefined : date.toISOString(),
    per_page: 1,
  });

  if (data.length === 0) {
    throw new Error(`No commits found for ${path}`);
  }

  const commit = data[0];
  return {
    date: new Date(commit.commit.committer?.date ?? 0),
    hash: commit.sha,
  };
}
