-- 1. Create Profiles Table (extends Supabase Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  credits integer not null default 50,
  tier text not null default 'free',
  api_key text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on Profiles
alter table public.profiles enable row level security;

-- Drop existing policies to prevent "already exists" errors
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
  on public.profiles for delete
  using (auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

-- 2. Create AI Writer History Table
create table if not exists public.writer_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  template text not null,
  prompt text not null,
  response text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Writer History
alter table public.writer_history enable row level security;

drop policy if exists "Users can view their own writer history" on public.writer_history;
create policy "Users can view their own writer history"
  on public.writer_history for select
  using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

drop policy if exists "Users can insert their own writer history" on public.writer_history;
create policy "Users can insert their own writer history"
  on public.writer_history for insert
  with check (auth.uid() = user_id);

-- 3. Create AI Studio Images Table
create table if not exists public.studio_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  prompt text not null,
  style text not null,
  url text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Studio Images
alter table public.studio_images enable row level security;

drop policy if exists "Users can view their own studio images" on public.studio_images;
create policy "Users can view their own studio images"
  on public.studio_images for select
  using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

drop policy if exists "Users can insert their own studio images" on public.studio_images;
create policy "Users can insert their own studio images"
  on public.studio_images for insert
  with check (auth.uid() = user_id);

-- 4. Create Calendar Events Table
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  time text not null,
  platform text not null,
  content text not null,
  status text not null default 'scheduled',
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Calendar Events
alter table public.calendar_events enable row level security;

drop policy if exists "Users can view their own calendar events" on public.calendar_events;
create policy "Users can view their own calendar events"
  on public.calendar_events for select
  using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

drop policy if exists "Users can insert their own calendar events" on public.calendar_events;
create policy "Users can insert their own calendar events"
  on public.calendar_events for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own calendar events" on public.calendar_events;
create policy "Users can update their own calendar events"
  on public.calendar_events for update
  using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

drop policy if exists "Users can delete their own calendar events" on public.calendar_events;
create policy "Users can delete their own calendar events"
  on public.calendar_events for delete
  using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'harishrsk@gmail.com');

-- 5. Automate Profile Creation on Registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, credits, tier)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    50,
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists before recreating
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
