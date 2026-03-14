import { completeOnboarding } from "@/app/onboarding/actions";
import { getProfile, requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Complete onboarding</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set your role and profile details to continue.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}

        <form action={completeOnboarding} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="provider" required />
                Provider
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="patient" required />
                Patient
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="specialty" className="mb-1 block text-sm font-medium">
              Specialty (provider only)
            </label>
            <input
              id="specialty"
              name="specialty"
              placeholder="Cardiology"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}

