create table if not exists public.activity_sessions (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade,
  activity text not null,
  start_time text not null,
  end_time text not null,
  duration text not null,
  duration_seconds integer,
  session_date text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.activity_sessions enable row level security;

create policy "Users can read their own sessions"
on public.activity_sessions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
on public.activity_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
on public.activity_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
on public.activity_sessions
for delete
to authenticated
using (auth.uid() = user_id);
