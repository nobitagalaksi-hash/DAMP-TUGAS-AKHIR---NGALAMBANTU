
-- Ratings table
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  helper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars int NOT NULL CHECK (stars BETWEEN 1 AND 5),
  tags text[] NOT NULL DEFAULT '{}',
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, reviewer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view ratings" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewer can insert own rating" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewer can update own rating" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);

-- Payment columns on posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text;

-- Notification preferences on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notif_peminat boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_pesan boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_selesai boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_promo boolean NOT NULL DEFAULT false;
