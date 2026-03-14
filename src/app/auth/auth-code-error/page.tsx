export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <div className="rounded-lg border border-red-300 bg-red-50 p-6">
        <h1 className="text-xl font-semibold text-red-900">Authentication failed</h1>
        <p className="mt-2 text-sm text-red-800">
          The login link could not be verified. Please try signing in again.
        </p>
      </div>
    </main>
  );
}

