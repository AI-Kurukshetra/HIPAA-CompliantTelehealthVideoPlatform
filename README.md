# HIPAA-Compliant Telehealth Platform (Project Setup)

This repository is now set up with:
- Next.js (App Router + TypeScript + Tailwind)
- Supabase SDK integration (browser, server, middleware)
- Starter SQL schema and RLS policies for telehealth MVP

## 1. Prerequisites

- Node.js 20+ (you already have Node 24)
- A Supabase account: https://supabase.com

## 2. Create a Supabase project (first-time friendly)

1. Log in to Supabase.
2. Click **New project**.
3. Choose organization, project name (for example: `telehealth-platform`), strong database password, and region.
4. Wait until project status becomes active.
5. Open **Project Settings -> API**.
6. Copy:
   - Project URL
   - `anon` public key
   - `service_role` key

## 3. Configure environment variables

1. Copy `.env.example` to `.env.local`.
2. Fill the values from Supabase API settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 4. Apply database setup SQL

In your Supabase dashboard:
1. Go to **SQL Editor**.
2. Run [`supabase/sql/001_schema.sql`](./supabase/sql/001_schema.sql).
3. Run [`supabase/sql/002_rls.sql`](./supabase/sql/002_rls.sql).
4. Run [`supabase/sql/003_payments_mvp.sql`](./supabase/sql/003_payments_mvp.sql) for payment write policies used by the app.
5. Optional: run [`supabase/sql/004_demo_seed_data.sql`](./supabase/sql/004_demo_seed_data.sql) for demo UI walkthrough data.
6. Optional (demo reset): run [`supabase/sql/005_reset_and_seed_demo_data.sql`](./supabase/sql/005_reset_and_seed_demo_data.sql) to wipe transactional app data and generate a fresh, richer demo dataset.

This creates the initial entities and Row Level Security policies for:
- users/profiles, providers, patients
- appointments, video sessions
- messages, files, payments
- audit logs

## 5. Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The homepage shows:
- whether Supabase env vars are configured
- whether auth session lookup is working

## 6. Configure Supabase Auth redirect URLs

In Supabase dashboard:
1. Go to **Authentication -> URL Configuration**.
2. Set **Site URL** to:
   - `http://localhost:3000`
3. Add **Redirect URL**:
   - `http://localhost:3000/auth/callback`

Without this step, magic-link sign-in callback will fail.

## 7. Implemented app slice (auth + onboarding + appointments)

- `src/lib/supabase/client.ts`: browser Supabase client
- `src/lib/supabase/server.ts`: server Supabase client for App Router
- `src/lib/supabase/middleware.ts` + `middleware.ts`: session refresh middleware
- `src/app/auth/callback/route.ts`: auth callback handler
- `src/app/auth/auth-code-error/page.tsx`: callback failure page
- `src/app/auth/sign-in/page.tsx`: magic-link sign-in UI
- `src/app/onboarding/page.tsx`: role onboarding (provider/patient)
- `src/app/app/*`: protected dashboard + appointment flows
- Starter schema and RLS SQL in `supabase/sql`

Routes now available:
- `/` landing/status
- `/auth/sign-in`
- `/onboarding`
- `/app`
- `/app/appointments`
- `/app/appointments/new`

## 8. Important note for HIPAA readiness

This setup is a solid base, but not full HIPAA compliance by itself. Before production, we still need:
- full security controls and audits
- infra hardening and key management
- BAA-ready vendor configuration
- complete audit, retention, and incident response workflows
-
