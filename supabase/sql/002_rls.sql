-- Row Level Security policies for telehealth MVP.

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.video_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.files enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self_or_admin"
on public.profiles for insert
with check (id = auth.uid() or public.is_admin());

-- providers and patients
create policy "providers_select_all_auth"
on public.providers for select
using (auth.uid() is not null);

create policy "providers_write_admin"
on public.providers for all
using (public.is_admin())
with check (public.is_admin());

create policy "patients_select_self_provider_or_admin"
on public.patients for select
using (
  user_id = auth.uid()
  or public.current_profile_role() = 'provider'
  or public.is_admin()
);

create policy "patients_update_self_or_admin"
on public.patients for update
using (user_id = auth.uid() or public.is_admin());

create policy "patients_insert_self_or_admin"
on public.patients for insert
with check (user_id = auth.uid() or public.is_admin());

-- appointments and sessions
create policy "appointments_access_related_users_or_admin"
on public.appointments for select
using (
  public.is_admin()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.providers p
    where p.id = provider_id and p.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.patients p
    where p.id = patient_id and p.user_id = auth.uid()
  )
);

create policy "appointments_insert_provider_patient_admin"
on public.appointments for insert
with check (
  public.is_admin()
  or exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
);

create policy "appointments_update_related_users_or_admin"
on public.appointments for update
using (
  public.is_admin()
  or exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
);

create policy "video_sessions_access_by_appointment_access"
on public.video_sessions for select
using (
  public.is_admin()
  or exists (
    select 1 from public.appointments a
    where a.id = appointment_id
    and (
      a.created_by = auth.uid()
      or exists (select 1 from public.providers p where p.id = a.provider_id and p.user_id = auth.uid())
      or exists (select 1 from public.patients p where p.id = a.patient_id and p.user_id = auth.uid())
    )
  )
);

create policy "video_sessions_write_related_users_or_admin"
on public.video_sessions for all
using (
  public.is_admin()
  or exists (
    select 1 from public.appointments a
    where a.id = appointment_id
    and (
      a.created_by = auth.uid()
      or exists (select 1 from public.providers p where p.id = a.provider_id and p.user_id = auth.uid())
      or exists (select 1 from public.patients p where p.id = a.patient_id and p.user_id = auth.uid())
    )
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.appointments a
    where a.id = appointment_id
    and (
      a.created_by = auth.uid()
      or exists (select 1 from public.providers p where p.id = a.provider_id and p.user_id = auth.uid())
      or exists (select 1 from public.patients p where p.id = a.patient_id and p.user_id = auth.uid())
    )
  )
);

-- messages/files/payments
create policy "messages_access_related_users_or_admin"
on public.messages for select
using (
  public.is_admin()
  or sender_user_id = auth.uid()
  or exists (
    select 1 from public.appointments a
    where a.id = appointment_id
    and (
      a.created_by = auth.uid()
      or exists (select 1 from public.providers p where p.id = a.provider_id and p.user_id = auth.uid())
      or exists (select 1 from public.patients p where p.id = a.patient_id and p.user_id = auth.uid())
    )
  )
);

create policy "messages_insert_related_users_or_admin"
on public.messages for insert
with check (
  public.is_admin()
  or sender_user_id = auth.uid()
  or exists (
    select 1 from public.appointments a
    where a.id = appointment_id
    and (
      a.created_by = auth.uid()
      or exists (select 1 from public.providers p where p.id = a.provider_id and p.user_id = auth.uid())
      or exists (select 1 from public.patients p where p.id = a.patient_id and p.user_id = auth.uid())
    )
  )
);

create policy "files_access_related_users_or_admin"
on public.files for select
using (
  public.is_admin()
  or uploaded_by = auth.uid()
  or (
    appointment_id is not null and exists (
      select 1 from public.appointments a
      where a.id = appointment_id
      and (
        a.created_by = auth.uid()
        or exists (select 1 from public.providers p where p.id = a.provider_id and p.user_id = auth.uid())
        or exists (select 1 from public.patients p where p.id = a.patient_id and p.user_id = auth.uid())
      )
    )
  )
);

create policy "files_insert_related_users_or_admin"
on public.files for insert
with check (public.is_admin() or uploaded_by = auth.uid());

create policy "payments_access_related_users_or_admin"
on public.payments for select
using (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
  or exists (
    select 1
    from public.appointments a
    join public.providers pr on pr.id = a.provider_id
    where a.id = appointment_id and pr.user_id = auth.uid()
  )
);

create policy "payments_write_admin"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

-- audit logs
create policy "audit_logs_select_admin_only"
on public.audit_logs for select
using (public.is_admin());

create policy "audit_logs_insert_authenticated"
on public.audit_logs for insert
with check (auth.uid() is not null);

