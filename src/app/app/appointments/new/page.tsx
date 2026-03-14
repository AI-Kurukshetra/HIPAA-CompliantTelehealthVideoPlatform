import { createAppointment } from "@/app/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";
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
  const hasProviders = (providers?.length ?? 0) > 0;
  const hasPatients = (patients?.length ?? 0) > 0;
  const isProvider = profile.role === "provider";
  const isPatient = profile.role === "patient";
  const isSubmitDisabled =
    !defaultProviderId ||
    !defaultPatientId ||
    (isProvider && !currentProviderId) ||
    (isPatient && !currentPatientId);

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">Schedule a Visit</h2>
        <p className="ink-muted mt-1 text-sm">Create a new virtual consultation for a provider-patient pair.</p>
      </div>

      <div className="soft-card rounded-[var(--radius-lg)] p-6 md:p-8">
        {params.error && (
          <p className="status-danger mb-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">{params.error}</p>
        )}

        {isProvider && !currentProviderId && (
          <p className="status-warn mb-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">
            Your provider record is missing. Re-run onboarding before scheduling appointments.
          </p>
        )}

        {isPatient && !currentPatientId && (
          <p className="status-warn mb-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">
            Your patient record is missing. Re-run onboarding before scheduling appointments.
          </p>
        )}

        {!hasProviders && (
          <p className="status-warn mb-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">
            No providers found. Complete provider onboarding first.
          </p>
        )}

        {!hasPatients && (
          <p className="status-warn mb-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">
            No patients found. Complete patient onboarding first.
          </p>
        )}

        <form action={createAppointment} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="provider_id" className="form-label">Provider</label>
              {isProvider && <input type="hidden" name="provider_id" value={defaultProviderId ?? ""} />}
              <select
                id="provider_id"
                name="provider_id"
                defaultValue={defaultProviderId}
                required
                disabled={isProvider}
                className="form-input"
              >
                {providers?.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.user_id} {provider.specialty ? `(${provider.specialty})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="patient_id" className="form-label">Patient</label>
              {isPatient && <input type="hidden" name="patient_id" value={defaultPatientId ?? ""} />}
              <select
                id="patient_id"
                name="patient_id"
                defaultValue={defaultPatientId}
                required
                disabled={isPatient}
                className="form-input"
              >
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.user_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="starts_at" className="form-label">Start time</label>
              <input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="ends_at" className="form-label">End time</label>
              <input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                required
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="form-label">Reason for visit</label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              className="form-input resize-none"
              placeholder="e.g. Follow-up consultation, symptom review..."
            />
          </div>

          <div className="flex items-center gap-3 border-t border-line-light pt-5">
            <SubmitButton
              idleText="Create Appointment"
              pendingText="Creating..."
              disabled={isSubmitDisabled}
              className="bg-brand text-white hover:bg-brand-strong"
            />
            {isSubmitDisabled && (
              <p className="text-xs text-muted">Complete profile setup to enable scheduling.</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
