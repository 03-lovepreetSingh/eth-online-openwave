"use server";

import { db } from "@/db";
import {
  hack_projects,
  project_votes,
  project_split_payments,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new hack project
 */
export async function createHackProject({
  hackathonId,
  projectName,
  description,
  repository,
  image_url,
  owner_id,
  team_members,
  tech_stack,
}: {
  hackathonId: string;
  projectName: string;
  description: string;
  repository: string;
  image_url: string;
  owner_id: string;
  team_members: string[];
  tech_stack: string[];
}) {
  try {
    const inserted = await db
      .insert(hack_projects)
      .values({
        hackathon_id: hackathonId,
        project_name: projectName,
        description,
        repository,
        image_url,
        owner_id,
        team_members: JSON.stringify(team_members),
        tech_stack: JSON.stringify(tech_stack),
      } as typeof hack_projects.$inferInsert)
      .returning({ id: hack_projects.id });

    return {
      success: true,
      projectId: inserted[0]?.id ?? null,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to create project" };
  }
}

/**
 * Get projects for a hackathon
 */
export async function getHackathonProjects(hackathonId: string) {
  try {
    if (!hackathonId) {
      return { success: false, error: "hackathonId is required" };
    }

    const projects = await db
      .select()
      .from(hack_projects)
      .where(eq(hack_projects.hackathon_id, hackathonId));

    return { success: true, projects };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to fetch projects" };
  }
}

/**
 * Submit a vote for a project
 */
export async function submitProjectVote({
  projectId,
  voterId,
  voteType,
}: {
  projectId: string;
  voterId: string;
  voteType: string;
}) {
  try {
    // Ensure vote type is valid
    if (!["contributor", "maintainer"].includes(voteType)) {
      return { success: false, error: "Invalid vote type" };
    }

    // Upsert vote
    await db.insert(project_votes).values({
      project_id: projectId,
      voter_id: voterId,
      vote_type: voteType,
    } as typeof project_votes.$inferInsert).onConflictDoUpdate({
      target: [project_votes.project_id, project_votes.voter_id],
      set: { vote_type: voteType },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to submit vote" };
  }
}