-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type mood_type as enum ('happy', 'excited', 'neutral', 'anxious', 'sad');

-- Create users table (extends Supabase auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    full_name text,
    avatar_url text,
    preferences jsonb default '{}'::jsonb
);

-- Create journal entries table
create table public.journal_entries (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    transcript text not null,
    ai_response text not null,
    mood mood_type not null,
    audio_url text,
    metadata jsonb default '{}'::jsonb
);

-- Create tags table for categorizing entries
create table public.tags (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create junction table for entries and tags
create table public.entry_tags (
    entry_id uuid references public.journal_entries(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (entry_id, tag_id)
);

-- Create RLS (Row Level Security) policies
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.tags enable row level security;
alter table public.entry_tags enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Journal entries policies
create policy "Users can view their own entries"
    on public.journal_entries for select
    using (auth.uid() = user_id);

create policy "Users can insert their own entries"
    on public.journal_entries for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own entries"
    on public.journal_entries for update
    using (auth.uid() = user_id);

create policy "Users can delete their own entries"
    on public.journal_entries for delete
    using (auth.uid() = user_id);

-- Tags policies
create policy "Anyone can view tags"
    on public.tags for select
    using (true);

create policy "Only authenticated users can create tags"
    on public.tags for insert
    with check (auth.role() = 'authenticated');

-- Entry tags policies
create policy "Users can view their own entry tags"
    on public.entry_tags for select
    using (
        exists (
            select 1 from public.journal_entries
            where journal_entries.id = entry_tags.entry_id
            and journal_entries.user_id = auth.uid()
        )
    );

create policy "Users can manage their own entry tags"
    on public.entry_tags for all
    using (
        exists (
            select 1 from public.journal_entries
            where journal_entries.id = entry_tags.entry_id
            and journal_entries.user_id = auth.uid()
        )
    );

-- Create indexes for better query performance
create index journal_entries_user_id_idx on public.journal_entries(user_id);
create index journal_entries_created_at_idx on public.journal_entries(created_at);
create index journal_entries_mood_idx on public.journal_entries(mood);
create index entry_tags_entry_id_idx on public.entry_tags(entry_id);
create index entry_tags_tag_id_idx on public.entry_tags(tag_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.journal_entries
    for each row execute procedure public.handle_updated_at();