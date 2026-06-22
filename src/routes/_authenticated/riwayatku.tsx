import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Star } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/_authenticated/riwayatku")({
  head: () => ({ meta: [{ title: "Riwayatku — NgalamBantu" }] }),
  component: RiwayatkuPage,
});

function RiwayatkuPage() {
  const [open, setOpen] = useState(false);
  const userId = useCurrentUser();

  // Earnings = completed offers I helped on (using post.imbalan_amount where I'm the helper, status accepted)
  const { data: helped = [] } = useQuery({
    queryKey: ["helped", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("post_offers")
        .select(
          "status, offered_amount, posts(id, title, imbalan_amount, status, updated_at, category)",
        )
        .eq("helper_id", userId!)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: ratingsRecv = [] } = useQuery({
    queryKey: ["ratings-recv", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("ratings").select("stars").eq("helper_id", userId!);
      return data ?? [];
    },
  });

  const totalEarn = helped.reduce((s, o) => {
    const p = (o as { posts?: { imbalan_amount?: number; status?: string } }).posts;
    if (p?.status === "completed") return s + (o.offered_amount ?? p.imbalan_amount ?? 0);
    return s;
  }, 0);
  const completedCount = helped.filter(
    (o) => (o as { posts?: { status?: string } }).posts?.status === "completed",
  ).length;
  const avgRating = ratingsRecv.length
    ? ratingsRecv.reduce((s, r) => s + r.stars, 0) / ratingsRecv.length
    : 0;

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 px-4 lg:px-8 py-6 max-w-6xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy mb-4">Riwayat</h1>
          <div className="bg-navy text-cream rounded-2xl p-6 mb-5">
            <p className="text-cream/80 text-sm">Total Penghasilan Bulan Ini</p>
            <p className="font-display text-4xl font-bold text-orange mt-1">
              {formatRupiah(totalEarn)}
            </p>
            <p className="text-xs text-cream/70 mt-1">{completedCount} tugas selesai</p>
          </div>
          <div className="space-y-3">
            {helped.length === 0 && (
              <div className="bg-cream rounded-2xl py-16 text-center text-navy/60">
                Belum ada riwayat membantu.
              </div>
            )}
            {helped.map((o, i) => {
              const p = (
                o as {
                  posts?: { id: string; title: string; imbalan_amount: number; updated_at: string };
                }
              ).posts;
              if (!p) return null;
              return (
                <div key={i} className="bg-orange rounded-2xl p-4 flex items-center gap-3">
                  <div className="bg-navy p-2 rounded-xl">
                    <img src={lionLogo} alt="" className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy truncate">{p.title}</p>
                    <p className="text-xs text-navy/70">
                      {new Date(p.updated_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · Jadi Helper
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-navy">
                      {formatRupiah(o.offered_amount ?? p.imbalan_amount)}
                    </p>
                    <p className="text-xs text-orange">★★★★★</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="bg-navy text-cream rounded-2xl p-6 text-center">
            <p className="text-orange font-bold">Reputasi Kamu</p>
            <p className="font-display text-5xl font-bold text-orange mt-2">
              {avgRating.toFixed(1)}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-5 w-5 ${n <= Math.round(avgRating) ? "text-orange fill-orange" : "text-cream/30"}`}
                />
              ))}
            </div>
            <button className="bg-orange text-navy font-bold text-sm px-4 py-2 rounded-full mt-4">
              Top Helper Malang
            </button>
          </div>
        </aside>
      </div>
      <PostingModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}
