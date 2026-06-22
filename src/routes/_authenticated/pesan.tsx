import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Search, Lightbulb } from "lucide-react";
import { timeAgo, initials } from "@/lib/format";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/_authenticated/pesan")({
  head: () => ({ meta: [{ title: "Pesan — NgalamBantu" }] }),
  component: PesanPage,
});

const COLORS = [
  "bg-navy",
  "bg-orange",
  "bg-pink-300",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-teal-500",
];

function PesanPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const userId = useCurrentUser();

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  // Group by peer
  const conversations = useMemo(() => {
    const map = new Map<
      string,
      { peerId: string; lastMsg: string; lastAt: string; unread: number }
    >();
    for (const m of messages) {
      const peer = m.sender_id === userId ? m.recipient_id : m.sender_id;
      const ex = map.get(peer);
      if (!ex)
        map.set(peer, {
          peerId: peer,
          lastMsg: m.body,
          lastAt: m.created_at,
          unread: !m.is_read && m.recipient_id === userId ? 1 : 0,
        });
      else if (!m.is_read && m.recipient_id === userId) ex.unread += 1;
    }
    return [...map.values()];
  }, [messages, userId]);

  const { data: peers = [] } = useQuery({
    queryKey: ["peers", conversations.map((c) => c.peerId).join(",")],
    enabled: conversations.length > 0,
    queryFn: async () => {
      const ids = conversations.map((c) => c.peerId);
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return data ?? [];
    },
  });

  const filtered = conversations.filter((c) => {
    const p = peers.find((x) => x.id === c.peerId);
    return !q || (p?.full_name ?? "").toLowerCase().includes(q.toLowerCase());
  });

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 px-4 lg:px-8 py-6 max-w-6xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy mb-4">Pesan</h1>
          <div className="relative mb-4">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-navy/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full bg-navy text-cream placeholder-cream/60 rounded-full pl-11 pr-4 py-3 text-sm"
            />
          </div>
          <div className="divide-y divide-navy/10 border-y border-navy/10">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-navy/60">Belum ada percakapan.</div>
            )}
            {filtered.map((c, i) => {
              const p = peers.find((x) => x.id === c.peerId);
              const name = p?.full_name ?? "User";
              return (
                <Link
                  key={c.peerId}
                  to="/pesan/$peerId"
                  params={{ peerId: c.peerId }}
                  className="flex gap-3 py-4 hover:bg-cream/50 px-2 rounded-xl"
                >
                  <div
                    className={`h-11 w-11 rounded-full grid place-items-center text-cream font-bold text-xs ${COLORS[i % COLORS.length]}`}
                  >
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-bold text-navy">{name}</p>
                      <span className="text-xs text-navy/60">{timeAgo(c.lastAt)}</span>
                    </div>
                    <p className="text-sm text-navy/80 truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && <span className="h-2 w-2 rounded-full bg-blue-500 mt-2" />}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-navy text-cream rounded-2xl p-6 text-center">
            <div className="bg-orange p-3 rounded-2xl inline-block">
              <img src={lionLogo} alt="" className="h-10 w-10" />
            </div>
            <p className="text-sm mt-3">Klik percakapan untuk membuka pesan!</p>
          </div>
          <div className="bg-orange rounded-2xl p-5">
            <p className="font-bold text-navy flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4" /> Tips Komunitas
            </p>
            <p className="text-sm text-navy/80">
              Selalu konfirmasi detail tugas lewat chat sebelum memulai pekerjaan ya! Pastikan
              lokasi dan waktu sudah disepakati untuk kenyamanan bersama.
            </p>
            <p className="text-sm font-bold text-navy mt-3 underline cursor-pointer">
              Pelajari Selengkapnya
            </p>
          </div>
        </aside>
      </div>
      <PostingModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}
