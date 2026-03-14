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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:py-14">
      <section className="app-shell relative overflow-hidden rounded-3xl p-8 md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#d7ecf7]/70 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-[#f6deb1]/70 blur-2xl" />

        <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="inline-flex rounded-full bg-[#0f6a8f]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f6a8f]">
              Secure Virtual Care
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-tight font-semibold md:text-5xl">
              Telehealth visits built for privacy, speed, and calm clinician workflows.
            </h1>
            <p className="ink-muted mt-4 max-w-xl text-base">
              Patients join instantly from browser. Providers run appointments, secure messaging, and payment flow
              from one protected workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={user ? "/app" : "/auth/sign-in"}
                className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                {user ? "Open Dashboard" : "Start with Magic Link"}
              </Link>
              <Link
                href="/app/appointments"
                className="rounded-md border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#12445d] transition hover:bg-white"
              >
                Explore Appointments
              </Link>
            </div>
          </div>

          <div className="soft-card rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5d7585]">System Health</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="ink-muted">Supabase configuration</span>
                <span className={configured ? "text-[#1f6a46]" : "text-[#8a2f2f]"}>{configured ? "Ready" : "Missing"}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="ink-muted">Signed in user</span>
                <span className="truncate text-right">{user?.email ?? "Not signed in"}</span>
              </li>
            </ul>
            {!configured ? (
              <p className="status-warn mt-4 rounded-md px-3 py-2 text-xs">
                Configure Supabase env vars on Vercel before onboarding real users.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="soft-card rounded-2xl p-5">
          <h2 className="font-medium">Secure Appointments</h2>
          <p className="ink-muted mt-2 text-sm">Role-protected appointment lifecycle with strict member-only access checks.</p>
        </article>
        <article className="soft-card rounded-2xl p-5">
          <h2 className="font-medium">Realtime Communication</h2>
          <p className="ink-muted mt-2 text-sm">In-visit chat, waiting room transitions, and controlled video room join paths.</p>
        </article>
        <article className="soft-card rounded-2xl p-5">
          <h2 className="font-medium">Traceable Actions</h2>
          <p className="ink-muted mt-2 text-sm">Audit event tracking and RLS-backed data access across core workflows.</p>
        </article>
      </section>
    </main>
  );
}
