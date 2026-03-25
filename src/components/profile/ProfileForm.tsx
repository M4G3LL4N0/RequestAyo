"use client";

import { useState } from "react";

type Props = {
  defaultEmail?: string;
  defaultFullName?: string;
  defaultHomeCity?: string;
  defaultBudgetSensitivity?: number;
  defaultSpeedSensitivity?: number;
  defaultTrustSensitivity?: number;
  defaultConvenienceSensitivity?: number;
};

export function ProfileForm({
  defaultEmail = "",
  defaultFullName = "",
  defaultHomeCity = "",
  defaultBudgetSensitivity = 50,
  defaultSpeedSensitivity = 50,
  defaultTrustSensitivity = 75,
  defaultConvenienceSensitivity = 60,
}: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [fullName, setFullName] = useState(defaultFullName);
  const [homeCity, setHomeCity] = useState(defaultHomeCity);
  const [budgetSensitivity, setBudgetSensitivity] = useState(defaultBudgetSensitivity);
  const [speedSensitivity, setSpeedSensitivity] = useState(defaultSpeedSensitivity);
  const [trustSensitivity, setTrustSensitivity] = useState(defaultTrustSensitivity);
  const [convenienceSensitivity, setConvenienceSensitivity] = useState(
    defaultConvenienceSensitivity
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          fullName,
          homeCity,
          budgetSensitivity,
          speedSensitivity,
          trustSensitivity,
          convenienceSensitivity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessage("Profile saved.");
      setLoading(false);
    } catch {
      setMessage("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white">Your Ayo profile</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Tune how Ayo should balance savings, speed, trust, and convenience for
          future recommendations.
        </p>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-sky-500"
        required
      />

      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-sky-500"
      />

      <input
        type="text"
        placeholder="Home city"
        value={homeCity}
        onChange={(e) => setHomeCity(e.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-sky-500"
      />

      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Budget sensitivity</span>
          <span>{budgetSensitivity}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={budgetSensitivity}
          onChange={(e) => setBudgetSensitivity(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Speed sensitivity</span>
          <span>{speedSensitivity}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={speedSensitivity}
          onChange={(e) => setSpeedSensitivity(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Trust sensitivity</span>
          <span>{trustSensitivity}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={trustSensitivity}
          onChange={(e) => setTrustSensitivity(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Convenience sensitivity</span>
          <span>{convenienceSensitivity}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={convenienceSensitivity}
          onChange={(e) => setConvenienceSensitivity(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save profile"}
      </button>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
