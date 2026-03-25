import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  AyoRequestRow,
  ProviderRecommendationRow,
  UserProfileRow,
} from "@/lib/types/ayo";

export async function getDashboardData(email: string) {
  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle<UserProfileRow>();

  if (!profile) {
    return {
      profile: null,
      requests: [],
      recommendationsByRequest: {},
    };
  }

  const { data: requests } = await supabase
    .from("ayo_requests")
    .select("*")
    .eq("user_profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(25)
    .returns<AyoRequestRow[]>();

  const requestIds = (requests || []).map((request) => request.id);

  let recommendations: ProviderRecommendationRow[] = [];

  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("provider_recommendations")
      .select("*")
      .in("ayo_request_id", requestIds)
      .order("score", { ascending: false })
      .returns<ProviderRecommendationRow[]>();

    recommendations = data || [];
  }

  const recommendationsByRequest = recommendations.reduce<
    Record<string, ProviderRecommendationRow[]>
  >((acc, recommendation) => {
    if (!acc[recommendation.ayo_request_id]) {
      acc[recommendation.ayo_request_id] = [];
    }
    acc[recommendation.ayo_request_id].push(recommendation);
    return acc;
  }, {});

  return {
    profile,
    requests: requests || [],
    recommendationsByRequest,
  };
}
