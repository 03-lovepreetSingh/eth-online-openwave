"use server";

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function getUserById(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'Missing user ID parameter' };
    }

    const usersData = await db.select().from(users).where(eq(users.id, userId));
    return { success: true, data: usersData };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getMaintainers(maintainerParam: string | string[]) {
  try {
    // Parse the maintainer parameter - it could be a single ID or an array
    let maintainerIds: string[];
    
    if (Array.isArray(maintainerParam)) {
      maintainerIds = maintainerParam;
    } else {
      try {
        // Try to parse as JSON array if it's a string
        maintainerIds = JSON.parse(maintainerParam);
        // Ensure it's an array
        if (!Array.isArray(maintainerIds)) {
          maintainerIds = [maintainerParam];
        }
      } catch {
        // If parsing fails, treat as a single ID
        maintainerIds = [maintainerParam];
      }
    }

    // Filter out empty strings and null values
    maintainerIds = maintainerIds.filter(id => id && id.trim() !== '');

    if (maintainerIds.length === 0) {
      return { success: true, data: [] };
    }

    // Build the query with OR conditions for multiple IDs
    let query;
    if (maintainerIds.length === 1) {
      query = db.select().from(users).where(eq(users.id, maintainerIds[0]));
    } else {
      // Create OR conditions for multiple maintainer IDs
      const orConditions = maintainerIds.map(id => eq(users.id, id));
      query = db.select().from(users).where(or(...orConditions));
    }

    const usersData = await query.execute();
    return { success: true, data: usersData };
  } catch (error) {
    console.error('Error fetching maintainers:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}