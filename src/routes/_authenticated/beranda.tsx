import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard, type PostCardData } from "@/components/post-card";
import { PostingModal } from "@/components/posting-modal";
import { TertarikModal } from "@/components/tertarik-modal";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import lionLogo from "@/assets/lion-logo-orange.png";
import { Search, MapPin, BarChart3, FolderOpen, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/beranda")({
  head: () => ({ meta: [{ title: "Beranda — NgalamBantu" }] }),
  component: BerandaPage,
});

type Tab = "semua" | "terdekat" | "urgent" | "mengikuti";

function BerandaPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("semua");
  const [postOpen, setPostOpen] = useState(false);
  const [tertarik, setTertarik] = useState<PostCardData | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", tab],
    queryFn: async () => {
      let q = supabase
        .from("posts")
        .select("*, profiles:user_id(full_name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);
      if (tab === "urgent") q = q.eq("is_urgent", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        author_name:
          (p as { profiles?: { full_name?: string | null } }).profiles?.full_name ?? null,
      })) as PostCardData[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [{ count: aktif }, { count: jalan }, { count: selesai }] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "in_progress"),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("updated_at", today.toISOString()),
      ]);
      return { aktif: aktif ?? 0, jalan: jalan ?? 0, selesai: selesai ?? 0 };
    },
  });

  return (
    <AppShell onCreatePost={() => setPostOpen(true)}>
      <div className="px-4 lg:px-8 py-6 grid lg:grid-cols-[1fr_320px] gap-6 max-w-[1400px] mx-auto">
        <div>
          {/* top bar */}
          <div className="hidden lg:flex items-center justify-between gap-4 mb-6">
            <h1 className="font-display text-3xl font-bold text-navy">Halo, Ker!</h1>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
              <input
                placeholder="Cari bantuan di Malang Raya..."
                className="w-full bg-white rounded-full pl-12 pr-4 py-3 outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/30"
              />
            </div>
            <div className="flex items-center gap-1 text-navy font-bold">
              Malang Raya <MapPin className="h-4 w-4 text-red-500 fill-red-500" />
            </div>
          </div>

          {/* tabs */}
          <div className="border-b border-navy/10 flex gap-6 mb-6">
            {(["semua", "terdekat", "urgent", "mengikuti"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 font-bold text-sm capitalize ${tab === t ? "text-navy border-b-2 border-navy" : "text-navy/50"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {isLoading && <p className="text-center text-navy/60 py-12">Memuat...</p>}
            {!isLoading && posts.length === 0 && (
              <div className="text-center py-16 bg-cream rounded-2xl">
                <p className="text-navy/60">Belum ada postingan.</p>
                <button
                  onClick={() => setPostOpen(true)}
                  className="mt-3 bg-navy text-cream px-5 py-2 rounded-xl font-bold"
                >
                  Buat Postingan Pertama
                </button>
              </div>
            )}
            {posts.map((p, i) => (
              <PostCard
                key={p.id}
                post={p}
                onTertarik={setTertarik}
                highlight={i === 0 || p.is_urgent}
              />
            ))}
          </div>
        </div>

        {/* right rail */}
        <aside className="space-y-4">
          <div className="bg-navy text-cream rounded-2xl p-5 flex gap-3">
            <img src={lionLogo} alt="" className="h-12 w-12" />
            <div className="text-sm">
              <p className="font-display font-bold text-orange">Halo! Saya Mbantu.</p>
              <p className="text-cream/80 text-xs mt-1">
                Ada {stats?.aktif ?? 0} bantuan baru di sekitarmu hari ini!
              </p>
            </div>
          </div>

          <div className="bg-navy text-cream rounded-2xl p-5">
            <p className="font-display font-bold text-orange flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Statistik Hari Ini
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Postingan Aktif", stats?.aktif ?? 0],
                ["Sedang Berjalan", stats?.jalan ?? 0],
                ["Selesai Hari Ini", stats?.selesai ?? 0],
              ].map(([lbl, v]) => (
                <div key={lbl as string} className="bg-orange text-navy rounded-xl p-3 text-center">
                  <div className="font-display text-2xl font-bold">{v}</div>
                  <div className="text-[10px] font-semibold leading-tight">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy text-cream rounded-2xl p-5">
            <p className="font-display font-bold text-orange flex items-center gap-2">
              <FolderOpen className="h-4 w-4" /> Kategori Populer
            </p>
            <div className="mt-3 space-y-2">
              {CATEGORIES.slice(0, 3).map((c) => (
                <Link
                  key={c.key}
                  to="/jelajahi/$category"
                  params={{ category: c.slug }}
                  className="bg-orange text-navy rounded-xl px-3 py-2 flex items-center justify-between text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <span>{c.emoji}</span> {c.label}
                  </span>
                  <span>›</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-navy text-cream rounded-2xl p-5">
            <p className="font-display font-bold text-orange flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Top Pembantu Minggu Ini
            </p>
            <div className="mt-3 bg-orange text-navy rounded-xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-navy text-cream grid place-items-center font-bold">
                B
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Bagas Wicaksono</p>
                <p className="text-xs">★★★★★ · 24 tugas</p>
              </div>
              <button className="text-xs font-bold border border-navy rounded-full px-3 py-1">
                Ikuti
              </button>
            </div>
          </div>
        </aside>
      </div>

      <PostingModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onCreated={() => qc.invalidateQueries({ queryKey: ["posts"] })}
      />
      <TertarikModal post={tertarik} onClose={() => setTertarik(null)} />
    </AppShell>
  );
}
