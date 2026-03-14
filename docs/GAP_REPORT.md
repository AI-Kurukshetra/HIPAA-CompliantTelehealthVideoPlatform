# Gap Report and Build Order

Source: `doxy_me_blueprint_20260309_185427.pdf` (decoded via `_decoded_streams.txt`) vs current codebase.

## 1) Immediate Priorities (Build Next)

1. Secure Messaging MVP
- Why now: High value, lower risk than live video, directly listed in MVP scope.
- Scope:
  - Appointment thread page (`/app/appointments/[id]`)
  - Send message action (server-side)
  - Membership validation (provider/patient for appointment)
  - Audit log event on send
- Acceptance:
  - Provider and patient can exchange messages only within their appointment.
  - Unauthorized users cannot read/send messages.

2. Video Session + Waiting Room MVP
- Why now: Core telehealth differentiator and must-have from blueprint.
- Scope:
  - Waiting room status flow (`waiting -> active -> ended`)
  - Provider controls to admit/start session
  - Join session route for provider/patient
  - Session audit events
- Acceptance:
  - Patient can join waiting room.
  - Provider can admit and start session.
  - Both sides can join only authorized appointments.

3. Payment Flow MVP
- Why now: Explicit in MVP scope and needed for business viability.
- Scope:
  - Appointment-linked payment intent/create/update flow
  - Payment status visible to both sides
  - Audit log on payment status change
- Acceptance:
  - Payment status updates reliably and is visible in appointment context.

## 2) Security and Compliance Hardening Track

Run in parallel with feature work.

1. Authorization matrix
- Define page/action permissions by role (`admin`, `provider`, `patient`).
- Enforce through shared helpers in `src/lib/auth.ts`.

2. Audit event coverage
- Log: sign-in callback success/failure, onboarding completion, appointment create/update/cancel, message send, session transitions, payment transitions.

3. Operational hygiene
- Secret handling review
- Sensitive field logging review
- Production deploy checklist (BAA-capable vendors, retention, incident response)

## 3) Suggested Ticket Sequence

1. `T1`: Add `docs/AUTHORIZATION_MATRIX.md` and enforce shared permission guards.
2. `T2`: Appointment detail route (`/app/appointments/[id]`) with member-only access.
3. `T3`: Messaging send/list actions and UI.
4. `T4`: Audit utility function + wire into appointments/messaging.
5. `T5`: Video waiting room state model + provider admit action.
6. `T6`: Video provider integration and join route.
7. `T7`: Payment initiation/status flow.
8. `T8`: End-to-end smoke tests and CI gate updates.

## 4) Definition of Done (Per Ticket)

1. `npm run lint` passes
2. `npm run typecheck` passes
3. Manual test steps documented and executed
4. At least one negative auth test verified (unauthorized access blocked)
5. Changes mapped back to SRS checklist row(s)

## 5) Current Risk Notes

1. SRS is blueprint-style and broad; avoid overbuilding advanced features before MVP core is complete.
2. HIPAA compliance is not a single feature; treat compliance as ongoing controls, logging, infrastructure, and process.
3. Avoid adding video/payment SDK complexity before route-level authorization and audit utilities are consistent.
