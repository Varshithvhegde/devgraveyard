"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-gothic text-xl text-bone hover:text-white transition-colors tracking-wide"
        >
          ⚰️ DevGraveyard
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/graveyard"
            className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/bury"
                className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
              >
                + Bury a Project
              </Link>
              <Link
                href="/my-graveyard"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {user.user_metadata?.avatar_url && (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                My Graveyard
              </Link>
              <button
                onClick={signOut}
                className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Connect GitHub
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
