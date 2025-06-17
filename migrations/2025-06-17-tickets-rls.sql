-- Enable RLS on tickets table
alter table public.tickets enable row level security;

-- Allow anyone to insert tickets
create policy "Allow insert for all" on public.tickets for insert with check (true);

-- Enable RLS on ticketactivities table
alter table public.ticketactivities enable row level security;

-- Allow anyone to insert ticketactivities
create policy "Allow insert for all" on public.ticketactivities for insert with check (true);

-- Allow anyone to select ticketactivities
create policy "Allow select for all" on public.ticketactivities for select using (true);
