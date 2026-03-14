import Link from "next/link";
import { signOut } from "@/app/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { profile } = await requireProfile();

  const navItems = [
    { href: "/app", label: "Dashboard", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
      </svg>
    )},
    { href: "/app/appointments", label: "Appointments", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
      </svg>
    )},
    { href: "/app/appointments/new", label: "New Visit", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
      </svg>
    )},
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-6">
      <header className="app-shell mb-6 rounded-[var(--radius-lg)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">{profile.full_name ?? "Care Dashboard"}</h1>
              <p className="text-xs text-muted capitalize">{profile.role}</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-alt hover:text-foreground"
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <div className="ml-1 h-5 w-px bg-line" />
            <form action={signOut}>
              <SubmitButton
                idleText="Sign out"
                pendingText="..."
                className="ml-1 border border-line bg-white px-3 py-2 text-muted hover:bg-surface-alt hover:text-foreground"
                spinnerClassName="border-[var(--line)] border-t-[var(--foreground)]"
              />
            </form>
          </nav>
        </div>
      </header>

      <div className="animate-fade-in">{children}</div>
    </main>
  );
}
