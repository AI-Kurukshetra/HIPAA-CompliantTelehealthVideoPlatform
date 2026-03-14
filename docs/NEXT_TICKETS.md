# Next Tickets (Post-T8)

As of 2026-03-14, T1-T8 are complete at MVP level. This file defines the next execution order to close remaining SRS gaps.

## T9: Screen/Document Sharing MVP

- Scope:
  - Add file upload action for appointment members.
  - Add appointment file list UI with access checks.
  - Add audit events (`file_uploaded`, `file_viewed`, `file_deleted` where applicable).
- Acceptance:
  - Provider/patient can upload and view files only for their appointment.
  - Unauthorized users cannot upload/read/download appointment files.
  - `npm run check` passes.

## T10: Provider Notes Workflow MVP

- Scope:
  - Create provider-only notes model and CRUD actions scoped to appointment.
  - Add notes UI in appointment detail.
  - Enforce provider-only read/write permissions.
  - Add audit events (`note_created`, `note_updated`, `note_deleted`).
- Acceptance:
  - Only assigned provider can manage notes.
  - Patient cannot read provider notes.
  - `npm run check` passes.

## T11: Emergency Procedure Workflow

- Scope:
  - Add emergency flag/escalation action in appointment session.
  - Capture emergency reason and timestamp.
  - Show emergency contact guidance and operational steps in UI/docs.
  - Add audit event (`emergency_escalated`).
- Acceptance:
  - Provider can trigger emergency flow from appointment context.
  - Emergency action is persisted and auditable.
  - Runbook documented in `docs/`.

## T12: Audit Coverage Completion

- Scope:
  - Ensure consistent audit logging for: auth callback success/failure, onboarding completion, sign-out, appointment update/cancel/failure paths.
  - Add a lightweight audit coverage checklist.
- Acceptance:
  - Critical user and system actions generate audit events.
  - Negative/error paths also emit meaningful audit events.
  - `docs/QA_SMOKE_TESTS.md` updated for verification.

## T13: Production Video/Payments Hardening

- Scope:
  - Replace placeholder/basic video room flow with BAA-capable provider integration approach.
  - Replace manual payment status workflow with production payment provider flow.
  - Add environment and secrets checklist for production.
- Acceptance:
  - Video and payment flows are production-integrated and auditable.
  - Configuration and operational prerequisites are documented.

## T14: Release Readiness and Compliance Ops

- Scope:
  - Add retention policy documentation and data lifecycle controls checklist.
  - Add incident response checklist and deployment hardening checklist.
  - Finalize CI release gates and manual sign-off checklist.
- Acceptance:
  - `docs/SRS_COVERAGE_REPORT.md` updated with new percentages.
  - Release checklist can be executed end-to-end before launch.
