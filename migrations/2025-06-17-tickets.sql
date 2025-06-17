-- Create tickets table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  requester_id uuid references users(id),
  requester_name text,
  status text not null default 'Open',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create ticketactivities table for communication log
create table if not exists public.ticketactivities (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  activity_type text not null check (activity_type in ('email', 'phone', 'chat')),
  sender_id uuid references users(id),
  sender_name text,
  message text,
  direction text check (direction in ('inbound', 'outbound')),
  timestamp timestamp with time zone default now(),
  meta jsonb
);

create index if not exists idx_ticketactivities_ticket_id on public.ticketactivities(ticket_id);
