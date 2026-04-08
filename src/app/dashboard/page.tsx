import { RequestHistory } from "@/components/dashboard/RequestHistory";
import { getDashboardData } from "@/lib/actions/dashboard";

import type { UserProfileRow, AyoRequestRow, ProviderRecommendationRow } from "@/lib/types/ayo";

type DashboardData = {
  profile: Pick<
    UserProfileRow,
    | "budget_sensitivity" 
    | "speed_sensitivity"
    | "trust_sensitivity"
    | "convenience_sensitivity"
  > | null;
  requests: AyoRequestRow[];
  recommendationsByRequest: Record<string, ProviderRecommendationRow[]>;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email || "";
  let data: DashboardData | null = null;
  
  try {
    if (email) {
      data = await getDashboardData(email);
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const requestCount = data?.requests.length || 0;
  const recommendationCount = Object.values(data?.recommendationsByRequest || {}).reduce(
    (acc, recommendations) => acc + recommendations.length,
    0
  );

  const averageTopRecommendationScore =
    data && requestCount > 0
      ? Math.round(
          data.requests.reduce((acc, request) => {
            const recommendations = data.recommendationsByRequest[request.id] || [];
            const topScore = recommendations.length > 0 ? Number(recommendations[0].score) : 0;
            return acc + topScore;
          }, 0) / requestCount
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
          Dashboard
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Ayo request history
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          View past Ayo requests, recommendation summaries, and provider options for a given user.
        </p>

        <form className="mt-8 flex max-w-xl gap-3" action="/dashboard" method="get">
          <input
            type="email"
            name="email"
            defaultValue={email}
            placeholder="Enter user email"
            className="h-12 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-sky-500"
            required
          />
          <button
            type="submit"
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950"
          >
            Load
          </button>
        </form>

        <div className="mt-10">
          {!email ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
              Enter an email above to load a user profile and request history.
            </div>
          ) : !data?.profile ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
              No profile found for that email yet.
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="text-sm text-slate-400">Total requests</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{requestCount}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="text-sm text-slate-400">Recommendations generated</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{recommendationCount}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="text-sm text-slate-400">Avg top recommendation score</p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {averageTopRecommendationScore}
                  </p>
                </div>
              </div>

              {data.profile && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                  <h2 className="text-2xl font-semibold text-white">Profile</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">Budget</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-2xl font-semibold">
                          {data.profile.budget_sensitivity}
                        </p>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-sky-600 to-violet-600 rounded-full" 
                            style={{ width: `${Math.min(Math.max(data.profile.budget_sensitivity, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">Speed</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {data.profile.speed_sensitivity}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">Trust</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {data.profile.trust_sensitivity}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">Convenience</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {data.profile.convenience_sensitivity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <RequestHistory
                requests={data.requests}
                recommendationsByRequest={data.recommendationsByRequest}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
