import { NextResponse } from "next/server";
import { getHackProjectsByHackathon } from "@/actions/hacks";
import { generateCertificateForProject } from "@/actions/certificates";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  const projectsRes = await getHackProjectsByHackathon(id);
  if (!projectsRes.success) {
    return NextResponse.json({ success: false, error: projectsRes.error }, { status: 500 });
  }

  const results: any[] = [];
  
  if (!projectsRes.projects || projectsRes.projects.length === 0) {
    return NextResponse.json({ success: false, error: "No projects found" }, { status: 404 });
  }

  for (const p of projectsRes.projects) {
    // Optionally restrict to winners / results declared
    const r = await generateCertificateForProject(p.id);
    results.push({ 
      projectId: p.id, 
      projectName: p.project_name,
      projectDescription: p.description,
      ownerId: p.owner_id,
      ...r 
    });
  }

  return NextResponse.json({ success: true, results });
}