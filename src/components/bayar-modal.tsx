import { useState } from "react";
import {
  X,
  QrCode,
  Building2,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Copy,
  Clock,
  FileImage,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";

type Step = "method" | "qris" | "qris-confirm" | "bank" | "done";
const BANKS = [
  { code: "BCA", name: "BCA", color: "bg-blue-600", num: "1234567890" },
  { code: "BNI", name: "BNI", color: "bg-orange-500", num: "9876543210" },
  { code: "BRI", name: "BRI", color: "bg-red-600", num: "5544332211" },
  { code: "MDR", name: "Mandiri", color: "bg-yellow-500", num: "1122334455" },
  { code: "BSI", name: "BSI/BSM", color: "bg-emerald-600", num: "7788990011" },
  { code: "PMT", name: "Permata Bank", color: "bg-sky-500", num: "6655443322" },
];

export function BayarModal({
  post,
  onClose,
  onPaid,
}: {
  post: { id: string; title: string; imbalan_amount: number } | null;
  onClose: () => void;
  onPaid?: () => void;
}) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<"qris" | "bank">("qris");
  const [bank, setBank] = useState(BANKS[0]);
  const [hasProof, setHasProof] = useState(false);
  if (!post) return null;

  const total = post.imbalan_amount;
  const totalWithUnique = total + 435;

  const confirm = async () => {
    await supabase
      .from("posts")
      .update({
        paid_at: new Date().toISOString(),
        payment_method: method === "qris" ? "QRIS" : bank.name,
        status: "completed",
      })
      .eq("id", post.id);
    setStep("done");
    onPaid?.();
  };

  const Backdrop = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-3xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-navy/60">
          <X />
        </button>
        {children}
      </div>
    </div>
  );

  if (step === "done")
    return (
      <Backdrop>
        <div className="text-center py-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
          <h2 className="font-display text-xl font-bold text-navy mt-3">Pembayaran Terkirim!</h2>
          <p className="text-sm text-navy/70 mt-1">Terima kasih telah mendukung helper.</p>
          <button
            onClick={onClose}
            className="mt-5 bg-navy text-cream font-bold py-3 px-8 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </Backdrop>
    );

  if (step === "method")
    return (
      <Backdrop>
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-orange/30 h-10 w-10 rounded-xl grid place-items-center">
            <FileImage className="text-navy" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-navy">Bayar Imbalan</h2>
            <p className="text-xs text-navy/70">Transfer ke helper sekarang</p>
          </div>
        </div>
        <div className="bg-orange rounded-2xl p-5 text-center mb-5">
          <p className="text-xs text-navy/70 font-bold tracking-wider">TOTAL IMBALAN</p>
          <p className="font-display text-4xl font-bold text-navy">{formatRupiah(total)}</p>
          <p className="text-xs text-navy/70 mt-1 font-bold">{post.title}</p>
        </div>
        <p className="font-bold text-navy mb-3">Pilih Metode Pembayaran</p>
        <div className="space-y-3 mb-5">
          {(
            [
              {
                k: "qris",
                Icon: QrCode,
                t: "QRIS (Gopay/OVO/DANA)",
                s: "Bayar instan via scan kode QR",
              },
              {
                k: "bank",
                Icon: Building2,
                t: "Transfer Bank",
                s: "BCA, Mandiri, BNI, atau Bank lain",
              },
            ] as const
          ).map(({ k, Icon, t, s }) => (
            <button
              key={k}
              onClick={() => setMethod(k)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left ${method === k ? "border-navy bg-navy/5" : "border-navy/15"}`}
            >
              <div className="bg-navy/10 h-10 w-10 rounded-xl grid place-items-center">
                <Icon className="text-navy" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-navy">{t}</p>
                <p className="text-xs text-navy/60">{s}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 ${method === k ? "border-navy bg-navy" : "border-navy/30"}`}
              >
                {method === k && <div className="h-2 w-2 bg-cream rounded-full m-auto mt-1" />}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep(method === "qris" ? "qris" : "bank")}
          className="w-full bg-navy text-cream font-bold py-3 rounded-xl"
        >
          Bayar Sekarang →
        </button>
        <button onClick={onClose} className="w-full text-navy/70 mt-2 text-sm">
          Bayar nanti
        </button>
      </Backdrop>
    );

  if (step === "qris")
    return (
      <Backdrop>
        <h2 className="font-display text-lg font-bold text-navy mb-4">Bayar via QRIS</h2>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-navy font-bold mb-3">
            <QrCode className="h-5 w-5" /> QRIS GPN
          </div>
          <div className="border-2 border-navy/15 rounded-2xl p-6 inline-block">
            <div className="h-48 w-48 bg-navy grid place-items-center text-cream text-xs">
              [QR CODE]
            </div>
          </div>
          <p className="text-xs text-navy/60 font-bold tracking-wider mt-4">TOTAL PEMBAYARAN</p>
          <p className="font-display text-3xl font-bold text-navy">{formatRupiah(total)}</p>
          <div className="inline-flex items-center gap-2 bg-orange text-navy text-sm font-bold px-4 py-2 rounded-full mt-3">
            <Clock className="h-4 w-4" /> QR berlaku selama 04:57
          </div>
        </div>
        <button
          onClick={() => {
            setHasProof(true);
            setStep("qris-confirm");
          }}
          className="w-full mt-5 bg-navy text-cream font-bold py-3 rounded-xl inline-flex items-center justify-center gap-2"
        >
          <Upload className="h-4 w-4" /> Upload Bukti Pembayaran
        </button>
        <p className="text-xs text-navy/60 text-center mt-3">
          Scan QR di atas menggunakan aplikasi bank atau dompet digital favorit Anda.
        </p>
      </Backdrop>
    );

  if (step === "qris-confirm")
    return (
      <Backdrop>
        <h2 className="font-display text-lg font-bold text-navy mb-4">Bayar via QRIS</h2>
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
          <p className="text-navy/70 mt-3">Konfirmasi Bukti Transfer</p>
          <div className="bg-orange rounded-xl p-3 flex items-center gap-2 mt-3 text-left">
            <FileImage className="text-navy" />
            <span className="flex-1 text-navy font-bold text-sm">bukti_qris.jpg</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="text-sm mt-4 space-y-2">
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/70">Nominal Pembayaran</span>
              <span className="font-bold text-navy">{formatRupiah(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy/70">Metode</span>
              <span className="font-bold text-navy">QRIS - Auto Scan</span>
            </div>
          </div>
          <button
            onClick={confirm}
            className="w-full mt-5 bg-navy text-cream font-bold py-3 rounded-xl"
          >
            Konfirmasi Pembayaran
          </button>
          <button
            onClick={() => setStep("qris")}
            className="w-full mt-2 text-navy/70 text-sm inline-flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        </div>
      </Backdrop>
    );

  // bank
  return (
    <Backdrop>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setStep("method")}>
          <ArrowLeft className="text-navy" />
        </button>
        <div>
          <h2 className="font-display text-lg font-bold text-navy inline-flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Pilih Bank Tujuan
          </h2>
          <p className="text-xs text-navy/70">Transfer ke rekening NgalamBantu</p>
        </div>
      </div>
      <p className="font-bold text-navy mb-2">Pilih Bank</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {BANKS.map((b) => (
          <button
            key={b.code}
            onClick={() => setBank(b)}
            className={`border-2 rounded-2xl p-3 flex flex-col items-center gap-1 ${bank.code === b.code ? "border-blue-500 bg-blue-50" : "border-navy/15"}`}
          >
            <div
              className={`${b.color} text-white text-[10px] font-bold h-8 w-8 rounded-full grid place-items-center`}
            >
              {b.code}
            </div>
            <span className="text-xs font-bold text-navy">{b.name}</span>
          </button>
        ))}
      </div>
      <div className="bg-orange rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`${bank.color} text-white text-[10px] font-bold h-8 w-8 rounded-full grid place-items-center`}
          >
            {bank.code}
          </div>
          <div>
            <p className="font-bold text-navy">{bank.name}</p>
            <p className="text-xs text-navy/70">Kode bank: 014</p>
          </div>
        </div>
        <p className="text-sm font-bold text-navy mt-2">Nomor Rekening</p>
        <div className="flex items-center gap-2 bg-card rounded-xl p-2 mt-1">
          <span className="flex-1 font-bold text-navy">{bank.num}</span>
          <button
            onClick={() => navigator.clipboard.writeText(bank.num)}
            className="bg-navy text-cream text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
          >
            <Copy className="h-3 w-3" /> Salin
          </button>
        </div>
        <p className="text-sm text-navy/80 mt-2">Atas Nama</p>
        <p className="font-bold text-navy">NgalamBantu Indonesia</p>
        <p className="text-sm font-bold text-navy mt-2">Nominal Transfer</p>
        <div className="flex items-center gap-2 bg-emerald-100 rounded-xl p-3 mt-1">
          <div className="flex-1">
            <p className="font-display text-xl font-bold text-emerald-800">
              {formatRupiah(totalWithUnique)}
            </p>
            <p className="text-xs text-emerald-700">Sudah termasuk kode unik +435</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(String(totalWithUnique))}
            className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            Salin
          </button>
        </div>
      </div>
      <button
        onClick={() => setHasProof(true)}
        className="w-full border-2 border-dashed border-navy/30 rounded-xl py-3 inline-flex items-center justify-center gap-2 text-navy font-bold"
      >
        <Upload className="h-4 w-4" /> {hasProof ? "bukti_transfer.jpg ✓" : "Upload Bukti Transfer"}
      </button>
      <button
        disabled={!hasProof}
        onClick={confirm}
        className={`w-full mt-3 font-bold py-3 rounded-xl ${hasProof ? "bg-navy text-cream" : "bg-cream text-navy/40 border border-navy/10"}`}
      >
        {hasProof ? "Konfirmasi Pembayaran" : "Upload bukti dulu ↑"}
      </button>
    </Backdrop>
  );
}
