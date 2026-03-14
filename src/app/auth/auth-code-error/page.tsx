import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6">
      <section className="animate-fade-in-up soft-card w-full rounded-[var(--radius-xl)] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-soft)] text-[var(--danger-ink)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Authentication Failed</h1>
        <p className="ink-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          We couldn&apos;t verify your authentication callback. This can happen if the link expired or was already used. Please try signing in again.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/auth/sign-in" className="btn-primary w-full sm:w-auto">
            Try Again
          </Link>
          <Link href="/" className="btn-secondary w-full sm:w-auto">
            Go to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
