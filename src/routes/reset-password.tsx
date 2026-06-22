import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ChevronLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Kata Sandi — NgalamBantu" },
      { name: "description", content: "Atur ulang kata sandi akun NgalamBantu Anda." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  useEffect(() => {
    // Check if this page was opened from a password reset email
    // Supabase adds type=recovery to the URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setHasRecoveryToken(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-navy relative flex-col justify-between p-12 rounded-r-[3rem] overflow-hidden">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={lionLogo} alt="" className="h-10 w-10 transition group-hover:scale-105" />
          <span className="font-display text-2xl font-bold text-orange">Ngalam Bantu.</span>
        </Link>
        <p className="text-cream/80 text-sm max-w-xs">Setiap bantuanmu menjadi jejak kebaikanmu.</p>
        <img
          src={lionLogo}
          alt=""
          className="absolute -bottom-20 -left-20 h-[28rem] w-[28rem] opacity-[0.08] pointer-events-none"
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-orange flex flex-col items-center justify-center p-6 md:p-12 relative">
        <Link
          to="/masuk"
          className="absolute top-6 left-6 flex items-center gap-1 text-navy/70 hover:text-navy text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke Masuk
        </Link>

        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy text-center">
            {success ? "Berhasil!" : "Reset Kata Sandi"}
          </h1>
          <p className="mt-3 text-navy/80 text-center text-sm">
            {success
              ? "Kata sandi Anda telah diperbarui. Silakan masuk dengan kata sandi baru."
              : hasRecoveryToken
                ? "Buat kata sandi baru untuk akun Anda."
                : "Silakan buka link reset kata sandi dari email Anda terlebih dahulu."}
          </p>

          {success ? (
            <div className="mt-8 text-center">
              <Link
                to="/masuk"
                className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-bold text-cream hover:bg-navy-deep transition shadow-lg"
              >
                Masuk Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : hasRecoveryToken ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white py-3 pl-11 pr-11 text-sm text-navy outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/30 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy/70"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm text-navy outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/30 transition"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-navy py-3.5 text-sm font-bold text-cream hover:bg-navy-deep transition disabled:opacity-60 shadow-lg"
              >
                {loading ? "Memuat..." : "Simpan Kata Sandi Baru"}
              </button>
            </form>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-sm text-navy/70 mb-4">
                Tidak menemukan link reset yang valid? Minta link baru melalui halaman masuk.
              </p>
              <Link
                to="/masuk"
                className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-cream transition"
              >
                Ke Halaman Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
