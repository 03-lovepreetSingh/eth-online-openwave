"use server";

import { db } from '@/db';
import { assignedIssues } from '@/db/schema';

interface AssignIssueInput {
  projectName: string;
  Contributor_id: string;
  issue: string;
  image_url?: string;
  name: string;
  description?: string;
}

export async function assignIssue({
  projectName,
  Contributor_id,
  issue,
  image_url = '',
  name,
  description = ''
}: AssignIssueInput) {
  try {
    // Check if required fields are present
    if (!projectName || !Contributor_id || !issue || !name) {
      return {
        success: false,
        error: 'Missing required fields for assignment'
      };
    }

    await db.insert(assignedIssues).values({
      projectName,
      Contributor_id,
      issue,
      image_url,
      name,
      description
    });

    return { success: true };
  } catch (error) {
    console.error('Error assigning issue:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: `Failed to assign issue: ${errorMessage}`
    };
  }
}

export async function getAssignedIssues() {
  try {
    const query = db.select().from(assignedIssues);
    const actuallyAssignedIssues = await query.execute();
    
    return { 
      success: true,
      data: actuallyAssignedIssues 
    };
  } catch (error) {
    console.error('Error fetching assigned issues:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: `Failed to fetch assigned issues: ${errorMessage}`
    };
  }
}