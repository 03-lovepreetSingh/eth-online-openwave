import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project_votes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch votes for the specific project
    const votes = await db
      .select()
      .from(project_votes)
      .where(eq(project_votes.project_id, id));

    return NextResponse.json(votes);
  } catch (error) {
    console.error("Error fetching project votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}
