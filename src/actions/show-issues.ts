"use server";

import { db } from '@/db';
import { issues, contributorRequests } from '@/db/schema';
import { eq ,and} from 'drizzle-orm';
export async function getAllIssues(currentUser?: string) {
  if (currentUser) {
    console.log('Fetching issues for user:', currentUser);
  }
  try {
    if (!currentUser) {
      return { success: true, data: [] };
    }
    
    const issuesData = await db
      .select()
      .from(issues)
      .innerJoin(
        contributorRequests,
        and(
          eq(issues.project_repository, contributorRequests.projectName),
          eq(issues.project_issues, contributorRequests.issue),
          eq(contributorRequests.Contributor_id, currentUser),
          eq(contributorRequests.status, 'assigned')
        )
      )
      .groupBy(issues.id, contributorRequests.id, issues.priority)
      .orderBy(issues.priority);

    const mappedData = issuesData.map(issue => ({
      ...issue,
      Difficulty: null,
      rewardAmount: null,
      active: true,
      publisher: null,
      issue_date: null
    }));
    
    return {
      success: true,
      data: mappedData.length > 0 ? mappedData : []
    };
  } catch (error) {
    console.error('Error fetching issues:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
