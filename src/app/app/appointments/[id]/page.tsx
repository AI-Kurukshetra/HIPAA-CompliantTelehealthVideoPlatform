import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  admitAndStartSession,
  createOrUpdatePayment,
  joinWaitingRoom,
  markPaymentPaid,
  sendAppointmentMessage,
} from "@/app/app/appointments/[id]/actions";

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
    .maybeSingle<{ id: string; status: "waiting" | "active" | "ended" | "failed"; started_at: string | null; ended_at: string | null }>();

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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Appointment details</h2>
        <Link
          href="/app/appointments"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Back to appointments
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Appointment ID</dt>
            <dd className="mt-1 text-sm">{appointment.id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Status</dt>
            <dd className="mt-1 text-sm capitalize">{appointment.status.replace("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Start</dt>
            <dd className="mt-1 text-sm">{new Date(appointment.starts_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">End</dt>
            <dd className="mt-1 text-sm">{new Date(appointment.ends_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Provider ID</dt>
            <dd className="mt-1 text-sm">{appointment.provider_id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Patient ID</dt>
            <dd className="mt-1 text-sm">{appointment.patient_id}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-gray-500">Reason</dt>
            <dd className="mt-1 text-sm">{appointment.reason?.trim() ? appointment.reason : "-"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-medium">Virtual waiting room</h3>

        {query.joined ? (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            You have joined the waiting room.
          </p>
        ) : null}

        {query.started ? (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Session started by provider.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Session status</p>
            <p className="mt-1 text-sm capitalize">{sessionStatus.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Started at</p>
            <p className="mt-1 text-sm">
              {videoSession?.started_at ? new Date(videoSession.started_at).toLocaleString() : "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {canJoinWaitingRoom ? (
            <form action={joinRoom}>
              <button
                type="submit"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Join waiting room
              </button>
            </form>
          ) : null}

          {appointment.meeting_token ? (
            <Link
              href={`/app/appointments/${appointment.id}/video`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Join video room
            </Link>
          ) : null}

          {isProvider ? (
            <form action={startSession}>
              <button
                type="submit"
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Admit and start session
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-medium">Payment</h3>

        {query.payment === "updated" ? (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Payment request saved.
          </p>
        ) : null}

        {query.payment === "paid" ? (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Payment marked as paid.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
            <p className="mt-1 text-sm capitalize">{payment?.status ?? "not created"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Amount</p>
            <p className="mt-1 text-sm">
              {payment ? `${payment.amount_cents} ${payment.currency}` : "-"}
            </p>
          </div>
        </div>

        {isProvider ? (
          <form action={savePayment} className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="amount_cents" className="mb-1 block text-sm font-medium">
                Amount (cents)
              </label>
              <input
                id="amount_cents"
                name="amount_cents"
                type="number"
                min={1}
                defaultValue={payment?.amount_cents ?? 5000}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="currency" className="mb-1 block text-sm font-medium">
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                maxLength={3}
                defaultValue={payment?.currency ?? "USD"}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Save payment request
              </button>
            </div>
          </form>
        ) : null}

        {isPatient && payment?.status === "pending" ? (
          <form action={payNow} className="mt-4">
            <button
              type="submit"
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Mark as paid
            </button>
          </form>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-medium">Secure messages</h3>

        {query.sent ? (
          <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Message sent.
          </p>
        ) : null}

        {query.error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {query.error}
          </p>
        ) : null}

        {messagesError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Failed to load messages: {messagesError.message}
          </p>
        ) : null}

        <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {thread.length === 0 ? (
            <p className="text-sm text-gray-600">No messages yet.</p>
          ) : (
            thread.map((message) => {
              const isCurrentUser = message.sender_user_id === user.id;
              return (
                <article key={message.id} className="rounded-md border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">
                    {isCurrentUser ? "You" : message.sender_type} -{" "}
                    {new Date(message.sent_at).toLocaleString()}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{message.body}</p>
                </article>
              );
            })
          )}
        </div>

        {canSendMessage ? (
          <form action={submitMessage} className="mt-4 space-y-3">
            <div>
              <label htmlFor="body" className="mb-1 block text-sm font-medium">
                New message
              </label>
              <textarea
                id="body"
                name="body"
                rows={3}
                required
                maxLength={2000}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Type a secure message"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Send message
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-gray-600">Message sending is available for providers and patients only.</p>
        )}
      </div>
    </section>
  );
}
