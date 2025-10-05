import { NextResponse } from "next/server";
import { generateCertificateForProject } from "@/actions/certificates";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!projectId) return NextResponse.json({ success: false, error: "projectId required" }, { status: 400 });

    const body = await req.json();
    const { userId } = body;

    const res = await generateCertificateForProject(projectId as string, userId);
    return NextResponse.json(res);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
