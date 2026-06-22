import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Settings } from "lucide-react";
import { timeAgo, initials } from "@/lib/format";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/_authenticated/notifikasi")({
  head: () => ({ meta: [{ title: "Notifikasi — NgalamBantu" }] }),
  component: NotifikasiPage,
});

const PREFS = [
  { key: "notif_peminat", label: "Peminat baru" },
  { key: "notif_pesan", label: "Pesan masuk" },
  { key: "notif_selesai", label: "Postingan selesai" },
  { key: "notif_promo", label: "Promo & info" },
] as const;

const COLORS = [
  "bg-teal-500",
  "bg-emerald-600",
  "bg-navy",
  "bg-pink-500",
  "bg-purple-500",
  "bg-orange",
];

function NotifikasiPage() {
  const [open, setOpen] = useState(false);
  const userId = useCurrentUser();
  const qc = useQueryClient();

  const { data: notifs = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-prefs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("notif_peminat, notif_pesan, notif_selesai, notif_promo")
        .eq("id", userId!)
        .maybeSingle();
      return data;
    },
  });

  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (profile) setPrefs(profile as unknown as Record<string, boolean>);
  }, [profile]);

  const togglePref = async (k: string) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    if (userId)
      await supabase
        .from("profiles")
        .update({ [k]: next[k] } as never)
        .eq("id", userId);
  };

  const markAll = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 px-4 lg:px-8 py-6 max-w-6xl mx-auto">
        <div>
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-display text-2xl font-bold text-navy">Notifikasi</h1>
            <button onClick={() => markAll.mutate()} className="text-sm font-bold text-orange">
              Tandai Semua Dibaca
            </button>
          </div>
          <div className="divide-y divide-navy/10 border-y border-navy/10">
            {notifs.length === 0 && (
              <div className="py-16 text-center text-navy/60">Belum ada notifikasi.</div>
            )}
            {notifs.map((n, i) => (
              <div key={n.id} className="flex gap-3 py-4">
                <div
                  className={`h-11 w-11 rounded-full grid place-items-center text-cream font-bold text-xs shrink-0 ${COLORS[i % COLORS.length]}`}
                >
                  {initials(n.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="font-bold text-navy">{n.title}</p>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 mt-2 ml-auto shrink-0" />
                    )}
                  </div>
                  {n.body && <p className="text-sm text-navy/80">{n.body}</p>}
                  <p className="text-xs text-navy/50 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-navy text-cream rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-orange p-2 rounded-xl">
              <img src={lionLogo} alt="" className="h-7 w-7" />
            </div>
            <p className="text-sm">
              Kamu punya <span className="text-orange font-bold">{unreadCount} notifikasi</span>{" "}
              belum dibaca!
            </p>
          </div>
          <div className="bg-orange rounded-2xl p-5">
            <p className="font-bold text-navy flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" /> Preferensi Notifikasi
            </p>
            {PREFS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm text-navy">{label}</span>
                <button
                  onClick={() => togglePref(key)}
                  className={`h-6 w-11 rounded-full p-0.5 transition ${prefs[key] ? "bg-navy" : "bg-navy/20"}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-cream transition-transform ${prefs[key] ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <PostingModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}
