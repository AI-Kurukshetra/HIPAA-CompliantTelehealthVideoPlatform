import Link from "next/link";
import { signInWithMagicLink } from "@/app/auth/sign-in/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
      <section className="grid w-full gap-6 md:grid-cols-[1fr_420px]">
        <div className="app-shell rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0f6a8f]">HIPAA Telehealth</p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold md:text-5xl">
            Fast sign-in for secure care sessions.
          </h1>
          <p className="ink-muted mt-4 max-w-md text-sm">
            We use passwordless magic links to keep access simple for providers and patients while preserving secure
            session management.
          </p>
          <div className="mt-6 space-y-2 text-sm text-[#335464]">
            <p>1. Enter your email address.</p>
            <p>2. Open the verification link from your inbox.</p>
            <p>3. Continue onboarding or land in your dashboard.</p>
          </div>
          <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#0f6a8f] hover:underline">
            Back to landing page
          </Link>
        </div>

        <div className="soft-card rounded-3xl p-7">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="ink-muted mt-2 text-sm">Use your clinical or patient email to receive a magic link.</p>

          {params.error ? <p className="status-danger mt-4 rounded-md px-3 py-2 text-sm">{params.error}</p> : null}
          {params.sent ? (
            <p className="status-ok mt-4 rounded-md px-3 py-2 text-sm">
              Magic link sent. Check your inbox and spam folder.
            </p>
          ) : null}

          <form action={signInWithMagicLink} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="doctor@clinic.com"
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6aa9c4] focus:ring-2 focus:ring-[#d7ecf7]"
              />
            </div>

            <SubmitButton
              idleText="Send Magic Link"
              pendingText="Sending..."
              className="w-full bg-brand text-white hover:bg-brand-strong"
            />
          </form>
        </div>
      </section>
    </main>
  );
}
