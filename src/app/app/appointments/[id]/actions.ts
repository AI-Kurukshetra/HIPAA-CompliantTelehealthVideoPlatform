"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

type AuthorizedAppointment = {
  id: string;
  provider_id: string;
  patient_id: string;
  meeting_token: string | null;
};

async function getAuthorizedAppointmentForUser(
  appointmentId: string,
  mode: "provider-only" | "provider-or-patient" | "patient-only",
) {
  const { user, profile } =
    mode === "provider-only"
      ? await requireRole(["provider"])
      : mode === "patient-only"
        ? await requireRole(["patient"])
      : await requireRole(["provider", "patient"]);

  const supabase = await createClient();
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, provider_id, patient_id, meeting_token")
    .eq("id", appointmentId)
    .maybeSingle<AuthorizedAppointment>();

  if (error || !appointment) {
    redirect("/app/appointments?error=Appointment%20not%20found");
  }

  const { providerId, patientId } = await getUserActorIds(user.id);

  if (profile.role === "provider") {
    if (!providerId) {
      redirect("/onboarding?error=Provider%20profile%20is%20incomplete");
    }
    if (appointment.provider_id !== providerId) {
      redirect("/app?error=Access%20denied");
    }
  }

  if (profile.role === "patient") {
    if (!patientId) {
      redirect("/onboarding?error=Patient%20profile%20is%20incomplete");
    }
    if (appointment.patient_id !== patientId) {
      redirect("/app?error=Access%20denied");
    }
  }

  return { user, profile, supabase, appointment };
}

export async function sendAppointmentMessage(appointmentId: string, formData: FormData) {
  const { user, profile, supabase, appointment } = await getAuthorizedAppointmentForUser(
    appointmentId,
    "provider-or-patient",
  );
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    redirect(`/app/appointments/${appointmentId}?error=Message%20cannot%20be%20empty`);
  }

  if (body.length > 2000) {
    redirect(`/app/appointments/${appointmentId}?error=Message%20is%20too%20long`);
  }

  const { data: insertedMessage, error: messageError } = await supabase
    .from("messages")
    .insert({
      appointment_id: appointment.id,
      sender_user_id: user.id,
      sender_type: profile.role,
      body,
    })
    .select("id")
    .single<{ id: string }>();

  if (messageError) {
    redirect(`/app/appointments/${appointmentId}?error=${encodeURIComponent(messageError.message)}`);
  }

  await logAuditEvent(supabase, {
    actorUserId: user.id,
    action: "message_sent",
    entity: "messages",
    entityId: insertedMessage.id,
    metadata: {
      appointment_id: appointment.id,
      sender_role: profile.role,
    },
  });

  revalidatePath(`/app/appointments/${appointmentId}`);
  redirect(`/app/appointments/${appointmentId}?sent=1`);
}

export async function joinWaitingRoom(appointmentId: string) {
  const { user, profile, supabase, appointment } = await getAuthorizedAppointmentForUser(
    appointmentId,
    "provider-or-patient",
  );

  const { data: existingSession } = await supabase
    .from("video_sessions")
    .select("id, status")
    .eq("appointment_id", appointment.id)
    .maybeSingle<{ id: string; status: "waiting" | "active" | "ended" | "failed" }>();

  let error: Error | null = null;

  if (!existingSession) {
    const { error: upsertError } = await supabase.from("video_sessions").upsert(
      {
        appointment_id: appointment.id,
        status: "waiting",
      },
      { onConflict: "appointment_id" },
    );
    error = upsertError;
  } else if (existingSession.status !== "active") {
    const { error: updateError } = await supabase
      .from("video_sessions")
      .update({ status: "waiting" })
      .eq("id", existingSession.id);
    error = updateError;
  }

  if (error) {
    redirect(`/app/appointments/${appointmentId}?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent(supabase, {
    actorUserId: user.id,
    action: "waiting_room_joined",
    entity: "video_sessions",
    entityId: appointment.id,
    metadata: {
      appointment_id: appointment.id,
      actor_role: profile.role,
    },
  });

  revalidatePath(`/app/appointments/${appointmentId}`);
  redirect(`/app/appointments/${appointmentId}?joined=1`);
}

export async function admitAndStartSession(appointmentId: string) {
  const { user, supabase, appointment } = await getAuthorizedAppointmentForUser(
    appointmentId,
    "provider-only",
  );

  const now = new Date().toISOString();
  let meetingToken = appointment.meeting_token;

  if (!meetingToken) {
    meetingToken = crypto.randomUUID();
    const { error: tokenError } = await supabase
      .from("appointments")
      .update({ meeting_token: meetingToken })
      .eq("id", appointment.id);

    if (tokenError) {
      redirect(`/app/appointments/${appointmentId}?error=${encodeURIComponent(tokenError.message)}`);
    }
  }

  const { data: session, error } = await supabase
    .from("video_sessions")
    .upsert(
      {
        appointment_id: appointment.id,
        status: "active",
        started_at: now,
      },
      { onConflict: "appointment_id" },
    )
    .select("id")
    .single<{ id: string }>();

  if (error) {
    redirect(`/app/appointments/${appointmentId}?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent(supabase, {
    actorUserId: user.id,
    action: "video_session_started",
    entity: "video_sessions",
    entityId: session.id,
    metadata: {
      appointment_id: appointment.id,
      started_at: now,
      meeting_token: meetingToken,
    },
  });

  revalidatePath(`/app/appointments/${appointmentId}`);
  redirect(`/app/appointments/${appointmentId}?started=1`);
}

export async function createOrUpdatePayment(appointmentId: string, formData: FormData) {
  const { user, supabase, appointment } = await getAuthorizedAppointmentForUser(
    appointmentId,
    "provider-only",
  );
  const amountRaw = String(formData.get("amount_cents") ?? "").trim();
  const currencyRaw = String(formData.get("currency") ?? "USD").trim().toUpperCase();
  const amountCents = Number.parseInt(amountRaw, 10);

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    redirect(`/app/appointments/${appointmentId}?error=Invalid%20payment%20amount`);
  }

  if (!/^[A-Z]{3}$/.test(currencyRaw)) {
    redirect(`/app/appointments/${appointmentId}?error=Currency%20must%20be%203%20letters`);
  }

  const now = new Date().toISOString();
  const { data: payment, error } = await supabase
    .from("payments")
    .upsert(
      {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        amount_cents: amountCents,
        currency: currencyRaw,
        provider: "manual",
        status: "pending",
        updated_at: now,
      },
      { onConflict: "appointment_id" },
    )
    .select("id")
    .single<{ id: string }>();

  if (error) {
    redirect(`/app/appointments/${appointmentId}?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent(supabase, {
    actorUserId: user.id,
    action: "payment_created_or_updated",
    entity: "payments",
    entityId: payment.id,
    metadata: {
      appointment_id: appointment.id,
      amount_cents: amountCents,
      currency: currencyRaw,
      status: "pending",
    },
  });

  revalidatePath(`/app/appointments/${appointmentId}`);
  redirect(`/app/appointments/${appointmentId}?payment=updated`);
}

export async function markPaymentPaid(appointmentId: string) {
  const { user, supabase, appointment } = await getAuthorizedAppointmentForUser(
    appointmentId,
    "patient-only",
  );

  const now = new Date().toISOString();
  const { data: payment, error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      updated_at: now,
    })
    .eq("appointment_id", appointment.id)
    .select("id, status")
    .maybeSingle<{ id: string; status: string }>();

  if (error) {
    redirect(`/app/appointments/${appointmentId}?error=${encodeURIComponent(error.message)}`);
  }

  if (!payment) {
    redirect(`/app/appointments/${appointmentId}?error=Payment%20request%20not%20found`);
  }

  await logAuditEvent(supabase, {
    actorUserId: user.id,
    action: "payment_marked_paid",
    entity: "payments",
    entityId: payment.id,
    metadata: {
      appointment_id: appointment.id,
      status: payment.status,
    },
  });

  revalidatePath(`/app/appointments/${appointmentId}`);
  redirect(`/app/appointments/${appointmentId}?payment=paid`);
}
