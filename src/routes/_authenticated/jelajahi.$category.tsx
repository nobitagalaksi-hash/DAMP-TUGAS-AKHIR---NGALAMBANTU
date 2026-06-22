import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { TertarikModal } from "@/components/tertarik-modal";
import { PostCard, type PostCardData } from "@/components/post-card";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CATEGORY_BY_SLUG, KECAMATAN_LIST } from "@/lib/categories";
import { ArrowLeft, Search, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/_authenticated/jelajahi/$category")({
  head: () => ({ meta: [{ title: "Kategori — NgalamBantu" }] }),
  component: CategoryDetail,
});

function CategoryDetail() {
  const { category: slug } = Route.useParams();
  const cat = CATEGORY_BY_SLUG[slug];
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [postOpen, setPostOpen] = useState(false);
  const [tertarik, setTertarik] = useState<PostCardData | null>(null);
  const [kec, setKec] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (!cat) throw notFound();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["cat-posts", cat.key, kec],
    queryFn: async () => {
      let q = supabase
        .from("posts")
        .select("*, profiles:user_id(full_name)")
        .eq("category", cat.key)
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (kec) q = q.eq("kecamatan", kec as "Lowokwaru");
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        author_name:
          (p as { profiles?: { full_name?: string | null } }).profiles?.full_name ?? null,
      })) as PostCardData[];
    },
  });

  const filtered = search.trim()
    ? posts.filter((p) => {
        const s = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(s) ||
          (p.description ?? "").toLowerCase().includes(s) ||
          (p.alamat ?? "").toLowerCase().includes(s)
        );
      })
    : posts;

  return (
    <AppShell onCreatePost={() => setPostOpen(true)}>
      <div className="px-4 lg:px-8 py-6 grid lg:grid-cols-[1fr_320px] gap-6 max-w-[1400px] mx-auto">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate({ to: "/jelajahi" })} className="text-navy">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="bg-orange h-10 w-10 rounded-xl grid place-items-center">
              <cat.Icon className="h-5 w-5 text-navy" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-navy">{cat.label}</h1>
              <p className="text-xs text-navy/60">{posts.length} postingan aktif</p>
            </div>
            <div className="ml-auto relative max-w-sm flex-1 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Cari di ${cat.label}...`}
                className="w-full bg-white rounded-full pl-11 pr-4 py-2.5 text-sm outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/40"
              />
            </div>
          </div>

          <div className="md:hidden mb-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari di ${cat.label}...`}
              className="w-full bg-white rounded-full pl-11 pr-4 py-2.5 text-sm outline-none ring-1 ring-navy/10"
            />
          </div>

          <div className="bg-navy text-cream rounded-2xl p-5 mb-5 flex gap-3 items-start">
            <PartyPopper className="h-6 w-6 text-orange shrink-0 mt-1" />
            <div>
              <p className="font-display font-bold text-orange">
                Dapatkan reward hingga Rp 100.000!
              </p>
              <p className="text-cream/80 text-xs mt-1">
                Bantu tetanggamu hari ini dan kumpulkan poin loyalitas untuk ditukarkan dengan
                voucher belanja.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading && <p className="text-center text-navy/60 py-12">Memuat...</p>}
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12 bg-cream rounded-2xl border border-navy/10">
                <div className="mx-auto mb-3 bg-orange h-14 w-14 rounded-2xl grid place-items-center">
                  <cat.Icon className="h-7 w-7 text-navy" />
                </div>
                <p className="font-display text-lg font-bold text-navy">
                  {search
                    ? `Tidak ada hasil untuk "${search}"`
                    : `Belum ada postingan di ${cat.label}`}
                </p>
                <p className="text-sm text-navy/60 mt-1">
                  Jadilah yang pertama meminta bantuan di kategori ini.
                </p>
                <button
                  onClick={() => setPostOpen(true)}
                  className="mt-4 bg-navy text-cream font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-navy-deep transition"
                >
                  + Buat Postingan {cat.label}
                </button>
              </div>
            )}
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} onTertarik={setTertarik} highlight />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-cream rounded-2xl p-5 border border-navy/10">
            <p className="font-display font-bold text-navy">Temukan tugas yang pas buat kamu</p>
            <p className="text-xs text-navy/70 mt-1">
              Mulai bangun reputasi bantuanmu hari ini dan dapatkan lencana "Top Helper".
            </p>
            <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-orange" style={{ width: "65%" }} />
            </div>
            <p className="text-[10px] text-navy/60 mt-1">65% Profil Selesai</p>
          </div>

          <div className="bg-navy text-cream rounded-2xl p-5">
            <p className="font-display font-bold text-orange">Semua Kategori</p>
            <div className="mt-3 space-y-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.key}
                  to="/jelajahi/$category"
                  params={{ category: c.slug }}
                  className={`flex items-center justify-between text-sm py-1.5 ${c.key === cat.key ? "text-orange font-bold" : "text-cream/80"}`}
                >
                  <span className="flex items-center gap-2">
                    <c.Icon className="h-4 w-4" /> {c.label}
                  </span>
                  <span>›</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-navy/10">
            <p className="font-display font-bold text-navy">📍 Saring Lokasi</p>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-2 text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={!kec}
                  onChange={() => setKec(null)}
                  className="accent-orange"
                />
                Semua Kecamatan
              </label>
              {KECAMATAN_LIST.map((k) => (
                <label key={k} className="flex items-center gap-2 text-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kec === k}
                    onChange={() => setKec(kec === k ? null : k)}
                    className="accent-orange"
                  />
                  {k}
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <PostingModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        defaultCategory={cat.key}
        onCreated={() => qc.invalidateQueries({ queryKey: ["cat-posts"] })}
      />
      <TertarikModal post={tertarik} onClose={() => setTertarik(null)} />
    </AppShell>
  );
}
