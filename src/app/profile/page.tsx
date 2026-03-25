import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
            Profile
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Tune how Ayo thinks for you
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Set your preferences so Ayo can make better ride, food, delivery, business, and real-world recommendations.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <ProfileForm />
        </section>
      </div>
    </main>
  );
}
