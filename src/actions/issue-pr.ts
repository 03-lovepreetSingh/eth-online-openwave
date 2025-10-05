"use server";

import { db } from '@/db';
import { issues } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getIssueForPR(project_repository: string, issueNumber: string) {
  try {
    if (!project_repository) {
      return { success: false, error: 'project_repository is required' };
    }
    if (!issueNumber) {
      return { success: false, error: 'issueNumber is required' };
    }

    const projectsData = await db
      .select()
      .from(issues)
      .where(
        and(
          eq(issues.project_repository, project_repository),
          eq(issues.project_issues, issueNumber)
        )
      )
      .orderBy(issues.priority);
      
    return { success: true, data: projectsData };
  } catch (error) {
    console.error('Error fetching issue for PR:', error);
    return { success: false, error: 'Failed to fetch issue for PR' };
  }
}

export async function updateIssueForPR(project_repository: string, issueNumber: string, updateData: any) {
  try {
    if (!project_repository) {
      return { success: false, error: 'project_repository is required' };
    }
    if (!issueNumber) {
      return { success: false, error: 'issueNumber is required' };
    }

    await db
      .update(issues)
      .set(updateData)
      .where(
        and(
          eq(issues.project_repository, project_repository),
          eq(issues.project_issues, issueNumber)
        )
      );
      
    return { success: true, message: 'Issue updated successfully' };
  } catch (error) {
    console.error('Error updating issue for PR:', error);
    return { success: false, error: 'Failed to update issue for PR' };
  }
}