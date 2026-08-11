-- Supabase enables pgcrypto by default, but keep this explicit for portability
-- (e.g. running these migrations against a bare self-hosted Postgres).
create extension if not exists pgcrypto;
