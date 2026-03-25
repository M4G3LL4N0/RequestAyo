import Link from "next/link";
import { AyoDemo } from "@/components/AyoDemo";
import { Section } from "@/components/Section";
import { WaitlistForm } from "@/components/WaitlistForm";

const features = [
  {
    title: "Better than app hopping",
    description:
      "Ayo helps you choose the best ride, food, delivery, or business without bouncing between five different apps.",
  },
  {
    title: "Built on trust, not noise",
    description:
      "Ayo is designed to prioritize reliability, consistency, speed, and fit for your real preferences.",
  },
  {
    title: "Gets smarter over time",
    description:
      "Every Ayo request helps build your profile so future recommendations feel more personal and more useful.",
  },
];

const useCases = [
  "Get me there the best way",
  "What should I order under $20?",
  "Find the most reliable tire shop nearby",
  "What’s the best way to send this to someone?",
  "Which local business is worth trusting?",
  "What’s the smartest move right now?",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-900">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
              Ayo
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              A reliable AI for real-world decisions.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Ayo helps you choose the best ride, food, delivery, business, or next step,
              then helps you get it done. Better than rideshare hopping. Better than food app hopping.
              Better than review hunting. Better than guessing.
            </p>

            <div className="mt-8">
              <WaitlistForm />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950"
              >
                Tune profile
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-slate-700 px-5 py-3 font-medium text-white"
              >
                View dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-2xl font-semibold">1</p>
                <p className="mt-2 text-sm text-slate-300">
                  One interface for rides, food, sends, and trusted local recommendations.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-2xl font-semibold">Trust</p>
                <p className="mt-2 text-sm text-slate-300">
                  Ayo ranks options using reliability, fit, speed, and user preferences.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-2xl font-semibold">Memory</p>
                <p className="mt-2 text-sm text-slate-300">
                  Each request improves your profile for better future recommendations.
                </p>
              </div>
            </div>
          </div>

          <AyoDemo />
        </div>
      </section>

      <Section
        eyebrow="Why now"
        title="The next interface is not search. It is trusted action."
        description="People do not want ten apps and ten tabs. They want one system that can tell them the best move and help execute it."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 p-6"
            >
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Use cases"
        title="Request Ayo for anything that needs a trusted next move."
        description="The first version of Ayo is focused on real-world consumer decisions with connected service outcomes."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Roadmap"
        title="Start with recommendations. Expand into execution."
        description="This MVP proves the behavior and profile loop first. Then Ayo expands into deeper integrations, live provider data, and full-action flows."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-400">Phase 1</p>
            <h3 className="mt-4 text-xl font-semibold">Requests + profile memory</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Launch the recommendation engine, waitlist, and user memory loop.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-400">Phase 2</p>
            <h3 className="mt-4 text-xl font-semibold">Live provider integrations</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Add real data from rides, food, delivery, and local business providers.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-400">Phase 3</p>
            <h3 className="mt-4 text-xl font-semibold">One-tap execution</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Let Ayo not only recommend the best move, but initiate it.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
