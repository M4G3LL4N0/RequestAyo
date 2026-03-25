import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ayoRequestId = String(body.ayoRequestId || "").trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const eventType = String(body.eventType || "").trim();
    const rating =
      typeof body.rating === "number" && Number.isFinite(body.rating)
        ? body.rating
        : null;
    const feedbackText = body.feedbackText
      ? String(body.feedbackText).trim()
      : null;
    const providerName = body.providerName ? String(body.providerName).trim() : null;
    const providerType = body.providerType ? String(body.providerType).trim() : null;

    if (!ayoRequestId || !eventType) {
      return NextResponse.json(
        { error: "ayoRequestId and eventType are required." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    let userProfileId: string | null = null;

    if (email) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profile) {
        userProfileId = profile.id;
      }
    }

    const { error: feedbackError } = await supabase.from("feedback_events").insert({
      ayo_request_id: ayoRequestId,
      user_profile_id: userProfileId,
      event_type: eventType,
      rating,
      feedback_text: feedbackText,
      metadata: {
        providerName,
        providerType,
      },
    });

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 500 });
    }

    if (userProfileId && providerName && providerType) {
      const { data: existingPreference } = await supabase
        .from("user_provider_preferences")
        .select("*")
        .eq("user_profile_id", userProfileId)
        .eq("provider_name", providerName)
        .eq("provider_type", providerType)
        .maybeSingle();

      const positive = rating && rating >= 4 ? 1 : 0;
      const negative = rating && rating <= 2 ? 1 : 0;

      if (existingPreference) {
        const nextSelections = existingPreference.total_selections + 1;
        const nextPositive = existingPreference.total_positive_feedback + positive;
        const nextNegative = existingPreference.total_negative_feedback + negative;

        let nextPreferenceScore = existingPreference.preference_score;

        if (positive) nextPreferenceScore = Math.min(100, nextPreferenceScore + 8);
        if (negative) nextPreferenceScore = Math.max(0, nextPreferenceScore - 12);

        await supabase
          .from("user_provider_preferences")
          .update({
            total_selections: nextSelections,
            total_positive_feedback: nextPositive,
            total_negative_feedback: nextNegative,
            preference_score: nextPreferenceScore,
          })
          .eq("id", existingPreference.id);
      } else {
        await supabase.from("user_provider_preferences").insert({
          user_profile_id: userProfileId,
          provider_name: providerName,
          provider_type: providerType,
          preference_score: positive ? 58 : negative ? 38 : 50,
          total_selections: 1,
          total_positive_feedback: positive,
          total_negative_feedback: negative,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
