# Telehealth MVP Checklist (From `doxy_me_blueprint_20260309_185427.pdf`)

Status key:
- `DONE`: Implemented and usable now
- `PARTIAL`: Base exists, but missing expected workflow depth
- `MISSING`: Not implemented yet

## Core Platform

| Feature | SRS Intent | Current Status | Evidence |
|---|---|---|---|
| Authentication | Secure sign-in for users | DONE | Magic-link sign-in + callback routes implemented |
| Role onboarding | Provider/patient onboarding and role assignment | DONE | Onboarding route + profile/provider/patient upsert |
| Role-based protected app | Protected `/app` area with role-aware behavior | DONE | Shared role guards + appointment membership checks implemented |
| Provider dashboard | Provider hub for appointments/interactions | PARTIAL | Dashboard exists, but not provider-specific metrics/features yet |
| Patient portal access | Browser-based patient access without app install | PARTIAL | Works in browser, but limited patient-specific portal features |

## Appointment and Consultation

| Feature | SRS Intent | Current Status | Evidence |
|---|---|---|---|
| Appointment scheduling | Book consultations with provider/patient linkage | PARTIAL | Create/list/detail implemented; full lifecycle states/actions still pending |
| Virtual waiting room | Patient waits; provider admits | DONE | Waiting room join + provider start session actions implemented |
| HIPAA-compliant video calling | Encrypted real-time video consults | PARTIAL | Protected video join route implemented; production BAA-ready provider integration pending |
| Cross-device support | Works on desktop/tablet/mobile | PARTIAL | Responsive web app baseline only; no full QA pass |
| Emergency procedures | Steps for medical emergencies during virtual visit | MISSING | No incident/escalation flow implemented |

## Collaboration and Records

| Feature | SRS Intent | Current Status | Evidence |
|---|---|---|---|
| Secure messaging | Secure chat during consultations | DONE | Appointment-scoped message send/list UI and access checks implemented |
| Screen/document sharing | Share files/results during consult | MISSING | `files` table exists; upload/share flows not implemented |
| Provider profiles | Credentials/specialty/availability | PARTIAL | Basic specialty captured; no full profile/availability UI |
| Provider notes system | Consultation note taking/documentation | MISSING | No notes UI/workflow (beyond generic tables) |

## Payments and Compliance

| Feature | SRS Intent | Current Status | Evidence |
|---|---|---|---|
| Payment processing | Payment collection for consultations | PARTIAL | Payment request + mark-paid flow implemented; no gateway integration yet |
| Comprehensive audit logging | Track access and critical activity | PARTIAL | Audit utility logs key appointment/message/video/payment actions; full coverage still pending |
| HIPAA readiness controls | Security/compliance operational controls | PARTIAL | Strong base (RLS/auth), but not production-level HIPAA controls end-to-end |

## MVP Readiness Summary

- `DONE`: 6
- `PARTIAL`: 8
- `MISSING`: 3

This project is a strong MVP foundation, not a complete SRS implementation yet. Highest-impact remaining capabilities are:
1. Screen/document sharing workflow
2. Provider notes workflow
3. Emergency escalation workflow
4. Full audit event coverage and production compliance hardening
