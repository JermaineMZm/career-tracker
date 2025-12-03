"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const supabase = supabaseBrowser();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();
  }, []);

  // Hide navbar on /auth
  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="bg-white shadow p-4 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl">
            CareerCoachAI
          </Link>

          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "text-blue-600" : ""}
          >
            Dashboard
          </Link>

          <Link
            href="/check-in"
            className={pathname === "/check-in" ? "text-blue-600" : ""}
          >
            Check-In
          </Link>

          <Link
            href="/check-ins"
            className={pathname === "/check-ins" ? "text-blue-600" : ""}
          >
            History
          </Link>

          <Link
            href="/roadmap"
            className={pathname === "/roadmap" ? "text-blue-600" : ""}
          >
            Roadmap
          </Link>

          <Link
            href="/weekly-insights"
            className={pathname === "/weekly-insights" ? "text-blue-600" : ""}
          >
            Weekly Insights
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className={pathname === "/profile" ? "text-blue-600" : ""}
          >
            Profile
          </Link>

          {/* Logout button */}
          {user && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className="text-sm text-red-500 underline"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
