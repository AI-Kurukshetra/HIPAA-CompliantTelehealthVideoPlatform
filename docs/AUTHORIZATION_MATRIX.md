# Authorization Matrix (T1)

This matrix defines which roles can access current routes and server actions.

Roles:
- `admin`
- `provider`
- `patient`
- `anonymous` (not authenticated)

## Routes

| Route | anonymous | provider | patient | admin | Enforcement |
|---|---:|---:|---:|---:|---|
| `/` | Allow | Allow | Allow | Allow | Public route |
| `/auth/sign-in` | Allow | Redirect to `/app` if already signed in | Redirect to `/app` if already signed in | Redirect to `/app` if already signed in | Auth flow |
| `/onboarding` | Deny (redirect to sign-in) | Allow only if no profile | Allow only if no profile | Allow only if no profile | `requireUser` + profile check |
| `/app` | Deny | Allow | Allow | Allow | `requireProfile` (protected app) |
| `/app/appointments` | Deny | Allow | Allow | Allow | `requireRole(["admin","provider","patient"])` |
| `/app/appointments/new` | Deny | Allow | Allow | Allow | `requireRole(["admin","provider","patient"])` |
| `/app/appointments/[id]` | Deny | Allow (own appointment only) | Allow (own appointment only) | Allow | `requireRole(["admin","provider","patient"])` + membership check |
| `/app/appointments/[id]/video` | Deny | Allow (own appointment only) | Allow (own appointment only) | Allow | `requireRole(["admin","provider","patient"])` + membership check + `meeting_token` required |

## Server Actions

| Action | anonymous | provider | patient | admin | Enforcement |
|---|---:|---:|---:|---:|---|
| `signOut` | Deny | Allow | Allow | Allow | Protected via active session |
| `completeOnboarding` | Deny | Allow | Allow | Allow | `requireUser` + data validation |
| `createAppointment` | Deny | Allow | Allow | Allow | `requireRole(["admin","provider","patient"])` + role-bound actor IDs |
| `sendAppointmentMessage` | Deny | Allow (own appointment only) | Allow (own appointment only) | Deny | `requireRole(["provider","patient"])` + appointment membership check + audit log |
| `joinWaitingRoom` | Deny | Allow (own appointment only) | Allow (own appointment only) | Deny | `requireRole(["provider","patient"])` + appointment membership check + upsert `video_sessions` |
| `admitAndStartSession` | Deny | Allow (own appointment only) | Deny | Deny | `requireRole(["provider"])` + appointment membership check + status update |
| `createOrUpdatePayment` | Deny | Allow (own appointment only) | Deny | Deny | `requireRole(["provider"])` + appointment membership check + upsert `payments` + audit log |
| `markPaymentPaid` | Deny | Deny | Allow (own appointment only) | Deny | `requireRole(["patient"])` + appointment membership check + update `payments` + audit log |

## Authorization Rules Applied

1. Any `/app/*` route requires authenticated user and profile.
2. Role-based routes/actions must use shared guard helpers in `src/lib/auth.ts`.
3. Provider users cannot create appointments on behalf of another provider.
4. Patient users cannot create appointments on behalf of another patient.
5. Missing provider/patient actor records are treated as incomplete onboarding and blocked.
