import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppHomePage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const [{ count: appointmentCount }, { count: messageCount }, { count: auditCount }] =
    await Promise.all([
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    {
      label: "Appointments",
      value: appointmentCount ?? 0,
      color: "text-brand",
      bgColor: "bg-brand-soft",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
          <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "Messages",
      value: messageCount ?? 0,
      color: "text-accent",
      bgColor: "bg-accent-soft",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "Audit Events",
      value: auditCount ?? 0,
      color: "text-[var(--ok-ink)]",
      bgColor: "bg-[var(--ok-soft)]",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="app-shell rounded-[var(--radius-lg)] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, {profile.full_name ?? "User"}
            </h2>
            <p className="ink-muted mt-2 max-w-lg text-sm leading-relaxed">
              Your secure care workspace is ready. Schedule new visits, review past consultations, or manage ongoing sessions.
            </p>
          </div>
          <span className="badge badge-brand hidden sm:flex">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-brand" />
            Active
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <div key={card.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bgColor} ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="soft-card rounded-[var(--radius-md)] p-6">
        <h3 className="text-[0.9375rem] font-semibold">Quick actions</h3>
        <p className="ink-muted mt-1 text-sm">Jump into your most common workflows.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/app/appointments/new" className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Schedule Visit
          </Link>
          <Link href="/app/appointments" className="btn-secondary">
            View All Appointments
          </Link>
        </div>
      </div>
    </section>
  );
}
