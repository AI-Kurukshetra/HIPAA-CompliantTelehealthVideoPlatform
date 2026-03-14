-- Extend payment write policies for MVP payment flow.
-- Run this after 001_schema.sql and 002_rls.sql.

drop policy if exists "payments_write_admin" on public.payments;

create policy "payments_insert_provider_or_admin"
on public.payments for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.appointments a
    join public.providers pr on pr.id = a.provider_id
    where a.id = appointment_id and pr.user_id = auth.uid()
  )
);

create policy "payments_update_related_users_or_admin"
on public.payments for update
using (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
  or exists (
    select 1
    from public.appointments a
    join public.providers pr on pr.id = a.provider_id
    where a.id = appointment_id and pr.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
  or exists (
    select 1
    from public.appointments a
    join public.providers pr on pr.id = a.provider_id
    where a.id = appointment_id and pr.user_id = auth.uid()
  )
);

create policy "payments_delete_admin_only"
on public.payments for delete
using (public.is_admin());
