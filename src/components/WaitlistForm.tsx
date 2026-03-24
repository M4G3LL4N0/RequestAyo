"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setMessage("");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, source: "hero" }),
    });

    const data = await res.json();

    if (!res.ok) {
      setState("error");
      setMessage(data.error || "Something went wrong.");
      return;
    }

    setState("success");
    setMessage("You’re on the waitlist.");
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="h-12 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none transition focus:border-sky-500"
        required
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="h-12 rounded-2xl bg-sky-500 px-6 font-medium text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
      >
        {state === "loading" ? "Joining..." : "Join waitlist"}
      </button>
      {message ? (
        <p className="text-sm text-slate-300 sm:col-span-2">{message}</p>
      ) : null}
    </form>
  );
}
