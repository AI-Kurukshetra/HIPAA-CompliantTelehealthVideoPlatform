import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:py-16">
      <section className="app-shell animate-fade-in-up relative overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--brand-soft)] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[var(--accent-soft)] opacity-60 blur-3xl" />

        <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-center">
          <div>
            <span className="badge badge-brand">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-1 h-3.5 w-3.5">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
              </svg>
              HIPAA-Compliant Platform
            </span>

            <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.15] font-bold tracking-tight md:text-5xl">
              Virtual care that puts{" "}
              <span className="text-brand">privacy first</span>
            </h1>

            <p className="ink-muted mt-5 max-w-lg text-base leading-relaxed">
              Patients join securely from any browser. Providers manage appointments, messaging, and billing from one protected workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/app" : "/auth/sign-in"} className="btn-primary">
                {user ? "Open Dashboard" : "Get Started"}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/app/appointments" className="btn-secondary">
                View Appointments
              </Link>
            </div>
          </div>

          <div className="soft-card animate-fade-in-up stagger-2 rounded-[var(--radius-md)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">System Status</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-alt px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${configured ? "bg-[var(--ok-ink)]" : "bg-[var(--danger-ink)]"}`} />
                  <span className="text-sm text-muted">Supabase</span>
                </div>
                <span className={`text-sm font-medium ${configured ? "text-[var(--ok-ink)]" : "text-[var(--danger-ink)]"}`}>
                  {configured ? "Connected" : "Not configured"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-alt px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${user ? "bg-[var(--ok-ink)]" : "bg-[var(--line)]"}`} />
                  <span className="text-sm text-muted">Session</span>
                </div>
                <span className="max-w-[180px] truncate text-sm font-medium">{user?.email ?? "Not signed in"}</span>
              </div>
            </div>
            {!configured && (
              <p className="status-warn mt-4 rounded-lg px-3 py-2 text-xs leading-relaxed">
                Set Supabase environment variables before onboarding users.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Secure Appointments",
            desc: "End-to-end appointment lifecycle with role-based access, scheduling, and session management.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
              </svg>
            ),
          },
          {
            title: "Encrypted Messaging",
            desc: "In-visit chat with audit trails. Messages stay within appointment context for full traceability.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
              </svg>
            ),
          },
          {
            title: "Full Audit Trail",
            desc: "Every action logged and traceable. Row-level security ensures data isolation across roles.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            ),
          },
        ].map((card, i) => (
          <article
            key={card.title}
            className={`soft-card animate-fade-in-up rounded-[var(--radius-md)] p-6 stagger-${i + 2}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
              {card.icon}
            </div>
            <h2 className="mt-4 text-[0.9375rem] font-semibold">{card.title}</h2>
            <p className="ink-muted mt-2 text-sm leading-relaxed">{card.desc}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
