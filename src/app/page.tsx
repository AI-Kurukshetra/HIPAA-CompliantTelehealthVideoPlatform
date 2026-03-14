import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">HIPAA Telehealth Platform</h1>
      <p className="mt-2 text-sm text-gray-600">Project setup: Next.js + Supabase</p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium">Environment status</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>Supabase env configured: {configured ? "Yes" : "No"}</li>
          <li>Current auth user: {user?.email ?? "Not signed in"}</li>
          <li>Auth check error: {error?.message ?? "None"}</li>
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium">Access the app</h2>
        <div className="mt-3 flex gap-3">
          <Link
            href={user ? "/app" : "/auth/sign-in"}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            {user ? "Open dashboard" : "Sign in"}
          </Link>
          {!configured ? (
            <Link
              href="https://supabase.com/dashboard"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Open Supabase
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
