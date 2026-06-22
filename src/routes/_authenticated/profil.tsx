import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PostingModal } from "@/components/posting-modal";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Trophy, BadgeCheck, Pencil, X, Award, Info } from "lucide-react";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({ meta: [{ title: "Profil — NgalamBantu" }] }),
  component: ProfilPage,
});

const BADGES = [
  { key: "newbie", title: "Pendatang Baru", sub: "5 tugas selesai" },
  { key: "fast", title: "Helper Cepat", sub: "Respon < 10 mnt" },
  { key: "trusted", title: "Andalan", sub: "Rating 4.9+" },
  { key: "popular", title: "Populer", sub: "Top 10% Helper" },
];

function ProfilPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const userId = useCurrentUser();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ count: posts }, { count: offers }, { data: ratings }, { count: doneThisMonth }] =
        await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId!),
          supabase
            .from("post_offers")
            .select("*", { count: "exact", head: true })
            .eq("helper_id", userId!),
          supabase.from("ratings").select("stars").eq("helper_id", userId!),
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId!)
            .eq("status", "completed")
            .gte(
              "updated_at",
              new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            ),
        ]);
      const stars = ratings ?? [];
      const avg = stars.length ? stars.reduce((s, r) => s + r.stars, 0) / stars.length : 0;
      return {
        posts: posts ?? 0,
        offers: offers ?? 0,
        avg,
        ratingsCount: stars.length,
        doneThisMonth: doneThisMonth ?? 0,
      };
    },
  });

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setUsername((profile as { username?: string }).username ?? "");
      setPhone(profile.phone ?? "");
      setBio((profile as { bio?: string }).bio ?? "");
      setSkills((profile as { skills?: string[] }).skills ?? []);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        phone,
        username: username || null,
        bio,
        skills,
      } as never);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
    },
  });

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  };

  const tugasCount = stats?.offers ?? 0;
  const avgRating = stats?.avg ?? 0;
  const followers = (profile as { followers_count?: number })?.followers_count ?? 0;
  const isTopHelper = (profile as { is_top_helper?: boolean })?.is_top_helper ?? avgRating >= 4.8;
  const isVerified = (profile as { is_verified?: boolean })?.is_verified ?? false;

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 px-4 lg:px-8 py-6 max-w-7xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy mb-5">Profil</h1>

          <div className="bg-cream rounded-3xl border border-navy/10 overflow-hidden">
            <div className="bg-navy h-32 relative">
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 h-28 w-28 rounded-full bg-red-500 grid place-items-center text-cream font-display text-3xl font-bold ring-4 ring-cream">
                {initials(fullName || "U U")}
              </div>
            </div>

            <div className="pt-16 px-6 pb-6 text-center">
              <p className="font-display text-2xl font-bold text-navy">{fullName || "Nama Kamu"}</p>
              <p className="text-sm text-navy/60">@{username || "username"} · Helper</p>

              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {isTopHelper && (
                  <span className="bg-navy text-cream text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-orange" /> Top Helper
                  </span>
                )}
                {isVerified && (
                  <span className="bg-navy text-cream text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-orange" /> Terverifikasi
                  </span>
                )}
              </div>

              <div className="mt-4 bg-navy text-cream rounded-2xl py-4 px-6 grid grid-cols-3 gap-2">
                <div>
                  <p className="font-display text-2xl font-bold text-orange">{tugasCount}</p>
                  <p className="text-xs text-cream/80">Tugas</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-orange">
                    {avgRating.toFixed(1)}★
                  </p>
                  <p className="text-xs text-cream/80">Rating</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-orange">{followers}</p>
                  <p className="text-xs text-cream/80">Pengikut</p>
                </div>
              </div>

              <div className="mt-4 bg-orange rounded-2xl p-4 text-left">
                <p className="font-bold text-navy mb-1">Tentang</p>
                {editing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Ceritakan tentang dirimu..."
                    className="w-full rounded-xl bg-cream py-2 px-3 text-sm text-navy outline-none"
                  />
                ) : (
                  <p className="text-sm text-navy/90">{bio || "Belum ada deskripsi."}</p>
                )}
              </div>

              <div className="mt-4 bg-orange rounded-2xl p-4 text-left">
                <p className="font-bold text-navy mb-2">Keahlian</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="bg-navy text-cream text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                    >
                      {s}
                      {editing && (
                        <button onClick={() => setSkills(skills.filter((k) => k !== s))}>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {!skills.length && !editing && (
                    <span className="text-xs text-navy/60">Belum ada keahlian.</span>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2 mt-3">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Tambah keahlian..."
                      className="flex-1 rounded-full bg-cream py-2 px-3 text-sm outline-none"
                    />
                    <button
                      onClick={addSkill}
                      className="bg-navy text-cream text-sm font-bold px-4 rounded-full"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {editing && (
                <div className="mt-4 bg-cream border border-navy/10 rounded-2xl p-4 space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">Nama Lengkap</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg bg-background py-2 px-3 text-sm outline-none ring-1 ring-navy/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg bg-background py-2 px-3 text-sm outline-none ring-1 ring-navy/10"
                      placeholder="zararefindra"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">Nomor Telepon</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg bg-background py-2 px-3 text-sm outline-none ring-1 ring-navy/10"
                    />
                  </div>
                </div>
              )}

              {editing ? (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-cream border-2 border-navy text-navy font-bold rounded-xl py-3"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                    className="flex-1 bg-navy text-cream font-bold rounded-xl py-3 disabled:opacity-50"
                  >
                    {save.isPending ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 w-full bg-cream border-2 border-navy text-navy font-bold rounded-xl py-3 inline-flex items-center justify-center gap-2"
                >
                  <Pencil className="h-4 w-4" /> Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-navy text-cream rounded-2xl p-5">
            <p className="font-bold mb-3 inline-flex items-center gap-2">
              <Award className="h-4 w-4 text-orange" /> Pendapatan
            </p>
            <div className="space-y-2">
              {BADGES.map((b) => (
                <div key={b.key} className="bg-orange rounded-xl p-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-navy shrink-0" />
                  <div>
                    <p className="font-bold text-navy text-sm leading-tight">{b.title}</p>
                    <p className="text-[11px] text-navy/70">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy text-cream rounded-2xl p-5">
            <p className="font-bold mb-4">Statistik Bulan Ini</p>
            <Stat
              label="Tugas Selesai"
              value={`${stats?.doneThisMonth ?? 0}/15`}
              pct={Math.min(100, ((stats?.doneThisMonth ?? 0) / 15) * 100)}
            />
            <Stat label="Respon Rata-rata" value="95%" pct={95} />
            <Stat label="Kepuasan" value={avgRating.toFixed(1)} pct={(avgRating / 5) * 100} />
            <div className="mt-4 flex items-start gap-2 text-xs text-cream/70">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p>
                Lanjutkan performa baikmu untuk mempertahankan status{" "}
                <span className="text-orange font-bold">Top Helper</span> bulan depan.
              </p>
            </div>
          </div>
        </aside>
      </div>
      <PostingModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}

function Stat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-cream/15 rounded-full overflow-hidden">
        <div className="h-full bg-orange" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
