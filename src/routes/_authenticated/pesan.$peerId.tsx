import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  ArrowLeft,
  Send,
  Camera,
  MapPin,
  MoreVertical,
  UserCircle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pesan/$peerId")({
  head: () => ({ meta: [{ title: "Chat — NgalamBantu" }] }),
  component: ChatPage,
});

const QUICK = ["Oke siap! 👍", "Berapa ongkosnya?", "Lokasi tepatnya dimana?", "Kapan bisa mulai?"];

function ChatPage() {
  const { peerId } = Route.useParams();
  const userId = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const qc = useQueryClient();
  const endRef = useRef<HTMLDivElement>(null);

  const { data: peer } = useQuery({
    queryKey: ["peer", peerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", peerId)
        .maybeSingle();
      return data;
    },
  });

  const { data: msgs = [] } = useQuery({
    queryKey: ["chat", userId, peerId],
    enabled: !!userId,
    refetchInterval: 4000,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const send = async (body: string) => {
    if (!userId || !body.trim()) return;
    setText("");
    await supabase
      .from("messages")
      .insert({ sender_id: userId, recipient_id: peerId, body: body.trim() });
    qc.invalidateQueries({ queryKey: ["chat", userId, peerId] });
  };

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <div className="grid lg:grid-cols-[1fr_320px] h-[calc(100vh-0px)] lg:h-screen">
        <div className="flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-orange px-4 py-3 flex items-center gap-3">
            <Link to="/pesan" className="text-navy">
              <ArrowLeft />
            </Link>
            <div className="bg-red-500 text-white font-bold h-10 w-10 rounded-full grid place-items-center text-xs">
              {initials(peer?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy truncate">{peer?.full_name ?? "User"}</p>
              <p className="text-xs text-navy/70 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online sekarang
              </p>
            </div>
            <UserCircle className="text-navy" />
            <MoreVertical className="text-navy" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-background">
            <div className="text-center">
              <span className="bg-navy/80 text-cream text-xs font-bold px-3 py-1 rounded-full">
                HARI INI
              </span>
            </div>
            {msgs.map((m) => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && (
                    <div className="bg-red-500 text-white font-bold h-7 w-7 rounded-full grid place-items-center text-[10px] shrink-0">
                      {initials(peer?.full_name)}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${mine ? "bg-navy text-cream rounded-br-sm" : "bg-card text-navy border border-navy/10 rounded-bl-sm"}`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Quick replies + input */}
          <div className="border-t border-navy/10 bg-card">
            <div className="flex gap-2 px-4 py-2 overflow-x-auto">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="shrink-0 border border-navy/20 rounded-full px-3 py-1.5 text-xs text-navy"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-3">
              <button className="text-navy/60">
                <Camera />
              </button>
              <button className="text-navy/60">
                <MapPin />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(text)}
                placeholder="Ketik pesan..."
                className="flex-1 bg-background rounded-full px-4 py-2.5 text-sm border border-navy/10"
              />
              <button
                onClick={() => send(text)}
                className="bg-navy text-cream h-10 w-10 rounded-full grid place-items-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex flex-col gap-4 p-4 border-l border-navy/10 bg-background">
          <div className="bg-navy text-cream rounded-2xl p-4 text-sm">
            Klik percakapan untuk membuka pesan yo, ker!
          </div>
          <div>
            <p className="font-bold text-navy flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-orange" /> Tips
            </p>
            <div className="bg-cream rounded-xl p-3 text-sm text-navy/80">
              Selalu konfirmasi detail tugas lewat chat sebelum memulai pekerjaan ya!
            </div>
          </div>
          <div>
            <p className="font-bold text-navy mb-2">Sudah Selesai Membantu?</p>
            <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl inline-flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Selesaikan Bantuan
            </button>
            <p className="text-xs text-navy/60 text-center mt-2">
              Klik setelah tugas selesai — upload bukti lalu cairkan penghasilanmu.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden bg-emerald-100 h-32 grid place-items-center relative">
            <MapPin className="h-10 w-10 text-blue-500" />
            <p className="absolute bottom-2 left-3 text-xs font-bold text-navy flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Area Malang Raya
            </p>
          </div>
        </aside>
      </div>
      <PostingModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}
