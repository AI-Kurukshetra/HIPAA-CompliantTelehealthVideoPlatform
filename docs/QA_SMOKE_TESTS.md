# QA Smoke Tests (T8)

Run this checklist before each demo/release.

## 0. Setup

1. Run `npm install`
2. Ensure `.env` or `.env.local` has valid Supabase values
3. Ensure SQL scripts were run in order:
   - `supabase/sql/001_schema.sql`
   - `supabase/sql/002_rls.sql`
   - `supabase/sql/003_payments_mvp.sql`
4. Run `npm run dev`

## 1. Auth and Onboarding

1. Open `/auth/sign-in`.
2. Sign up with email/password (or sign in if account already exists).
3. If new account, complete onboarding as provider or patient.
4. Confirm redirect to `/app`.

Expected:
- Unauthenticated users cannot access `/app/*`.
- New users without profile are routed to `/onboarding`.

## 2. Appointment Flow

1. Create appointment from `/app/appointments/new`.
2. Open appointment in `/app/appointments/[id]`.
3. Verify provider/patient can only see their own appointments.

Expected:
- Invalid appointment data is rejected.
- Cross-appointment URL access is blocked.

## 3. Messaging

1. In appointment detail, send a message as provider.
2. Open as patient and confirm message appears.
3. Reply as patient and confirm provider sees reply.

Expected:
- Empty message is rejected.
- Unauthorized users cannot send/read appointment messages.

## 4. Waiting Room and Video

1. Patient clicks `Join waiting room`.
2. Provider clicks `Admit and start session`.
3. Click `Join video room`.

Expected:
- Session status transitions to `waiting` then `active`.
- Meeting token is required for `/video` route.
- Patient cannot run provider-only start action.

## 5. Payment Flow

1. Provider sets amount/currency in `Payment`.
2. Patient opens same appointment and clicks `Mark as paid`.
3. Confirm status changes from `pending` to `paid`.

Expected:
- Provider can create/update payment request.
- Patient can mark only own appointment payment as paid.

## 6. Audit Verification

In Supabase `audit_logs`, confirm events are written for:

1. `appointment_created`
2. `message_sent`
3. `waiting_room_joined`
4. `video_session_started`
5. `payment_created_or_updated`
6. `payment_marked_paid`

## 7. Quality Gates

1. Run `npm run lint`
2. Run `npm run typecheck`
3. Run `npm run build`

Expected:
- All commands pass with no errors.
