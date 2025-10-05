import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project_split_payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch split payments for the specific project
    const splits = await db
      .select()
      .from(project_split_payments)
      .where(eq(project_split_payments.project_id, id));

    return NextResponse.json(splits);
  } catch (error) {
    console.error("Error fetching project splits:", error);
    return NextResponse.json(
      { error: "Failed to fetch splits" },
      { status: 500 }
    );
  }
}
