import { NextResponse } from "next/server";
import { db } from "../../../db/index";
import {
  hack_projects,
  project_votes,
  project_split_payments,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new hack project
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hackathonId,
      projectName,
      description,
      repository,
      image_url,
      owner_id,
      team_members,
      tech_stack,
    } = body;

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

    return NextResponse.json({
      success: true,
      projectId: inserted[0]?.id ?? null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

/**
 * Get projects for a hackathon
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const hackathonId = url.searchParams.get("hackathonId");
    if (!hackathonId) {
      return NextResponse.json(
        { success: false, error: "hackathonId is required" },
        { status: 400 }
      );
    }

    const projects = await db
      .select()
      .from(hack_projects)
      .where(eq(hack_projects.hackathon_id, hackathonId));

    return NextResponse.json({ success: true, projects });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * Submit a vote for a project
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { projectId, voterId, voteType } = body;

    // Ensure vote type is valid
    if (!["contributor", "maintainer"].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: "Invalid vote type" },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}