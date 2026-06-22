import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  Search,
  Bell,
  MessageSquare,
  Heart,
  History,
  Plus,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import lionLogo from "@/assets/lion-logo-orange.png";

const NAV = [
  { to: "/beranda", label: "Beranda", Icon: LayoutGrid },
  { to: "/jelajahi", label: "Jelajahi", Icon: Search },
  { to: "/notifikasi", label: "Notifikasi", Icon: Bell },
  { to: "/pesan", label: "Pesan", Icon: MessageSquare },
  { to: "/bantuanku", label: "Bantuanku", Icon: Heart },
  { to: "/riwayatku", label: "Riwayatku", Icon: History },
] as const;

export function AppShell({
  children,
  onCreatePost,
}: {
  children: ReactNode;
  onCreatePost?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const sidebar = (
    <aside className="bg-navy text-cream flex flex-col h-full w-72 shrink-0">
      <div className="p-6 flex items-start justify-between">
        <Link to="/beranda" className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-bold text-orange leading-none">
            Ngalam
            <br />
            Bantu.
          </span>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden text-cream/70">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex justify-center pb-4">
        <img src={lionLogo} alt="" className="h-16 w-16" />
      </div>
      <nav className="px-4 space-y-1.5 flex-1 overflow-y-auto">
        {NAV.map(({ to, label, Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                active ? "bg-orange text-navy" : "text-cream/90 hover:bg-navy-deep"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            onCreatePost?.();
            setOpen(false);
          }}
          className="w-full mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-cream/10 text-cream border border-cream/20 hover:bg-cream/20 transition"
        >
          <Plus className="h-5 w-5" /> Buat Postingan
        </button>
        <div className="h-px bg-orange/40 my-4 mx-2" />
      </nav>
      <div className="p-4 space-y-2">
        <Link
          to="/profil"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-cream/90 hover:bg-navy-deep"
        >
          <User className="h-5 w-5" /> Profil
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-cream bg-navy-deep hover:bg-navy-deep/70 border border-cream/10"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">{sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="bg-black/40 flex-1" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-cream border-b border-navy/10 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="text-navy">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/beranda" className="font-display text-xl font-bold text-orange">
            Ngalam Bantu.
          </Link>
          <div className="w-6" />
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
