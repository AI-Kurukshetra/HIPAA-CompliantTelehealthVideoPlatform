import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  admitAndStartSession,
  createOrUpdatePayment,
  joinWaitingRoom,
  markPaymentPaid,
  sendAppointmentMessage,
} from "@/app/app/appointments/[id]/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type AppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    sent?: string;
    error?: string;
    joined?: string;
    started?: string;
    payment?: string;
  }>;
};

type AppointmentDetail = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  reason: string | null;
  provider_id: string;
  patient_id: string;
  meeting_token: string | null;
  created_by: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  sender_user_id: string;
  sender_type: "provider" | "patient" | "system";
  body: string;
  sent_at: string;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "scheduled": return "badge badge-brand";
    case "in_progress": return "badge badge-ok";
    case "completed": return "badge badge-muted";
    case "cancelled": return "badge badge-danger";
    default: return "badge badge-muted";
  }
}

export default async function AppointmentDetailPage({ params, searchParams }: AppointmentDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const { user, profile } = await requireRole(["admin", "provider", "patient"]);
  const supabase = await createClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, reason, provider_id, patient_id, meeting_token, created_by, created_at")
    .eq("id", id)
    .maybeSingle<AppointmentDetail>();

  if (error) {
    redirect(`/app/appointments?error=${encodeURIComponent(error.message)}`);
  }

  if (!appointment) {
    notFound();
  }

  if (profile.role !== "admin") {
    const { providerId, patientId } = await getUserActorIds(user.id);

    if (profile.role === "provider") {
      if (!providerId) redirect("/onboarding?error=Provider%20profile%20is%20incomplete");
      if (appointment.provider_id !== providerId) redirect("/app?error=Access%20denied");
    }

    if (profile.role === "patient") {
      if (!patientId) redirect("/onboarding?error=Patient%20profile%20is%20incomplete");
      if (appointment.patient_id !== patientId) redirect("/app?error=Access%20denied");
    }
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, sender_user_id, sender_type, body, sent_at")
    .eq("appointment_id", appointment.id)
    .order("sent_at", { ascending: true })
    .limit(200);

  const thread: MessageRow[] = messages ?? [];
  const canSendMessage = profile.role === "provider" || profile.role === "patient";
  const submitMessage = sendAppointmentMessage.bind(null, appointment.id);

  const { data: videoSession } = await supabase
    .from("video_sessions")
    .select("id, status, started_at, ended_at")
    .eq("appointment_id", appointment.id)
    .maybeSingle<{
      id: string;
      status: "waiting" | "active" | "ended" | "failed";
      started_at: string | null;
      ended_at: string | null;
    }>();

  const sessionStatus = videoSession?.status ?? "not_created";
  const joinRoom = joinWaitingRoom.bind(null, appointment.id);
  const startSession = admitAndStartSession.bind(null, appointment.id);
  const isProvider = profile.role === "provider";
  const isPatient = profile.role === "patient";
  const canJoinWaitingRoom = profile.role === "provider" || profile.role === "patient";
  const savePayment = createOrUpdatePayment.bind(null, appointment.id);
  const payNow = markPaymentPaid.bind(null, appointment.id);

  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount_cents, currency, status, provider, provider_ref, updated_at")
    .eq("appointment_id", appointment.id)
    .maybeSingle<{
      id: string;
      amount_cents: number;
      currency: string;
      status: "pending" | "paid" | "failed" | "refunded";
      provider: string;
      provider_ref: string | null;
      updated_at: string;
    }>();

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Appointment</h2>
          <span className={statusBadgeClass(appointment.status)}>
            {appointment.status.replace("_", " ")}
          </span>
        </div>
        <Link href="/app/appointments" className="btn-secondary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
      </div>

      {query.error && <p className="status-danger rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">{query.error}</p>}

      {/* Details card */}
      <div className="soft-card rounded-[var(--radius-md)] p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Details</h3>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Appointment ID</dt>
            <dd className="mt-1 font-mono text-xs">{appointment.id}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Created</dt>
            <dd className="mt-1 text-sm">{new Date(appointment.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Start</dt>
            <dd className="mt-1 text-sm font-medium">{new Date(appointment.starts_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">End</dt>
            <dd className="mt-1 text-sm font-medium">{new Date(appointment.ends_at).toLocaleString()}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Reason</dt>
            <dd className="mt-1 text-sm">{appointment.reason?.trim() ? appointment.reason : "-"}</dd>
          </div>
        </dl>
      </div>

      {/* Virtual waiting room */}
      <div className="soft-card rounded-[var(--radius-md)] p-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand">
            <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0 0 19 15.25v-10.5Z" />
          </svg>
          <h3 className="text-[0.9375rem] font-semibold">Virtual Waiting Room</h3>
        </div>

        {query.joined && <p className="status-ok mt-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">You have joined the waiting room.</p>}
        {query.started && <p className="status-ok mt-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">Session started by provider.</p>}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-alt px-4 py-3">
            <p className="text-xs text-muted">Session status</p>
            <p className="mt-1 text-sm font-medium capitalize">{sessionStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg bg-surface-alt px-4 py-3">
            <p className="text-xs text-muted">Started at</p>
            <p className="mt-1 text-sm font-medium">{videoSession?.started_at ? new Date(videoSession.started_at).toLocaleString() : "-"}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {canJoinWaitingRoom && (
            <form action={joinRoom}>
              <SubmitButton
                idleText="Join Waiting Room"
                pendingText="Joining..."
                className="border border-line bg-white text-foreground hover:bg-surface-alt"
                spinnerClassName="border-[var(--line)] border-t-[var(--foreground)]"
              />
            </form>
          )}

          {appointment.meeting_token && (
            <Link href={`/app/appointments/${appointment.id}/video`} className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0 0 19 15.25v-10.5Z" />
              </svg>
              Join Video Room
            </Link>
          )}

          {isProvider && (
            <form action={startSession}>
              <SubmitButton
                idleText="Admit & Start Session"
                pendingText="Starting..."
                className="bg-[var(--ok-ink)] text-white hover:bg-[#165a39]"
              />
            </form>
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="soft-card rounded-[var(--radius-md)] p-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand">
            <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 1.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM2 15h16a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2Z" clipRule="evenodd" />
          </svg>
          <h3 className="text-[0.9375rem] font-semibold">Payment</h3>
        </div>

        {query.payment === "updated" && <p className="status-ok mt-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">Payment request saved.</p>}
        {query.payment === "paid" && <p className="status-ok mt-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">Payment marked as paid.</p>}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-alt px-4 py-3">
            <p className="text-xs text-muted">Status</p>
            <p className="mt-1 text-sm font-medium capitalize">{payment?.status ?? "Not created"}</p>
          </div>
          <div className="rounded-lg bg-surface-alt px-4 py-3">
            <p className="text-xs text-muted">Amount</p>
            <p className="mt-1 text-sm font-medium">
              {payment ? `$${(payment.amount_cents / 100).toFixed(2)} ${payment.currency}` : "-"}
            </p>
          </div>
        </div>

        {isProvider && (
          <form action={savePayment} className="mt-5 grid gap-4 border-t border-line-light pt-5 sm:grid-cols-3 sm:items-end">
            <div>
              <label htmlFor="amount_cents" className="form-label">Amount (cents)</label>
              <input
                id="amount_cents"
                name="amount_cents"
                type="number"
                min={1}
                defaultValue={payment?.amount_cents ?? 5000}
                required
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="currency" className="form-label">Currency</label>
              <input
                id="currency"
                name="currency"
                maxLength={3}
                defaultValue={payment?.currency ?? "USD"}
                required
                className="form-input uppercase"
              />
            </div>
            <SubmitButton
              idleText="Save Payment"
              pendingText="Saving..."
              className="w-full bg-brand text-white hover:bg-brand-strong"
            />
          </form>
        )}

        {isPatient && payment?.status === "pending" && (
          <form action={payNow} className="mt-5 border-t border-line-light pt-5">
            <SubmitButton
              idleText="Mark as Paid"
              pendingText="Processing..."
              className="bg-[var(--ok-ink)] text-white hover:bg-[#165a39]"
            />
          </form>
        )}
      </div>

      {/* Secure messages */}
      <div className="soft-card rounded-[var(--radius-md)] p-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand">
            <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.25 2.43 1.564 2.43 3.015v4.422c0 1.452-.993 2.766-2.43 3.016-.753.13-1.512.23-2.275.299a.387.387 0 0 0-.244.134l-2.27 2.838a.75.75 0 0 1-1.162 0l-2.27-2.838a.387.387 0 0 0-.244-.134 41.116 41.116 0 0 1-2.275-.299C2.993 12.727 2 11.413 2 9.961V5.539c0-1.451.993-2.765 2.43-3.015ZM7 8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm2 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0Zm5-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" clipRule="evenodd" />
          </svg>
          <h3 className="text-[0.9375rem] font-semibold">Secure Messages</h3>
        </div>

        {query.sent && <p className="status-ok mt-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">Message sent.</p>}
        {messagesError && (
          <p className="status-danger mt-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">
            Failed to load messages: {messagesError.message}
          </p>
        )}

        <div className="mt-4 max-h-[360px] space-y-2.5 overflow-y-auto rounded-[var(--radius-sm)] border border-line-light bg-surface-alt p-3">
          {thread.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">No messages yet. Start the conversation below.</p>
          ) : (
            thread.map((message) => {
              const isCurrentUser = message.sender_user_id === user.id;
              return (
                <article
                  key={message.id}
                  className={`rounded-lg border p-3 ${
                    isCurrentUser
                      ? "ml-6 border-brand-muted bg-brand-soft/40"
                      : "mr-6 border-line-light bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted">
                      {isCurrentUser ? "You" : <span className="capitalize">{message.sender_type}</span>}
                    </p>
                    <time className="text-[0.6875rem] text-muted">{new Date(message.sent_at).toLocaleString()}</time>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                </article>
              );
            })
          )}
        </div>

        {canSendMessage ? (
          <form action={submitMessage} className="mt-4 space-y-3">
            <div>
              <label htmlFor="body" className="form-label">New message</label>
              <textarea
                id="body"
                name="body"
                rows={3}
                required
                maxLength={2000}
                className="form-input resize-none"
                placeholder="Type a secure message..."
              />
            </div>
            <SubmitButton
              idleText="Send Message"
              pendingText="Sending..."
              className="bg-brand text-white hover:bg-brand-strong"
            />
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted">Message sending is available for providers and patients only.</p>
        )}
      </div>
    </section>
  );
}
