import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AyoRequestRow, ProviderRecommendationRow } from "@/lib/types/ayo";

export async function getAdminData() {
  const supabase = createServerSupabaseClient();

  const { data: requests } = await supabase
    .from("ayo_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<AyoRequestRow[]>();

  const requestIds = (requests || []).map((request) => request.id);

  let recommendations: ProviderRecommendationRow[] = [];

  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("provider_recommendations")
      .select("*")
      .in("ayo_request_id", requestIds)
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
    requests: requests || [],
    recommendationsByRequest,
  };
}
