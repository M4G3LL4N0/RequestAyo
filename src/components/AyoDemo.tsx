"use client";

import { useState } from "react";

type ResultOption = {
  providerName: string;
  providerType: string;
  score: number;
  priceEstimate?: string;
  etaEstimate?: string;
  trustScore?: number;
  notes?: string;
};

type ResultPayload = {
  summary: string;
  category: string;
  options: ResultOption[];
};

export function AyoDemo() {
  const [email, setEmail] = useState("");
  const [requestText, setRequestText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, requestText }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong.");
      return;
    }

    setResult(data.result);
    setLoading(false);
  }

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-sky-950/20">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
          Ayo demo
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">
          Ask Ayo what to do.
        </h3>
        <p className="mt-3 text-slate-300">
          Try requests like “Get me there the best way,” “What food should I order under $20,” or “What’s the best way to send this?”
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional, improves future recommendations)"
          className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none transition focus:border-sky-500"
        />
        <textarea
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          placeholder="Ayo, get me there..."
          className="min-h-[120px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Request Ayo"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {result ? (
        <div className="mt-8 space-y-5">
          <div className="rounded-2xl border border-sky-900/50 bg-sky-950/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
              Recommendation
            </p>
            <p className="mt-2 text-lg font-medium text-white">{result.summary}</p>
            <p className="mt-2 text-sm text-slate-400">
              Category: {result.category}
            </p>
          </div>

          <div className="grid gap-4">
            {result.options.map((option, index) => (
              <div
                key={`${option.providerName}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-medium text-white">{option.providerName}</p>
                    <p className="text-sm text-slate-400">{option.providerType}</p>
                  </div>
                  <div className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
                    Score {Math.round(option.score)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                  {option.priceEstimate ? <span>Price: {option.priceEstimate}</span> : null}
                  {option.etaEstimate ? <span>ETA: {option.etaEstimate}</span> : null}
                  {option.trustScore ? <span>Trust: {option.trustScore}</span> : null}
                </div>

                {option.notes ? (
                  <p className="mt-3 text-sm leading-6 text-slate-300">{option.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
