import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ayoRequestId = String(body.ayoRequestId || "").trim();
    const providerName = String(body.providerName || "").trim();
    const providerType = String(body.providerType || "").trim();
    const score =
      typeof body.score === "number" && Number.isFinite(body.score) ? body.score : null;

    if (!ayoRequestId || !providerName || !providerType) {
      return NextResponse.json(
        { error: "ayoRequestId, providerName, and providerType are required." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("ayo_requests")
      .update({
        selected_provider_name: providerName,
        selected_provider_type: providerType,
        selected_score: score,
        selected_option: {
          providerName,
          providerType,
          score,
        },
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
