"use server";

import { db } from "../db/index";
import { issues } from "../db/schema";
import { eq } from "drizzle-orm";

export async function addIssue({
  email,
  priority,
  issue_name,
  issue_description,
  issue_date,
  project_repository,
  issue_url,
  difficulty,
  rewardAmount,
  project_issues,
}: {
  email: string;
  priority: string;
  issue_name: string;
  issue_description: string;
  issue_date: string;
  project_repository: string;
  issue_url: string;
  difficulty: string;
  rewardAmount: number;
  project_issues: string;
}) {
  try {
    // First insert the issue
    const [{ issue_id: createdIssueId }] = await db
      .insert(issues)
      .values({
        issue_name,
        issue_description,
        issue_date,
        project_repository,
        issue_url,
        project_issues,
        Difficulty: difficulty,
        rewardAmount,
        priority,
      })
      .returning({ issue_id: issues.id });

    try {
      // Send webhook to n8n
      const response = await fetch(
        "https://n8n-h04ks0s0kk0kw0ocws0socsk.server.openwave.tech/webhook/43c1a3aa-c87d-4e66-a109-51e8412dbffc",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            n8n_condition: "create-issue",
            email: email,
            issue_id: createdIssueId,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to send webhook notification");
      }
    } catch (webhookError) {
      console.error("Webhook error:", webhookError);
      // Continue even if webhook fails
    }

    return {
      success: true,
      issueId: createdIssueId,
    };
  } catch (error) {
    console.error("Error in issue creation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getIssues() {
  try {
    const issuesData = await db.select().from(issues);
    return { issues: issuesData };
  } catch (error) {
    console.error("Error fetching issues:", error);
    return { success: false, error: "Failed to fetch issues" };
  }
}

export async function getIssueById(issueId: string) {
  try {
    if (!issueId) {
      return { success: false, error: 'Issue ID is required' };
    }

    const issue = await db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1);

    if (issue.length === 0) {
      return { success: false, error: 'Issue not found' };
    }

    return { success: true, data: issue[0] };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getIssuesByUser(publisher: string) {
  try {
    if (!publisher) {
      return { success: false, error: 'Publisher is required' };
    }

    const issuesData = await db
      .select()
      .from(issues)
      .where(eq(issues.publisher, publisher));

    return { success: true, data: issuesData };
  } catch (err: any) {
    console.error('Error fetching issues by user:', err);
    return { success: false, error: 'Internal server error' };
  }
}