import { AyoRequestRow, ProviderRecommendationRow } from "@/lib/types/ayo";

type Props = {
  requests: AyoRequestRow[];
  recommendationsByRequest: Record<string, ProviderRecommendationRow[]>;
};

export function AdminRequests({ requests, recommendationsByRequest }: Props) {
  if (!requests.length) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
        No requests found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => {
        const recommendations = recommendationsByRequest[request.id] || [];

        return (
          <div
            key={request.id}
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
                  {request.request_category || "general"}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {request.request_text}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {request.email || "no email"} · {new Date(request.created_at).toLocaleString()}
                </p>
              </div>

              <div className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
                {request.completion_status}
              </div>
            </div>

            {request.response_summary ? (
              <div className="mt-4 rounded-2xl border border-sky-900/40 bg-sky-950/20 p-4">
                <p className="text-sm leading-7 text-slate-200">{request.response_summary}</p>
              </div>
            ) : null}

            {request.selected_provider_name ? (
              <div className="mt-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                <p className="text-sm text-emerald-300">
                  Selected: {request.selected_provider_name} ({request.selected_provider_type || "unknown"})
                </p>
              </div>
            ) : null}

            {recommendations.length ? (
              <div className="mt-5 grid gap-4">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-medium text-white">
                          {recommendation.provider_name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {recommendation.provider_type}
                        </p>
                      </div>
                      <div className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
                        Score {Math.round(Number(recommendation.score))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
