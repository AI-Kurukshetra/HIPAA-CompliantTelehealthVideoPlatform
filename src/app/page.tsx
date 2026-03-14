import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:py-16">
      <section className="app-shell animate-fade-in-up relative overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--brand-soft)] opacity-55 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[var(--accent-soft)] opacity-70 blur-3xl" />

        <div className="relative grid gap-10 md:grid-cols-[1.25fr_0.75fr] md:items-center">
          <div>
            <span className="badge badge-brand">Virtual Care Platform</span>
            <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.15] font-bold tracking-tight md:text-5xl">
              Better care delivery,
              <span className="text-brand"> one secure workspace</span>
            </h1>
            <p className="ink-muted mt-5 max-w-xl text-base leading-relaxed">
              Built for telehealth teams to schedule visits, message securely, run video sessions, and track billing
              without juggling tools.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/app" : "/auth/sign-in"} className="btn-primary">
                {user ? "Open Dashboard" : "Start Now"}
              </Link>
              <Link href="/app/appointments/new" className="btn-secondary">
                Schedule a Visit
              </Link>
            </div>
          </div>

          <div className="soft-card animate-fade-in-up stagger-2 rounded-[var(--radius-md)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">What You Can Do</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="rounded-lg bg-surface-alt px-3 py-2.5">
                Schedule and manage provider-patient appointments
              </li>
              <li className="rounded-lg bg-surface-alt px-3 py-2.5">
                Run secure chat and waiting-room based video consults
              </li>
              <li className="rounded-lg bg-surface-alt px-3 py-2.5">
                Track payment status and audit events per appointment
              </li>
            </ul>
            <div className="mt-5 rounded-lg border border-line-light bg-white px-3 py-3">
              <p className="text-xs text-muted">Designed for providers, clinics, and care coordinators</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Smart Scheduling",
            desc: "Create visits quickly with role-aware access and appointment-level security.",
          },
          {
            title: "Secure Communication",
            desc: "Keep messages and consultation context tied to each appointment thread.",
          },
          {
            title: "Operational Visibility",
            desc: "Track sessions, payments, and care activity in a clean dashboard workflow.",
          },
        ].map((card, i) => (
          <article key={card.title} className={`soft-card animate-fade-in-up rounded-[var(--radius-md)] p-6 stagger-${i + 2}`}>
            <h2 className="text-[0.96rem] font-semibold">{card.title}</h2>
            <p className="ink-muted mt-2 text-sm leading-relaxed">{card.desc}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
