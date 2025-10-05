import { NextResponse } from "next/server";
import { getUserProjects } from "@/actions/user-projects";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });

    const res = await getUserProjects(userId);
    return NextResponse.json(res);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
