-- Fix provider onboarding writes for non-admin provider users.
-- Run after 001_schema.sql and 002_rls.sql.

drop policy if exists "providers_write_admin" on public.providers;

create policy "providers_insert_self_or_admin"
on public.providers for insert
with check (user_id = auth.uid() or public.is_admin());

create policy "providers_update_self_or_admin"
on public.providers for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "providers_delete_admin_only"
on public.providers for delete
using (public.is_admin());
