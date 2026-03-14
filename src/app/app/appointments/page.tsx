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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Appointments</h2>
          <p className="ink-muted text-sm">Review scheduled, active, and completed consultations.</p>
        </div>
        <Link href="/app/appointments/new" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong">
          New appointment
        </Link>
      </div>

      {params.created ? <p className="status-ok rounded-md px-3 py-2 text-sm">Appointment created successfully.</p> : null}
      {error ? <p className="status-danger rounded-md px-3 py-2 text-sm">Failed to load appointments: {error.message}</p> : null}
      {!hasActorRecord ? (
        <p className="status-warn rounded-md px-3 py-2 text-sm">
          Profile setup is incomplete for your role. Re-run onboarding to continue.
        </p>
      ) : null}

      <div className="soft-card overflow-x-auto rounded-2xl">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f2f8fc] text-[#355164]">
            <tr>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">End</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-[#5d7483]" colSpan={5}>
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((row) => (
                <tr key={row.id} className="border-t border-[#e4edf3]">
                  <td className="px-4 py-3">{new Date(row.starts_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(row.ends_at).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{row.status.replace("_", " ")}</td>
                  <td className="px-4 py-3">{row.reason ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/app/appointments/${row.id}`} className="font-medium text-[#0f6a8f] hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
