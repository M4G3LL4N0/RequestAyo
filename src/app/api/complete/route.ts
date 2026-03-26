import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ayoRequestId = String(body.ayoRequestId || "").trim();
    const completionStatus = String(body.completionStatus || "completed").trim();

    if (!ayoRequestId) {
      return NextResponse.json({ error: "ayoRequestId is required." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("ayo_requests")
      .update({
        completion_status: completionStatus,
        completed_at: completionStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", ayoRequestId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
