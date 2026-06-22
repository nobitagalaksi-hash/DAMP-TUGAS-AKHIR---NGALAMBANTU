import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Phone, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/masuk")({
  head: () => ({
    meta: [
      { title: "Masuk — NgalamBantu" },
      {
        name: "description",
        content: "Masuk atau daftar ke NgalamBantu untuk mulai saling membantu di Malang.",
      },
    ],
  }),
  component: MasukPage,
});

function MasukPage() {
  const [tab, setTab] = useState<"masuk" | "daftar">("masuk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (tab === "daftar") {
      if (password !== confirmPassword) {
        setError("Kata sandi tidak cocok");
        setLoading(false);
        return;
      }
      if (!agree) {
        setError("Anda harus menyetujui Syarat & Ketentuan");
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        window.location.href = "/beranda";
        return;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(
            "Akun sudah dibuat, tetapi Supabase masih memaksa konfirmasi email. Matikan Email Confirmations di dashboard Supabase agar langsung login.",
          );
        } else {
          window.location.href = "/beranda";
          return;
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) setError(signInError.message);
      else {
        window.location.href = "/beranda";
        return;
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/beranda",
    });
    if (result.error) setError(result.error.message || "Gagal masuk dengan Google");
    if (result.redirected) return;
    if (!result.error) {
      window.location.href = "/beranda";
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
        {/* Decorative lion */}
        <img
          src={lionLogo}
          alt=""
          className="absolute -bottom-20 -left-20 h-[28rem] w-[28rem] opacity-[0.08] pointer-events-none"
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-orange flex flex-col items-center justify-center p-6 md:p-12 relative">
        {/* Mobile back link */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1 text-navy/70 hover:text-navy text-sm lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-navy text-center">
            Sugeng Rawuh,
          </h1>
          <p className="mt-3 text-navy/80 text-center text-sm">
            Masuk dulu yuk! Sebelum menunjukkan aksi sosial Anda di Malang.
          </p>

          {/* Tab Switcher */}
          <div className="mt-8 flex bg-white/90 rounded-full p-1.5">
            <button
              onClick={() => {
                setTab("masuk");
                setError("");
                setMessage("");
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                tab === "masuk" ? "bg-navy text-cream shadow-md" : "text-navy hover:bg-white/50"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setTab("daftar");
                setError("");
                setMessage("");
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                tab === "daftar" ? "bg-navy text-cream shadow-md" : "text-navy hover:bg-white/50"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Social Login */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-navy border border-navy/10 hover:bg-white/90 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.19 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.98.66-2.23 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.54H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.83 14.09a6.96 6.96 0 0 1 0-4.18V7.07H2.18C.79 9.37 0 11.85 0 14.25s.79 4.88 2.18 7.18l3.65-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.65 2.84c.87-2.6 3.3-4.16 6.17-4.16z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-navy border border-navy/10 hover:bg-white/90 transition opacity-60 cursor-not-allowed"
              disabled
              title="Segera hadir"
            >
              <Phone className="h-5 w-5" />
              Telepon
            </button>
          </div>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-navy/20" />
            <span className="text-xs text-navy/60">Atau gunakan email</span>
            <div className="h-px flex-1 bg-navy/20" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@ngalam.id"
                  className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm text-navy outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-navy/30 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Kata Sandi</label>
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

            {tab === "daftar" && (
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Konfirmasi Kata Sandi
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
            )}

            {tab === "masuk" && (
              <div className="text-right">
                <Link
                  to="/reset-password"
                  className="text-sm text-navy/70 hover:text-navy underline"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>
            )}

            {tab === "daftar" && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-navy/30 text-navy focus:ring-navy accent-navy"
                />
                <span className="text-xs text-navy/80 leading-relaxed">
                  Saya menyetujui <span className="underline">Syarat & Ketentuan</span> serta{" "}
                  <span className="underline">Kebijakan Privasi</span> NgalamBantu.
                </span>
              </label>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</div>
            )}

            {message && (
              <div className="rounded-lg bg-green-50 px-4 py-2.5 text-xs text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-navy py-3.5 text-sm font-bold text-cream hover:bg-navy-deep transition disabled:opacity-60 shadow-lg"
            >
              {loading ? "Memuat..." : tab === "masuk" ? "Masuk Sekarang" : "Daftar Sekarang"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-navy/70">
            Butuh bantuan?{" "}
            <span className="font-semibold underline cursor-pointer">Pusat Bantuan</span>
          </p>
        </div>
      </div>
    </div>
  );
}
