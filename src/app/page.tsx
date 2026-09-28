const useCases = [
  "Find the best way to get across town",
  "Choose food without opening five delivery apps",
  "Pick a trusted local business fast",
  "Compare send, delivery, courier, and shipping options",
  "Remember what you like for the next request",
  "Give one clear recommendation instead of a messy list",
];

const pillars = [
  {
    title: "One trusted answer",
    body: "Ayo is built around the idea that people do not want ten options. They want the best move for their situation.",
  },
  {
    title: "Personal memory",
    body: "Ayo learns from previous requests, accepted recommendations, preferences, and feedback so future answers fit the person better.",
  },
  {
    title: "Real-world action",
    body: "The product starts with rides, food, delivery, sending, and local business decisions, then expands into deeper execution flows.",
  },
];

const roadmap = [
  "Live provider data for rides, food, delivery, and local services",
  "User profiles that learn speed, savings, trust, and convenience preferences",
  "Selection and completion tracking to improve future recommendations",
  "One-tap handoff into the service that can complete the job",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <a href="/" className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200">
          Ayo
        </a>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#product" className="hover:text-white">
            Product
          </a>
          <a href="#use-cases" className="hover:text-white">
            Use cases
          </a>
          <a href="#roadmap" className="hover:text-white">
            Roadmap
          </a>
        </nav>

        <a
          href="#request"
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-950/20 backdrop-blur hover:bg-white/15"
        >
          Request Ayo
        </a>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
            Real-world AI decision layer
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-7xl">
            One AI to choose the best move in the real world.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Ayo helps you decide between rides, food, deliveries, local businesses,
            and send options. It remembers what you prefer, ranks choices by trust,
            speed, price, and convenience, then points you to the best next step.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#request"
              className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-slate-950 shadow-2xl shadow-sky-950/30 hover:bg-sky-100"
            >
              Try the Ayo flow
            </a>
            <a
              href="#product"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center font-semibold text-white backdrop-blur hover:bg-white/10"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Rides", "Food", "Delivery"].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur"
              >
                <p className="text-sm text-slate-400">Starts with</p>
                <p className="mt-2 text-xl font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          id="request"
          className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Ayo request
                </p>
                <h2 className="mt-2 text-2xl font-semibold">What should I do?</h2>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Sample walkthrough
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">User asks</p>
              <p className="mt-2 text-lg text-white">
                “Ayo, get me across town without wasting money.”
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-4">
              <p className="text-sm text-sky-200">Ayo recommends</p>
              <p className="mt-2 text-xl font-semibold text-white">
                Wait 4 minutes, then take the lower-cost rideshare option.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Example ranking across arrival time, price, and reliability when
                the user prefers saving money if the delay is small. This is a
                product preview, not a live quote.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Trust", "High"],
                ["Savings", "Lower fare"],
                ["Delay", "Short wait"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
            Product
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Better than app hopping because Ayo decides across the apps.
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Ayo is not trying to be another ride app, food app, review site, or
            shipping company on day one. It is the trusted layer above them:
            understand the request, compare the path, recommend the move, and
            learn from what the user chooses.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20"
              >
                <h3 className="text-2xl font-semibold">{pillar.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              Use cases
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Built for the decisions people make every day.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-slate-200 shadow-xl shadow-black/10 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
            Build path
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            From recommendation engine to action layer.
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {roadmap.map((item, index) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm text-sky-300">0{index + 1}</p>
                <p className="mt-2 text-lg font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-lg font-semibold">Ayo</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              A reliable AI for real-world decisions across rides, food, delivery,
              local businesses, and everyday next steps.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Early product preview. No live customer counts or savings claims on this page.
          </p>
        </div>
      </footer>
    </div>
  );
}
