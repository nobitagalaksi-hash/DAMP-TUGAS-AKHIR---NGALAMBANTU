import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lionLogo from "@/assets/lion-logo-orange.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NgalamBantu — Platform Saling Bantu Warga Malang" },
      {
        name: "description",
        content:
          "Platform warga Malang untuk saling membantu. Request bantuan atau jadi Helper, mudah dan terpercaya.",
      },
      { property: "og:title", content: "NgalamBantu — Platform Saling Bantu Warga Malang" },
      {
        property: "og:description",
        content: "Platform warga Malang untuk saling membantu. Request bantuan atau jadi Helper.",
      },
    ],
  }),
  component: Landing,
});

const stats = [
  { value: "885K", label: "Warga Kota Malang" },
  { value: "60+", label: "Pengguna Terdaftar" },
  { value: "2 Peran", label: "Requester & Helper" },
  { value: "5 Fitur", label: "Utama Platform" },
];

const faqs = [
  {
    q: "Bagaimana cara meminta bantuan di NgalamBantu?",
    a: "Daftar akun, pilih peran Requester, lalu klik 'Minta Bantuan' dan deskripsikan kebutuhan kamu beserta imbalan yang ditawarkan. Helper di sekitar lokasi kamu akan menerima notifikasi.",
  },
  {
    q: "Apakah NgalamBantu tersedia di seluruh Malang?",
    a: "Saat ini NgalamBantu aktif di seluruh wilayah Kota Malang dan sekitarnya. Kami terus memperluas jangkauan ke daerah-daerah lain agar lebih banyak warga terhubung.",
  },
  {
    q: "Siapa saja yang bisa menjadi Helper?",
    a: "Siapa pun warga Malang berusia 17 tahun ke atas yang bersedia membantu bisa mendaftar sebagai Helper. Cukup lengkapi profil dan verifikasi identitas.",
  },
  {
    q: "Apakah ada biaya untuk menggunakan NgalamBantu?",
    a: "Mendaftar dan menggunakan platform NgalamBantu sepenuhnya gratis. Imbalan untuk Helper ditentukan dan disepakati langsung antara Requester dan Helper.",
  },
  {
    q: "Berapa lama waktu yang dibutuhkan untuk mendapatkan Helper?",
    a: "Rata-rata Requester mendapatkan Helper dalam waktu 5–15 menit, tergantung lokasi, jenis bantuan, dan imbalan yang ditawarkan. Semakin spesifik dan menarik, semakin cepat direspon.",
  },
];

function Landing() {
  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setIsAuthed(!!s));
    return () => subscription.unsubscribe();
  }, []);
  const ctaTo = isAuthed ? "/beranda" : "/masuk";
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero ctaTo={ctaTo} />
      <StatsBar />
      <About />
      <ChatDemo />
      <Roles />
      <FAQ />
      <CTA ctaTo={ctaTo} />
      <Footer />
    </div>
  );
}

function Nav() {
  const [user, setUser] = useState<null | { email?: string }>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-cream font-display text-lg font-bold">
          <img src={lionLogo} alt="" className="h-8 w-8" />
          NgalamBantu.
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream/90">
          <a href="#tentang" className="hover:text-orange transition">
            Tentang Kami
          </a>
          <a href="#cara-kerja" className="hover:text-orange transition">
            Cara Kerja
          </a>
          <a href="#faq" className="hover:text-orange transition">
            FAQ
          </a>
        </nav>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-cream/30 px-4 py-2 text-sm text-cream hover:bg-cream/10 transition"
          >
            Keluar
          </button>
        ) : (
          <Link
            to="/masuk"
            className="flex items-center gap-1.5 rounded-full border border-cream/30 px-4 py-2 text-sm text-cream hover:bg-cream/10 transition"
          >
            Masuk <ChevronDown className="h-4 w-4" />
          </Link>
        )}
      </div>
    </header>
  );
}

function Hero({ ctaTo }: { ctaTo: string }) {
  return (
    <section className="relative overflow-hidden bg-navy pt-32 pb-40 text-cream">
      <img
        src={lionLogo}
        alt=""
        className="pointer-events-none absolute -right-10 top-10 h-[26rem] w-[26rem] opacity-10"
      />
      <img
        src={lionLogo}
        alt=""
        className="pointer-events-none absolute right-40 top-40 h-72 w-72 opacity-[0.07]"
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-4">
          <img src={lionLogo} alt="NgalamBantu" className="h-20 w-20" />
          <h1 className="font-display text-6xl md:text-7xl font-bold leading-[0.95]">
            Ngalam
            <br />
            Bantu.
          </h1>
        </div>
        <p className="mt-8 max-w-md text-sm text-cream/70">
          Solusi praktis untuk mendapat & memberikan bantuan di sekitar kamu, kapan pun dibutuhkan.
        </p>
        <Link
          to={ctaTo}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange px-7 py-3 text-sm font-semibold text-navy hover:brightness-105 transition shadow-lg shadow-orange/20"
        >
          Mulai <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="bg-orange text-navy">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-display text-4xl md:text-5xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-navy/80">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="tentang" className="relative bg-cream py-24 overflow-hidden">
      <img
        src={lionLogo}
        alt=""
        className="pointer-events-none absolute -left-16 top-12 h-72 w-72 opacity-[0.08]"
      />
      <img
        src={lionLogo}
        alt=""
        className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 opacity-[0.08]"
      />
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="rounded-3xl bg-orange p-12 text-center shadow-xl shadow-navy/10 border-4 border-navy/5">
          <h2 className="font-display text-4xl font-bold text-navy">Tentang Kami</h2>
          <div className="mt-6 space-y-4 text-navy/85 text-sm leading-relaxed">
            <p>
              NgalamBantu hadir sebagai platform digital yang menghubungkan warga Kota Malang yang
              membutuhkan bantuan dengan warga lain yang siap menolong.
            </p>
            <p>
              Kami percaya semangat gotong royong adalah bagian dari budaya Malang. Lewat
              NgalamBantu, kebaikan kecil bisa menjadi solusi nyata sehari-hari.
            </p>
            <p>
              Daftar, deskripsikan bantuan yang kamu butuhkan, dan biarkan Helper terdekat datang
              membantu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatDemo() {
  return (
    <section id="cara-kerja" className="relative bg-navy py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl bg-cream p-8 shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-navy/10">
            <div className="h-10 w-10 rounded-full bg-navy" />
            <div>
              <div className="font-display text-lg font-bold text-orange">Amira (Helper)</div>
              <div className="text-xs text-muted-foreground">Online sekarang</div>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Bubble
              side="left"
              name="AA"
              text="Halo! Saya tertarik membantu pindahan kamu. Kapan butuhnya?"
            />
            <Bubble
              side="right"
              name="AL"
              text="Besok jam 9 pagi, di Jalan Sumbersari. Butuh 2 orang kira-kira 3 jam an."
            />
            <Bubble
              side="left"
              name="AA"
              text="Siap! Saya dan teman bisa. Soal imbalan 150k per orang gimana?"
            />
            <Bubble side="right" name="AL" text="Deal! Terima kasih ya, saya tunggu." />
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-white border border-navy/10 p-1.5 pl-5">
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="Tulis pesan..."
            />
            <button className="h-9 w-9 rounded-full bg-orange flex items-center justify-center text-navy">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ side, name, text }: { side: "left" | "right"; name: string; text: string }) {
  const isLeft = side === "left";
  return (
    <div className={`flex items-end gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
      <div className="h-9 w-9 shrink-0 rounded-full bg-cream border-2 border-navy flex items-center justify-center text-xs font-bold text-navy">
        {name}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-medium ${isLeft ? "bg-orange text-navy rounded-bl-sm" : "bg-navy text-cream rounded-br-sm"}`}
      >
        {text}
      </div>
    </div>
  );
}

function Roles() {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center font-display text-4xl font-bold text-navy">
          Dua Peran, Satu Platform
        </h2>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <RoleCard
            title="Requester"
            subtitle="Yang Butuh Bantuan"
            items={[
              "Posting kebutuhan dengan cepat",
              "Pilih Helper sesuai preferensi",
              "Bayar imbalan setelah selesai",
              "Beragam kategori: belanja, kirim, dll",
            ]}
          />
          <RoleCard
            title="Helper"
            subtitle="Yang Siap Membantu"
            items={[
              "Lihat permintaan di sekitar lokasi",
              "Pilih bantuan yang sesuai jadwal",
              "Dapatkan imbalan langsung",
              "Bangun reputasi & poin terbaik",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function RoleCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl bg-orange p-8 border-4 border-navy/10 shadow-lg">
      <h3 className="text-center font-display text-3xl font-bold text-navy">{title}</h3>
      <p className="text-center text-sm font-semibold text-navy/70 italic mt-1">{subtitle}</p>
      <ul className="mt-6 space-y-2 text-sm text-navy text-center">
        {items.map((it) => (
          <li key={it}>• {it}</li>
        ))}
      </ul>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative bg-navy py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center font-display text-5xl font-bold text-orange">FAQ's</h2>
        <div className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl bg-cream shadow-lg overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left"
              >
                <span className="font-display text-lg font-bold text-navy w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-semibold text-navy text-sm md:text-base">{f.q}</span>
                <span
                  className={`h-8 w-8 shrink-0 rounded-full bg-orange flex items-center justify-center text-navy transition ${open === i ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 pl-[4.5rem] text-sm text-navy/70 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ ctaTo }: { ctaTo: string }) {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">
          Siap Dibantu atau Membantu?
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Bergabung dengan ribuan warga Malang yang sudah saling membantu di NgalamBantu
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            to={ctaTo}
            className="w-full max-w-sm rounded-full bg-navy py-3.5 font-semibold text-cream hover:bg-navy-deep transition shadow-lg text-center"
          >
            {ctaTo === "/beranda" ? "Buka Beranda" : "Daftar Sekarang"}
          </Link>
          {ctaTo === "/masuk" && (
            <Link
              to="/masuk"
              className="w-full max-w-sm rounded-full border-2 border-navy py-3 font-semibold text-navy hover:bg-navy hover:text-cream transition text-center"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-deep py-8 text-center text-xs text-cream/60">
      © 2026 NgalamBantu. Dibuat dengan semangat gotong royong warga Malang.
    </footer>
  );
}
