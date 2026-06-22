import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { RatingModal } from "@/components/rating-modal";
import { BayarModal } from "@/components/bayar-modal";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Plus, Star, Wallet, Clock } from "lucide-react";
import { CATEGORY_BY_KEY, type CategoryKey } from "@/lib/categories";
import { formatRupiah } from "@/lib/format";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/_authenticated/bantuanku")({
  head: () => ({ meta: [{ title: "Bantuanku — NgalamBantu" }] }),
  component: BantuankuPage,
});

type Tab = "aktif" | "berjalan" | "selesai";
type PostRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  imbalan_amount: number;
  is_urgent: boolean;
  needed_time: string | null;
  flexibility: string;
  paid_at: string | null;
  created_at: string;
};

function BantuankuPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("aktif");
  const [rating, setRating] = useState<PostRow | null>(null);
  const [bayar, setBayar] = useState<PostRow | null>(null);
  const userId = useCurrentUser();
  const qc = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ["bantuanku", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      return (data ?? []) as PostRow[];
    },
  });

  const { aktif, berjalan, selesai } = useMemo(
    () => ({
      aktif: posts.filter((p) => p.status === "open"),
      berjalan: posts.filter((p) => p.status === "in_progress"),
      selesai: posts.filter((p) => p.status === "completed" || p.status === "cancelled"),
    }),
    [posts],
  );

  const list = tab === "aktif" ? aktif : tab === "berjalan" ? berjalan : selesai;

  const cancel = async (id: string) => {
    await supabase.from("posts").update({ status: "cancelled" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["bantuanku"] });
  };
  const markDone = async (id: string) => {
    await supabase.from("posts").update({ status: "completed" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["bantuanku"] });
  };

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 px-4 lg:px-8 py-6 max-w-6xl mx-auto">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-bold text-navy">Bantuanku</h1>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 border border-navy text-navy font-bold text-sm px-4 py-2 rounded-full"
            >
              <Plus className="h-4 w-4" /> Posting Baru
            </button>
          </div>
          <div className="grid grid-cols-3 border-b border-navy/10 mb-5">
            {(
              [
                ["aktif", "Aktif", aktif.length],
                ["berjalan", "Berjalan", berjalan.length],
                ["selesai", "Selesai", selesai.length],
              ] as const
            ).map(([k, lbl, count]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`pb-3 text-sm font-bold ${tab === k ? "text-blue-600 border-b-2 border-blue-600" : "text-navy/60"}`}
              >
                {lbl} {count > 0 && <span className="text-xs">({count})</span>}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {list.length === 0 && (
              <div className="bg-cream rounded-2xl py-16 text-center text-navy/60">
                Belum ada postingan di sini.
              </div>
            )}
            {list.map((p) => {
              const cat = CATEGORY_BY_KEY[p.category as CategoryKey];
              const badge =
                p.status === "open"
                  ? { t: "Terbuka", c: "text-emerald-700" }
                  : p.status === "in_progress"
                    ? { t: "Berjalan", c: "text-orange" }
                    : p.status === "completed"
                      ? { t: "Selesai", c: "text-blue-600" }
                      : { t: "Dibatalkan", c: "text-navy/50" };
              return (
                <div key={p.id} className="bg-orange rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-bold text-navy">{p.title}</h3>
                    <span className={`text-xs font-bold bg-card px-3 py-1 rounded-full ${badge.c}`}>
                      ● {badge.t}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                      {cat?.label}
                    </span>
                    <span className="bg-card text-orange text-xs font-bold px-3 py-1 rounded-full">
                      {formatRupiah(p.imbalan_amount)}
                    </span>
                  </div>
                  <p className="text-xs text-navy/70 flex items-center gap-2 mb-4">
                    <Clock className="h-3 w-3" />{" "}
                    {p.flexibility === "fleksibel" ? "Fleksibel" : (p.needed_time ?? "Hari ini")} •
                    0 peminat
                  </p>
                  {p.status === "open" && (
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <button className="bg-card border-2 border-navy text-navy font-bold py-2.5 rounded-xl">
                        Lihat Peminat
                      </button>
                      <button
                        onClick={() => cancel(p.id)}
                        className="bg-card text-navy font-bold py-2.5 px-5 rounded-xl border border-navy/10"
                      >
                        Tutup
                      </button>
                    </div>
                  )}
                  {p.status === "in_progress" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-navy text-cream font-bold py-2.5 rounded-xl">
                        Chat Helper
                      </button>
                      <button
                        onClick={() => markDone(p.id)}
                        className="bg-emerald-600 text-white font-bold py-2.5 rounded-xl"
                      >
                        ✓ Selesai & Bayar
                      </button>
                    </div>
                  )}
                  {p.status === "completed" && (
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <button
                        onClick={() => setRating(p)}
                        className="bg-orange-100 text-orange font-bold py-2.5 rounded-xl border border-orange/30 inline-flex items-center justify-center gap-2"
                      >
                        <Star className="h-4 w-4" /> Beri Rating
                      </button>
                      <button
                        onClick={() => setBayar(p)}
                        disabled={!!p.paid_at}
                        className={`font-bold py-2.5 px-5 rounded-xl inline-flex items-center gap-2 ${p.paid_at ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        <Wallet className="h-4 w-4" /> {p.paid_at ? "Lunas" : "Bayar"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-navy text-cream rounded-2xl p-4 flex items-start gap-3">
            <div className="bg-orange p-2 rounded-xl">
              <img src={lionLogo} alt="" className="h-7 w-7" />
            </div>
            <p className="text-sm">Kelola semua postingan bantuanmu di sini!</p>
          </div>
          <div className="bg-orange rounded-2xl p-5">
            <p className="font-display font-bold text-navy mb-3">Ringkasan</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["AKTIF", aktif.length],
                  ["BERJALAN", berjalan.length],
                  ["SELESAI", selesai.length],
                ] as const
              ).map(([l, n]) => (
                <div key={l} className="bg-navy text-cream rounded-xl p-3 text-center">
                  <p className="font-display text-2xl font-bold">{n}</p>
                  <p className="text-[10px] font-bold tracking-wider">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <PostingModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => qc.invalidateQueries({ queryKey: ["bantuanku"] })}
      />
      <RatingModal
        post={rating}
        onClose={() => setRating(null)}
        onDone={() => qc.invalidateQueries({ queryKey: ["bantuanku"] })}
      />
      <BayarModal
        post={bayar}
        onClose={() => setBayar(null)}
        onPaid={() => qc.invalidateQueries({ queryKey: ["bantuanku"] })}
      />
    </AppShell>
  );
}
