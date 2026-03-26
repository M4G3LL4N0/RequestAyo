import { AdminRequests } from "@/components/admin/AdminRequests";
import { getAdminData } from "@/lib/actions/admin";

export default async function AdminPage() {
  const data = await getAdminData();

  const completedCount = data.requests.filter(
    (request) => request.completion_status === "completed"
  ).length;

  const selectedCount = data.requests.filter(
    (request) => Boolean(request.selected_provider_name)
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
          Admin
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          RequestAyo operator panel
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Monitor incoming Ayo requests, recommendation outputs, selected providers, and completion signals.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Requests</p>
            <p className="mt-3 text-3xl font-semibold">{data.requests.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Selections</p>
            <p className="mt-3 text-3xl font-semibold">{selectedCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="mt-3 text-3xl font-semibold">{completedCount}</p>
          </div>
        </div>

        <div className="mt-10">
          <AdminRequests
            requests={data.requests}
            recommendationsByRequest={data.recommendationsByRequest}
          />
        </div>
      </div>
    </main>
  );
}
