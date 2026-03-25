import { RequestHistory } from "@/components/dashboard/RequestHistory";
import { getDashboardData } from "@/lib/actions/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams.email || "";
  const data = email ? await getDashboardData(email) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
            Operator Dashboard
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Ayo User Profile
          </h1>
          <p className="mt-4 text-slate-300">
            View and analyze user requests, preferences, and recommendations.
          </p>

          <form className="mt-8 max-w-xl" action="/dashboard" method="get">
            <div className="flex items-center gap-3">
              <input
                type="email"
                name="email"
                defaultValue={email}
                placeholder="Search by email..."
                className="h-14 flex-1 rounded-2xl border-2 border-slate-700 bg-slate-900 px-6 text-white outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="h-14 rounded-2xl bg-white px-8 font-medium text-slate-950 hover:bg-slate-100 transition-colors"
              >
                Load
              </button>
            </div>
          </form>
        </div>

        {!email ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950 p-10 text-center">
            <p className="text-slate-300">Enter an email to load user data</p>
          </div>
        ) : !data?.profile ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950 p-10 text-center">
            <p className="text-slate-300">No profile found for {email}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.requests.length > 0 && (
              <div className="rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950 p-8">
                <h2 className="text-xl font-semibold text-white">Quick Stats</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">Total Requests</p>
                    <p className="mt-2 text-3xl font-semibold">{data.requests.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">Avg. Score</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {Math.round(
                        data.requests.reduce(
                          (acc, req) => acc + (req.response_score || 0),
                          0
                        ) / data.requests.length
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">Most Used</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {getMostUsedProvider(data.requests)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">Last Request</p>
                    <p className="mt-2 text-xl font-semibold">
                      {new Date(
                        data.requests[0].created_at
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950 p-8 lg:col-span-1">
                <h2 className="text-xl font-semibold text-white">Preferences</h2>
                <div className="mt-6 space-y-4">
                  {[
                    { name: "Budget", value: data.profile.budget_sensitivity },
                    { name: "Speed", value: data.profile.speed_sensitivity },
                    { name: "Trust", value: data.profile.trust_sensitivity },
                    { name: "Convenience", value: data.profile.convenience_sensitivity },
                  ].map((pref) => (
                    <div key={pref.name}>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>{pref.name}</span>
                        <span>{pref.value}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-600"
                          style={{ width: `${pref.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <RequestHistory
                  requests={data.requests}
                  recommendationsByRequest={data.recommendationsByRequest}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
