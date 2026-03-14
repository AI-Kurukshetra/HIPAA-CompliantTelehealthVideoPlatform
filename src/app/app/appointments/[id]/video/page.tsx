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

  if (!appointment.meeting_token) {
    redirect(`/app/appointments/${appointment.id}?error=Session%20is%20not%20ready`);
  }

  const roomUrl = getVideoRoomUrl(appointment.meeting_token);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Video session</h2>
        <Link
          href={`/app/appointments/${appointment.id}`}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Back to appointment
        </Link>
      </div>

      <p className="text-sm text-gray-600">
        If video fails to load, use the direct room link below in a new tab.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <iframe
          title="Telehealth video room"
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture"
          className="h-[70vh] w-full rounded-md border border-gray-200"
        />
      </div>

      <a
        href={roomUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
      >
        Open room in new tab
      </a>
    </section>
  );
}
