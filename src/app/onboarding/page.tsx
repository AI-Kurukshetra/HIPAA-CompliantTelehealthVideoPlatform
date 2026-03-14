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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <section className="soft-card w-full rounded-3xl p-7">
        <h1 className="text-3xl font-semibold">Complete your onboarding</h1>
        <p className="ink-muted mt-2 text-sm">
          Configure your role and basic profile details. You can continue in under a minute.
        </p>

        {params.error ? <p className="status-danger mt-4 rounded-md px-3 py-2 text-sm">{params.error}</p> : null}

        <form action={completeOnboarding} className="mt-5 space-y-4">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">Role</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3">
                <input type="radio" name="role" value="provider" required className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold">Provider</span>
                  <span className="ink-muted block text-xs">Manage visits and lead sessions</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3">
                <input type="radio" name="role" value="patient" required className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold">Patient</span>
                  <span className="ink-muted block text-xs">Join appointments and follow care plans</span>
                </span>
              </label>
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6aa9c4] focus:ring-2 focus:ring-[#d7ecf7]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6aa9c4] focus:ring-2 focus:ring-[#d7ecf7]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="specialty" className="mb-1 block text-sm font-medium">
                Specialty (provider only)
              </label>
              <input
                id="specialty"
                name="specialty"
                placeholder="Cardiology"
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6aa9c4] focus:ring-2 focus:ring-[#d7ecf7]"
              />
            </div>

            <div>
              <label htmlFor="date_of_birth" className="mb-1 block text-sm font-medium">
                Date of birth (patient only)
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#6aa9c4] focus:ring-2 focus:ring-[#d7ecf7]"
              />
            </div>
          </div>

          <SubmitButton
            idleText="Continue to Dashboard"
            pendingText="Saving profile..."
            className="w-full bg-brand text-white hover:bg-brand-strong"
          />
        </form>
      </section>
    </main>
  );
}
