"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

export async function createAppointment(formData: FormData) {
  const { user, profile } = await requireRole(["admin", "provider", "patient"]);
  const supabase = await createClient();

  const requestedProviderId = String(formData.get("provider_id") ?? "");
  const requestedPatientId = String(formData.get("patient_id") ?? "");
  const startsAtRaw = String(formData.get("starts_at") ?? "");
  const endsAtRaw = String(formData.get("ends_at") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const startsAt = new Date(startsAtRaw);
  const endsAt = new Date(endsAtRaw);

  if (
    !requestedProviderId ||
    !requestedPatientId ||
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    startsAt >= endsAt
  ) {
    redirect("/app/appointments/new?error=Invalid%20appointment%20data");
  }

  const { providerId: currentProviderId, patientId: currentPatientId } = await getUserActorIds(user.id);

  let providerId = requestedProviderId;
  let patientId = requestedPatientId;

  if (profile.role === "provider") {
    if (!currentProviderId) {
      redirect("/onboarding?error=Provider%20profile%20is%20incomplete");
    }
    providerId = currentProviderId;
  }

  if (profile.role === "patient") {
    if (!currentPatientId) {
      redirect("/onboarding?error=Patient%20profile%20is%20incomplete");
    }
    patientId = currentPatientId;
  }

  const { data: insertedAppointment, error } = await supabase
    .from("appointments")
    .insert({
      provider_id: providerId,
      patient_id: patientId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      reason,
      created_by: profile.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    redirect(`/app/appointments/new?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent(supabase, {
    actorUserId: user.id,
    action: "appointment_created",
    entity: "appointments",
    entityId: insertedAppointment.id,
    metadata: {
      provider_id: providerId,
      patient_id: patientId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      created_by_role: profile.role,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/appointments");
  redirect("/app/appointments?created=1");
}
