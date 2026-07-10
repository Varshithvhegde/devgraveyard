import { Octokit } from "@octokit/rest";
import { GitHubCommit, GitHubRepo } from "@/types/github";

export function createOctokit(token: string) {
  return new Octokit({ auth: token });
}

export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
  const octokit = createOctokit(token);
  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    sort: "pushed",
    per_page: 100,
    affiliation: "owner",
  });
  return repos.filter((r) => !r.fork) as GitHubRepo[];
}

export async function getRepoCommits(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubCommit[]> {
  const octokit = createOctokit(token);
  try {
    const commits = await octokit.paginate(octokit.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
    });
    return commits.filter((c) => c.commit.author?.date) as GitHubCommit[];
  } catch {
    return [];
  }
}

export async function getRepoLanguages(
  token: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.repos.listLanguages({ owner, repo });
    return data;
  } catch {
    return {};
  }
}

export async function getFirstAndLastCommit(
  token: string,
  owner: string,
  repo: string
): Promise<{ first: GitHubCommit | null; last: GitHubCommit | null }> {
  const octokit = createOctokit(token);
  try {
    const { data: lastCommits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });
    const last = (lastCommits[0] ?? null) as GitHubCommit | null;

    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const { data: firstCommits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 1,
      until: new Date(
        new Date(repoData.created_at).getTime() + 86400000 * 30
      ).toISOString(),
    });
    const first = ((firstCommits[firstCommits.length - 1] ?? last)) as GitHubCommit | null;

    return { first, last };
  } catch {
    return { first: null, last: null };
  }
}
