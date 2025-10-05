"use server";

import { db } from '@/db';
import { project } from '@/db/schema';
import { eq } from 'drizzle-orm';

type MaintainerAction = 'replace' | 'append' | 'remove';

export async function updateProjectMaintainers(
  projectName: string, 
  maintainerUserIds: string[], 
  action: MaintainerAction = 'replace'
) {
  try {
    // Validation
    if (!projectName) {
      return { success: false, error: 'projectName is required' };
    }

    if (!maintainerUserIds || !Array.isArray(maintainerUserIds)) {
      return { success: false, error: 'maintainerUserIds must be an array' };
    }

    // Validate that all maintainerUserIds are strings
    const invalidIds = maintainerUserIds.filter(id => typeof id !== 'string' || id.trim() === '');
    if (invalidIds.length > 0) {
      return { success: false, error: 'All maintainer user IDs must be non-empty strings' };
    }

    // Get existing project
    const existingProject = await db
      .select()
      .from(project)
      .where(eq(project.project_repository, projectName))
      .limit(1);

    if (existingProject.length === 0) {
      return { success: false, error: 'Project not found' };
    }

    const existingMaintainers = existingProject[0].maintainerUserIds || [] as string[];
    let finalMaintainers;

    switch (action) {
      case 'append':
        // Add new maintainers, avoid duplicates
        finalMaintainers = [...new Set([...existingMaintainers as string[], ...maintainerUserIds])];
        break;
      case 'remove':
        // Remove specified maintainers
        finalMaintainers = (existingMaintainers as string[]).filter((id: string) => !maintainerUserIds.includes(id));
        break;
      case 'replace':
      default:
        // Replace entire array
        finalMaintainers = maintainerUserIds;
        break;
    }

    // Update the project
    const updatedProject = await db
      .update(project)
      .set({ 
        maintainerUserIds: finalMaintainers
      })
      .where(eq(project.project_repository, projectName))
      .returning();

    return {
      success: true,
      message: `Project maintainers ${action}d successfully`,
      data: updatedProject[0]
    };
  } catch (error) {
    console.error('Error updating project maintainers:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getProjectMaintainers(projectName: string) {
  try {
    if (!projectName) {
      return { success: false, error: 'projectName is required' };
    }

    const projectData = await db
      .select()
      .from(project)
      .where(eq(project.project_repository, projectName))
      .limit(1);

    if (projectData.length === 0) {
      return { success: false, error: 'Project not found' };
    }

    return {
      success: true,
      data: {
        project: projectData[0],
        maintainers: projectData[0].maintainerUserIds || []
      }
    };
  } catch (error) {
    console.error('Error fetching project maintainers:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}