import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6">
      <section className="soft-card w-full rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a2f2f]">Authentication Issue</p>
        <h1 className="mt-2 text-3xl font-semibold">Magic link verification failed</h1>
        <p className="ink-muted mt-3 text-sm">
          The link may be expired or already used. Request a fresh sign-in link to continue.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth/sign-in" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong">
            Try again
          </Link>
          <Link href="/" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f7fcff]">
            Go to landing
          </Link>
        </div>
      </section>
    </main>
  );
}
