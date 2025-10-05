"use server";

import { db } from "@/db";
import { hackathons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createHackathon({
  name,
  description,
  start_date,
  end_date,
  image_url,
}: {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
}) {
  try {
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
    
    return {
      success: true,
      id: inserted[0]?.id ?? null,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to create hackathon" };
  }
}

export async function getHackathons() {
  try {
    const hackathonsData = await db.select().from(hackathons);
    return { hackathons: hackathonsData };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to fetch hackathons" };
  }
}