"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users, hack_projects } from "@/db/schema";
import { Octokit } from "octokit";
import { IssueWalletABI } from "../../../abi";
import { parseEther } from "viem";
import { Session } from "next-auth";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface Issue {
  id: number;
  title: string;
  html_url: string;
  number: number;
  body: string;
  created_at: string;
}

export async function fetchUserProfile(email: string) {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email));
  return user;
}

export async function fetchRepositories(userId: string) {
  const repos = await db.select()
    .from(hack_projects)
    .where(eq(hack_projects.owner_id, userId));
  return repos;
}

export async function fetchIssues(token: string, user: string, repo: string) {
  const octokit = new Octokit({ auth: token });
  const response = await octokit.request(
    `GET /repos/${user}/${repo}/issues`,
    {
      owner: user,
      repo: repo,
      state: "open",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return response.data as Issue[];
}

export async function fetchIssueDetails(token: string, user: string, repo: string, issueNumber: string) {
  const octokit = new Octokit({ auth: token });
  const response = await octokit.request(
    `GET /repos/${user}/${repo}/issues/${issueNumber}`,
    {
      owner: user,
      repo: repo,
      issue_number: Number.parseInt(issueNumber),
    }
  );
  return response.data;
}

export async function deployContract(session: Session) {
  // Placeholder - actual implementation would go here
  return { contractAddress: "" };
}

export async function updateMaintainerWallet(username: string, contractAddress: string) {
  const response = await fetch("/api/publicProfile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: username,
      maintainerWallet: contractAddress,
    }),
  });
  return await response.json();
}

export async function createBounty(
  issueTitle: string,
  issueDescription: string,
  issueCreatedAt: string,
  issueUrl: string,
  difficulty: string,
  selectedissue: string,
  rewardAmount: string,
  priority: string,
  selectedRepo: string,
  email: string | null | undefined
) {
  const response = await fetch("/api/add-issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      issue_name: issueTitle,
      issue_description: issueDescription,
      issue_date: issueCreatedAt,
      issue_url: issueUrl,
      difficulty: difficulty,
      project_issues: selectedissue,
      rewardAmount: rewardAmount,
      priority: priority,
      project_repository: selectedRepo,
      email: email,
    }),
  });
  return await response.json();
}