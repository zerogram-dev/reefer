import { Octokit } from "npm:octokit";
import { getFileCommit } from "./github.ts";

export const REPO = "MarshalX/telegram-crawler";

export function getCrawlerRepoPath({ host, pathname }: URL): string {
  if (pathname === "/") {
    return `data/web/${host}.html`;
  }

  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
    pathname += ".html";
  } else if (!/\.\w+$/.test(pathname)) {
    pathname += ".html";
  }

  return `data/web/${host}${pathname}`;
}

export function getCrawlerRepoPathUrl(url: URL): string {
  return `https://github.com/${REPO}/tree/data/${getCrawlerRepoPath(url)}`;
}

export async function getCrawlerFileCommit(
  gh: Octokit,
  url: URL,
  date: Date | "latest",
) {
  const [owner, repo] = REPO.split("/");
  return await getFileCommit({
    gh,
    owner,
    repo,
    branch: "data",
    path: getCrawlerRepoPath(url),
    date,
  });
}
