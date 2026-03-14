import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type UpcomingAppointment = {
  id: string;
  starts_at: string;
  status: string;
  reason: string | null;
};

type RecentMessage = {
  id: string;
  appointment_id: string;
  sender_type: "provider" | "patient" | "system";
  body: string;
  sent_at: string;
};

export default async function AppHomePage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    { count: appointmentCount },
    { count: messageCount },
    { count: activeSessionCount },
    { data: upcomingAppointmentsData },
    { data: recentMessagesData },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("video_sessions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("appointments")
      .select("id, starts_at, status, reason")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("messages")
      .select("id, appointment_id, sender_type, body, sent_at")
      .order("sent_at", { ascending: false })
      .limit(3),
  ]);

  const upcomingAppointments: UpcomingAppointment[] = upcomingAppointmentsData ?? [];
  const recentMessages: RecentMessage[] = recentMessagesData ?? [];

  const cards = [
    {
      label: "Total Appointments",
      value: appointmentCount ?? 0,
      hint: "All scheduled and historical visits",
      color: "text-brand",
      bgColor: "bg-brand-soft",
    },
    {
      label: "Secure Messages",
      value: messageCount ?? 0,
      hint: "Conversation records across appointments",
      color: "text-accent",
      bgColor: "bg-accent-soft",
    },
    {
      label: "Active Sessions",
      value: activeSessionCount ?? 0,
      hint: "Currently running video consultations",
      color: "text-[var(--ok-ink)]",
      bgColor: "bg-[var(--ok-soft)]",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="app-shell rounded-[var(--radius-lg)] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Care Command Center
            </h2>
            <p className="ink-muted mt-2 max-w-2xl text-sm leading-relaxed">
              Welcome {profile.full_name ?? "User"}. Track upcoming visits, monitor active sessions, and continue
              secure care delivery from one dashboard.
            </p>
          </div>
          <span className="badge badge-brand capitalize">{profile.role} workspace</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <div key={card.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${card.bgColor} ${card.color}`}>
              {card.label}
            </div>
            <p className={`mt-3 text-3xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="soft-card rounded-[var(--radius-md)] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.95rem] font-semibold">Upcoming Visits</h3>
            <Link href="/app/appointments" className="text-xs font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="rounded-lg bg-surface-alt px-3 py-3 text-sm text-muted">
                No upcoming visits yet. Schedule one to get started.
              </p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <article key={appointment.id} className="rounded-lg border border-line-light bg-surface-alt px-3 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {new Date(appointment.starts_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize">{appointment.status.replace("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted">
                    {appointment.reason?.trim() ? appointment.reason : "General consultation"}
                  </p>
                  <Link href={`/app/appointments/${appointment.id}`} className="mt-2 inline-block text-xs font-semibold text-brand hover:underline">
                    Open appointment
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="soft-card rounded-[var(--radius-md)] p-6">
          <h3 className="text-[0.95rem] font-semibold">Recent Secure Messages</h3>
          <p className="ink-muted mt-1 text-xs">Latest communication in appointment threads.</p>

          <div className="mt-4 space-y-3">
            {recentMessages.length === 0 ? (
              <p className="rounded-lg bg-surface-alt px-3 py-3 text-sm text-muted">No recent messages.</p>
            ) : (
              recentMessages.map((message) => (
                <article key={message.id} className="rounded-lg border border-line-light bg-surface-alt px-3 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {message.sender_type} • {new Date(message.sent_at).toLocaleString()}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm">
                    {message.body}
                  </p>
                  <Link href={`/app/appointments/${message.appointment_id}`} className="mt-2 inline-block text-xs font-semibold text-brand hover:underline">
                    Open thread
                  </Link>
                </article>
              ))
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-line-light pt-4">
            <Link href="/app/appointments/new" className="btn-primary">Schedule Visit</Link>
            <Link href="/app/appointments" className="btn-secondary">Manage Appointments</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
