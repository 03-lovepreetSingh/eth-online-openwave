"use server";

import { db } from "@/db";
import { project_split_payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProjectSplits(projectId: string) {
  try {
    if (!projectId) {
      return { success: false, error: "Project ID is required" };
    }

    // Fetch split payments for the specific project
    const splits = await db
      .select()
      .from(project_split_payments)
      .where(eq(project_split_payments.project_id, projectId));

    return { success: true, data: splits };
  } catch (error) {
    console.error("Error fetching project splits:", error);
    return { success: false, error: "Failed to fetch splits" };
  }
}