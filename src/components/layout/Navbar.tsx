"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(3,3,5,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(139,92,246,0.12)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(139,92,246,0.08) inset"
          : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="text-xl transition-all duration-300 group-hover:scale-110"
            style={{ filter: "drop-shadow(0 0 8px rgba(139,92,246,0.5))" }}
          >
            ⚰️
          </span>
          <span
            className="font-gothic text-lg text-bone tracking-wide"
            style={{ textShadow: "0 0 20px rgba(139,92,246,0.3)" }}
          >
            DevGraveyard
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/graveyard"
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              isActive("/graveyard")
                ? "text-purple-300 bg-purple-950/50"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/bury"
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  isActive("/bury")
                    ? "text-purple-300 bg-purple-950/50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                + Bury
              </Link>
              <Link
                href="/my-graveyard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200"
              >
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    width={20}
                    height={20}
                    className="rounded-full ring-1 ring-purple-700/40"
                  />
                ) : null}
                <span className="hidden sm:block">Mine</span>
              </Link>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors rounded-lg hover:bg-white/5"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 16px rgba(139,92,246,0.3)",
              }}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Connect GitHub
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
