
-- Categories enum
CREATE TYPE public.post_category AS ENUM (
  'kurir_antar','pindahan_angkat','titip_beli','reparasi_servis',
  'print_admin','kesehatan_darurat','les_belajar','hewan_peliharaan'
);

CREATE TYPE public.post_status AS ENUM ('open','in_progress','completed','cancelled');
CREATE TYPE public.kecamatan AS ENUM ('Lowokwaru','Klojen','Blimbing','Sukun','Kedungkandang');
CREATE TYPE public.imbalan_type AS ENUM ('per_orang','per_tugas','nego');
CREATE TYPE public.flexibility AS ENUM ('tepat','toleransi','fleksibel');
CREATE TYPE public.offer_status AS ENUM ('pending','accepted','rejected','cancelled');

-- Posts (Bantuan)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  category public.post_category NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  jumlah_orang INT NOT NULL DEFAULT 1,
  imbalan_amount INT NOT NULL DEFAULT 0,
  imbalan_type public.imbalan_type NOT NULL DEFAULT 'per_tugas',
  needed_date DATE,
  needed_time TIME,
  flexibility public.flexibility NOT NULL DEFAULT 'toleransi',
  alamat TEXT,
  kecamatan public.kecamatan,
  status public.post_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view posts" ON public.posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own posts" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON public.posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Offers (Tertarik Membantu)
CREATE TABLE public.post_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offered_amount INT,
  availability TEXT,
  message TEXT,
  status public.offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, helper_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_offers TO authenticated;
GRANT ALL ON public.post_offers TO service_role;
ALTER TABLE public.post_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helper and post owner can view offers" ON public.post_offers
  FOR SELECT TO authenticated USING (
    auth.uid() = helper_id OR
    auth.uid() = (SELECT user_id FROM public.posts WHERE id = post_id)
  );
CREATE POLICY "Helpers can create offers" ON public.post_offers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = helper_id);
CREATE POLICY "Helper or post owner can update offer" ON public.post_offers
  FOR UPDATE TO authenticated USING (
    auth.uid() = helper_id OR
    auth.uid() = (SELECT user_id FROM public.posts WHERE id = post_id)
  );
CREATE POLICY "Helpers can delete own offers" ON public.post_offers
  FOR DELETE TO authenticated USING (auth.uid() = helper_id);

-- Saved posts
CREATE TABLE public.saved_posts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_posts TO authenticated;
GRANT ALL ON public.saved_posts TO service_role;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON public.saved_posts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  related_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipient can update read" ON public.messages
  FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.post_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX posts_status_created_idx ON public.posts(status, created_at DESC);
CREATE INDEX posts_category_idx ON public.posts(category);
CREATE INDEX posts_user_idx ON public.posts(user_id);
CREATE INDEX offers_post_idx ON public.post_offers(post_id);
CREATE INDEX offers_helper_idx ON public.post_offers(helper_id);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX messages_pair_idx ON public.messages(sender_id, recipient_id, created_at DESC);
