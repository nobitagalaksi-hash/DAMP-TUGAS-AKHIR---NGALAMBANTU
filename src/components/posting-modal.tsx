import { useState } from "react";
import {
  X,
  Plus,
  Camera,
  Minus,
  Calendar,
  Clock as ClockIcon,
  AlarmClock,
  Hourglass,
  RefreshCw,
  Map,
  ClipboardCheck,
  Rocket,
} from "lucide-react";
import { CATEGORIES, type CategoryKey, KECAMATAN_LIST, type Kecamatan } from "@/lib/categories";
import { formatRupiah } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

interface PostFormState {
  title: string;
  category: CategoryKey;
  is_urgent: boolean;
  description: string;
  photo_url: string;
  jumlah_orang: number;
  imbalan_amount: number;
  imbalan_type: "per_orang" | "per_tugas" | "nego";
  needed_date: string;
  needed_time: string;
  flexibility: "tepat" | "toleransi" | "fleksibel";
  alamat: string;
  kecamatan: Kecamatan;
}

const INITIAL: PostFormState = {
  title: "",
  category: "kurir_antar",
  is_urgent: false,
  description: "",
  photo_url: "",
  jumlah_orang: 1,
  imbalan_amount: 15000,
  imbalan_type: "per_tugas",
  needed_date: new Date().toISOString().slice(0, 10),
  needed_time: "08:00",
  flexibility: "toleransi",
  alamat: "",
  kecamatan: "Lowokwaru",
};

const IMBALAN_PRESETS = [15000, 20000, 30000, 50000, 80000, 100000];

export function PostingModal({
  open,
  onClose,
  onCreated,
  defaultCategory,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  defaultCategory?: CategoryKey;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PostFormState>({
    ...INITIAL,
    category: defaultCategory ?? INITIAL.category,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  const set = <K extends keyof PostFormState>(k: K, v: PostFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm(INITIAL);
    setStep(1);
    setErr("");
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setErr("");
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setErr("Sesi habis");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("posts").insert({
      user_id: u.user.id,
      title: form.title,
      description: form.description || null,
      photo_url: form.photo_url || null,
      category: form.category,
      is_urgent: form.is_urgent,
      jumlah_orang: form.jumlah_orang,
      imbalan_amount: form.imbalan_amount,
      imbalan_type: form.imbalan_type,
      needed_date: form.needed_date,
      needed_time: form.needed_time,
      flexibility: form.flexibility,
      alamat: form.alamat || null,
      kecamatan: form.kecamatan,
    });
    setSubmitting(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onCreated?.();
    close();
  };

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl my-8 max-h-[92vh] flex flex-col">
        <header className="p-6 pb-3 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-navy flex items-center gap-2">
              <Plus className="h-6 w-6" /> Posting Bantuan
            </h2>
            <p className="text-xs text-navy/60 mt-0.5">
              Step {step} dari 5 —{" "}
              {
                [
                  "Judul & Kategori",
                  "Deskripsi & Foto",
                  "Orang & Imbalan",
                  "Waktu & Jam",
                  "Lokasi",
                ][step - 1]
              }
            </p>
          </div>
          <button onClick={close} className="text-navy/60 hover:text-navy">
            <X className="h-6 w-6" />
          </button>
        </header>

        {/* Stepper */}
        <div className="px-6 py-4 flex items-center">
          {[1, 2, 3, 4, 5].map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold shrink-0 ${
                  s < step
                    ? "bg-orange text-navy"
                    : s === step
                      ? "bg-navy text-cream"
                      : "bg-navy/10 text-navy/40"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {i < 4 && (
                <div className={`flex-1 h-0.5 mx-1 ${s < step ? "bg-orange" : "bg-navy/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex-1 overflow-y-auto space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Judul Bantuan</label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="butuh kurir antar paket"
                  className="w-full rounded-xl bg-cream py-3 px-4 outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Kategori</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => set("category", c.key)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold text-navy text-left ${
                        form.category === c.key
                          ? "bg-blue-50 border-navy ring-2 ring-navy/30"
                          : "bg-white border-navy/10 hover:bg-cream"
                      }`}
                    >
                      <span className="text-lg">{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => set("is_urgent", !form.is_urgent)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-navy ${
                  form.is_urgent ? "bg-orange" : "bg-cream"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded grid place-items-center ${form.is_urgent ? "bg-navy text-cream" : "bg-white border border-navy/30"}`}
                >
                  {form.is_urgent && "✓"}
                </span>
                Tandai sebagai URGENT
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Deskripsi Detail</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  placeholder="Contoh: Pakaian olahraga nanti taruh di satpam sekolah aja, titip belikan nasi bungkus depan gang…"
                  className="w-full rounded-xl bg-white py-3 px-4 outline-none ring-1 ring-navy/15 focus:ring-2 focus:ring-navy/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">
                  URL Foto (Opsional)
                </label>
                <input
                  value={form.photo_url}
                  onChange={(e) => set("photo_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-white py-3 px-4 outline-none ring-1 ring-navy/15 focus:ring-2 focus:ring-navy/30"
                />
                <div className="mt-3 border-2 border-dashed border-navy/20 rounded-2xl p-8 text-center text-navy/50">
                  <Camera className="h-8 w-8 mx-auto" />
                  <p className="mt-2 text-sm font-semibold">Tempel link foto di atas</p>
                  <p className="text-xs">JPG, PNG</p>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">
                  Jumlah Orang Dibutuhkan
                </label>
                <div className="inline-flex items-center bg-orange rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => set("jumlah_orang", Math.max(1, form.jumlah_orang - 1))}
                    className="h-9 w-9 rounded-full bg-navy text-cream grid place-items-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 font-bold text-navy">{form.jumlah_orang}</span>
                  <button
                    type="button"
                    onClick={() => set("jumlah_orang", form.jumlah_orang + 1)}
                    className="h-9 w-9 rounded-full bg-navy text-cream grid place-items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="ml-3 mr-3 text-navy/80 text-sm">orang</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Imbalan / Upah</label>
                <div className="bg-navy text-cream rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="font-bold">Rp</span>
                  <input
                    type="number"
                    value={form.imbalan_amount}
                    onChange={(e) => set("imbalan_amount", parseInt(e.target.value || "0"))}
                    className="bg-transparent outline-none flex-1 text-lg font-bold"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {IMBALAN_PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("imbalan_amount", v)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${form.imbalan_amount === v ? "bg-navy text-cream border-navy" : "bg-cream text-navy border-navy/20"}`}
                    >
                      {formatRupiah(v)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Jenis Imbalan</label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ["per_orang", "Per orang"],
                      ["per_tugas", "Per tugas"],
                      ["nego", "Nego"],
                    ] as const
                  ).map(([v, lbl]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("imbalan_type", v)}
                      className={`px-3 py-3 rounded-xl border text-sm font-semibold text-navy ${form.imbalan_type === v ? "bg-blue-50 border-navy ring-2 ring-navy/30" : "bg-white border-navy/15"}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Tanggal Dibutuhkan</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.needed_date}
                    onChange={(e) => set("needed_date", e.target.value)}
                    className="w-full rounded-xl bg-cream py-3 px-4 pr-10 outline-none ring-1 ring-navy/15"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/50" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {(
                    [
                      ["Hari ini", today],
                      ["Besok", tomorrow],
                      ["Lusa", dayAfter],
                    ] as const
                  ).map(([lbl, v]) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => set("needed_date", v)}
                      className={`py-2 rounded-xl font-semibold text-sm ${form.needed_date === v ? "bg-navy text-cream" : "bg-cream text-navy"}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Jam Spesifik</label>
                <input
                  type="time"
                  value={form.needed_time}
                  onChange={(e) => set("needed_time", e.target.value)}
                  className="w-full rounded-xl bg-cream py-3 px-4 outline-none ring-1 ring-navy/15"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("needed_time", t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${form.needed_time === t ? "bg-navy text-cream" : "bg-cream text-navy"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">
                  Fleksibilitas Waktu
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ["tepat", "Tepat waktu", AlarmClock],
                      ["toleransi", "± 30 mnt", Hourglass],
                      ["fleksibel", "Fleksibel", RefreshCw],
                    ] as const
                  ).map(([v, lbl, Ic]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("flexibility", v)}
                      className={`px-3 py-4 rounded-xl border text-sm font-semibold text-navy flex flex-col items-center gap-1 ${form.flexibility === v ? "bg-blue-50 border-navy ring-2 ring-navy/30" : "bg-white border-navy/15"}`}
                    >
                      <Ic className="h-5 w-5" /> {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Alamat / Lokasi</label>
                <input
                  value={form.alamat}
                  onChange={(e) => set("alamat", e.target.value)}
                  placeholder="SD KAUMAN 1 MALANG"
                  className="w-full rounded-xl bg-cream py-3 px-4 outline-none ring-1 ring-navy/15"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy mb-2">Kecamatan</label>
                <div className="grid grid-cols-3 gap-3">
                  {KECAMATAN_LIST.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set("kecamatan", k)}
                      className={`py-3 rounded-xl border text-sm font-semibold text-navy ${form.kecamatan === k ? "bg-blue-50 border-navy ring-2 ring-navy/30" : "bg-white border-navy/15"}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-orange rounded-2xl p-5 text-center text-navy">
                <Map className="h-8 w-8 mx-auto" />
                <p className="font-display font-bold mt-2">Pilih dari Peta</p>
                <p className="text-xs">Tap untuk pin lokasi tepat (segera)</p>
              </div>
              <div className="rounded-xl border border-navy/15 p-4">
                <p className="font-bold text-navy flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" /> Ringkasan Posting
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-navy">
                  <div>
                    <div className="text-xs text-navy/60">JUDUL</div>
                    <div className="font-bold">{form.title || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-navy/60">KATEGORI</div>
                    <div className="font-bold">
                      {CATEGORIES.find((c) => c.key === form.category)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-navy/60">ORANG & UPAH</div>
                    <div className="font-bold">
                      {form.jumlah_orang} orang · {formatRupiah(form.imbalan_amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-navy/60">WAKTU</div>
                    <div className="font-bold">{form.needed_date}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {err && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{err}</div>}
        </div>

        <footer className="p-6 pt-3 border-t border-navy/10 flex gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-3 rounded-xl border border-navy/15 font-bold text-navy"
            >
              ← Kembali
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !form.title}
              className="flex-1 bg-navy text-cream font-bold rounded-xl py-3 hover:bg-navy-deep transition disabled:opacity-50"
            >
              Lanjut →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || !form.title}
              className="flex-1 bg-navy text-cream font-bold rounded-xl py-3 hover:bg-navy-deep transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Rocket className="h-4 w-4" /> {submitting ? "Memposting..." : "Posting Sekarang!"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
