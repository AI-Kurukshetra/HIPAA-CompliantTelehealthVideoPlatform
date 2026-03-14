import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
    <section className="space-y-5">
      <div className="app-shell rounded-2xl p-6">
        <h2 className="text-2xl font-semibold">Welcome, {profile.full_name ?? "User"}</h2>
        <p className="ink-muted mt-2 text-sm">
          Your secure care workspace is active. Use quick actions to schedule or review consultations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="soft-card rounded-2xl p-5">
            <p className="ink-muted text-sm">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="soft-card rounded-2xl p-5">
        <h3 className="font-medium">Quick actions</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/app/appointments/new" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong">
            Schedule appointment
          </Link>
          <Link href="/app/appointments" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-[#12445d] hover:bg-[#f4fbff]">
            View appointments
          </Link>
        </div>
      </div>
    </section>
  );
}
