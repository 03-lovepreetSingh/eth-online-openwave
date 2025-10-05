"use server";

import { db } from "@/db";
import { project_certificates, hack_projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserCerts(userId: string) {
  const certs = await db.select().from(project_certificates).where(eq(project_certificates.issued_to, userId)).innerJoin(hack_projects, eq(project_certificates.project_id, hack_projects.id));
  return certs;
}
