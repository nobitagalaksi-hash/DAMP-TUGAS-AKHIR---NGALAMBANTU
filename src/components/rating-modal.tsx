import { useState } from "react";
import { Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";

const TAGS = [
  "Cepat & responsif",
  "Amanah",
  "Ramah",
  "Sesuai kesepakatan",
  "Tepat waktu",
  "Hasilnya bagus",
];
const LABELS: Record<number, string> = {
  1: "Kurang",
  2: "Cukup",
  3: "Baik",
  4: "Sangat baik",
  5: "Luar biasa!",
};

export function RatingModal({
  post,
  onClose,
  onDone,
}: {
  post: { id: string; title: string; helper_id?: string | null } | null;
  onClose: () => void;
  onDone?: () => void;
}) {
  const userId = useCurrentUser();
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  if (!post) return null;

  const toggle = (t: string) =>
    setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const submit = async () => {
    if (!userId || !post.helper_id) return onClose();
    setSaving(true);
    await supabase.from("ratings").insert({
      post_id: post.id,
      reviewer_id: userId,
      helper_id: post.helper_id,
      stars,
      tags,
      comment: comment || null,
    });
    setSaving(false);
    onDone?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="bg-card rounded-3xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-navy/60">
          <X />
        </button>
        <div className="text-center">
          <Star className="h-14 w-14 text-orange fill-orange mx-auto" />
          <p className="text-navy/70 mt-2">Beri Rating</p>
          <h2 className="font-display text-xl font-bold text-navy">{post.title}</h2>
          <p className="text-sm text-navy/70 mt-1">
            Bagaimana pengalaman kamu dengan <span className="font-bold">Helper</span>?
          </p>
        </div>
        <div className="flex justify-center gap-1 my-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)}>
              <Star
                className={`h-9 w-9 ${n <= stars ? "text-orange fill-orange" : "text-navy/20"}`}
              />
            </button>
          ))}
        </div>
        <p className="text-center font-bold text-orange mb-4">{LABELS[stars]}</p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggle(t)}
              className={`text-sm px-4 py-1.5 rounded-full border ${
                tags.includes(t)
                  ? "bg-blue-50 border-blue-400 text-navy font-bold"
                  : "border-navy/20 text-navy/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tulis ulasan singkat..."
          className="w-full rounded-xl border border-navy/20 p-3 text-sm mb-4 min-h-24"
        />
        <button
          disabled={saving}
          onClick={submit}
          className="w-full bg-navy text-cream font-bold py-3 rounded-xl disabled:opacity-50"
        >
          Kirim Rating
        </button>
        <button onClick={onClose} className="w-full text-navy/70 mt-2 text-sm">
          Lewati
        </button>
      </div>
    </div>
  );
}
