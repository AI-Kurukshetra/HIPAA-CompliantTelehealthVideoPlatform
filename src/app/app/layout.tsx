import Link from "next/link";
import { signOut } from "@/app/app/actions";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { profile } = await requireProfile();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Telehealth</p>
          <h1 className="text-lg font-semibold">{profile.full_name ?? "User Dashboard"}</h1>
          <p className="text-xs text-gray-600">Role: {profile.role}</p>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/app" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/app/appointments" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            Appointments
          </Link>
          <Link href="/app/appointments/new" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            New Appointment
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>

      {children}
    </main>
  );
}

