import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateAyoRecommendation } from "@/lib/ayo/engine";
import type { AyoProfile } from "@/lib/ayo/engine";
import type { UserProfileRow } from "@/lib/types/ayo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestText = String(body.requestText || "").trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;

    if (!requestText) {
      return NextResponse.json({ error: "Request text is required." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    let profile: AyoProfile | undefined;
    let providerPreferences: AyoProfile['preferredProviders'] = [];
    let dislikedProviders: AyoProfile['dislikedProviders'] = [];

    if (email) {
      // Load user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle<UserProfileRow>();

      if (profileData) {
        profile = {
          budgetSensitivity: profileData.budget_sensitivity,
          speedSensitivity: profileData.speed_sensitivity,
          trustSensitivity: profileData.trust_sensitivity,
          convenienceSensitivity: profileData.convenience_sensitivity,
          preferredCategories: profileData.preferred_categories as string[] | undefined,
          dislikedProviders: profileData.disliked_providers as AyoProfile['dislikedProviders']
        };

        // Load provider preferences
        const { data: preferences } = await supabase
          .from("user_provider_preferences")
          .select("provider_name, provider_type, preference_score")
          .eq("user_profile_id", profileData.id);

        providerPreferences = preferences?.map(p => ({
          providerName: p.provider_name,
          providerType: p.provider_type,
          preferenceScore: p.preference_score
        })) || [];
      }
    }

    // Generate recommendation
    const result = generateAyoRecommendation(requestText, {
      ...profile,
      preferredProviders: providerPreferences,
      dislikedProviders
    });

    // Store request in database
    const { data: ayoRequest, error } = await supabase
      .from("ayo_requests")
      .insert({
        email,
        user_profile_id: profile ? profile.id : null,
        request_text: requestText,
        request_category: result.category,
        request_context: {
          detected_intent: result.detectedIntent,
          has_profile: !!profile
        },
        response_summary: result.summary,
        selected_option: null
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Store recommendations
    const allOptions = [result.primary, ...result.alternatives];
    const { error: recError } = await supabase
      .from("provider_recommendations")
      .insert(
        allOptions.map(opt => ({
          ayo_request_id: ayoRequest.id,
          provider_type: opt.providerType,
          provider_name: opt.providerName,
          score: opt.adjustedScore,
          price_estimate: opt.priceEstimate || null,
          eta_estimate: opt.etaEstimate || null,
          trust_score: opt.trustScore || null,
          notes: opt.notes || null,
          metadata: {
            baseScore: opt.baseScore,
            reasoning: opt.reasoning,
            flags: opt.flags
          }
        }))
      );

    if (recError) {
      return NextResponse.json({ error: recError.message }, { status: 500 });
    }

    return NextResponse.json({
      requestId: ayoRequest.id,
      ...result
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error." }, 
      { status: 500 }
    );
  }
}
