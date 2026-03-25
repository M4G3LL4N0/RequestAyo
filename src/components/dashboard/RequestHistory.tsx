import Link from "next/link";

type RequestHistoryProps = {
  requests: any[];
  recommendationsByRequest: Record<string, any[]>;
};

export function RequestHistory({
  requests = [],
  recommendationsByRequest = {},
}: RequestHistoryProps) {
  if (!requests.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950 p-8 text-center">
        <p className="text-slate-400">No Ayo requests found yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          This user hasn't made any requests yet - check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Recent requests</h2>
      
      <div className="grid gap-4">
        {requests.map((request) => {
          const id = request.id;
          const recommendations = recommendationsByRequest[id] || [];
          const topOption = recommendations[0];
          
          return (
            <div
              key={id}
              className="rounded-3xl border-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="border-b border-slate-800 p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400">
                      {new Date(request.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 font-medium text-white">
                      "{request.request_text}"
                    </p>
                  </div>
                  {topOption && (
                    <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1">
                      <span className="text-xs font-medium text-sky-400">
                        {topOption?.provider_type}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Ayo Summary
                </h4>
                <p className="text-white">
                  {request.response_summary ||
                    "No summary generated for this request"}
                </p>

                {recommendations.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mt-6 mb-3">
                      Provider Options
                    </h4>
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">
                                {rec.provider_name}
                              </p>
                              <p className="text-xs text-slate-400">{rec.provider_type}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {rec.price_estimate && (
                                <span className="text-sm text-slate-300">
                                  ${rec.price_estimate}
                                </span>
                              )}
                              <span className="rounded-full bg-sky-900/50 px-2.5 py-0.5 text-xs font-medium text-sky-300">
                                {Math.round(rec.score)}pts
                              </span>
                            </div>
                          </div>
                          {rec.notes && (
                            <p className="mt-2 text-sm text-slate-400">{rec.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
