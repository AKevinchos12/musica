create table if not exists public.music_cards (
  id uuid primary key,
  title text not null,
  artist text not null default 'Nuestra playlist',
  dedication text,
  lyrics text,
  moment text,
  audio_url text not null,
  artwork_url text not null default '/images/cover-1.png',
  created_at timestamptz not null default now()
);

alter table public.music_cards enable row level security;
create policy "Public can read music cards" on public.music_cards for select using (true);
create policy "Public can create music cards" on public.music_cards for insert with check (true);
create policy "Public can update music cards" on public.music_cards for update using (true);
create policy "Public can delete music cards" on public.music_cards for delete using (true);

insert into storage.buckets (id, name, public)
values ('music-files', 'music-files', true)
on conflict (id) do nothing;