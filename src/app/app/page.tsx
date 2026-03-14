import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export default async function AppHomePage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const [{ count: appointmentCount }, { count: messageCount }, { count: auditCount }] =
    await Promise.all([
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Appointments", value: appointmentCount ?? 0 },
    { label: "Messages", value: messageCount ?? 0 },
    { label: "Audit Events", value: auditCount ?? 0 },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Welcome, {profile.full_name ?? "User"}</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your secure workspace is active. Use the links above to manage consultations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-medium">Quick actions</h3>
        <div className="mt-3 flex gap-3">
          <Link
            href="/app/appointments/new"
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Schedule appointment
          </Link>
          <Link
            href="/app/appointments"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            View appointments
          </Link>
        </div>
      </div>
    </section>
  );
}

