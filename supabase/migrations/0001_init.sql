create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('subscriber', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('pending', 'active', 'lapsed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'draw_mode') then
    create type draw_mode as enum ('random', 'weighted');
  end if;

  if not exists (select 1 from pg_type where typname = 'draw_match_tier') then
    create type draw_match_tier as enum ('match_5', 'match_4', 'match_3');
  end if;

  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type verification_status as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type payout_status as enum ('pending', 'paid');
  end if;
end $$;

create table if not exists public.charities (
  id text primary key,
  slug text not null,
  name text not null,
  description text not null,
  hero_image text,
  tags text[] not null default '{}',
  upcoming_event text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.charities
  add column if not exists slug text,
  add column if not exists hero_image text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists upcoming_event text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.charities
set slug = coalesce(nullif(slug, ''), lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
where slug is null or slug = '';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default 'Subscriber',
  role app_role not null default 'subscriber',
  selected_charity_id text references public.charities(id),
  charity_percent int not null default 10 check (charity_percent between 10 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_code text not null check (plan_code in ('monthly', 'yearly')),
  status subscription_status not null default 'pending',
  gateway text not null,
  gateway_reference text,
  amount_inr int not null check (amount_inr > 0),
  billing_cycle_months int not null check (billing_cycle_months in (1, 12)),
  charity_contribution_inr int not null default 0 check (charity_contribution_inr >= 0),
  started_at timestamptz,
  renewal_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

create table if not exists public.score_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  played_on date not null,
  stableford_score int not null check (stableford_score between 1 and 45),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, played_on)
);

create index if not exists idx_scores_user_date on public.score_entries(user_id, played_on desc);

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  month_key date not null unique,
  draw_mode draw_mode not null,
  winning_numbers int[] not null check (array_length(winning_numbers, 1) = 5),
  prize_pool_total_inr int not null default 0 check (prize_pool_total_inr >= 0),
  jackpot_rollover_inr int not null default 0 check (jackpot_rollover_inr >= 0),
  published boolean not null default false,
  executed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.draws
  add column if not exists published boolean not null default false;

create table if not exists public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  numbers int[] not null check (array_length(numbers, 1) = 5),
  created_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create table if not exists public.draw_winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_tier draw_match_tier not null,
  prize_amount_inr int not null check (prize_amount_inr >= 0),
  verification_status verification_status not null default 'pending',
  payout_status payout_status not null default 'pending',
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (draw_id, user_id, match_tier)
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_charities_updated_at on public.charities;
create trigger trg_charities_updated_at
before update on public.charities
for each row execute function public.handle_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.handle_updated_at();

drop trigger if exists trg_scores_updated_at on public.score_entries;
create trigger trg_scores_updated_at
before update on public.score_entries
for each row execute function public.handle_updated_at();

drop trigger if exists trg_draws_updated_at on public.draws;
create trigger trg_draws_updated_at
before update on public.draws
for each row execute function public.handle_updated_at();

drop trigger if exists trg_winners_updated_at on public.draw_winners;
create trigger trg_winners_updated_at
before update on public.draw_winners
for each row execute function public.handle_updated_at();

create or replace function public.enforce_score_limit()
returns trigger
language plpgsql
as $$
begin
  delete from public.score_entries se
  where se.user_id = new.user_id
    and se.id in (
      select id
      from public.score_entries
      where user_id = new.user_id
      order by played_on asc, created_at asc
      offset 5
    );
  return new;
end;
$$;

drop trigger if exists trg_enforce_score_limit on public.score_entries;
create trigger trg_enforce_score_limit
after insert on public.score_entries
for each row execute function public.enforce_score_limit();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1), 'Subscriber')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.charities enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.score_entries enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.draw_winners enable row level security;

drop policy if exists "Charities are visible to everyone" on public.charities;
create policy "Charities are visible to everyone"
on public.charities for select
using (true);

drop policy if exists "Admins manage charities" on public.charities;
create policy "Admins manage charities"
on public.charities for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select
using (public.is_admin());

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own subscriptions" on public.subscriptions;
create policy "Users can create own subscriptions"
on public.subscriptions for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own subscriptions" on public.subscriptions;
create policy "Users can update own subscriptions"
on public.subscriptions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can manage subscriptions" on public.subscriptions;
create policy "Admins can manage subscriptions"
on public.subscriptions for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can manage own scores" on public.score_entries;
create policy "Users can manage own scores"
on public.score_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view published draws" on public.draws;
create policy "Users can view published draws"
on public.draws for select
using (published = true or public.is_admin());

drop policy if exists "Admins can manage draws" on public.draws;
create policy "Admins can manage draws"
on public.draws for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can view own draw entries" on public.draw_entries;
create policy "Users can view own draw entries"
on public.draw_entries for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage draw entries" on public.draw_entries;
create policy "Admins can manage draw entries"
on public.draw_entries for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can view own winner records" on public.draw_winners;
create policy "Users can view own winner records"
on public.draw_winners for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can upload own proof" on public.draw_winners;
create policy "Users can upload own proof"
on public.draw_winners for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can manage winner records" on public.draw_winners;
create policy "Admins can manage winner records"
on public.draw_winners for all
using (public.is_admin())
with check (public.is_admin());

do $$
declare charities_id_type text;
begin
  select c.data_type
  into charities_id_type
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'charities'
    and c.column_name = 'id';

  if charities_id_type = 'uuid' then
    insert into public.charities (id, slug, name, description, hero_image, tags, upcoming_event, is_featured)
    values
      ((format('%s-%s-%s-%s-%s', substr(md5('junior-fairways-foundation'), 1, 8), substr(md5('junior-fairways-foundation'), 9, 4), substr(md5('junior-fairways-foundation'), 13, 4), substr(md5('junior-fairways-foundation'), 17, 4), substr(md5('junior-fairways-foundation'), 21, 12)))::uuid, 'junior-fairways-foundation', 'Junior Fairways Foundation', 'Funds coaching scholarships and equipment for underrepresented junior golfers.', '/charity-junior-fairways.jpg', '{"youth","education","golf"}', 'City Junior Golf Day - 15 May', true),
      ((format('%s-%s-%s-%s-%s', substr(md5('clean-water-drive'), 1, 8), substr(md5('clean-water-drive'), 9, 4), substr(md5('clean-water-drive'), 13, 4), substr(md5('clean-water-drive'), 17, 4), substr(md5('clean-water-drive'), 21, 12)))::uuid, 'clean-water-drive', 'Clean Water Drive', 'Builds clean water infrastructure in rural communities with transparent impact reports.', '/charity-clean-water.jpg', '{"health","infrastructure"}', 'Impact Showcase - 01 June', false),
      ((format('%s-%s-%s-%s-%s', substr(md5('green-links-initiative'), 1, 8), substr(md5('green-links-initiative'), 9, 4), substr(md5('green-links-initiative'), 13, 4), substr(md5('green-links-initiative'), 17, 4), substr(md5('green-links-initiative'), 21, 12)))::uuid, 'green-links-initiative', 'Green Links Initiative', 'Restores local ecosystems around sports spaces through community volunteering programs.', '/charity-green-links.jpg', '{"environment","community"}', 'Planting Weekend - 22 April', false)
    on conflict (id) do update
    set slug = excluded.slug,
        name = excluded.name,
        description = excluded.description,
        hero_image = excluded.hero_image,
        tags = excluded.tags,
        upcoming_event = excluded.upcoming_event,
        is_featured = excluded.is_featured;
  else
    insert into public.charities (id, slug, name, description, hero_image, tags, upcoming_event, is_featured)
    values
      ('junior-fairways-foundation', 'junior-fairways-foundation', 'Junior Fairways Foundation', 'Funds coaching scholarships and equipment for underrepresented junior golfers.', '/charity-junior-fairways.jpg', '{"youth","education","golf"}', 'City Junior Golf Day - 15 May', true),
      ('clean-water-drive', 'clean-water-drive', 'Clean Water Drive', 'Builds clean water infrastructure in rural communities with transparent impact reports.', '/charity-clean-water.jpg', '{"health","infrastructure"}', 'Impact Showcase - 01 June', false),
      ('green-links-initiative', 'green-links-initiative', 'Green Links Initiative', 'Restores local ecosystems around sports spaces through community volunteering programs.', '/charity-green-links.jpg', '{"environment","community"}', 'Planting Weekend - 22 April', false)
    on conflict (id) do update
    set slug = excluded.slug,
        name = excluded.name,
        description = excluded.description,
        hero_image = excluded.hero_image,
        tags = excluded.tags,
        upcoming_event = excluded.upcoming_event,
        is_featured = excluded.is_featured;
  end if;
end $$;
