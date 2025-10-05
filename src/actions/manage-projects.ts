"use server";

import { db } from '@/db';
import { project } from '@/db/schema';
import { eq, or, sql } from 'drizzle-orm';

export async function getManagedProjects(projectOwner: string) {
  try {
    if (!projectOwner) {
      return { success: false, error: 'projectOwner is required' };
    }

    // Get projects where user is either the owner OR in maintainerUserIds array
    const projectsData = await db.select().from(project).where(
      or(
        eq(project.projectOwner, projectOwner),
        sql`${project.maintainerUserIds}::jsonb ? ${projectOwner}`
      )
    );

    return { success: true, data: projectsData };
  } catch (error) {
    console.error('Error fetching managed projects:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}