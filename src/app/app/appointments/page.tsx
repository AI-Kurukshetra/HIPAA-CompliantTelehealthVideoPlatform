import Link from "next/link";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type AppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  reason: string | null;
};

type AppointmentPageProps = {
  searchParams: Promise<{ created?: string }>;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "scheduled":
      return "badge badge-brand";
    case "in_progress":
      return "badge badge-ok";
    case "completed":
      return "badge badge-muted";
    case "cancelled":
      return "badge badge-danger";
    default:
      return "badge badge-muted";
  }
}

export default async function AppointmentsPage({ searchParams }: AppointmentPageProps) {
  const params = await searchParams;
  const { user, profile } = await requireRole(["admin", "provider", "patient"]);
  const supabase = await createClient();
  let hasActorRecord = true;
  const { providerId, patientId } = await getUserActorIds(user.id);

  let query = supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, reason")
    .order("starts_at", { ascending: false })
    .limit(50);

  if (profile.role === "provider") {
    if (providerId) {
      query = query.eq("provider_id", providerId);
    } else {
      hasActorRecord = false;
    }
  }

  if (profile.role === "patient") {
    if (patientId) {
      query = query.eq("patient_id", patientId);
    } else {
      hasActorRecord = false;
    }
  }

  const { data, error } = hasActorRecord ? await query : { data: [], error: null };
  const appointments: AppointmentRow[] = data ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Appointments</h2>
          <p className="ink-muted mt-1 text-sm">Review scheduled, active, and completed consultations.</p>
        </div>
        <Link href="/app/appointments/new" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          New Appointment
        </Link>
      </div>

      {params.created && (
        <p className="status-ok rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">Appointment created successfully.</p>
      )}
      {error && (
        <p className="status-danger rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">Failed to load: {error.message}</p>
      )}
      {!hasActorRecord && (
        <p className="status-warn rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">
          Profile setup is incomplete for your role. Re-run onboarding to continue.
        </p>
      )}

      <div className="soft-card overflow-hidden rounded-[var(--radius-md)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line-light bg-surface-alt">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Start</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">End</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Reason</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted" />
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted" colSpan={5}>
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-line">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      <p>No appointments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((row) => (
                  <tr key={row.id} className="border-b border-line-light transition hover:bg-surface-alt">
                    <td className="px-5 py-3.5 text-sm">{new Date(row.starts_at).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm">{new Date(row.ends_at).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={statusBadgeClass(row.status)}>
                        {row.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-3.5 text-sm text-muted">{row.reason ?? "-"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/app/appointments/${row.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand-soft"
                      >
                        Open
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
