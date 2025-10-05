"use server";

import { db } from "../db/index";
import { contributorRequests } from "../db/schema";
import { eq, and } from "drizzle-orm";

export async function getContributorRequests(projectOwner: string) {
  if (!projectOwner) {
    return { success: false, error: "projectOwner is required" };
  }

  try {
    const projectsData = await db
      .select()
      .from(contributorRequests)
      .where(and(
        eq(contributorRequests.projectOwner, projectOwner),
        eq(contributorRequests.status, "assigned")
      ));
    return { success: true, project: projectsData };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function createContributorRequest({
  projectName,
  Contributor_id,
  contributor_email,
  requestDate,
  skills,
  issue,
  projectOwner,
  image_url,
  name,
  description,
  status,
  fullName
}: {
  projectName: string;
  Contributor_id: string;
  contributor_email: string;
  requestDate: string;
  skills?: string[];
  issue: string;
  projectOwner: string;
  image_url?: string;
  name: string;
  description?: string;
  status: string;
  fullName?: string;
}) {
  try {
    // Check if required fields are present
    if (!projectName || !Contributor_id || !issue || !name) {
      return { success: false, error: "Missing required fields" };
    }

    await db.insert(contributorRequests).values({
      projectName,
      Contributor_id,
      contributor_email,
      requestDate: new Date(requestDate),
      skills: skills ? JSON.stringify(skills) : null,
      issue,
      projectOwner,
      image_url,
      name,
      description,
      status,
      fullName
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating contributor request:", error);
    return { success: false, error: "Failed to create contributor request" };
  }
}

export async function updateContributorRequestStatus({
  id,
  status
}: {
  id: string;
  status: string;
}) {
  try {
    if (!id || !status) {
      return { success: false, error: 'Missing required fields' };
    }
    
    await db
      .update(contributorRequests)
      .set({ status })
      .where(eq(contributorRequests.id, id));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating contributor request status:', error);
    return { success: false, error: 'Failed to update contributor request status' };
  }
}

export async function getPullRequests() {
  try {
    const projectsData = await db
      .select()
      .from(contributorRequests)
      .where(eq(contributorRequests.status, "assigned"));
      
    return { success: true, data: projectsData };
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return { success: false, error: 'Failed to fetch pull requests' };
  }
}