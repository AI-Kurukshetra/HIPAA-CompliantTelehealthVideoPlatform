import Link from "next/link";
import { signInWithPassword, signUpWithPassword } from "@/app/auth/sign-in/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    notice?: string;
    tab?: "signin" | "signup";
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const selectedTab = params.tab === "signup" ? "signup" : "signin";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
      <section className="animate-fade-in-up grid w-full gap-8 md:grid-cols-[1fr_440px] md:items-center">
        {/* Left: Branding panel */}
        <div className="app-shell relative overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-soft opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-accent-soft opacity-50 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-tight">MedConnect</span>
            </div>

            <h1 className="mt-6 font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              {selectedTab === "signin"
                ? "Welcome back to your care portal"
                : "Join MedConnect in minutes"}
            </h1>

            <p className="ink-muted mt-4 max-w-md text-sm leading-relaxed">
              {selectedTab === "signin"
                ? "Sign in to access your appointments, secure messages, virtual waiting room, and care workflows."
                : "Create your account to get started with virtual care. Set up your profile and you're ready for your first visit."}
            </p>

            <div className="mt-8 space-y-3.5">
              {(selectedTab === "signin"
                ? [
                    { icon: "shield", text: "End-to-end encrypted sessions" },
                    { icon: "video", text: "Browser-based video visits" },
                    { icon: "lock", text: "HIPAA-compliant infrastructure" },
                  ]
                : [
                    { icon: "user", text: "Choose your role: Provider or Patient" },
                    { icon: "clock", text: "Onboarding takes under a minute" },
                    { icon: "check", text: "Start scheduling immediately" },
                  ]
              ).map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    {item.icon === "shield" && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.icon === "video" && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3A.75.75 0 0 0 19 15.25v-10.5Z" />
                      </svg>
                    )}
                    {item.icon === "lock" && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.icon === "user" && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                      </svg>
                    )}
                    {item.icon === "clock" && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.icon === "check" && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-muted">{item.text}</span>
                </div>
              ))}
            </div>

            <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>

        {/* Right: Auth form */}
        <div className="soft-card animate-fade-in-up stagger-2 rounded-[var(--radius-xl)] p-7">
          <div className="grid grid-cols-2 rounded-[var(--radius-sm)] border border-line bg-surface-alt p-1 text-sm">
            <Link
              href="/auth/sign-in?tab=signin"
              className={`rounded-md px-3 py-2.5 text-center font-semibold transition ${
                selectedTab === "signin"
                  ? "bg-white text-brand shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-in?tab=signup"
              className={`rounded-md px-3 py-2.5 text-center font-semibold transition ${
                selectedTab === "signup"
                  ? "bg-white text-brand shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Create account
            </Link>
          </div>

          {params.error && (
            <p className="status-danger mt-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">{params.error}</p>
          )}
          {params.notice && (
            <p className="status-ok mt-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">{params.notice}</p>
          )}

          {selectedTab === "signin" ? (
            <form action={signInWithPassword} className="mt-6 space-y-5">
              <div>
                <label htmlFor="signin_email" className="form-label">Email address</label>
                <input
                  id="signin_email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="signin_password" className="form-label">Password</label>
                <input
                  id="signin_password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>
              <SubmitButton
                idleText="Sign in"
                pendingText="Signing in..."
                className="w-full bg-brand text-white hover:bg-brand-strong"
              />

              <p className="text-center text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-in?tab=signup" className="font-medium text-brand hover:text-brand-strong">
                  Create one
                </Link>
              </p>
            </form>
          ) : (
            <form action={signUpWithPassword} className="mt-6 space-y-5">
              <div>
                <label htmlFor="signup_email" className="form-label">Email address</label>
                <input
                  id="signup_email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="form-input"
                />
                <p className="mt-1.5 text-xs text-muted">
                  Use a valid email you can access for verification.
                </p>
              </div>
              <div>
                <label htmlFor="signup_password" className="form-label">Create password</label>
                <input
                  id="signup_password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="form-input"
                />
                <p className="mt-1.5 text-xs text-muted">
                  Must be at least 8 characters. Use a mix of letters, numbers, and symbols.
                </p>
              </div>
              <SubmitButton
                idleText="Create account"
                pendingText="Creating account..."
                className="w-full bg-brand text-white hover:bg-brand-strong"
              />

              <div className="rounded-[var(--radius-sm)] border border-line-light bg-surface-alt px-4 py-3">
                <p className="text-xs leading-relaxed text-muted">
                  After creating your account, you&apos;ll complete a quick onboarding to set your role (Provider or Patient) and profile details.
                </p>
              </div>

              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/auth/sign-in?tab=signin" className="font-medium text-brand hover:text-brand-strong">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
