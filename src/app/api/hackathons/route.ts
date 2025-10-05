import { NextResponse } from "next/server";
import { db } from "../../../db/index";
import {
  hackathons,
  hack_projects,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, start_date, end_date, image_url } = body;
    const result = await db.insert(hackathons).values({
      name,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      image_url,
    } as typeof hackathons.$inferInsert);
    const inserted = await db
      .insert(hackathons)
      .values({
        name,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        image_url,
      } as typeof hackathons.$inferInsert)
      .returning({ id: hackathons.id });
    return NextResponse.json({
      success: true,
      id: inserted[0]?.id ?? null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to create hackathon" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const hackathonsData = await db.select().from(hackathons);
    return NextResponse.json({ hackathons: hackathonsData });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hackathons" },
      { status: 500 }
    );
  }
}