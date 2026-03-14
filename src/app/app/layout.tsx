import Link from "next/link";
import { signOut } from "@/app/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { profile } = await requireProfile();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="app-shell mb-7 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4f6d7d]">Telehealth Workspace</p>
            <h1 className="text-xl font-semibold">{profile.full_name ?? "Care Dashboard"}</h1>
            <p className="ink-muted text-xs capitalize">Role: {profile.role}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/app" className="rounded-md border border-transparent px-3 py-2 font-medium transition hover:border-line hover:bg-white/80">
              Dashboard
            </Link>
            <Link
              href="/app/appointments"
              className="rounded-md border border-transparent px-3 py-2 font-medium transition hover:border-line hover:bg-white/80"
            >
              Appointments
            </Link>
            <Link
              href="/app/appointments/new"
              className="rounded-md border border-transparent px-3 py-2 font-medium transition hover:border-line hover:bg-white/80"
            >
              New Appointment
            </Link>
            <form action={signOut}>
              <SubmitButton
                idleText="Sign out"
                pendingText="Signing out..."
                className="border border-line bg-white px-3 py-2 text-[#12445d] hover:bg-[#f4fbff]"
                spinnerClassName="border-[#90adbf] border-t-[#12445d]"
              />
            </form>
          </nav>
        </div>
      </header>

      {children}
    </main>
  );
}
