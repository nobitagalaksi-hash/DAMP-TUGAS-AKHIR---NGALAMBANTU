import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { TertarikModal } from "@/components/tertarik-modal";
import { PostCard, type PostCardData } from "@/components/post-card";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, KECAMATAN_LIST } from "@/lib/categories";
import { Search, MapPin, Flame, Handshake, X } from "lucide-react";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

const TRENDING = [
  "Angkat furnitur Malang",
  "Print laporan PKL",
  "Antar paket Lowokwaru",
  "Servis AC rumah",
];

export const Route = createFileRoute("/_authenticated/jelajahi")({
  head: () => ({ meta: [{ title: "Jelajahi — NgalamBantu" }] }),
  validateSearch: zodValidator(searchSchema),
  component: JelajahiPage,
});

function JelajahiPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/jelajahi" });
  const [postOpen, setPostOpen] = useState(false);
  const [tertarik, setTertarik] = useState<PostCardData | null>(null);
  const [input, setInput] = useState(q);

  const setQuery = (next: string) => {
    setInput(next);
    navigate({ search: { q: next }, replace: true });
  };

  const { data: counts = {} } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("category").eq("status", "open");
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const r of data ?? []) map[r.category] = (map[r.category] ?? 0) + 1;
      return map;
    },
  });

  const { data: kecCounts = {} } = useQuery({
    queryKey: ["kecamatan-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("kecamatan").eq("status", "open");
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const r of data ?? []) if (r.kecamatan) map[r.kecamatan] = (map[r.kecamatan] ?? 0) + 1;
      return map;
    },
  });

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["jelajahi-search", q],
    enabled: q.trim().length > 0,
    queryFn: async () => {
      const term = `%${q.trim()}%`;
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles:user_id(full_name)")
        .eq("status", "open")
        .or(`title.ilike.${term},description.ilike.${term},alamat.ilike.${term}`)
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        author_name:
          (p as { profiles?: { full_name?: string | null } }).profiles?.full_name ?? null,
      })) as PostCardData[];
    },
  });

  const showResults = q.trim().length > 0;

  return (
    <AppShell onCreatePost={() => setPostOpen(true)}>
      <div className="px-4 lg:px-8 py-6 grid lg:grid-cols-[1fr_320px] gap-6 max-w-[1400px] mx-auto">
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="hidden lg:block font-display text-3xl font-bold text-navy">
              Halo, Ker!
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(input);
              }}
              className="relative flex-1 max-w-xl"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cari bantuan di Malang Raya..."
                className="w-full bg-white rounded-full pl-12 pr-10 py-3 outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/40"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy/50 hover:text-navy"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
            <div className="hidden lg:flex items-center gap-1 text-navy font-bold">
              Malang Raya <MapPin className="h-4 w-4 text-red-500 fill-red-500" />
            </div>
          </div>

          {showResults ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-navy">
                  Hasil pencarian: <span className="text-orange">"{q}"</span>
                </h2>
                <button
                  onClick={() => setQuery("")}
                  className="text-sm font-semibold text-navy/60 hover:text-navy"
                >
                  Reset
                </button>
              </div>
              {isFetching && <p className="text-center text-navy/60 py-12">Memuat...</p>}
              {!isFetching && results.length === 0 && (
                <div className="text-center py-16 bg-cream rounded-2xl border border-navy/10">
                  <p className="text-navy/70">Belum ada postingan yang cocok dengan "{q}".</p>
                  <button
                    onClick={() => setPostOpen(true)}
                    className="mt-3 bg-navy text-cream px-5 py-2.5 rounded-xl font-bold"
                  >
                    Buat Postingan
                  </button>
                </div>
              )}
              <div className="space-y-4">
                {results.map((p) => (
                  <PostCard key={p.id} post={p} onTertarik={setTertarik} highlight />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {CATEGORIES.map((c, i) => {
                  const orange = i % 3 === 1 || i % 3 === 2;
                  return (
                    <Link
                      key={c.key}
                      to="/jelajahi/$category"
                      params={{ category: c.slug }}
                      className={`rounded-2xl p-5 ${orange ? "bg-orange text-navy" : "bg-navy text-cream"} hover:shadow-lg transition`}
                    >
                      <c.Icon className={`h-7 w-7 ${orange ? "text-navy" : "text-orange"}`} />
                      <h3 className="font-display text-xl font-bold mt-2">{c.label}</h3>
                      <p className={`text-xs ${orange ? "text-navy/70" : "text-cream/70"}`}>
                        {counts[c.key] ?? 0} aktif
                      </p>
                    </Link>
                  );
                })}
              </div>

              <h2 className="mt-8 font-display text-xl font-bold text-navy flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange" /> Trending
              </h2>
              <div className="mt-3 space-y-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="w-full bg-navy text-cream rounded-xl px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-navy-deep transition"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" /> {t}
                    </span>
                    <span>›</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-navy text-cream rounded-2xl p-5">
            <div className="bg-orange w-10 h-10 rounded-xl grid place-items-center">
              <Handshake className="h-5 w-5 text-navy" />
            </div>
            <p className="font-display font-bold text-orange mt-3">
              Temukan bantuan yang kamu butuhkan!
            </p>
            <p className="text-cream/80 text-xs mt-1">
              Mimin NgalamBantu siap sedia membantu segala kebutuhanmu dengan cepat.
            </p>
            <button
              onClick={() => setPostOpen(true)}
              className="mt-3 bg-orange text-navy font-bold text-sm px-4 py-2 rounded-xl"
            >
              Buat Postingan
            </button>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-navy/10">
            <p className="font-display font-bold text-navy flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" /> Lokasi Aktif
            </p>
            <div className="mt-3 space-y-2 text-sm">
              {KECAMATAN_LIST.map((k) => (
                <div key={k} className="flex items-center justify-between text-navy">
                  <span>{k}</span>
                  <span className="font-semibold text-navy/70">{kecCounts[k] ?? 0} aktif</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <PostingModal open={postOpen} onClose={() => setPostOpen(false)} />
      <TertarikModal post={tertarik} onClose={() => setTertarik(null)} />
    </AppShell>
  );
}
