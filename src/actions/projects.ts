"use server";

import { db } from "@/db";
import { hack_projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProject(projectId: string) {
  const project = await db.select().from(hack_projects).where(eq(hack_projects.id, projectId));
  return project;
}
