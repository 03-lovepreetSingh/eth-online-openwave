"use server";

import { db } from '@/db';
import { contributorRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getContributionsByUser(contributor: string) {
  try {
    if (!contributor) {
      return { success: false, error: 'Contributor ID is required' };
    }

    const projectsData = await db
      .select()
      .from(contributorRequests)
      .where(
        and(
          eq(contributorRequests.Contributor_id, contributor),
          eq(contributorRequests.status, "assigned")
        )
      );
      
    return { success: true, data: projectsData };
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return { success: false, error: 'Failed to fetch contributions' };
  }
}

export async function updateContributionStatus({
  projectName,
  status,
  Contributor,
  issue
}: {
  projectName: string;
  status: string;
  Contributor: string;
  issue: string;
}) {
  try {
    // Check if required fields are present
    if (!projectName || !status || !Contributor || !issue) {
      return { success: false, error: 'Missing required fields' };
    }

    // Update the status for the given parameters
    await db
      .update(contributorRequests)
      .set({ status })
      .where(
        and(
          eq(contributorRequests.projectName, projectName),
          eq(contributorRequests.issue, issue),
          eq(contributorRequests.Contributor_id, Contributor),
          eq(contributorRequests.status, "assigned")
        )
      );

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    console.error('Error updating contribution status:', error);
    return { 
      success: false, 
      error: 'Failed to update status',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}