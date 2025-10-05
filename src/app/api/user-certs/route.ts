import { NextResponse } from "next/server";
import { getUserCerts } from "@/actions/user-certs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const certs = await getUserCerts(userId);
    return NextResponse.json(certs);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
