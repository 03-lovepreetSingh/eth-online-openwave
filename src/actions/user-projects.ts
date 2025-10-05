"use server";

import { db } from "@/db";
import { hack_projects, hackathons, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserProjects(userId: string) {
  try {
    const projects = await db
      .select({
        project: hack_projects,
        hackathon: hackathons
      })
      .from(hack_projects)
      .leftJoin(hackathons, eq(hack_projects.hackathon_id, hackathons.id))
      .where(eq(hack_projects.owner_id, userId))
      .orderBy(hack_projects.created_at);

    return { success: true, projects };
  } catch (error) {
    console.error("getUserProjects error:", error);
    return { success: false, error: "Failed to fetch user projects" };
  }
}