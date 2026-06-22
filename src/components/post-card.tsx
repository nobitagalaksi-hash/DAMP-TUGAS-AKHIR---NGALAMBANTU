import { MapPin, Clock, MessageCircle, Bookmark, Share2, MoreVertical } from "lucide-react";
import { CATEGORY_BY_KEY, type CategoryKey } from "@/lib/categories";
import { formatRupiah, timeAgo, initials } from "@/lib/format";

export interface PostCardData {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  category: CategoryKey;
  is_urgent: boolean;
  jumlah_orang: number;
  imbalan_amount: number;
  imbalan_type: string;
  needed_date: string | null;
  needed_time: string | null;
  alamat: string | null;
  kecamatan: string | null;
  status: string;
  created_at: string;
  author_name?: string | null;
}

export function PostCard({
  post,
  onTertarik,
  highlight = true,
}: {
  post: PostCardData;
  onTertarik?: (post: PostCardData) => void;
  highlight?: boolean;
}) {
  const cat = CATEGORY_BY_KEY[post.category];
  const bg = highlight && post.is_urgent ? "bg-orange" : "bg-card";
  const textPrimary = highlight && post.is_urgent ? "text-navy" : "text-foreground";
  const muted = highlight && post.is_urgent ? "text-navy/80" : "text-muted-foreground";

  return (
    <article className={`${bg} rounded-2xl p-5 shadow-sm border border-navy/5`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-navy text-cream grid place-items-center font-bold text-sm shrink-0">
          {initials(post.author_name || "U U")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${textPrimary}`}>
              {post.author_name || "Pengguna"}
            </span>
            {post.is_urgent && (
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                URGENT
              </span>
            )}
          </div>
          <span className={`text-xs ${muted}`}>{timeAgo(post.created_at)}</span>
        </div>
        <button className={`p-1 ${muted}`}>
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <h3 className={`mt-3 font-display text-lg font-bold leading-snug ${textPrimary}`}>
        {post.title}
      </h3>
      {post.description && (
        <p className={`mt-1 text-sm leading-relaxed ${muted}`}>{post.description}</p>
      )}

      {post.photo_url && (
        <img src={post.photo_url} alt="" className="mt-3 w-full h-56 object-cover rounded-xl" />
      )}

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white text-navy px-3 py-1 rounded-full">
          {cat.emoji} {cat.label}
        </span>
        <span className="text-sm font-bold text-emerald-700">
          {formatRupiah(post.imbalan_amount)}
          <span className="font-normal text-xs">
            /
            {post.imbalan_type === "per_orang"
              ? "org"
              : post.imbalan_type === "per_tugas"
                ? "tugas"
                : "nego"}
          </span>
        </span>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
          {post.jumlah_orang} orang dibutuhkan
        </span>
      </div>

      <div className={`mt-3 flex items-center gap-4 text-xs ${muted}`}>
        {post.alamat && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-red-500" /> {post.alamat}
          </span>
        )}
        {post.needed_date && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.needed_date}{" "}
            {post.needed_time?.slice(0, 5) ?? ""}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={`flex items-center gap-4 text-sm ${muted}`}>
          <button className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> 0
          </button>
          <button className="inline-flex items-center gap-1">
            <Bookmark className="h-4 w-4" /> Simpan
          </button>
          <button className="inline-flex items-center gap-1">
            <Share2 className="h-4 w-4" /> Bagikan
          </button>
        </div>
        <button
          onClick={() => onTertarik?.(post)}
          className="bg-navy text-cream font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-navy-deep transition"
        >
          Tertarik Membantu
        </button>
      </div>
    </article>
  );
}
