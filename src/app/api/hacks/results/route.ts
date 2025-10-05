import { NextRequest, NextResponse } from "next/server";
import { getHackathonResults, calculateAndUpdateResults } from "@/actions/hacks";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathon_id = searchParams.get("hackathon_id");

    const result = await getHackathonResults(hackathon_id || undefined);
    
    if (result.success) {
      return NextResponse.json(result.results);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hackathon_id, action } = body;

    if (action === "calculate") {
      const result = await calculateAndUpdateResults(hackathon_id);
      
      if (result.success) {
        return NextResponse.json({ message: result.message });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing results action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
