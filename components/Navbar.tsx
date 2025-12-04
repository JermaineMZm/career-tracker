"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (pathname.startsWith("/auth")) return null;

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-lg transition-all font-medium text-sm ${
      pathname === path
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
        : "text-gray-700 hover:bg-white/50 hover:text-purple-600"
    }`;

  return (
    <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-purple-100/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
            🚀 CareerCoachAI
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard" className={linkClasses("/dashboard")}>📊 Dashboard</Link>
            <Link href="/check-in" className={linkClasses("/check-in")}>✅ Check-In</Link>
            <Link href="/check-ins" className={linkClasses("/check-ins")}>📝 History</Link>
            <Link href="/roadmap" className={linkClasses("/roadmap")}>🗺️ Roadmap</Link>
            <Link href="/weekly-insights" className={linkClasses("/weekly-insights")}>💡 Insights</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/profile" className={`${linkClasses("/profile")} hidden sm:inline-block`}>
            👤 Profile
          </Link>

          {user && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className="text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Sign Out
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
