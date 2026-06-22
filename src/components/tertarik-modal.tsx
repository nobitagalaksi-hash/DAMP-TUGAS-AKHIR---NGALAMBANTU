import { useState } from "react";
import { X, Handshake } from "lucide-react";
import { formatRupiah, initials } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import type { PostCardData } from "./post-card";

const AVAIL = ["Sekarang", "1 Jam Lagi", "2 Jam Lagi", "Nanti Sore", "Besok Pagi", "Fleksibel"];

export function TertarikModal({
  post,
  onClose,
  onSent,
}: {
  post: PostCardData | null;
  onClose: () => void;
  onSent?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [availability, setAvailability] = useState("Sekarang");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!post) return null;

  const send = async () => {
    setErr("");
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setErr("Sesi habis");
      setLoading(false);
      return;
    }
    if (u.user.id === post.user_id) {
      setErr("Tidak bisa menawar postingan sendiri");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("post_offers").upsert(
      {
        post_id: post.id,
        helper_id: u.user.id,
        offered_amount: amount ? parseInt(amount) : post.imbalan_amount,
        availability,
        message: message || null,
        status: "pending",
      },
      { onConflict: "post_id,helper_id" },
    );
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSent?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-navy/60">
            <X className="h-6 w-6" />
          </button>
        </div>
        <h2 className="font-display text-2xl font-bold text-navy text-center">
          Tertarik Membantu?
        </h2>
        <p className="text-center text-sm text-navy/70 mt-1">
          Isi detail penawaranmu agar mereka bisa memilihmu
        </p>

        <div className="mt-5 bg-orange rounded-2xl p-4 text-navy">
          <p className="text-xs font-semibold">Bantuan ditawarkan:</p>
          <p className="font-display font-bold mt-1 leading-tight">{post.title}</p>
          <p className="mt-2 text-xs">
            Imbalan ditawarkan:{" "}
            <span className="font-bold">
              {formatRupiah(post.imbalan_amount)}/
              {post.imbalan_type === "per_orang" ? "org" : "tugas"}
            </span>
          </p>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-bold text-navy mb-2">Bantuan ditawarkan:</label>
          <div className="bg-cream rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="font-bold text-navy/60">Rp</span>
            <input
              type="number"
              placeholder="Sesuai tawaran atau nego"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent outline-none flex-1 text-navy"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-bold text-navy mb-2">Kapan Kamu Bisa?</label>
          <div className="flex flex-wrap gap-2">
            {AVAIL.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvailability(a)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${availability === a ? "bg-navy text-cream border-navy" : "bg-white text-navy border-navy/20"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-bold text-navy mb-2">
            Pesan Buat Mereka <span className="font-normal text-navy/50">(Opsional)</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Perkenalkan diri & jelaskan kenapa kamu cocok untuk tugas ini..."
            className="w-full bg-cream rounded-xl px-4 py-3 outline-none text-sm resize-none"
          />
        </div>

        <div className="mt-5 bg-orange rounded-2xl p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500 text-white grid place-items-center font-bold">
            {initials(post.author_name || "U U")}
          </div>
          <div>
            <p className="font-display font-bold text-navy">{post.author_name || "Pengguna"}</p>
            <p className="text-xs text-navy/70">★ 4.9 · 47 tugas</p>
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{err}</div>
        )}

        <button
          onClick={send}
          disabled={loading}
          className="mt-5 w-full bg-navy text-cream font-bold rounded-xl py-3.5 hover:bg-navy-deep transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Handshake className="h-5 w-5" /> {loading ? "Mengirim..." : "Kirim Penawaran"}
        </button>
      </div>
    </div>
  );
}
