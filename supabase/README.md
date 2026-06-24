# Supabase setup for a fresh project

1. Create a new Supabase project in the dashboard.
2. In Authentication > Settings, disable email confirmation if you want signup to be instant.
3. Open SQL Editor in the new project and run the migration in [supabase/migrations/20260624000000_fresh_project_schema.sql](supabase/migrations/20260624000000_fresh_project_schema.sql).
4. Copy the new project URL and anon key into the environment variables used by the app:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
5. Restart the dev server after changing the environment variables.

If you use the Supabase CLI later, update [supabase/config.toml](supabase/config.toml) with the new project id.
