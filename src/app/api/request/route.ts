import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateAyoRecommendation, type AyoProfile } from "@/lib/ayo/engine";

type NormalizedOption = {
  providerType: string;
  providerName: string;
  score: number;
  priceEstimate?: string;
  etaEstimate?: string;
  trustScore?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  reasoning?: Record<string, unknown>;
};

function normalizeOptions(result: unknown): NormalizedOption[] {
  if (!result || typeof result !== "object") return [];

  const maybeResult = result as {
    options?: unknown;
    primaryRecommendation?: unknown;
    alternatives?: unknown;
  };

  if (Array.isArray(maybeResult.options)) {
    return maybeResult.options.filter((option): option is NormalizedOption => {
      return Boolean(
        option &&
          typeof option === "object" &&
          "providerType" in option &&
          "providerName" in option &&
          "score" in option
      );
    });
  }

  const out: NormalizedOption[] = [];

  if (
    maybeResult.primaryRecommendation &&
    typeof maybeResult.primaryRecommendation === "object" &&
    "providerType" in maybeResult.primaryRecommendation &&
    "providerName" in maybeResult.primaryRecommendation &&
    "score" in maybeResult.primaryRecommendation
  ) {
    out.push(maybeResult.primaryRecommendation as NormalizedOption);
  }

  if (Array.isArray(maybeResult.alternatives)) {
    out.push(
      ...maybeResult.alternatives.filter((option): option is NormalizedOption => {
        return Boolean(
          option &&
            typeof option === "object" &&
            "providerType" in option &&
            "providerName" in option &&
            "score" in option
        );
      })
    );
  }

  return out;
}

function getCategory(result: unknown): string {
  if (!result || typeof result !== "object") return "general";
  const maybeResult = result as { category?: unknown };
  return typeof maybeResult.category === "string" ? maybeResult.category : "general";
}

function getSummary(result: unknown): string {
  if (!result || typeof result !== "object") return "Ayo generated a recommendation.";
  const maybeResult = result as { summary?: unknown };
  return typeof maybeResult.summary === "string"
    ? maybeResult.summary
    : "Ayo generated a recommendation.";
}

function getExplanation(result: unknown): Record<string, unknown> {
  if (!result || typeof result !== "object") return {};

  const maybeResult = result as {
    primaryRecommendation?: {
      providerName?: string;
      score?: number;
      reasoning?: Record<string, unknown>;
    };
  };

  return {
    primaryProvider: maybeResult.primaryRecommendation?.providerName || null,
    primaryScore: maybeResult.primaryRecommendation?.score || null,
    reasoning: maybeResult.primaryRecommendation?.reasoning || {},
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const requestText = String(body.requestText || "").trim();

    if (!requestText) {
      return NextResponse.json({ error: "Request text is required." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    let userProfileId: string | null = null;
    let profileForEngine: AyoProfile | undefined;
    let hadExistingProfile = false;

    if (email) {
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (existingProfileError) {
        return NextResponse.json({ error: existingProfileError.message }, { status: 500 });
      }

      if (existingProfile) {
        hadExistingProfile = true;
        userProfileId = existingProfile.id;

        profileForEngine = {
          budgetSensitivity: existingProfile.budget_sensitivity,
          speedSensitivity: existingProfile.speed_sensitivity,
          trustSensitivity: existingProfile.trust_sensitivity,
          convenienceSensitivity: existingProfile.convenience_sensitivity,
          preferredCategories: Array.isArray(existingProfile.preferred_categories)
            ? existingProfile.preferred_categories
            : [],
          dislikedProviders: Array.isArray(existingProfile.disliked_providers)
            ? existingProfile.disliked_providers
            : [],
        };
      } else {
        const { data: insertedProfile, error: insertProfileError } = await supabase
          .from("user_profiles")
          .insert({ email })
          .select("*")
          .single();

        if (insertProfileError) {
          return NextResponse.json({ error: insertProfileError.message }, { status: 500 });
        }

        userProfileId = insertedProfile.id;

        profileForEngine = {
          budgetSensitivity: insertedProfile.budget_sensitivity,
          speedSensitivity: insertedProfile.speed_sensitivity,
          trustSensitivity: insertedProfile.trust_sensitivity,
          convenienceSensitivity: insertedProfile.convenience_sensitivity,
          preferredCategories: Array.isArray(insertedProfile.preferred_categories)
            ? insertedProfile.preferred_categories
            : [],
          dislikedProviders: Array.isArray(insertedProfile.disliked_providers)
            ? insertedProfile.disliked_providers
            : [],
        };
      }
    }

    const result = generateAyoRecommendation(requestText, profileForEngine);
    const summary = getSummary(result);
    const category = getCategory(result);
    const normalizedOptions = normalizeOptions(result);
    const explanation = getExplanation(result);

    const { data: requestRow, error: requestError } = await supabase
      .from("ayo_requests")
      .insert({
        email,
        user_profile_id: userProfileId,
        request_text: requestText,
        request_category: category,
        request_context: {
          hadExistingProfile,
          hasEmail: Boolean(email),
        },
        response_summary: summary,
        selected_option: null,
        explanation,
      })
      .select("*")
      .single();

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 500 });
    }

    if (normalizedOptions.length > 0) {
      const recommendationRows = normalizedOptions.map((option) => ({
        ayo_request_id: requestRow.id,
        provider_type: option.providerType,
        provider_name: option.providerName,
        score: option.score,
        price_estimate: option.priceEstimate || null,
        eta_estimate: option.etaEstimate || null,
        trust_score: option.trustScore || null,
        notes: option.notes || null,
        metadata: {
          ...(option.metadata || {}),
          reasoning: option.reasoning || {},
        },
      }));

      const { error: recommendationError } = await supabase
        .from("provider_recommendations")
        .insert(recommendationRows);

      if (recommendationError) {
        return NextResponse.json({ error: recommendationError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      requestId: requestRow.id,
      result,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
