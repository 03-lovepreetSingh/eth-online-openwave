"use server";

import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getLikesByUserAndProject(userId: string, projectName: string) {
  if (!userId) {
    return { error: 'User is required' };
  }

  if (!projectName) {
    return { error: 'Project Name is required' };
  }

  try {
    const projectsData = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.projectName, projectName)
        )
      )
      .orderBy(likes.likedAt);
    
    return { projects: projectsData };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { error: 'Internal Server Error' };
  }
}

export async function addLike(userId: string, projectName: string) {
  if (!userId || !projectName) {
    console.error('Missing required fields:', { userId, projectName });
    return {
      error: 'User ID and Project Name are required',
      received: { userId, projectName }
    };
  }

  try {
    // Check if the like already exists
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.projectName, projectName)
        )
      );

    if (existingLike.length > 0) {
      return { error: 'User has already liked this project' };
    }

    // Add the like
    await db.insert(likes).values({
      userId,
      projectName,
      likedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding like:', error);
    return { error: 'Internal Server Error' };
  }
}

export async function removeLike(userId: string, projectName: string) {
  if (!userId || !projectName) {
    return { error: 'User ID and Project Name are required' };
  }

  try {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.projectName, projectName)
        )
      );

    return { success: true };
  } catch (error) {
    console.error('Error removing like:', error);
    return { error: 'Internal Server Error' };
  }
}