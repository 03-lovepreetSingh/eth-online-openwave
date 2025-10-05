import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hack_projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch projects for the specific hackathon
    const projects = await db
      .select()
      .from(hack_projects)
      .where(eq(hack_projects.hackathon_id, id));

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching hackathon projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
