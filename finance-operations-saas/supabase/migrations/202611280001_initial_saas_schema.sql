-- Finance Operations SaaS — initial tenant-isolated schema
-- Apply in Supabase SQL Editor or via Supabase CLI after reviewing this migration.
begin;

create extension if not exists pgcrypto;

create type public.member_role as enum ('owner','admin','finance_manager','collector','viewer');
create type public.invoice_follow_up as enum ('not_contacted','email_sent','call_scheduled','promise_to_pay','disputed');

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.organisation_members (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (organisation_id,user_id)
);
create index organisation_members_user_idx on public.organisation_members(user_id);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  invoice_number text not null check (char_length(trim(invoice_number)) between 1 and 40),
  customer_name text not null check (char_length(trim(customer_name)) between 1 and 120),
  issue_date date not null,
  due_date date not null,
  amount numeric(14,2) not null check (amount > 0),
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0 and amount_paid <= amount),
  currency char(3) not null default 'USD',
  follow_up_status public.invoice_follow_up not null default 'not_contacted',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_dates_valid check (issue_date <= due_date),
  constraint invoice_org_number_unique unique (organisation_id,invoice_number)
);
create index invoices_org_due_idx on public.invoices(organisation_id,due_date);
create index invoices_org_customer_idx on public.invoices(organisation_id,customer_name);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index audit_events_org_time_idx on public.audit_events(organisation_id,occurred_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organisation_members m
    where m.organisation_id = target_org and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed public.member_role[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organisation_members m
    where m.organisation_id = target_org and m.user_id = (select auth.uid()) and m.role = any(allowed)
  );
$$;

create or replace function public.create_my_organisation(org_name text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare new_org uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists(select 1 from public.organisation_members where user_id = auth.uid()) then
    raise exception 'This account already belongs to an organisation';
  end if;
  if char_length(trim(org_name)) not between 2 and 120 then raise exception 'Invalid organisation name'; end if;
  insert into public.organisations(name,created_by) values(trim(org_name),auth.uid()) returning id into new_org;
  insert into public.organisation_members(organisation_id,user_id,role) values(new_org,auth.uid(),'owner');
  insert into public.audit_events(organisation_id,actor_id,entity_type,entity_id,action)
    values(new_org,auth.uid(),'organisation',new_org,'organisation.created');
  return new_org;
end;
$$;

create or replace function public.get_my_organisation()
returns table(id uuid,name text,role public.member_role)
language sql stable security invoker set search_path = ''
as $$
  select o.id,o.name,m.role from public.organisations o
  join public.organisation_members m on m.organisation_id=o.id
  where m.user_id=(select auth.uid()) order by o.created_at limit 1;
$$;

create or replace function public.audit_invoice_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare org_id uuid; inv_id uuid; action_name text;
begin
  if TG_OP='DELETE' then org_id:=old.organisation_id; inv_id:=old.id; action_name:='invoice.deleted';
  elsif TG_OP='INSERT' then org_id:=new.organisation_id; inv_id:=new.id; action_name:='invoice.created';
  else org_id:=new.organisation_id; inv_id:=new.id; action_name:='invoice.updated'; new.updated_at:=now(); new.updated_by:=auth.uid();
  end if;
  insert into public.audit_events(organisation_id,actor_id,entity_type,entity_id,action)
    values(org_id,auth.uid(),'invoice',inv_id,action_name);
  if TG_OP='DELETE' then return old; else return new; end if;
end;
$;

create or replace function public.set_invoice_updated_at()
returns trigger language plpgsql set search_path = '' as $
begin new.updated_at:=now(); new.updated_by:=auth.uid(); return new; end;
$;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_invoice_updated_at();
create trigger invoices_audit_trigger after insert or update or delete on public.invoices
for each row execute function public.audit_invoice_change();

-- Invitations are written only by the trusted Edge Function using service-role credentials.
create table public.pending_organisation_invitations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  email text not null check (email = lower(trim(email))),
  role public.member_role not null check (role in ('admin','finance_manager','collector','viewer')),
  invited_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (organisation_id,email)
);
alter table public.pending_organisation_invitations enable row level security;
revoke all on public.pending_organisation_invitations from anon, authenticated;

create or replace function public.accept_my_pending_invitations()
returns integer language plpgsql security definer set search_path = ''
as $
declare current_email text; accepted_count integer := 0; invitation record;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  current_email := lower(coalesce(auth.jwt()->>'email',''));
  if current_email = '' then raise exception 'Verified email is required'; end if;
  for invitation in
    select * from public.pending_organisation_invitations
    where email=current_email order by created_at
  loop
    insert into public.organisation_members(organisation_id,user_id,role,invited_by)
      values(invitation.organisation_id,auth.uid(),invitation.role,invitation.invited_by)
      on conflict (organisation_id,user_id) do nothing;
    insert into public.audit_events(organisation_id,actor_id,entity_type,entity_id,action,metadata)
      values(invitation.organisation_id,auth.uid(),'membership',invitation.organisation_id,'membership.invitation_accepted',
        jsonb_build_object('role',invitation.role));
    delete from public.pending_organisation_invitations where id=invitation.id;
    accepted_count := accepted_count + 1;
  end loop;
  return accepted_count;
end;
$;

alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_events enable row level security;

create policy org_read_member on public.organisations for select to authenticated using (public.is_org_member(id));
create policy org_update_admin on public.organisations for update to authenticated using (public.has_org_role(id,array['owner','admin']::public.member_role[])) with check (public.has_org_role(id,array['owner','admin']::public.member_role[]));
create policy members_read_same_org on public.organisation_members for select to authenticated using (public.is_org_member(organisation_id));
create policy invoices_read_member on public.invoices for select to authenticated using (public.is_org_member(organisation_id));
create policy invoices_insert_finance on public.invoices for insert to authenticated with check (public.has_org_role(organisation_id,array['owner','admin','finance_manager']::public.member_role[]));
create policy invoices_update_finance on public.invoices for update to authenticated using (public.has_org_role(organisation_id,array['owner','admin','finance_manager']::public.member_role[])) with check (public.has_org_role(organisation_id,array['owner','admin','finance_manager']::public.member_role[]));
create policy invoices_delete_admin on public.invoices for delete to authenticated using (public.has_org_role(organisation_id,array['owner','admin']::public.member_role[]));
create policy audit_read_admin on public.audit_events for select to authenticated using (public.has_org_role(organisation_id,array['owner','admin']::public.member_role[]));

grant usage on schema public to authenticated;
grant select,update on public.organisations to authenticated;
grant select on public.organisation_members to authenticated;
grant select,insert,update,delete on public.invoices to authenticated;
grant select on public.audit_events to authenticated;
grant usage,select on sequence public.audit_events_id_seq to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid,public.member_role[]) to authenticated;
grant execute on function public.create_my_organisation(text) to authenticated;
grant execute on function public.get_my_organisation() to authenticated;
revoke all on function public.create_my_organisation(text) from anon;
revoke all on function public.get_my_organisation() from anon;

commit;

revoke all on function public.accept_my_pending_invitations() from anon;
grant execute on function public.accept_my_pending_invitations() to authenticated;
