import Link from "next/link";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type AppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  reason: string | null;
  provider_id: string;
  patient_id: string;
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
    .select("id, starts_at, ends_at, status, reason, provider_id, patient_id")
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Appointments</h2>
        <Link
          href="/app/appointments/new"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          New appointment
        </Link>
      </div>

      {params.created ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Appointment created successfully.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Failed to load appointments: {error.message}
        </p>
      ) : null}

      {!hasActorRecord ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Profile setup is incomplete for your role. Re-run onboarding to continue.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
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
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((row) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{new Date(row.starts_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(row.ends_at).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{row.status.replace("_", " ")}</td>
                  <td className="px-4 py-3">{row.reason ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/app/appointments/${row.id}`} className="text-blue-700 hover:underline">
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
