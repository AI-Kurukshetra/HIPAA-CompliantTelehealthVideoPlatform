import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/onboarding/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getProfile, requireUser } from "@/lib/auth";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const existingProfile = await getProfile(user.id);

  if (existingProfile) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
      <section className="animate-fade-in-up w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Set up your profile</h1>
          <p className="ink-muted mx-auto mt-2 max-w-md text-sm leading-relaxed">
            Tell us your role and basic details. This takes under a minute and you can update your profile later.
          </p>
        </div>

        {params.error && (
          <p className="status-danger mb-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm">{params.error}</p>
        )}

        <div className="soft-card rounded-[var(--radius-xl)] p-7 md:p-8">
          <form action={completeOnboarding} className="space-y-6">
            {/* Role selection */}
            <fieldset>
              <legend className="form-label text-sm">Choose your role</legend>
              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                <label className="group relative flex cursor-pointer items-start gap-3.5 rounded-[var(--radius-md)] border-2 border-line bg-white p-4 transition hover:border-brand-muted hover:bg-brand-soft/30 has-[:checked]:border-brand has-[:checked]:bg-brand-soft/40">
                  <input type="radio" name="role" value="provider" required className="sr-only" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                      <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286a48.4 48.4 0 0 1 6.085 2.563.756.756 0 0 0 .09.041 49.3 49.3 0 0 1 3.611 1.679Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold">Provider</span>
                    <span className="mt-0.5 block text-xs text-muted">Manage visits, lead sessions, set billing</span>
                  </div>
                  <div className="absolute right-3 top-3 hidden h-5 w-5 items-center justify-center rounded-full bg-brand text-white group-has-[:checked]:flex">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </label>

                <label className="group relative flex cursor-pointer items-start gap-3.5 rounded-[var(--radius-md)] border-2 border-line bg-white p-4 transition hover:border-brand-muted hover:bg-brand-soft/30 has-[:checked]:border-brand has-[:checked]:bg-brand-soft/40">
                  <input type="radio" name="role" value="patient" required className="sr-only" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold">Patient</span>
                    <span className="mt-0.5 block text-xs text-muted">Join appointments, follow care plans</span>
                  </div>
                  <div className="absolute right-3 top-3 hidden h-5 w-5 items-center justify-center rounded-full bg-brand text-white group-has-[:checked]:flex">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </label>
              </div>
            </fieldset>

            <hr className="border-line-light" />

            {/* Name & Phone */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="full_name" className="form-label">Full name <span className="text-[var(--danger-ink)]">*</span></label>
                <input id="full_name" name="full_name" required placeholder="Dr. Jane Smith" className="form-input" />
              </div>
              <div>
                <label htmlFor="phone" className="form-label">Phone number</label>
                <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="form-input" />
              </div>
            </div>

            {/* Role-specific fields */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="specialty" className="form-label">
                  Specialty
                  <span className="ml-1 text-xs font-normal text-muted">(providers)</span>
                </label>
                <input id="specialty" name="specialty" placeholder="e.g. Cardiology, Psychiatry" className="form-input" />
              </div>
              <div>
                <label htmlFor="date_of_birth" className="form-label">
                  Date of birth
                  <span className="ml-1 text-xs font-normal text-muted">(patients)</span>
                </label>
                <input id="date_of_birth" name="date_of_birth" type="date" className="form-input" />
              </div>
            </div>

            <SubmitButton
              idleText="Complete Setup & Continue"
              pendingText="Saving your profile..."
              className="w-full bg-brand text-white hover:bg-brand-strong"
            />
          </form>
        </div>
      </section>
    </main>
  );
}
