import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserActorIds, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getVideoRoomUrl } from "@/lib/video";

type AppointmentVideoPageProps = {
  params: Promise<{ id: string }>;
};

type AppointmentVideoAccess = {
  id: string;
  provider_id: string;
  patient_id: string;
  meeting_token: string | null;
};

export default async function AppointmentVideoPage({ params }: AppointmentVideoPageProps) {
  const { id } = await params;
  const { user, profile } = await requireRole(["admin", "provider", "patient"]);
  const supabase = await createClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, provider_id, patient_id, meeting_token")
    .eq("id", id)
    .maybeSingle<AppointmentVideoAccess>();

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

  if (!appointment.meeting_token) {
    redirect(`/app/appointments/${appointment.id}?error=Session%20is%20not%20ready`);
  }

  const roomUrl = getVideoRoomUrl(appointment.meeting_token);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0 0 19 15.25v-10.5Z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Video Session</h2>
        </div>
        <Link href={`/app/appointments/${appointment.id}`} className="btn-secondary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Back to Appointment
        </Link>
      </div>

      <p className="ink-muted text-sm">
        If the video doesn&apos;t load, use the direct link below to open in a new tab.
      </p>

      <div className="soft-card overflow-hidden rounded-[var(--radius-md)]">
        <iframe
          title="Telehealth video room"
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture"
          className="h-[72vh] w-full"
        />
      </div>

      <a
        href={roomUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary inline-flex text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm4.03-1.28a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V5.56l-5.97 5.97a.75.75 0 1 1-1.06-1.06l5.97-5.97H9.03a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>
        Open Room in New Tab
      </a>
    </section>
  );
}
