import { createAppointment } from "@/app/app/actions";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type NewAppointmentPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  const params = await searchParams;
  const { user, profile } = await requireRole(["admin", "provider", "patient"]);
  const supabase = await createClient();
  const { providerId: currentProviderId, patientId: currentPatientId } = await getUserActorIds(user.id);

  const [{ data: providers }, { data: patients }] = await Promise.all([
    supabase.from("providers").select("id, user_id, specialty").order("created_at"),
    supabase.from("patients").select("id, user_id").order("created_at"),
  ]);

  const defaultProviderId = profile.role === "provider" ? currentProviderId : providers?.[0]?.id;
  const defaultPatientId = profile.role === "patient" ? currentPatientId : patients?.[0]?.id;
  const isProvider = profile.role === "provider";
  const isPatient = profile.role === "patient";
  const isSubmitDisabled =
    !defaultProviderId ||
    !defaultPatientId ||
    (isProvider && !currentProviderId) ||
    (isPatient && !currentPatientId);

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Schedule appointment</h2>
      <p className="mt-2 text-sm text-gray-600">
        Create a secure virtual consultation entry in the system.
      </p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      {isProvider && !currentProviderId ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your provider record is missing. Re-run onboarding before scheduling appointments.
        </p>
      ) : null}

      {isPatient && !currentPatientId ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your patient record is missing. Re-run onboarding before scheduling appointments.
        </p>
      ) : null}

      <form action={createAppointment} className="mt-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="provider_id" className="mb-1 block text-sm font-medium">
              Provider
            </label>
            {isProvider ? <input type="hidden" name="provider_id" value={defaultProviderId ?? ""} /> : null}
            <select
              id="provider_id"
              name="provider_id"
              defaultValue={defaultProviderId}
              required
              disabled={isProvider}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {providers?.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.user_id} {provider.specialty ? `(${provider.specialty})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="patient_id" className="mb-1 block text-sm font-medium">
              Patient
            </label>
            {isPatient ? <input type="hidden" name="patient_id" value={defaultPatientId ?? ""} /> : null}
            <select
              id="patient_id"
              name="patient_id"
              defaultValue={defaultPatientId}
              required
              disabled={isPatient}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.user_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="starts_at" className="mb-1 block text-sm font-medium">
              Start time
            </label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ends_at" className="mb-1 block text-sm font-medium">
              End time
            </label>
            <input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="mb-1 block text-sm font-medium">
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Follow-up consultation"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Create appointment
        </button>
      </form>
    </section>
  );
}
