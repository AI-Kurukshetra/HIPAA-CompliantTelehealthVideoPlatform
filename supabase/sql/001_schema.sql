-- Core schema for telehealth MVP.
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'provider', 'patient');
create type public.appointment_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
create type public.session_status as enum ('waiting', 'active', 'ended', 'failed');
create type public.message_sender as enum ('provider', 'patient', 'system');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'patient',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  specialty text,
  license_number text,
  bio text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  reason text,
  meeting_token text unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_sessions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  status public.session_status not null default 'waiting',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  sender_type public.message_sender not null,
  body text not null,
  sent_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  bucket text not null,
  object_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  provider text not null default 'stripe',
  provider_ref text,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_provider_starts_at on public.appointments(provider_id, starts_at);
create index if not exists idx_appointments_patient_starts_at on public.appointments(patient_id, starts_at);
create index if not exists idx_messages_appointment_sent_at on public.messages(appointment_id, sent_at);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

