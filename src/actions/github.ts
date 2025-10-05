"use server";

import { Octokit } from "@octokit/rest";
export async function fetchGithubIssuesByUser(authToken: string, user: string, selectedRepo: string) {
const octokit = new Octokit({ auth: authToken });
  try {
    const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues`,
          {
            owner: user,
            repo: selectedRepo,
            state: "open",
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );
    
    return { 
        success: true,
        issues: response.data 
    };
  } catch (error) {
    console.error("Error fetching issues:", error);
    return { 
      success: false,
      exists: false,
      error: 'Error fetching issues' 
    };
  }
}


export async function fetchGithubIssueDetails(authToken: string, user: string, selectedRepo: string, selectedissue: string) {

  if (!authToken) {
    return { success: false, error: 'Authentication token is missing' };
  }

  const octokit = new Octokit({ auth: authToken });

  try {
    const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues/${selectedissue}`,
          {
            owner: user,
            repo: selectedRepo,
            issue_number: Number.parseInt(selectedissue),
          }
        );
    return { 
        success: true,
        issue: response.data 
    };
  } catch (error) {
    console.error('Error fetching issue:', error);
    return { 
      success: false,
      exists: false,
      error: 'Error fetching issue' 
    };
  }
}